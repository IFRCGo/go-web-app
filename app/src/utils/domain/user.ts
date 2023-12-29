import {
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

interface User {
    first_name: string | undefined | null;
    last_name: string | undefined | null;
    username: string;
}

// eslint-disable-next-line import/prefer-default-export
export function getUserName(user: User | undefined) {
    if (isNotDefined(user)) {
        return 'Unknown user';
    }

    const name = [user.first_name, user.last_name].filter(isTruthyString).join(' ');
    if (isTruthyString(name)) {
        return name;
    }

    // NOTE: Username can also be email
    // so stripping out the domain part
    const index = user.username.indexOf('@');
    if (index === -1) {
        return user.username;
    }

    return user.username.substring(0, index);
}
