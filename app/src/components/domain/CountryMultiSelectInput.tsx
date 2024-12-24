import {
    MultiSelectInput,
    type MultiSelectInputProps,
} from '@ifrc-go/ui';
import {
    numericIdSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';

import useCountry, { type Country } from '#hooks/domain/useCountry';

export type CountryOption = Country;

type Props<NAME> = MultiSelectInputProps<
    number,
    NAME,
    Country,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: number[], name: NAME) => void;
    value: number[] | undefined | null;
    filterByRegion?: number | undefined;
}

function CountrySelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        filterByRegion,
        ...otherProps
    } = props;

    const countries = useCountry({ region: filterByRegion });

    return (
        <MultiSelectInput
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
