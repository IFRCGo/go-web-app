import { useState } from 'react';

import SearchMultiSelectInput, {
    SearchMultiSelectInputProps,
} from '#components/SearchMultiSelectInput';

import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';

type UserDetails = NonNullable<GoApiResponse<'/api/v2/user/'>['results']>[number];
export type User = Pick<UserDetails, 'id' | 'first_name' | 'last_name' | 'username'>;

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
    | 'selectedOnTop'
>;

// FIXME: better state handling, better popup messages
function UserSearchMultiSelectInput<const NAME>(
    props: UserMultiSelectInputProps<NAME>,
) {
    const {
        className,
        ...otherProps
    } = props;

    const [dropdownShown, setShowDropdown] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        pending,
        response,
    } = useRequest({
        skip: !dropdownShown,
        url: '/api/v2/users/',
        query: {
            name: debouncedSearchText,
            limit: 20,
        },
        preserveResponse: true,
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
            selectedOnTop
        />
    );
}

export default UserSearchMultiSelectInput;
