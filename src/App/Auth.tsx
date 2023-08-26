import type { ReactElement } from 'react';
import { useContext } from 'react';
import { isNotDefined, isDefined } from '@togglecorp/fujs';
import { Navigate } from 'react-router-dom';

import UserContext from '#contexts/user';

interface Props {
    children: ReactElement,
    context: {
        title: string,
        visibility: 'is-authenticated' | 'is-not-authenticated' | 'anything',
    },
}
function Auth(props: Props) {
    const {
        context,
        children,
    } = props;

    const { userAuth: userDetails } = useContext(UserContext);

    if (context.visibility === 'is-authenticated' && isNotDefined(userDetails)) {
        return (
            <Navigate to="/login" />
        );
    }
    if (context.visibility === 'is-not-authenticated' && isDefined(userDetails)) {
        return (
            <Navigate to="/" />
        );
    }

    return children;
}

export default Auth;
