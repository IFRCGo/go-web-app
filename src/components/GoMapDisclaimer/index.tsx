import { _cs } from '@togglecorp/fujs';

import InfoPopup from '#components/InfoPopup';
import Link from '#components/Link';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function GoMapDisclaimer(props: Props) {
    const {
        className,
    } = props;

    return (
        <InfoPopup
            infoLabel="Map Sources: ICRC, UN CODs"
            className={_cs(styles.goMapDisclaimer, className)}
            description={(
                <>
                    <div>
                        The maps used do not imply the expression of any opinion on the part of the International Federation of Red Cross and Red Crescent Societies or National Society concerning the legal status of a territory or of its authorities.
                    </div>
                    <div>
                        Map Sources: ICRC,
                        {' '}
                        <Link to="https://cod.unocha.org/">UNCODs</Link>
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
                            © Mapbox
                        </Link>
                        <Link
                            to="https://www.openstreetmap.org/about/"
                            title="OpenStreetMap"
                            aria-label="OpenStreetMap"
                            role="listitem"
                        >
                            © OpenStreetMap
                        </Link>
                        <Link
                            className="mapbox-improve-map"
                            to={`https://apps.mapbox.com/feedback/?owner=go-ifrc&amp;id=ckrfe16ru4c8718phmckdfjh0&amp;access_token=${import.meta.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`}
                            title="Map feedback"
                            aria-label="Map feedback"
                            role="listitem"
                        >
                            Improve this map
                        </Link>
                    </div>
                </>
            )}
        />
    );
}

export default GoMapDisclaimer;
