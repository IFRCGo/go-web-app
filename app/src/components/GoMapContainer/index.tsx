import {
    useCallback,
    useEffect,
    useRef,
} from 'react';
import {
    ArtboardLineIcon,
    CloseFillIcon,
    CloseLineIcon,
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateOutput,
    IconButton,
    InfoPopup,
    Label,
    ListView,
    RawButton,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
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
    title: string;
    footer?: React.ReactNode;
    withoutDownloadButton?: boolean;
    withPresentationMode?: boolean;
    presentationModeAdditionalBeforeContent?: React.ReactNode;
    presentationModeAdditionalAfterContent?: React.ReactNode;
    onPresentationModeChange?: (newPresentationMode: boolean) => void;
    children?: React.ReactNode;
    withFullHeight?: boolean;
}

function GoMapContainer(props: Props) {
    const {
        className,
        title = 'IFRC GO - Map',
        footer,
        withoutDownloadButton = false,
        withPresentationMode = false,
        presentationModeAdditionalBeforeContent,
        presentationModeAdditionalAfterContent,
        onPresentationModeChange,
        children,
        withFullHeight,
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
                    spacing="xs"
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

    const [
        presentationMode,
        {
            setTrue: setPresentationModeTrue,
            setFalse: setPresentationModeFalse,
        },
    ] = useBooleanState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const enterPresentationMode = useCallback(() => {
        if (isDefined(containerRef.current)) {
            containerRef.current.requestFullscreen();
        }
    }, []);

    const exitPresentationMode = useCallback(() => {
        if (isDefined(document.fullscreenElement)) {
            document.exitFullscreen();
        }
    }, []);

    const handleFullScreenChange = useCallback(() => {
        if (isDefined(document.fullscreenElement)) {
            setPresentationModeTrue();
        } else {
            setPresentationModeFalse();
        }
    }, [setPresentationModeTrue, setPresentationModeFalse]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    useEffect(() => {
        if (isDefined(onPresentationModeChange)) {
            onPresentationModeChange(presentationMode);
        }
    }, [presentationMode, onPresentationModeChange]);

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
        toPng(containerRef.current, { skipAutoScale: false })
            .then((data) => FileSaver.saveAs(data, title))
            .finally(exitPrintMode);
    }, [exitPrintMode, title, alert, strings.failureToDownloadMessage]);

    return (
        <Container
            elementRef={containerRef}
            pending={false}
            errored={false}
            empty={false}
            filtered={false}
            className={_cs(
                styles.goMapContainer,
                printMode && styles.printMode,
                presentationMode && styles.presentationMode,
                withFullHeight && styles.withFullHeight,
                className,
            )}
            headingLevel={2}
            heading={(presentationMode || printMode) && (
                <ListView
                    withPadding={printMode}
                    withSpacingOpticalCorrection
                >
                    {title}
                    <DateOutput
                        className={styles.headerDate}
                        value={(new Date()).toDateString()}
                    />
                </ListView>
            )}
            headerActions={(
                <>
                    {printMode && (
                        <Container
                            className={styles.floatingActions}
                            withShadow
                            withBackground
                            withPadding
                        >
                            <ListView>
                                <Button
                                    name={undefined}
                                    onClick={handleDownloadClick}
                                    before={(
                                        <DownloadTwoLineIcon />
                                    )}
                                >
                                    {strings.downloadButtonTitle}
                                </Button>
                                <IconButton
                                    name={undefined}
                                    title={strings.exitPrintModeButtonTitle}
                                    ariaLabel={strings.exitPrintModeButtonTitle}
                                    onClick={exitPrintMode}
                                    variant="secondary"
                                >
                                    <CloseFillIcon />
                                </IconButton>
                            </ListView>
                        </Container>
                    )}
                    {presentationMode && (
                        <IconButton
                            name={undefined}
                            onClick={exitPresentationMode}
                            title={strings.exitPresentationModeButtonTitle}
                            ariaLabel={strings.exitPresentationModeButtonTitle}
                            variant="secondary"
                        >
                            <CloseLineIcon />
                        </IconButton>
                    )}
                    {printMode && (
                        <ListView
                            withPadding
                            withSpacingOpticalCorrection
                        >
                            <img
                                className={styles.goIcon}
                                src={goLogo}
                                alt={strings.downloadHeaderLogoAltText}
                            />
                        </ListView>
                    )}
                </>
            )}
            spacing={presentationMode ? 'xl' : 'none'}
            withPadding={presentationMode}
        >
            <ListView
                className={styles.viewContainer}
                layout="block"
                spacing={presentationMode ? 'lg' : 'none'}
            >
                {presentationMode && presentationModeAdditionalBeforeContent}
                <div className={styles.relativeWrapper}>
                    <MapContainer
                        className={styles.map}
                    />
                    <InfoPopup
                        infoLabel={strings.infoLabel}
                        className={styles.mapDisclaimer}
                        description={(
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                                spacing="sm"
                            >
                                <Label>
                                    {strings.mapDisclaimer}
                                </Label>
                                <ListView
                                    withSpacingOpticalCorrection
                                    spacing="xs"
                                    withWrap
                                >
                                    {mapSources}
                                </ListView>
                                <ListView
                                    className="mapboxgl-ctrl-attrib-inner"
                                    spacing="xs"
                                    withSpacingOpticalCorrection
                                    withWrap
                                >
                                    <Link
                                        href="https://www.mapbox.com/about/maps/"
                                        external
                                        title={strings.mapContainerMapbox}
                                        aria-label={strings.mapContainerMapbox}
                                        role="listitem"
                                        withLinkIcon
                                        spacing="xs"
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
                                        spacing="xs"
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
                                        spacing="xs"
                                    >
                                        {strings.improveMapLabel}
                                    </Link>
                                </ListView>
                            </ListView>
                        )}
                    />
                    {withPresentationMode && !printMode && !presentationMode && (
                        <Button
                            className={styles.presentationModeButton}
                            name={undefined}
                            before={<ArtboardLineIcon />}
                            onClick={enterPresentationMode}
                        >
                            {strings.presentationModeButtonLabel}
                        </Button>
                    )}
                    {!printMode && !presentationMode && !withoutDownloadButton && (
                        <RawButton
                            className={styles.downloadButton}
                            name={undefined}
                            onClick={enterPrintMode}
                            title={strings.downloadButtonTitle}
                        >
                            <DownloadTwoLineIcon />
                        </RawButton>
                    )}
                    <div className={styles.content}>
                        {children}
                    </div>
                </div>
                {footer && (
                    <ListView
                        withPadding
                        withWrap
                        withDarkBackground
                        withSpaceBetweenContents
                    >
                        {footer}
                    </ListView>
                )}
                {presentationMode && presentationModeAdditionalAfterContent}
            </ListView>
        </Container>
    );
}

export default GoMapContainer;
