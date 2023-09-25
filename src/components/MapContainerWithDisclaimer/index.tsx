import { useRef, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { MapContainer } from '@togglecorp/re-map';
import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';

import {
    DownloadTwoLineIcon,
    CloseFillIcon,
} from '@ifrc-go/icons';

import InfoPopup from '#components/InfoPopup';
import DateOutput from '#components/DateOutput';
import useAlert from '#hooks/useAlert';
import Header from '#components/Header';
import useTranslation from '#hooks/useTranslation';
import IconButton from '#components/IconButton';
import Button from '#components/Button';
import Link from '#components/Link';
import { resolveToComponent } from '#utils/translation';
import useBooleanState from '#hooks/useBooleanState';
import RawButton from '#components/RawButton';

import { mbtoken } from '#config';

import i18n from './i18n.json';
import styles from './styles.module.css';

async function downloadImage(
    divRef: React.RefObject<HTMLDivElement>,
    title = 'test',
) {
    if (divRef?.current) {
        const canvas = await html2canvas(divRef.current, { scale: 3 });

        const png = canvas.toDataURL('image/png', 1.0);

        FileSaver.saveAs(png, `${title}.png`);
    }
}

interface Props {
    className?: string;
    title?: string;
    footer?: React.ReactNode;
    withoutDownloadButton?: boolean;
}

function MapContainerWithDisclaimer(props: Props) {
    const {
        className,
        title = 'Map',
        footer,
        withoutDownloadButton = false,
    } = props;

    const strings = useTranslation(i18n);

    const mapSources = resolveToComponent(
        strings.mapSourcesLabel,
        {
            uncodsLink: (
                <Link
                    href="https://cod.unocha.org/"
                    external
                    withLinkIcon
                >
                    {strings.mapSourceUNCODsLabel}
                </Link>
            ),
        },
    );

    const [
        printMode,
        {
            setTrue: enterPrintMode,
            setFalse: exitPrintMode,
        },
    ] = useBooleanState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const alert = useAlert();
    const handleDownloadClick = useCallback(() => {
        if (!containerRef?.current) {
            alert.show(
                strings.failureToDownloadMessage,
                { variant: 'danger' },
            );
            return;
        }
        downloadImage(containerRef, `${title}-(${new Date().toDateString()})`);
        exitPrintMode();
    }, [
        exitPrintMode,
        title,
        alert,
        strings,
    ]);

    return (
        <>
            {printMode && (
                <Header
                    className={styles.header}
                    heading={undefined}
                    actionsContainerClassName={styles.actions}
                    actions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={handleDownloadClick}
                                icons={(
                                    <DownloadTwoLineIcon />
                                )}
                            >
                                {strings.downloadButtonTitle}
                            </Button>
                            <IconButton
                                name={undefined}
                                // FIXME: Use translations
                                title="Close"
                                ariaLabel="Close"
                                onClick={exitPrintMode}
                                variant="secondary"
                            >
                                <CloseFillIcon />
                            </IconButton>
                        </>
                    )}
                />
            )}
            <div
                className={_cs(
                    styles.mapContainerWithDisclaimer,
                    className,
                    printMode && styles.printMode,
                )}
                ref={containerRef}
            >
                {printMode && (
                    <Header
                        className={styles.downloadHeader}
                        heading={(
                            <>
                                {title}
                                (
                                <DateOutput
                                    value={(new Date()).toDateString()}
                                />
                                )
                            </>
                        )}
                    />
                )}
                <div className={styles.mapWrapper}>
                    <MapContainer className={styles.container} />
                    <InfoPopup
                        infoLabel={strings.infoLabel}
                        className={styles.mapDisclaimer}
                        description={(
                            <div className={styles.disclaimerPopupContent}>
                                <div>
                                    {strings.mapDisclaimer}
                                </div>
                                <div>
                                    {mapSources}
                                </div>
                                <div
                                    className={_cs(styles.attribution, 'mapboxgl-ctrl-attrib-inner')}
                                    role="list"
                                >
                                    <Link
                                        href="https://www.mapbox.com/about/maps/"
                                        external
                                        title={strings.mapContainerMapbox}
                                        aria-label={strings.mapContainerMapbox}
                                        role="listitem"
                                        withLinkIcon
                                    >
                                        {strings.copyrightMapbox}
                                    </Link>
                                    <Link
                                        href="https://www.openstreetmap.org/about/"
                                        external
                                        title={strings.mapContainerOpenStreetMap}
                                        aria-label={strings.mapContainerOpenStreetMap}
                                        role="listitem"
                                        withLinkIcon
                                    >
                                        {strings.copyrightOSM}
                                    </Link>
                                    <Link
                                        className="mapbox-improve-map"
                                        href={`https://apps.mapbox.com/feedback/?owner=go-ifrc&amp;id=ckrfe16ru4c8718phmckdfjh0&amp;access_token=${mbtoken}`}
                                        external
                                        title={strings.feedbackAriaLabel}
                                        aria-label={strings.feedbackAriaLabel}
                                        role="listitem"
                                        withLinkIcon
                                    >
                                        {strings.improveMapLabel}
                                    </Link>
                                </div>
                            </div>
                        )}
                    />
                </div>
                {!printMode && !withoutDownloadButton && (
                    <RawButton
                        className={styles.downloadButton}
                        name={undefined}
                        onClick={enterPrintMode}
                        title={strings.downloadButtonTitle}
                    >
                        <DownloadTwoLineIcon />
                    </RawButton>
                )}
                {footer}
            </div>
        </>
    );
}

export default MapContainerWithDisclaimer;
