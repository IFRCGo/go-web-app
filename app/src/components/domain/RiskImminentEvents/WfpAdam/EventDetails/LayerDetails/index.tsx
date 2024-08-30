import { CycloneIcon } from '@ifrc-go/icons';
import {
    Checkbox,
    Container,
    TextOutput,
} from '@ifrc-go/ui';

import {
    LAYER_CYCLONE_BUFFERS,
    LAYER_CYCLONE_NODES,
    LayerOption,
    LayerType,
} from '#utils/domain/risk';

import styles from './styles.module.css';

export interface Props {
    options: LayerOption;
    value: Record<LayerType, boolean>;
    onChange: (value: boolean, name: LayerType) => void;
}

function LayerDetails(props: Props) {
    const {
        options,
        value,
        onChange,
    } = props;

    return (
        <>
            <Checkbox
                label={options.label}
                key={options.key}
                name={options.key}
                value={!!value[options.key]}
                onChange={onChange}
            />
            {options.key === LAYER_CYCLONE_NODES && value[LAYER_CYCLONE_NODES] && (
                <Container
                    heading="Wind speed km/h"
                    headingLevel={5}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconRed} />}
                        value="> 240 km/h"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconRed} />}
                        value="185 to 240 km/h"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconOrange} />}
                        value="110 t0 185 km/h"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconGreen} />}
                        value="<= 110 km/h"
                    />
                </Container>
            )}
            {options.key === LAYER_CYCLONE_BUFFERS && value[LAYER_CYCLONE_BUFFERS] && (
                <Container
                    heading="Wind Buffer"
                    headingLevel={5}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<div className={styles.stormRed} />}
                        value="120 km/h"
                    />
                    <TextOutput
                        icon={<div className={styles.stormOrange} />}
                        value="90 km/h"
                    />
                    <TextOutput
                        icon={<div className={styles.stormGreen} />}
                        value="60 km/h"
                    />
                </Container>
            )}
        </>
    );
}

export default LayerDetails;
