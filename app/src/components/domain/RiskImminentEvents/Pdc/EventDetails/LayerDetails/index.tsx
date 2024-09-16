import { CycloneIcon } from '@ifrc-go/icons';
import {
    Checkbox,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

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
                    heading={strings.pdcWindSpeedHeading}
                    headingLevel={5}
                    headerClassName={styles.headerClassName}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconRed} />}
                        value={resolveToString(
                            strings.pdcWindSpeedWithThreat,
                            { time: '36 hours' },
                        )}
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconOrange} />}
                        value={resolveToString(
                            strings.pdcWindSpeedWithThreat,
                            { time: '48 hours' },
                        )}
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconGreen} />}
                        value={resolveToString(
                            strings.pdcWindSpeedWithThreat,
                            { time: '5 days' },
                        )}
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconBlue} />}
                        value={strings.pdcWindSpeedWithNoThreat}
                    />
                </Container>
            )}
            {layerOption.key === LAYER_CYCLONE_BUFFERS && visibleLayer[LAYER_CYCLONE_BUFFERS] && (
                <Container
                    heading={strings.pdcAlertLevelHeading}
                    headingLevel={5}
                    headerClassName={styles.headerClassName}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<div className={styles.stormRed} />}
                        value={strings.pdcAlertTypeWarning}
                    />
                    <TextOutput
                        icon={<div className={styles.stormOrange} />}
                        value={strings.pdcAlertTypeWatch}
                    />
                    <TextOutput
                        icon={<div className={styles.stormGreen} />}
                        value={strings.pdcAlertTypeAdvisory}
                    />
                    <TextOutput
                        icon={<div className={styles.stormBlue} />}
                        value={strings.pdcAlertTypeInformation}
                    />
                </Container>
            )}
        </>
    );
}

export default LayerDetails;
