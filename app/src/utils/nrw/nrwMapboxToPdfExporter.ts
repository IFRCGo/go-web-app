import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';
import type { Map as MapboxGLMap } from 'mapbox-gl-v3';

import { PrintElementId } from './nrwMapToPdfExporter';

interface CapturedElement {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

async function captureElement(elementId: string): Promise<CapturedElement | null> {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`[MapboxPdfExport] Element with id "${elementId}" not found`);
        return null;
    }

    const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: false,
    });

    return {
        canvas,
        width: canvas.width,
        height: canvas.height,
    };
}

function waitForMapIdle(mapInstance: MapboxGLMap): Promise<void> {
    return new Promise((resolve) => {
        let resolved = false;

        const finish = () => {
            if (resolved) {
                return;
            }
            resolved = true;
            resolve();
        };

        mapInstance.once('idle', finish);
        mapInstance.triggerRepaint();

        // Fallback to avoid hanging exports if the map never emits `idle`.
        window.setTimeout(finish, 1200);
    });
}

async function captureMapCanvas(mapInstance: MapboxGLMap): Promise<CapturedElement> {
    await waitForMapIdle(mapInstance);

    const mapCanvas = mapInstance.getCanvas();
    return {
        canvas: mapCanvas,
        width: mapCanvas.width,
        height: mapCanvas.height,
    };
}

/**
 * Captures the Mapbox map and NRW control panel and generates a PDF.
 */
export async function exportMapboxToPdf(
    mapInstance: MapboxGLMap,
    filenameSections: string[] = [],
): Promise<void> {
    let filename = `nrw-mapbox-map-${filenameSections.join('-')}.pdf`;
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
        const [mapElement, controlPanel] = await Promise.all([
            captureMapCanvas(mapInstance),
            captureElement(PrintElementId.ControlPanel),
        ]);

        const pdf = new JsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;
        const contentHeight = pageHeight - 2 * margin;

        const mapAspectRatio = mapElement.width / mapElement.height;
        let mapWidth = contentWidth;
        let mapHeight = mapWidth / mapAspectRatio;

        if (mapHeight > contentHeight) {
            mapHeight = contentHeight;
            mapWidth = mapHeight * mapAspectRatio;
        }

        const mapX = margin + (contentWidth - mapWidth) / 2;
        const mapY = margin + (contentHeight - mapHeight) / 2;

        pdf.addImage(
            mapElement.canvas.toDataURL('image/png'),
            'PNG',
            mapX,
            mapY,
            mapWidth,
            mapHeight,
        );

        if (controlPanel) {
            pdf.addPage();
            const panelAspectRatio = controlPanel.width / controlPanel.height;
            let panelWidth = contentWidth;
            let panelHeight = panelWidth / panelAspectRatio;

            if (panelHeight > contentHeight) {
                panelHeight = contentHeight;
                panelWidth = panelHeight * panelAspectRatio;
            }

            pdf.addImage(
                controlPanel.canvas.toDataURL('image/png'),
                'PNG',
                margin,
                margin,
                panelWidth,
                panelHeight,
            );
        }

        pdf.save(filename);
    } catch (error) {
        console.error('[MapboxPdfExport] Error generating PDF:', error);
        throw error;
    }
}

export default exportMapboxToPdf;
