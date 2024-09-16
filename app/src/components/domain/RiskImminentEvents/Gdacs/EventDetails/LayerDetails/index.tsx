import {
    Checkbox,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import {
    LAYER_CYCLONE_BUFFERS,
    LayerOption,
    LayerType,
} from '#utils/domain/risk';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    layerOption: LayerOption;
    visibleLayer: Record<LayerType, boolean>;
    onLayerVisibilityChange: (value: boolean, name: LayerType) => void;
}

function LayerDetails(props: Props) {
    const {
        layerOption,
        visibleLayer,
        onLayerVisibilityChange,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <Checkbox
                label={layerOption.label}
                key={layerOption.key}
                name={layerOption.key}
                value={!!visibleLayer[layerOption.key]}
                onChange={onLayerVisibilityChange}
            />
            {layerOption.key === LAYER_CYCLONE_BUFFERS && visibleLayer[LAYER_CYCLONE_BUFFERS] && (
                <Container
                    heading={strings.gdacsAlertLevelHeading}
                    headingLevel={5}
                    headerClassName={styles.headerClassName}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<div className={styles.stormRed} />}
                        value={strings.gdacsAlertLevelRed}
                    />
                    <TextOutput
                        icon={<div className={styles.stormOrange} />}
                        value={strings.gdacsAlertLevelOrange}
                    />
                    <TextOutput
                        icon={<div className={styles.stormGreen} />}
                        value={strings.gdacsAlertLevelGreen}
                    />
                </Container>
            )}
        </>
    );
}

export default LayerDetails;
