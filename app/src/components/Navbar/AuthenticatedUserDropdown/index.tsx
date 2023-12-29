import {
    useCallback,
    useContext,
} from 'react';
import { DropdownMenu } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';
import UserContext from '#contexts/user';
import useAuth from '#hooks/domain/useAuth';
import useUserMe from '#hooks/domain/useUserMe';
import { getUserName } from '#utils/domain/user';

import i18n from './i18n.json';

interface Props {
    className?: string;
}

function AuthenticatedUserDropdown(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);
    const { isAuthenticated } = useAuth();

    const {
        userAuth: userDetails,
        removeUserAuth: removeUser,
    } = useContext(UserContext);
    const userMe = useUserMe();

    const handleLogoutConfirm = useCallback(() => {
        removeUser();
        window.location.reload();
    }, [removeUser]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <DropdownMenu
            className={className}
            label={(
                userMe
                    ? getUserName(userMe)
                    : userDetails?.displayName ?? strings.userDisplayNameAnonymous
            )}
            variant="tertiary"
            persistent
        >
            <DropdownMenuItem
                type="link"
                to="accountLayout"
            >
                {strings.userMenuAccount}
            </DropdownMenuItem>
            <DropdownMenuItem
                name={undefined}
                type="confirm-button"
                onConfirm={handleLogoutConfirm}
                persist
            >
                {strings.userMenuLogout}
            </DropdownMenuItem>
        </DropdownMenu>
    );
}

export default AuthenticatedUserDropdown;
