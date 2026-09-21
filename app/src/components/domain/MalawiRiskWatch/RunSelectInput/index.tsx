import {
    InfoPopup,
    ListView,
    SelectInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props<OPTION extends object, KEY extends string> {
    options: OPTION[] | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => string;
    value: KEY | undefined;
    onChange: (value: KEY | undefined) => void;
    disabled?: boolean;
    infoTitle: string;
    // Shown in the info popup for the selected option
    infoDetails: React.ReactNode;
}

// Compact run or date picker for the side panel header
function RunSelectInput<OPTION extends object, KEY extends string>(props: Props<OPTION, KEY>) {
    const {
        options,
        keySelector,
        labelSelector,
        value,
        onChange,
        disabled,
        infoTitle,
        infoDetails,
    } = props;

    return (
        <SelectInput
            className={styles.runSelect}
            name={undefined}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value={value}
            onChange={onChange}
            disabled={disabled}
            nonClearable
            actions={isDefined(value) && (
                <InfoPopup
                    title={infoTitle}
                    description={(
                        <ListView
                            layout="block"
                            spacing="xs"
                        >
                            {infoDetails}
                        </ListView>
                    )}
                />
            )}
        />
    );
}

export default RunSelectInput;
