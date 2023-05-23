import { createContext } from 'react';

export interface UserDetails {
    id: number;
    username: string;
    firstName: string | undefined;
    lastName: string | undefined;
    displayName: string;
    token: string;
}

export interface UserContextProps {
    userDetails?: UserDetails,
    setUser: (userDetails: UserDetails) => void,
    hydrateUser: () => void;
    removeUser: () => void;
}

const UserContext = createContext<UserContextProps>({
    setUser: () => {
        // eslint-disable-next-line no-console
        console.warn('UserContext::setUser called without provider');
    },
    hydrateUser: () => {
        // eslint-disable-next-line no-console
        console.warn('UserContext::hydrateUser called without provider');
    },
    removeUser: () => {
        // eslint-disable-next-line no-console
        console.warn('UserContext::removeUser called without provider');
    },
});

export default UserContext;
