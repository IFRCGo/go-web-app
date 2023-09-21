import type { MultiSelectInputProps } from '#components/MultiSelectInput';
import MultiSelectInput from '#components/MultiSelectInput';
import useCountry, { Country } from '#hooks/domain/useCountry';

function keySelector(value: CountryOption) {
    return value.iso3;
}
function labelSelector(value: CountryOption) {
    return value.name;
}

export type CountryOption = Country;

type Props<NAME> = MultiSelectInputProps<
    string,
    NAME,
    Country,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: string[], name: NAME) => void;
    value: string[] | undefined | null;
    regionFilter?: number;
}

function CountryIsoMultiSelectInput<const NAME>(props: Props<NAME>) {
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
        <MultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={countries}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default CountryIsoMultiSelectInput;
