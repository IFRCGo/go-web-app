import { useRef, useCallback } from 'react';
import SearchSelectInput from '#components/SearchSelectInput';
import {
    useLazyRequest,
    ListResponse,
} from '#utils/restRequest';

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

export function getDisplayName(user: User) {
    if (user.first_name || user.last_name) {
        return `${user.first_name} ${user.last_name}`;
    }

    return user.username;
}

type Key = string | number;

interface Props<N, O, V extends Key> {
    name: N;
    initialOptions: O[];
    value: V | undefined | null;
    onChange: (newValue: V, name: N) => void;
}

function UserSearchSelectInput<N, O, V extends Key>(props: Props<N, O, V>) {
    const {
        name,
        value,
        onChange,
        initialOptions,
    } = props;

    const callbackRef = useRef<(opt: O[]) => void | undefined>();

    const {
        trigger: triggerSearch,
    } = useLazyRequest<ListResponse<User>, string>({
        url: 'api/v2/users',
        query: (searchString: string) => ({
            name: searchString,
        }),
        onSuccess: (response) => {
            if (callbackRef.current) {
                callbackRef.current(response.results.map((user) => ({
                    label: getDisplayName(user),
                    value: user.id,
                })));
            }
        },
    });

    const handleUserSearch = useCallback((searchString: string | undefined, callback) => {
        if (searchString && searchString.length > 2) {
            triggerSearch(searchString);
        }

        callbackRef.current = callback;

        return [];
    }, [triggerSearch]);

    return (
        <SearchSelectInput
            name={name}
            initialOptions={initialOptions}
            value={value}
            onChange={onChange}
            loadOptions={handleUserSearch}
        />
    );
}

export default UserSearchSelectInput;
