import type { Props as SelectInputProps } from '#components/SelectInput';
import SelectInput from '#components/SelectInput';
import { numericIdSelector, stringNameSelector } from '#utils/selectors';
import useCountry, { Country } from '#hooks/domain/useCountry';

export type CountryOption = Country;

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
    onChange: (newValue: number | undefined, name: NAME) => void;
    value: number | undefined | null;

    regionFilter?: number;
}

function CountrySelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        regionFilter,
        ...otherProps
    } = props;

    const countries = useCountry({ region: regionFilter });

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
