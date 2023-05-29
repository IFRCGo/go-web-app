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
type UserMultiSelectInputProps<K extends string> = SearchMultiSelectInputProps<
    number,
    K,
    User,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
>;

function UserMultiSelectInput<K extends string>(
    props: UserMultiSelectInputProps<K>,
) {
    const {
        className,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        pending,
        response,
    } = useRequest<ListResponse<User>>({
        skip: (debouncedSearchText?.length ?? 0) < 2 || !opened,
        url: 'api/v2/users/',
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
            onShowDropdownChange={setOpened}
        />
    );
}

export default UserMultiSelectInput;
