import React, { useEffect, useRef, useCallback } from 'react';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const pluginRef = useRef<PluginContext | null>(null);

    // Initialize Molstar plugin
    useEffect(() => {
        if (!containerRef.current) return;

        // Create plugin instance
        const initPlugin = async () => {
            try {
                const plugin = await createPluginUI({
                    target: containerRef.current!,
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

                pluginRef.current = plugin;

                // Subscribe to structure hover/click events
                if (onResidueHover || onResidueClick) {
                    plugin.behaviors.interaction.hover.subscribe((e) => {
                        if (e.current?.loci) {
                            const { loci } = e.current;
                            // Extract residue number from loci
                            if ('elements' in loci && loci.elements.length > 0) {
                                try {
                                    const element = (loci.elements as any[])[0];
                                    if (element && 'unit' in element) {
                                        // Simplified residue detection
                                        onResidueHover?.(1); // Placeholder
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

                // Load structure
                await loadStructure(pdbUrl);
                onLoadComplete?.();

            } catch (error) {
                console.error('Failed to initialize Molstar:', error);
                onLoadError?.(error instanceof Error ? error.message : 'Failed to initialize viewer');
            }
        };

        initPlugin();

        // Cleanup
        return () => {
            if (pluginRef.current) {
                pluginRef.current.dispose();
                pluginRef.current = null;
            }
        };
    }, []);

    // Load structure from URL
    const loadStructure = useCallback(async (url: string) => {
        const plugin = pluginRef.current;
        if (!plugin) return;

        try {
            // Clear existing structures
            await plugin.clear();

            // Load from URL
            const data = await plugin.builders.data.download({
                url,
                isBinary: false
            }, { state: { isGhost: true } });

            // Parse as PDB
            const trajectory = await plugin.builders.structure.parseTrajectory(data as any, 'pdb');

            // Apply default preset
            await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

        } catch (error) {
            console.error('Failed to load structure:', error);
            onLoadError?.(error instanceof Error ? error.message : 'Failed to load structure');
        }
    }, [onLoadError]);

    // Reload when URL changes
    useEffect(() => {
        if (pluginRef.current && pdbUrl) {
            loadStructure(pdbUrl);
        }
    }, [pdbUrl, loadStructure]);

    // Highlight residue by number
    const highlightResidue = useCallback((residueNumber: number) => {
        const plugin = pluginRef.current;
        if (!plugin) return;
        // Placeholder for residue highlighting
    }, []);

    // Export screenshot
    const exportScreenshot = useCallback(async (): Promise<string | null> => {
        const plugin = pluginRef.current;
        if (!plugin) return null;

        try {
            // Use plugin's built-in screenshot functionality
            const canvas = document.querySelector('canvas');
            if (!canvas) return null;

            const dataUrl = canvas.toDataURL('image/png');
            return dataUrl;
        } catch (error) {
            console.error('Failed to export screenshot:', error);
            return null;
        }
    }, []);

    // Expose methods via ref (for parent component)
    useEffect(() => {
        if (containerRef.current) {
            (containerRef.current as any).molstar = {
                highlightResidue,
                exportScreenshot
            };
        }
    }, [highlightResidue, exportScreenshot]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height, position: 'relative' }}
        />
    );
};

export default MolstarViewer;
