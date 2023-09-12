import { createContext } from 'react';

export interface UserAuth {
    id: number;
    // FIXME: why do we not use displayName for other users?
    displayName: string;
    token: string;
    expires: string;

    username: string;
    firstName: string | undefined;
    lastName: string | undefined;
}

export interface UserContextProps {
    userAuth: UserAuth | undefined,
    setUserAuth: (userDetails: UserAuth) => void,
    hydrateUserAuth: () => void;
    removeUserAuth: () => void;
}

const UserContext = createContext<UserContextProps>({
    setUserAuth: () => {
        // eslint-disable-next-line no-console
        console.warn('UserContext::setUser called without provider');
    },
    hydrateUserAuth: () => {
        // eslint-disable-next-line no-console
        console.warn('UserContext::hydrateUser called without provider');
    },
    removeUserAuth: () => {
        // eslint-disable-next-line no-console
        console.warn('UserContext::removeUser called without provider');
    },
    userAuth: undefined,
});

export default UserContext;
