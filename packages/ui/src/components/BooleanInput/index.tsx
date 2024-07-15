import { useMemo } from 'react';

import RadioInput, { Props as RadioInputProps } from '#components/RadioInput';
import { Props as RadioProps } from '#components/RadioInput/Radio';
import useTranslation from '#hooks/useTranslation';
import {
    booleanValueSelector,
    stringLabelSelector,
} from '#utils/selectors';

import i18n from './i18n.json';

export type BooleanInputProps<NAME> = RadioInputProps<
    NAME,
    { value: boolean, label: string},
    boolean,
    RadioProps<boolean, NAME>,
    'options' | 'keySelector' | 'labelSelector'
>;

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
