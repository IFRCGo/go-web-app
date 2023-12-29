import {
    useCallback,
    useRef,
} from 'react';
import {
    CloseFillIcon,
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    DateOutput,
    Header,
    IconButton,
    InfoPopup,
    RawButton,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';
import { MapContainer } from '@togglecorp/re-map';
import FileSaver from 'file-saver';
import { toPng } from 'html-to-image';

import goLogo from '#assets/icons/go-logo-2020.svg';
import Link from '#components/Link';
import { mbtoken } from '#config';
import useAlert from '#hooks/useAlert';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            exitPrintMode();
            return;
        }
        toPng(containerRef.current, {
            skipAutoScale: false,
        })
            .then((data) => FileSaver.saveAs(data, title))
            .finally(exitPrintMode);
    }, [
        exitPrintMode,
        title,
        alert,
        strings.failureToDownloadMessage,
    ]);

    return (
        <div className={styles.mapContainer}>
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
                                title={strings.mapContainerIconButton}
                                ariaLabel={strings.mapContainerIconButton}
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
                        headingClassName={styles.downloadHeading}
                        headingLevel={2}
                        heading={(
                            <>
                                {title}
                                <DateOutput
                                    className={styles.headerDate}
                                    value={(new Date()).toDateString()}
                                />
                            </>
                        )}
                        actions={(
                            <img
                                className={styles.goIcon}
                                src={goLogo}
                                alt={strings.downloadHeaderLogoAltText}
                            />
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
        </div>
    );
}

export default MapContainerWithDisclaimer;
