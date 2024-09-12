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
    const strings = useTranslation(i18n);

    return (
        <>
            <Checkbox
                label={options.label}
                key={options.key}
                name={options.key}
                value={!!value[options.key]}
                onChange={onChange}
            />
            {options.key === LAYER_CYCLONE_BUFFERS && value[LAYER_CYCLONE_BUFFERS] && (
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
