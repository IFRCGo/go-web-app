import { useState } from 'react';

import SearchMultiSelectInput, {
    SearchMultiSelectInputProps,
} from '#components/SearchMultiSelectInput';

import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const keySelector = (d: User) => d.id;
const labelSelector = (user: User) => {
    if (user.first_name || user.last_name) {
        return `${user.first_name} ${user.last_name}`;
    }

    return user.username;
};

type Def = { containerClassName?: string;}
type UserMultiSelectInputProps<NAME> = SearchMultiSelectInputProps<
    number,
    NAME,
    User,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

// FIXME: better state handling, better popup messages
function UserMultiSelectInput<const NAME>(
    props: UserMultiSelectInputProps<NAME>,
) {
    const {
        className,
        ...otherProps
    } = props;

    const [dropdownShown, setShowDropdown] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const safeSearchText = debouncedSearchText?.trim() ?? '';

    const {
        pending,
        response,
    } = useRequest<ListResponse<User>>({
        skip: !dropdownShown || safeSearchText.length < 2,
        url: '/api/v2/users/',
        query: {
            name: debouncedSearchText,
            limit: 20,
        },
    });

    return (
        <SearchMultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={response?.results}
            optionsPending={pending}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setShowDropdown}
        />
    );
}

export default UserMultiSelectInput;
