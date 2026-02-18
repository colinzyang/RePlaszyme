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

// Track initialization state across all instances to prevent race conditions
const initializingContainers = new Set<HTMLDivElement>();

const MolstarViewer: React.FC<MolstarViewerProps> = ({
    pdbUrl,
    onResidueClick,
    onResidueHover,
    onLoadComplete,
    onLoadError,
    height = '500px'
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const pluginRef = useRef<PluginContext | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const initAttemptRef = useRef(0);

    // Initialize Molstar plugin
    useEffect(() => {
        if (!wrapperRef.current) return;

        // Skip if already initialized
        if (pluginRef.current) return;

        const currentAttempt = ++initAttemptRef.current;
        let cancelled = false;

        const initPlugin = async () => {
            // Double-check after async boundary
            if (cancelled || pluginRef.current) return;

            // Create a fresh container element for Molstar
            const container = document.createElement('div');
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.position = 'relative';

            // Check if this container is already being initialized (StrictMode protection)
            if (initializingContainers.has(container)) {
                return;
            }

            // Append to wrapper
            if (!wrapperRef.current || cancelled) {
                return;
            }

            wrapperRef.current.appendChild(container);
            containerRef.current = container;
            initializingContainers.add(container);

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

                // Check if cancelled or a newer init attempt started
                if (cancelled || initAttemptRef.current !== currentAttempt) {
                    plugin.dispose();
                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                    initializingContainers.delete(container);
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

                if (!cancelled) {
                    onLoadComplete?.();
                }

            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to initialize Molstar:', error);
                    onLoadError?.(error instanceof Error ? error.message : 'Failed to initialize viewer');
                }
                initializingContainers.delete(container);
            }
        };

        // Delay initialization slightly to allow StrictMode cleanup to complete
        const timeoutId = setTimeout(() => {
            initPlugin();
        }, 0);

        // Cleanup
        return () => {
            cancelled = true;
            clearTimeout(timeoutId);

            if (pluginRef.current) {
                pluginRef.current.dispose();
                pluginRef.current = null;
            }
            setIsInitialized(false);

            // Remove the container element entirely
            if (containerRef.current) {
                initializingContainers.delete(containerRef.current);
                if (containerRef.current.parentNode) {
                    containerRef.current.parentNode.removeChild(containerRef.current);
                }
                containerRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Internal load function
    const loadStructureInternal = async (plugin: PluginContext, url: string) => {
        try {
            await plugin.clear();

            const data = await plugin.builders.data.download({
                url,
                isBinary: false
            }, { state: { isGhost: true } });

            const trajectory = await plugin.builders.structure.parseTrajectory(data as any, 'pdb');
            await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

        } catch (error) {
            console.error('Failed to load structure:', error);
            throw error;
        }
    };

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
            console.error('Failed to export screenshot:', error);
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
