import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';

import {
    EVENTS_PANEL_ELEMENT_ID,
    LEGEND_PANEL_ELEMENT_ID,
    MAP_CONTAINER_ELEMENT_ID,
} from '#utils/nrw/nrwConstants';

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

// Grab the Mapbox WebGL canvas straight from the DOM by its container id
function captureMapCanvas(containerId: string): CapturedElement | null {
    const container = document.getElementById(containerId);
    const canvas = container?.querySelector('canvas') ?? null;
    if (!canvas) {
        console.error(`[MapboxPdfExport] Map canvas not found in "${containerId}"`);
        return null;
    }

    return {
        canvas,
        width: canvas.width,
        height: canvas.height,
    };
}

// Captures the Mapbox map and other tagged elements, and exports them in a pdf
export default async function exportNrwDataMapToPdf(
    filenameSections: string[] = [],
): Promise<void> {
    let filename = `nrw-mapbox-map-${filenameSections.join('-')}.pdf`;
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
        const mapElement = captureMapCanvas(MAP_CONTAINER_ELEMENT_ID);
        if (!mapElement) {
            throw new Error('Map canvas not found');
        }

        // Grab other elements to include by DOM id
        const [legendPanel, eventsPanel] = await Promise.all([
            captureElement(LEGEND_PANEL_ELEMENT_ID),
            captureElement(EVENTS_PANEL_ELEMENT_ID),
        ]);

        // Set PDF size and page properties
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

        // Set up the first page: map and legend panel.
        // This is debug design and will be covered by a design item later
        const legendSpacing = legendPanel ? 5 : 0;
        let legendWidth = 0;
        let legendHeight = 0;

        if (legendPanel) {
            const legendAspectRatio = legendPanel.width / legendPanel.height;
            legendWidth = contentWidth;
            legendHeight = legendWidth / legendAspectRatio;
        }

        const mapAspectRatio = mapElement.width / mapElement.height;
        let mapWidth = contentWidth;
        let mapHeight = mapWidth / mapAspectRatio;

        const availableMapHeight = contentHeight - legendHeight - legendSpacing;
        if (mapHeight > availableMapHeight) {
            mapHeight = availableMapHeight;
            mapWidth = mapHeight * mapAspectRatio;
        }

        const mapX = margin + (contentWidth - mapWidth) / 2;
        const mapY = margin;

        pdf.addImage(
            mapElement.canvas.toDataURL('image/png'),
            'PNG',
            mapX,
            mapY,
            mapWidth,
            mapHeight,
        );

        if (legendPanel) {
            const legendX = margin + (contentWidth - legendWidth) / 2;
            const legendY = mapY + mapHeight + legendSpacing;

            pdf.addImage(
                legendPanel.canvas.toDataURL('image/png'),
                'PNG',
                legendX,
                legendY,
                legendWidth,
                legendHeight,
            );
        }

        // Second page: events panel.
        if (eventsPanel) {
            pdf.addPage();
            const panelAspectRatio = eventsPanel.width / eventsPanel.height;
            let panelWidth = contentWidth;
            let panelHeight = panelWidth / panelAspectRatio;

            if (panelHeight > contentHeight) {
                panelHeight = contentHeight;
                panelWidth = panelHeight * panelAspectRatio;
            }

            pdf.addImage(
                eventsPanel.canvas.toDataURL('image/png'),
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
