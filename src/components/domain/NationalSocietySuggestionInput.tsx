import type { Props as SelectInputProps } from '#components/SelectInput';
import SelectInput from '#components/SelectInput';
import useNationalSociety, { NationalSociety } from '#hooks/domain/useNationalSociety';

function countrySocietyNameSelector(country: NationalSociety) {
    return country.society_name;
}

type Props<NAME> = SelectInputProps<
    string,
    NAME,
    NationalSociety,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: string | undefined, name: NAME) => void;
    value: string | undefined | null;
}

function NationalSocietySuggestionInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        ...otherProps
    } = props;

    const nationalSocieties = useNationalSociety();

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={nationalSocieties}
            keySelector={countrySocietyNameSelector}
            labelSelector={countrySocietyNameSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default NationalSocietySuggestionInput;
