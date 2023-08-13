import type { Props as SelectInputProps } from '#components/SelectInput';
import SelectInput from '#components/SelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { components } from '#generated/types';

export type RegionOption = components['schemas']['ApiRegionNameEnum'];

type Props<NAME> = SelectInputProps<
    RegionOption['key'],
    NAME,
    RegionOption,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: RegionOption['key'] | undefined, name: NAME) => void;
    value: RegionOption['key'] | undefined | null;
}

function RegionSelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        ...otherProps
    } = props;

    const { api_region_name: regionOptions } = useGlobalEnums();

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={regionOptions}
            keySelector={(item) => item.key}
            labelSelector={(item) => item.value}
            value={value}
            onChange={onChange}
        />
    );
}

export default RegionSelectInput;
