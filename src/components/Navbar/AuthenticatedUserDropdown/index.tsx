import { useContext, useCallback } from 'react';

import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

interface Props {
    className?: string;
}

function AuthenticatedUserDropdown(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);

    const { userAuth: userDetails, removeUserAuth: removeUser } = useContext(UserContext);
    const { account: accountRoute } = useContext(RouteContext);
    const handleLogoutClick = useCallback(() => {
        removeUser();
    }, [removeUser]);

    if (!userDetails) {
        return null;
    }

    return (
        <DropdownMenu
            className={className}
            label={userDetails.displayName ?? 'Anonymous'}
            variant="tertiary"
        >
            <DropdownMenuItem
                label={strings.userMenuAccount}
                to={accountRoute.absolutePath}
            />
            <DropdownMenuItem
                label={strings.userMenuLogout}
                onClick={handleLogoutClick}
            />
        </DropdownMenu>
    );
}

export default AuthenticatedUserDropdown;
