import {
    SelectInput,
    type SelectInputProps,
} from '@ifrc-go/ui';
import { stringValueSelector } from '@ifrc-go/ui/utils';

import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

export type RegionOption = components<'read'>['schemas']['ApiRegionNameEnum'];
function regionKeySelector(option: RegionOption) {
    return option.key;
}

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
    onChange: (newValue: RegionOption['key'] | undefined, name: NAME, value: RegionOption | undefined) => void;
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
            keySelector={regionKeySelector}
            labelSelector={stringValueSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default RegionSelectInput;
