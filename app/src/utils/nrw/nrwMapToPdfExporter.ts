import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';
import type MapOl from 'ol/Map';

// IDs to identify the elements that should be captured for the PDF.
export enum PrintElementId {
    DataPanel = 'nrw-data-panel',
    LayerPanel = 'nrw-layer-panel',
    ControlPanel = 'nrw-control-panel',
    Map = 'nrw-map',
}

// Properties of a captured element, including the canvas and its dimensions
interface CapturedElement {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

// Capture the content of a DOM element as a canvas using html2canvas
async function captureElement(elementId: string): Promise<CapturedElement | null> {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return null;
    }

    const canvas = await html2canvas(element, {
        // Needed to handle map layers from external sources
        useCORS: true,
    });

    return {
        canvas,
        width: canvas.width,
        height: canvas.height,
    };
}

/**
 * Captures the OpenLayers map
 * This ensures all map layers are fully rendered.
 */
async function captureMap(
    mapInstance: MapOl,
    mapElementId: string,
): Promise<CapturedElement | null> {
    const mapElement = document.getElementById(mapElementId);
    if (!mapElement) {
        console.error(`Map element with id "${mapElementId}" not found`);
        return null;
    }

    return new Promise((resolve) => {
        mapInstance.once('rendercomplete', () => {
            // Get the map's viewport which contains the canvas
            const mapCanvas = mapInstance.getViewport().querySelector('canvas');

            if (mapCanvas) {
                // Use the OpenLayers canvas directly - it's already rendered
                resolve({
                    canvas: mapCanvas as HTMLCanvasElement,
                    width: mapCanvas.width,
                    height: mapCanvas.height,
                });
            } else {
                // Fallback: capture the element with html2canvas
                html2canvas(mapElement, {
                    useCORS: true,
                    allowTaint: false,
                    ignoreElements: (element) => element.classList.contains('ol-control'),
                }).then((canvas) => {
                    resolve({
                        canvas,
                        width: canvas.width,
                        height: canvas.height,
                    });
                }).catch((error) => {
                    console.error('Error capturing map:', error);
                    resolve(null);
                });
            }
        });

        // Trigger a render to ensure 'rendercomplete' fires
        mapInstance.renderSync();
    });
}

/**
 * Captures the NRW map and associated panels and generates a PDF.
 * TODO: there is no PDF export style design, so the exported layout will change
 * @param mapInstance - The OpenLayers map instance
 * @param filenameSections - List of strings to include in the filename
 */
export async function exportMapToPdf(
    mapInstance: MapOl,
    filenameSections: string[] = [],
): Promise<void> {
    let filename = `nrw-map-${filenameSections.join('-')}.pdf`;

    // Sanitize filename by replacing invalid characters with underscores
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
        // Capture the non-map panels in parallel
        const [dataPanel, controlPanel] = await Promise.all([
            captureElement(PrintElementId.DataPanel),
            captureElement(PrintElementId.ControlPanel),
        ]);

        // The map panel needs to be captured with special handling,
        // using OpenLayers rendercomplete event
        const mapElement = await captureMap(mapInstance, PrintElementId.Map);

        // Create PDF
        const pdf = new JsPDF({
            orientation: 'portrait',
            unit: 'mm',
            // A4 size (supports multiple pages)
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm for A4
        const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm for A4
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;
        const gap = 5;

        let currentY = margin;

        // Add the data panel
        if (dataPanel) {
            const dataPanelMaxHeight = 30;
            const aspectRatio = dataPanel.width / dataPanel.height;
            let scaledWidth = contentWidth;
            let scaledHeight = contentWidth / aspectRatio;

            if (scaledHeight > dataPanelMaxHeight) {
                scaledHeight = dataPanelMaxHeight;
                scaledWidth = dataPanelMaxHeight * aspectRatio;
            }

            pdf.addImage(
                dataPanel.canvas.toDataURL('image/png'),
                'PNG',
                margin,
                currentY,
                scaledWidth,
                scaledHeight,
            );
            currentY += scaledHeight + gap;
        }

        // Calculate available height for the map based on remaining page space
        const mapMaxHeight = pageHeight - currentY - margin;

        // Add map
        if (mapElement) {
            const aspectRatio = mapElement.width / mapElement.height;
            let scaledWidth = contentWidth;
            let scaledHeight = contentWidth / aspectRatio;

            if (scaledHeight > mapMaxHeight) {
                scaledHeight = mapMaxHeight;
                scaledWidth = mapMaxHeight * aspectRatio;
            }

            // Center the map horizontally if it's narrower than content width
            const mapX = margin + (contentWidth - scaledWidth) / 2;

            pdf.addImage(
                mapElement.canvas.toDataURL('image/png'),
                'PNG',
                mapX,
                currentY,
                scaledWidth,
                scaledHeight,
            );
        }

        // Add second page for the control panel
        if (controlPanel) {
            pdf.addPage();
            const aspectRatio = controlPanel.width / controlPanel.height;
            const scaledWidth = contentWidth;
            const scaledHeight = contentWidth / aspectRatio;

            pdf.addImage(
                controlPanel.canvas.toDataURL('image/png'),
                'PNG',
                margin,
                margin,
                scaledWidth,
                scaledHeight,
            );
        }

        // Save the PDF locally
        pdf.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

export default exportMapToPdf;
