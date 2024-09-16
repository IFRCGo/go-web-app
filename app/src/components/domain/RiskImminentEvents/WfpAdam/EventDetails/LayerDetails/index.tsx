import { CycloneIcon } from '@ifrc-go/icons';
import {
    Checkbox,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import {
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
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
            {layerOption.key === LAYER_CYCLONE_NODES && visibleLayer[LAYER_CYCLONE_NODES] && (
                <Container
                    heading={strings.wfpWindSpeedHeading}
                    headingLevel={5}
                    headerClassName={styles.headerClassName}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconRed} />}
                        value={strings.wfpWindSpeedExtreme}
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconOrange} />}
                        value={strings.wfpWindSpeedModerate}
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconGreen} />}
                        value={strings.wfpWindSpeedLow}
                    />
                </Container>
            )}
            {layerOption.key === LAYER_CYCLONE_BUFFERS && visibleLayer[LAYER_CYCLONE_BUFFERS] && (
                <Container
                    heading={strings.wfpAlertLevelHeading}
                    headingLevel={5}
                    headerClassName={styles.headerClassName}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<div className={styles.stormRed} />}
                        value={strings.wfpAlertLevelRed}
                    />
                    <TextOutput
                        icon={<div className={styles.stormOrange} />}
                        value={strings.wfpAlertLevelOrange}
                    />
                    <TextOutput
                        icon={<div className={styles.stormGreen} />}
                        value={strings.wfpAlertLevelGreen}
                    />
                </Container>
            )}
        </>
    );
}

export default LayerDetails;
