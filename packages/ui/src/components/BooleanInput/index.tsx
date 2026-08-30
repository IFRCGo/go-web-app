import { useMemo } from 'react';

import RadioInput, { CommonProps as RadioInputProps } from '#components/RadioInput';
import { Props as RadioProps } from '#components/RadioInput/Radio';
import useTranslation from '#hooks/useTranslation';
import {
    booleanValueSelector,
    stringLabelSelector,
} from '#utils/selectors';

import i18n from './i18n.json';

export type BooleanInputProps<NAME> = Omit<
RadioInputProps<
    NAME,
    {
        value: boolean,
        label: React.ReactNode,
    },
    boolean,
    RadioProps<boolean>
>, 'options' | 'keySelector' | 'labelSelector'> & ({
    clearable?: never;
    onChange: (value: boolean, name: NAME) => void;
} | {
    clearable: true;
    onChange: (value: boolean | undefined, name: NAME) => void;
})

function BooleanInput<const NAME>(props: BooleanInputProps<NAME>) {
    const strings = useTranslation(i18n);

    const yesNoOptions = useMemo(
        () => [
            { value: true, label: strings.yesLabel },
            { value: false, label: strings.noLabel },
        ],
        [
            strings.yesLabel,
            strings.noLabel,
        ],
    );

    return (
        <RadioInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            options={yesNoOptions}
            keySelector={booleanValueSelector}
            labelSelector={stringLabelSelector}
        />
    );
}

export default BooleanInput;
