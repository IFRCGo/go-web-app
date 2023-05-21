import { useRef, useState, useCallback } from 'react';
import { unique } from '@togglecorp/fujs';
import SearchMultiSelectInput from '#components/SearchMultiSelectInput';
import {
    useLazyRequest,
    ListResponse,
} from '#utils/restRequest';
import { NameType } from '#components/types';

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

function keySelector(user: User) {
    return user.id;
}

function labelSelector(user: User) {
    if (user.first_name || user.last_name) {
        return `${user.first_name} ${user.last_name}`;
    }

    return user.username;
}

interface Props<N extends NameType> {
    name: N;
    initialOptions: User[];
    value: number[] | undefined | null;
    onChange: (newValue: number[] | undefined, name: N) => void;
}

function UserSearchSelectInput<N extends NameType>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        initialOptions,
    } = props;

    const [options, setOptions] = useState<User[]>(initialOptions);
    const callbackRef = useRef<(opt: User[]) => void | undefined>();

    const {
        trigger: triggerSearch,
    } = useLazyRequest<ListResponse<User>, string>({
        url: 'api/v2/users',
        query: (searchString: string) => ({
            name: searchString,
        }),
        onSuccess: (response) => {
            setOptions((oldOptions) => unique(
                [...oldOptions, ...response.results],
                keySelector,
            ));
            if (callbackRef.current) {
                callbackRef.current(response.results);
            }
        },
    });

    const handleUserSearch = useCallback((
        searchString: string | undefined,
        callback: (newUsers: User[]) => void,
    ) => {
        if (searchString && searchString.length > 2) {
            triggerSearch(searchString);
        }

        callbackRef.current = callback;

        return [];
    }, [triggerSearch]);

    return (
        <SearchMultiSelectInput
            name={name}
            initialOptions={initialOptions}
            options={options}
            keySelector={keySelector}
            value={value}
            onChange={onChange}
            loadOptions={handleUserSearch}
        />
    );
}

export default UserSearchSelectInput;
