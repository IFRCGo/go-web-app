import { useContext } from 'react';

import type { Props as SelectInputProps } from '#components/SelectInput';
import SelectInput from '#components/SelectInput';
import { numericKeySelector, stringValueSelector } from '#utils/selectors';
import ServerEnumsContext from '#contexts/server-enums';

interface RegionOption {
    key: number;
    value: string;
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

    const {
        api_region_name: regionOptions,
    } = useContext(ServerEnumsContext);

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={regionOptions}
            keySelector={numericKeySelector}
            labelSelector={stringValueSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default RegionSelectInput;
