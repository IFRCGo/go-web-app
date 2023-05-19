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

export const USER_STORAGE_KEY = 'user';

const UserContext = createContext<UserContextProps>({
    setUser: () => {
        console.warn('UserContext::setUser called without provider');
    },
    hydrateUser: () => {
        console.warn('UserContext::hydrateUser called without provider');
    },
    removeUser: () => {
        console.warn('UserContext::removeUser called without provider');
    },
});

export default UserContext;
