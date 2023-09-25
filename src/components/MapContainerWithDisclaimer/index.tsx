import { _cs } from '@togglecorp/fujs';
import { MapContainer } from '@togglecorp/re-map';

import InfoPopup from '#components/InfoPopup';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';
import { resolveToComponent } from '#utils/translation';
import { mbtoken } from '#config';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function MapContainerWithDisclaimer(props: Props) {
    const { className } = props;
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

    return (
        <div className={_cs(styles.mapContainerWithDisclaimer, className)}>
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
    );
}

export default MapContainerWithDisclaimer;
