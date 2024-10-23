import SearchSelectInput, { Props as SearchSelectInputProps } from '#components/SearchSelectInput';
import { rankedSearchOnList } from '#utils/common';

type Def = { containerClassName?: string };
type OptionKey = string | number;

export type Props<
    OPTION_KEY extends OptionKey,
    NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
    OMISSION extends string,
> = SearchSelectInputProps<
    OPTION_KEY,
    NAME,
    OPTION,
    RENDER_PROPS,
    OMISSION | 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount'
    | 'selectedOnTop'
>;

function SelectInput<
    OPTION_KEY extends OptionKey,
    const NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
>(
    props: Props<OPTION_KEY, NAME, OPTION, RENDER_PROPS, never>,
) {
    const {
        name,
        options,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        nonClearable,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange,
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
                sortFunction={rankedSearchOnList}
                searchOptions={options}
                selectedOnTop={false}
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
            sortFunction={rankedSearchOnList}
            searchOptions={options}
            selectedOnTop={false}
        />
    );
}

export default SelectInput;
