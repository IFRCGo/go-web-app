import JsPDF from 'jspdf';

import { type NrwCapturedImage } from '#views/CountryProfileNationalRiskWatch/contexts/NrwScreenCaptureContext';
import {
    type CountryCodeIso3,
    type NrwEvent,
} from '#views/CountryProfileNationalRiskWatch/types';

interface NrwPdfText {
    title: string;
    generated: string;
    mapNote: string;
    pageLabel: string;
}

const mapAttribution = '© Mapbox © OpenStreetMap';

// Opaque types.
declare const pxUnit: unique symbol;
declare const ptUnit: unique symbol;
declare const mmUnit: unique symbol;

type Px = number & {
    [pxUnit]: true;
};

type Pt = number & {
    [ptUnit]: true;
};

type Mm = number & {
    [mmUnit]: true;
};

// Values used to line up the layout elements in the PDF based on the Figma design css
const frameWidthPx = 1757 as Px;
const marginPx = 40 as Px;
const headerHeightPx = 30 as Px; // 20px title line + 10px padding above the divider
const contentTopPx = 88 as Px;
const mapColumnWidthPx = 1191 as Px;
const mapHeightPx = 1073 as Px;
const columnGapPx = 18 as Px;
const footerTopPx = (mapHeightPx + 11) as Px;
const titleFontPx = 18 as Px;
const captionFontPx = 12 as Px;
const attributionPaddingPx = 4 as Px;
const dividerLineWidthPx = 1 as Px;

const textPrimary = '#323232'; // go-ui-color-gray-90
const textSecondary = '#6f6f6f'; // go-ui-color-gray-70
const divider = '#c6c6c6'; // go-ui-color-gray-40
const attributionBackground = '#f2f2f2'; // approximates Mapbox's translucent white attribution box

function calculateDisplayArea(aspectRatio: number, maxWidth: Mm, maxHeight: Mm) {
    let width = maxWidth;
    let height = (width / aspectRatio) as Mm;
    if (height > maxHeight) {
        height = maxHeight;
        width = (height * aspectRatio) as Mm;
    }
    return { width, height };
}

function generateFileName(
    selectedEvent: NrwEvent | undefined,
    countries: CountryCodeIso3[],
): string {
    const date = new Date().toISOString().slice(0, 10);
    if (selectedEvent) {
        return `national-risk-watch-${selectedEvent.countryCodeIso3}-event${selectedEvent.eventId}-${date}.pdf`;
    }
    if (countries.length === 1) {
        return `national-risk-watch-${countries[0]}-${date}.pdf`;
    }
    // Fallback to using a generic file name (For multi-country map exports)
    return `national-risk-watch-${date}.pdf`;
}

function calculateMm(value: Px, pageWidthMm: Mm): Mm {
    return ((value * pageWidthMm) / frameWidthPx) as Mm;
}

// jsPDF font sizes are always in pt (which is inch-based).
// Keep settings in px for design consistency, but convert to pt for export.
function pxToPt(value: Px, pageWidthMm: Mm): Pt {
    const pointsPerInch = 72;
    const mmPerInch = 25.4;
    const mm = calculateMm(value, pageWidthMm);
    const inches = mm / mmPerInch;
    return (inches * pointsPerInch) as Pt;
}

interface Props {
    mapImage: NrwCapturedImage;
    eventsImage: NrwCapturedImage | undefined;
    selectedEvent: NrwEvent | undefined;
    countries: CountryCodeIso3[];
    text: NrwPdfText;
}

export default function exportNrwToPdf(props: Props) {
    const {
        mapImage,
        eventsImage,
        selectedEvent,
        countries,
        text,
    } = props;

    const pdf = new JsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidthMm = pdf.internal.pageSize.getWidth() as Mm;
    const marginMm = calculateMm(marginPx, pageWidthMm);
    const rightEdgeMm = (pageWidthMm - marginMm) as Mm;

    // Header
    pdf.setFont('helvetica', 'bold');
    const titleFontPt = pxToPt(titleFontPx, pageWidthMm);
    pdf.setFontSize(titleFontPt);
    pdf.setTextColor(textPrimary);
    pdf.text(text.title.toUpperCase(), marginMm, marginMm, { baseline: 'top' });

    pdf.setFont('helvetica', 'normal');
    const captionFontPt = pxToPt(captionFontPx, pageWidthMm);
    pdf.setFontSize(captionFontPt);
    pdf.setTextColor(textSecondary);
    pdf.text(text.generated, rightEdgeMm, marginMm, { align: 'right', baseline: 'top' });

    pdf.setDrawColor(divider);
    const dividerLineWidthMm = calculateMm(dividerLineWidthPx, pageWidthMm);
    pdf.setLineWidth(dividerLineWidthMm);
    const dividerYMm = (marginMm + calculateMm(headerHeightPx, pageWidthMm)) as Mm;
    pdf.line(marginMm, dividerYMm, rightEdgeMm, dividerYMm);

    // Main content
    const contentTopMm = calculateMm(contentTopPx, pageWidthMm);
    const mapColumnWidthMm = calculateMm(mapColumnWidthPx, pageWidthMm);
    const mapHeightMm = calculateMm(mapHeightPx, pageWidthMm);
    const mapSize = calculateDisplayArea(mapImage.aspectRatio, mapColumnWidthMm, mapHeightMm);
    pdf.addImage(mapImage.dataUrl, 'PNG', marginMm, contentTopMm, mapSize.width, mapSize.height);

    // Map attribution overlaid on the bottom-left corner of the map
    const attributionPaddingMm = calculateMm(attributionPaddingPx, pageWidthMm);
    const attributionTextHeightMm = calculateMm(captionFontPx, pageWidthMm);
    const attributionWidthMm = (pdf.getTextWidth(mapAttribution) + attributionPaddingMm * 2) as Mm;
    const attributionHeightMm = (attributionTextHeightMm + attributionPaddingMm * 2) as Mm;
    const attributionYMm = (contentTopMm + mapSize.height - attributionHeightMm) as Mm;
    pdf.setFillColor(attributionBackground);
    pdf.rect(marginMm, attributionYMm, attributionWidthMm, attributionHeightMm, 'F');
    pdf.text(
        mapAttribution,
        marginMm + attributionPaddingMm,
        attributionYMm + attributionPaddingMm,
        { baseline: 'top' },
    );

    if (eventsImage) {
        const eventsXMm = (
            marginMm + mapColumnWidthMm + calculateMm(columnGapPx, pageWidthMm)) as Mm;
        const eventsColumnWidthMm = (rightEdgeMm - eventsXMm) as Mm;
        const eventsSize = calculateDisplayArea(
            eventsImage.aspectRatio,
            eventsColumnWidthMm,
            mapHeightMm,
        );
        pdf.addImage(eventsImage.dataUrl, 'PNG', eventsXMm, contentTopMm, eventsSize.width, eventsSize.height);
    }

    // Footer
    const footerYMm = (contentTopMm + calculateMm(footerTopPx, pageWidthMm)) as Mm;
    pdf.text(text.mapNote, marginMm + mapColumnWidthMm, footerYMm, { align: 'right', baseline: 'top' });
    pdf.text(text.pageLabel, rightEdgeMm, footerYMm, { align: 'right', baseline: 'top' });

    pdf.save(generateFileName(selectedEvent, countries));
}
