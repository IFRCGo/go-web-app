import { useMemo } from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ButtonLayout,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type User } from '#components/domain/UserSearchMultiSelectInput';
import { getUserName } from '#utils/domain/user';

import i18n from './i18n.json';

interface Props {
    userId: number;
    user: User;
    onUserRemove?: (item: number) => void;
}

function ShareUserItem(props: Props) {
    const {
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
        <ButtonLayout
        // FIXME: use appropriate component
            readOnly
            spacingOffset={-2}
            spacing="sm"
            after={(
                <Button
                    name={userId}
                    onClick={onUserRemove}
                    styleVariant="action"
                    title={strings.removeUser}
                >
                    <CloseLineIcon />
                </Button>
            )}
            styleVariant="translucent"
        >
            {userName}
        </ButtonLayout>
    );
}

export default ShareUserItem;
