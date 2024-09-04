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
                        icon={<CycloneIcon className={styles.iconBlue} />}
                        value="63 km/h with no current threat"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconGreen} />}
                        value="63 km/h imapct within 5 days"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconOrange} />}
                        value="63 km/h imapct within 48 hours"
                    />
                    <TextOutput
                        icon={<CycloneIcon className={styles.iconRed} />}
                        value="63 km/h imapct within 36 hours"
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
                        icon={<div className={styles.stormBlue} />}
                        value="Information"
                    />
                    <TextOutput
                        icon={<div className={styles.stormGreen} />}
                        value="Advisory"
                    />
                    <TextOutput
                        icon={<div className={styles.stormOrange} />}
                        value="Watch"
                    />
                    <TextOutput
                        icon={<div className={styles.stormRed} />}
                        value="Warning"
                    />
                </Container>
            )}
        </>
    );
}

export default LayerDetails;
