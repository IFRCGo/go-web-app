import { _cs } from '@togglecorp/fujs';
import Map, {
  MapContainer,
  MapSource,
  MapLayer,
  MapTooltip
} from '@togglecorp/re-map';

import GoMapDisclaimer from '#components/GoMapDisclaimer';
import { defaultMapStyle, defaultMapOptions } from '#utils/map';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import commonStrings from '#strings/common';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function ActiveOperationMap(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation('common', commonStrings);

    return (
        <Container
            className={_cs(styles.activeOperationMap, className)}
            heading={strings.activeOperationsTitle}
            withHeaderBorder
        >
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
            >
                <div className={styles.mapContainerWrapper}>
                  <MapContainer className={styles.mapContainer} />
                  <GoMapDisclaimer className={styles.mapDisclaimer}/>
                </div>
            </Map>
        </Container>
    );
}

export default ActiveOperationMap;
