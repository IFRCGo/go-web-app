import {
    SelectInput,
    type SelectInputProps,
} from '@ifrc-go/ui';
import {
    numericIdSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';

import useCountry, { type Country } from '#hooks/domain/useCountry';

type Props<NAME> = SelectInputProps<
    number,
    NAME,
    Country,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: number | undefined, name: NAME, option: Country | undefined) => void;
    value: number | undefined | null;
    regionId?: number;
}

function CountrySelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        regionId,
        ...otherProps
    } = props;

    const countries = useCountry({ region: regionId });

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={countries}
            keySelector={numericIdSelector}
            labelSelector={stringNameSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default CountrySelectInput;
