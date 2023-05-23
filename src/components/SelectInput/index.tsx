import SearchSelectInput, { SearchSelectInputProps } from '#components/SearchSelectInput';
import { rankedSearchOnList } from '#utils/common';

type Def = { containerClassName?: string };
type OptionKey = string | number;

export type SelectInputProps<
    T extends OptionKey,
    K extends string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    O extends object,
    P extends Def,
> = SearchSelectInputProps<T, K, O, P, 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount'>;

// eslint-disable-next-line @typescript-eslint/ban-types
function SelectInput<T extends OptionKey, K extends string, O extends object, P extends Def>(
    props: SelectInputProps<T, K, O, P>,
) {
    const {
        name,
        options,
        labelSelector,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        nonClearable,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        onChange,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        totalOptionsCount,
        ...otherProps
    } = props;

    // NOTE: this looks weird but we need to use typeguard to identify between
    // different union types (for onChange and nonClearable)
    // eslint-disable-next-line react/destructuring-assignment
    if (props.nonClearable) {
        return (
            <SearchSelectInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                // eslint-disable-next-line react/destructuring-assignment
                onChange={props.onChange}
                // eslint-disable-next-line react/destructuring-assignment
                nonClearable={props.nonClearable}
                name={name}
                options={options}
                labelSelector={labelSelector}
                sortFunction={rankedSearchOnList}
                searchOptions={options}
            />
        );
    }
    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            // eslint-disable-next-line react/destructuring-assignment
            onChange={props.onChange}
            // eslint-disable-next-line react/destructuring-assignment
            nonClearable={props.nonClearable}
            name={name}
            options={options}
            labelSelector={labelSelector}
            sortFunction={rankedSearchOnList}
            searchOptions={options}
        />
    );
}

export default SelectInput;
