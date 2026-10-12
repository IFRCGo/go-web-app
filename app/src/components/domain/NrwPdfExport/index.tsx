import {
    type RefObject,
    useCallback,
    useContext,
    useState,
} from 'react';
import { faDownToLine } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import { captureElement } from '#components/domain/NrwMap/captureNrwMapScreenCapture';
import useAlert from '#hooks/useAlert';
import NrwEventsContext from '#views/CountryProfileNationalRiskWatch/contexts/NrwEventsContext';
import NrwScreenCaptureContext from '#views/CountryProfileNationalRiskWatch/contexts/NrwScreenCaptureContext';
import { type CountryCodeIso3 } from '#views/CountryProfileNationalRiskWatch/types';

import exportNrwToPdf from './exportNrwToPdf';

import i18n from './i18n.json';

const dataFormat = 'dd MMM yyyy, hh:mm';

interface Props {
    eventsPanelRef: RefObject<HTMLDivElement | null>;
    countries: CountryCodeIso3[];
}

function NrwPdfExport(props: Props) {
    const { eventsPanelRef, countries } = props;

    const strings = useTranslation(i18n);
    const { takeScreenCapture } = useContext(NrwScreenCaptureContext);
    const { selectedEvent } = useContext(NrwEventsContext);
    const alert = useAlert();
    const [exporting, setExporting] = useState(false);

    const handleClick = useCallback(async () => {
        if (isNotDefined(takeScreenCapture)) {
            return;
        }
        setExporting(true);
        try {
            const eventsElement = eventsPanelRef.current;
            if (!eventsElement) {
                throw new Error('Events panel element not found');
            }
            const [mapImage, eventsImage] = await Promise.all([
                takeScreenCapture(),
                eventsElement ? captureElement(eventsElement) : undefined,
            ]);

            exportNrwToPdf({
                mapImage,
                eventsImage,
                selectedEvent,
                countries,
                text: {
                    title: strings.nrwPdfExportTitle,
                    generated: resolveToString(strings.nrwPdfExportGenerated, {
                        date: formatDate(new Date(), dataFormat) ?? '',
                    }),
                    mapNote: strings.nrwPdfExportMapNote,
                    // For now, the export is always a single page.
                    // This will change when we support longer data lists.
                    pageLabel: resolveToString(
                        strings.nrwPdfExportPageLabel,
                        { page: 1, total: 1 },
                    ),
                },
            });
        } catch (error) {
            alert.show(strings.nrwPdfExportFailedMessage, {
                variant: 'danger',
                debugMessage: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setExporting(false);
        }
    }, [takeScreenCapture, eventsPanelRef, selectedEvent, countries, alert, strings]);

    return (
        <Button
            name={undefined}
            spacing="xl"
            styleVariant="outline"
            colorVariant="secondary"
            disabled={isNotDefined(takeScreenCapture) || exporting}
            onClick={handleClick}
            before={<FontAwesomeIcon icon={faDownToLine} />}
        >
            {exporting
                ? strings.nrwPdfExportExportingLabel
                : strings.nrwPdfExportButtonLabel}
        </Button>
    );
}

export default NrwPdfExport;
