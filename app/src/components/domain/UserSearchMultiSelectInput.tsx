import { useState } from 'react';
import {
    SearchMultiSelectInput,
    type SearchMultiSelectInputProps,
} from '@ifrc-go/ui';

import useDebouncedValue from '#hooks/useDebouncedValue';
import { getUserName } from '#utils/domain/user';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

type UserDetails = NonNullable<GoApiResponse<'/api/v2/user/'>['results']>[number];
export type User = Pick<UserDetails, 'id' | 'first_name' | 'last_name' | 'username'>;

const keySelector = (d: User) => d.id;

type Def = { containerClassName?: string;}
type UserMultiSelectInputProps<NAME> = SearchMultiSelectInputProps<
    number,
    NAME,
    User,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
    | 'selectedOnTop'
>;

function UserSearchMultiSelectInput<const NAME>(
    props: UserMultiSelectInputProps<NAME>,
) {
    const {
        className,
        options,
        ...otherProps
    } = props;

    const [dropdownShown, setShowDropdown] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        pending,
        response,
    } = useRequest({
        skip: (debouncedSearchText?.length ?? 0) < 1 || !dropdownShown,
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
            labelSelector={getUserName}
            onSearchValueChange={setSearchText}
            options={options}
            searchOptions={response?.results ?? options}
            optionsPending={pending}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setShowDropdown}
            selectedOnTop
        />
    );
}

export default UserSearchMultiSelectInput;
