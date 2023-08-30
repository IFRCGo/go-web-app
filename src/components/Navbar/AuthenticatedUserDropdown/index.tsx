import { useContext, useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';

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

    const handleLogoutClick = useCallback(() => {
        removeUser();
    }, [removeUser]);

    if (isNotDefined(userDetails)) {
        return null;
    }

    return (
        <DropdownMenu
            className={className}
            label={userDetails.displayName ?? 'Anonymous'}
            variant="tertiary"
        >
            <DropdownMenuItem
                type="link"
                to="accountLayout"
            >
                {strings.userMenuAccount}
            </DropdownMenuItem>
            <DropdownMenuItem
                name={undefined}
                type="button"
                onClick={handleLogoutClick}
            >
                {strings.userMenuLogout}
            </DropdownMenuItem>
        </DropdownMenu>
    );
}

export default AuthenticatedUserDropdown;
