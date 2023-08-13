import type { Props as SelectInputProps } from '#components/SelectInput';
import SelectInput from '#components/SelectInput';
import useDisasterType from '#hooks/domain/useDisasterType';
import { DisasterTypes } from '#contexts/domain';

export type DisasterTypeItem = NonNullable<DisasterTypes['results']>[number];

function keySelector(type: DisasterTypeItem) {
    return type.id;
}
function labelSelector(type: DisasterTypeItem) {
    return type.name ?? '?';
}

type Props<NAME> = SelectInputProps<
    number,
    NAME,
    DisasterTypeItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (newValue: number | undefined, name: NAME) => void;
    value: number | undefined | null;
    optionsFilter?: (item: DisasterTypeItem) => boolean;
}

// FIXME: filer out name with undefined name
function DisasterTypeSelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        optionsFilter,
        ...otherProps
    } = props;

    const disasterTypes = useDisasterType();

    const options = optionsFilter
        ? disasterTypes?.filter(optionsFilter)
        : disasterTypes;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default DisasterTypeSelectInput;
