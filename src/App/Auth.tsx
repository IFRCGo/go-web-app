import { type ReactElement, useContext } from 'react';
import { isNotDefined, isDefined } from '@togglecorp/fujs';
import { Navigate, useParams } from 'react-router-dom';

import UserContext from '#contexts/user';
import FourHundredThree from '#components/FourHundredThree';
import usePermissions from '#hooks/domain/usePermissions';
import { type ExtendedProps } from './routes';

interface Props {
    children: ReactElement,
    context: ExtendedProps,
}
function Auth(props: Props) {
    const {
        context,
        children,
    } = props;

    const urlParams = useParams();
    const perms = usePermissions();

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

    if (context.permissions) {
        const hasPermission = context.permissions(perms, urlParams);

        if (!hasPermission) {
            return (
                <FourHundredThree />
            );
        }
    }

    return children;
}

export default Auth;
