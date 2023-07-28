import { useMemo } from 'react';
import RadioInput from '#components/RadioInput';
import useTranslation from '#hooks/useTranslation';
import { booleanValueSelector, stringLabelSelector } from '#utils/selectors';

import i18n from './i18n.json';

interface Props<NAME> {
    name: NAME;
    onChange: (value: boolean, name: NAME) => void;
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    value: boolean | undefined | null;
    disabled?: boolean;
    readOnly?: boolean;
}

function BooleanInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        label,
        hint,
        error,
        onChange,
        value,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const yesNoOptions = useMemo(
        () => [
            { value: true, label: strings.yesLabel },
            { value: false, label: strings.noLabel },
        ],
        [strings],
    );

    return (
        <RadioInput
            name={name}
            options={yesNoOptions}
            value={value}
            label={label}
            hint={hint}
            keySelector={booleanValueSelector}
            labelSelector={stringLabelSelector}
            onChange={onChange}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
        />
    );
}

export default BooleanInput;
