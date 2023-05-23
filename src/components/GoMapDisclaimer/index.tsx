import { _cs } from '@togglecorp/fujs';

import InfoPopup from '#components/InfoPopup';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function GoMapDisclaimer(props: Props) {
    const strings = useTranslation(i18n);
    const {
        className,
    } = props;

    const mapSources = resolveToComponent(
        strings.mapSourcesLabel,
        {
            uncodsLink: (
                <Link to="https://cod.unocha.org/">
                    {strings.mapSourceUNCODsLabel}
                </Link>
            ),
        },
    );

    return (
        <InfoPopup
            infoLabel="Map Sources: ICRC, UN CODs"
            className={_cs(styles.goMapDisclaimer, className)}
            description={(
                <>
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
                            to="https://www.mapbox.com/about/maps/"
                            title="Mapbox"
                            aria-label="Mapbox"
                            role="listitem"
                        >
                            {strings.copyrightMapbox}
                        </Link>
                        <Link
                            to="https://www.openstreetmap.org/about/"
                            title="OpenStreetMap"
                            aria-label="OpenStreetMap"
                            role="listitem"
                        >
                            {strings.copyrightOSM}
                        </Link>
                        <Link
                            className="mapbox-improve-map"
                            to={`https://apps.mapbox.com/feedback/?owner=go-ifrc&amp;id=ckrfe16ru4c8718phmckdfjh0&amp;access_token=${import.meta.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`}
                            title="Map feedback"
                            aria-label="Map feedback"
                            role="listitem"
                        >
                            {strings.improveMapLabel}
                        </Link>
                    </div>
                </>
            )}
        />
    );
}

export default GoMapDisclaimer;
