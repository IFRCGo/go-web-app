import type { Props as SelectInputProps } from '#components/SelectInput';
import SelectInput from '#components/SelectInput';
import { useRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';

function regionNameSelector({ region_name }: { region_name: string }) {
    return region_name;
}

interface RegionOption {
    id: number;
    region_name: string;
}

type Props<NAME> = SelectInputProps<
    number,
    NAME,
    RegionOption,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: number | undefined, name: NAME) => void;
    value: number | undefined | null;
}

function RegionSelectInput<NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        ...otherProps
    } = props;

    const { response: regionResponse } = useRequest({
        url: '/api/v2/region/',
    });

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={regionResponse?.results}
            keySelector={numericIdSelector}
            labelSelector={regionNameSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default RegionSelectInput;
