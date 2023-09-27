import { type ReactElement, Fragment } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import useAuth from '#hooks/domain/useAuth';
import FourHundredThree from '#components/FourHundredThree';
import usePermissions from '#hooks/domain/usePermissions';
import { type ExtendedProps } from './routes';

interface Props {
    children: ReactElement,
    context: ExtendedProps,
    absolutePath: string,
}
function Auth(props: Props) {
    const {
        context,
        children,
        absolutePath,
    } = props;

    const urlParams = useParams();
    const perms = usePermissions();

    const { isAuthenticated } = useAuth();

    if (context.visibility === 'is-authenticated' && !isAuthenticated) {
        return (
            <Navigate to="/login" />
        );
    }
    if (context.visibility === 'is-not-authenticated' && isAuthenticated) {
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

    return (
        <Fragment
            key={absolutePath}
        >
            {children}
        </Fragment>
    );
}

export default Auth;
