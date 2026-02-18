import React, { useEffect, useRef, useCallback, useState } from 'react';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';

interface MolstarViewerProps {
    pdbUrl: string;
    onResidueClick?: (residueNumber: number) => void;
    onResidueHover?: (residueNumber: number | null) => void;
    onLoadComplete?: () => void;
    onLoadError?: (error: string) => void;
    height?: string;
}

const MolstarViewer: React.FC<MolstarViewerProps> = ({
    pdbUrl,
    onResidueClick,
    onResidueHover,
    onLoadComplete,
    onLoadError,
    height = '500px'
}) => {
    // Wrapper ref for the container
    const wrapperRef = useRef<HTMLDivElement>(null);
    const pluginRef = useRef<PluginContext | null>(null);
    // Track the actual container element that Molstar uses
    const molstarContainerRef = useRef<HTMLDivElement | null>(null);
    const isInitializing = useRef(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Validate URL and fetch PDB data with better error handling
    const fetchPdbData = async (url: string): Promise<string> => {
        console.log('[MolstarViewer] Fetching PDB from:', url);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();

            // Basic validation - PDB files should start with HEADER, TITLE, ATOM, or similar
            const trimmedText = text.trim();
            const isPdbFormat = /^(HEADER|TITLE|ATOM|HETATM|REMARK|COMPND|SOURCE|KEYWDS|EXPDTA|AUTHOR|REVDAT|JRNL|DBREF|SEQRES|MODRES|HET|FORMUL|HELIX|SHEET|SSBOND|LINK|CISPEP|SITE|CRYST1|ORIGX1|ORIGX2|ORIGX3|SCALE1|SCALE2|SCALE3|MODEL|END)/m.test(trimmedText);

            if (!isPdbFormat) {
                // Check if it's an XML error (S3 returns XML errors)
                if (trimmedText.startsWith('<?xml') || trimmedText.startsWith('<Error>')) {
                    console.error('[MolstarViewer] Received XML error response:', trimmedText.substring(0, 500));
                    throw new Error('PDB file not found (S3 returned error)');
                }
                console.error('[MolstarViewer] Invalid PDB format, first 200 chars:', trimmedText.substring(0, 200));
                throw new Error('Invalid PDB file format');
            }

            console.log('[MolstarViewer] PDB data validated, size:', text.length, 'bytes');
            return text;

        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('[MolstarViewer] Network/CORS error:', error);
                throw new Error('Network error or CORS blocked. Check if S3 bucket allows requests from this origin.');
            }
            throw error;
        }
    };

    // Internal load function with better error handling
    const loadStructureInternal = async (plugin: PluginContext, url: string) => {
        try {
            // First validate the URL and data
            const pdbData = await fetchPdbData(url);

            await plugin.clear();

            // Use the raw data instead of letting Molstar fetch
            const data = await plugin.builders.data.rawData({
                data: pdbData,
                label: url.split('/').pop() || 'structure.pdb'
            }, { state: { isGhost: true } });

            const trajectory = await plugin.builders.structure.parseTrajectory(data as any, 'pdb');
            await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

        } catch (error) {
            console.error('[MolstarViewer] Failed to load structure:', error);
            throw error;
        }
    };

    // Initialize Molstar plugin
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        // Skip if already initialized or currently initializing
        if (pluginRef.current || isInitializing.current) {
            return;
        }

        isInitializing.current = true;
        let disposed = false;

        const init = async () => {
            // Check if disposed during async setup
            if (disposed || !wrapper) return;

            // Create a fresh container element for Molstar
            // This ensures we get a clean DOM element without any existing React roots
            const container = document.createElement('div');
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.position = 'relative';

            wrapper.appendChild(container);
            molstarContainerRef.current = container;

            try {
                const plugin = await createPluginUI({
                    target: container,
                    render: renderReact18,
                    spec: {
                        ...DefaultPluginUISpec(),
                        layout: {
                            initial: {
                                isExpanded: false,
                                showControls: true,
                                regionState: {
                                    top: 'hidden',
                                    left: 'hidden',
                                    right: 'hidden',
                                    bottom: 'hidden'
                                }
                            }
                        },
                        components: {
                            remoteState: 'none'
                        }
                    }
                });

                // Check if disposed after async createPluginUI
                if (disposed) {
                    plugin.dispose();
                    // Clean up the container we created
                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                    molstarContainerRef.current = null;
                    return;
                }

                pluginRef.current = plugin;
                setIsInitialized(true);

                // Subscribe to structure hover/click events
                if (onResidueHover || onResidueClick) {
                    plugin.behaviors.interaction.hover.subscribe((e) => {
                        if (e.current?.loci) {
                            const { loci } = e.current;
                            if ('elements' in loci && loci.elements.length > 0) {
                                try {
                                    const element = (loci.elements as any[])[0];
                                    if (element && 'unit' in element) {
                                        onResidueHover?.(1);
                                    }
                                } catch {
                                    onResidueHover?.(null);
                                }
                            }
                        } else {
                            onResidueHover?.(null);
                        }
                    });
                }

                // Load initial structure
                await loadStructureInternal(plugin, pdbUrl);

                if (!disposed) {
                    onLoadComplete?.();
                }

            } catch (error) {
                if (!disposed) {
                    console.error('[MolstarViewer] Failed to initialize:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize viewer';
                    onLoadError?.(errorMessage);
                }
                // Clean up container on error
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                molstarContainerRef.current = null;
            } finally {
                isInitializing.current = false;
            }
        };

        init();

        // Cleanup
        return () => {
            disposed = true;

            // Dispose the plugin first
            if (pluginRef.current) {
                pluginRef.current.dispose();
                pluginRef.current = null;
            }

            // Remove the container element entirely to clean up any React roots
            if (molstarContainerRef.current) {
                if (molstarContainerRef.current.parentNode) {
                    molstarContainerRef.current.parentNode.removeChild(molstarContainerRef.current);
                }
                molstarContainerRef.current = null;
            }

            setIsInitialized(false);
            isInitializing.current = false;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Load structure from URL (public API)
    const loadStructure = useCallback(async (url: string) => {
        const plugin = pluginRef.current;
        if (!plugin) return;

        try {
            await loadStructureInternal(plugin, url);
        } catch (error) {
            onLoadError?.(error instanceof Error ? error.message : 'Failed to load structure');
        }
    }, [onLoadError]);

    // Reload when URL changes
    useEffect(() => {
        if (isInitialized && pluginRef.current && pdbUrl) {
            loadStructure(pdbUrl);
        }
    }, [pdbUrl, isInitialized, loadStructure]);

    // Highlight residue by number
    const highlightResidue = useCallback((residueNumber: number) => {
        const plugin = pluginRef.current;
        if (!plugin) return;
    }, []);

    // Export screenshot
    const exportScreenshot = useCallback(async (): Promise<string | null> => {
        const plugin = pluginRef.current;
        if (!plugin) return null;

        try {
            const canvas = wrapperRef.current?.querySelector('canvas');
            if (!canvas) return null;
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('[MolstarViewer] Failed to export screenshot:', error);
            return null;
        }
    }, []);

    // Expose methods via ref
    useEffect(() => {
        if (wrapperRef.current) {
            (wrapperRef.current as any).molstar = {
                highlightResidue,
                exportScreenshot
            };
        }
    }, [highlightResidue, exportScreenshot]);

    return (
        <div
            ref={wrapperRef}
            style={{ width: '100%', height, position: 'relative' }}
        />
    );
};

export default MolstarViewer;
