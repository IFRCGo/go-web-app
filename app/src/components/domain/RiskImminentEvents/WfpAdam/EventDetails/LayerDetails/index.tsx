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
    options: LayerOption;
    layers: Record<LayerType, boolean>;
    onLayerChange: (value: boolean, name: LayerType) => void;
}

function LayerDetails(props: Props) {
    const {
        options,
        layers,
        onLayerChange,
    } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <Checkbox
                label={options.label}
                key={options.key}
                name={options.key}
                value={!!layers[options.key]}
                onChange={onLayerChange}
            />
            {options.key === LAYER_CYCLONE_NODES && layers[LAYER_CYCLONE_NODES] && (
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
            {options.key === LAYER_CYCLONE_BUFFERS && layers[LAYER_CYCLONE_BUFFERS] && (
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
