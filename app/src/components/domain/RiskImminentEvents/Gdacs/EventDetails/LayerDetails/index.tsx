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
                        value=">= 119 km/h"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconOrange} />}
                        value="93 to 118 km/h"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconGreen} />}
                        value="63 to 92 km/h"
                    />
                </Container>
            )}
            {options.key === LAYER_CYCLONE_BUFFERS && value[LAYER_CYCLONE_BUFFERS] && (
                <Container
                    heading="Alert Level"
                    headingLevel={5}
                    childrenContainerClassName={styles.content}
                >
                    <TextOutput
                        icon={<div className={styles.stormRed} />}
                        value="Red"
                    />
                    <TextOutput
                        icon={<div className={styles.stormOrange} />}
                        value="Orange"
                    />
                    <TextOutput
                        icon={<div className={styles.stormGreen} />}
                        value="Green"
                    />
                </Container>
            )}
        </>
    );
}

export default LayerDetails;
