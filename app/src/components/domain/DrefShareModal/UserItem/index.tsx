import { useMemo } from 'react';
import { DeleteBinFillIcon } from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import { type User } from '#components/domain/UserSearchMultiSelectInput';
import { getUserName } from '#utils/domain/user';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    userId: number;
    user: User;
    onUserRemove?: (item: number) => void;
}

function UserItem(props: Props) {
    const {
        className,
        userId,
        user,
        onUserRemove,
    } = props;

    const strings = useTranslation(i18n);

    const userName = useMemo(
        () => getUserName(user),
        [user],
    );

    return (
        <div className={_cs(className, styles.user)}>
            <div className={styles.name}>
                {userName}
            </div>
            {isDefined(onUserRemove) && (
                <Button
                    name={userId}
                    className={styles.removeButton}
                    onClick={onUserRemove}
                    variant="tertiary"
                    title={strings.removeUser}
                >
                    <DeleteBinFillIcon />
                </Button>
            )}
        </div>
    );
}

export default UserItem;
