import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { DeleteBinFillIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import useTranslation from '#hooks/useTranslation';
import { getUserName } from '#utils/domain/user';
import { type User } from '#components/domain/UserSearchMultiSelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    userId: number;
    onUserRemove: (item: number) => void;
    userOptions: User[] | undefined | null;
}

function UserItem(props: Props) {
    const {
        className,
        userId,
        onUserRemove,
        userOptions,
    } = props;

    const strings = useTranslation(i18n);

    const userItem = useMemo(
        () => userOptions?.find((item) => item.id === userId),
        [
            userOptions,
            userId,
        ],
    );
    const userName = useMemo(
        () => getUserName(userItem),
        [userItem],
    );

    return (
        <div className={_cs(className, styles.user)}>
            <div className={styles.name}>
                {userName}
            </div>
            <Button
                name={userId}
                className={styles.removeButton}
                onClick={onUserRemove}
                variant="tertiary"
                title={strings.removeUser}
            >
                <DeleteBinFillIcon />
            </Button>
        </div>
    );
}

export default UserItem;
