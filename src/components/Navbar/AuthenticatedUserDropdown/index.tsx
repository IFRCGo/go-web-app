import { useContext, useCallback } from 'react';

import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import routes from '#routes';

import commonStrings from '#strings/common';

import UserContext from '#contexts/user';

interface Props {
    className?: string;
}

function AuthenticatedUserDropdown(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation('common', commonStrings);

    const { userDetails, removeUser } = useContext(UserContext);
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
                href={routes.account.absolutePath}
            />
            <DropdownMenuItem
                label={strings.userMenuLogout}
                onClick={handleLogoutClick}
            />
        </DropdownMenu>
    );
}

export default AuthenticatedUserDropdown;
