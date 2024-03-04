import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    List,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import UserSearchMultiSelectInput, { type User } from '#components/domain/UserSearchMultiSelectInput';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import UserItem from './UserItem';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    drefId: number;
    onCancel: () => void;
    onSuccess: () => void;
}

const userKeySelector = (item: User) => item.id;

function DrefShareModal(props: Props) {
    const {
        drefId,
        onCancel,
        onSuccess,
    } = props;

    const strings = useTranslation(i18n);

    const alert = useAlert();
    const [users, setUsers] = useInputState<number[]>([]);
    const [userOptions, setUserOptions] = useInputState<User[] | undefined | null>([]);

    const {
        pending: updatePending,
        trigger: triggerUpdate,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-share/',
        body: () => ({
            dref: drefId,
            users,
        }),
        onSuccess: () => {
            alert.show(
                strings.drefShareSuccessfully,
                { variant: 'success' },
            );
            onSuccess();
        },
    });

    const {
        pending: getPending,
        // response: usersResponse,
    } = useRequest({
        skip: isNotDefined(drefId),
        url: '/api/v2/dref-share-user/{id}/',
        pathVariables: { id: drefId },
        onSuccess: (response) => {
            if (isDefined(response.users)) {
                setUsers(response.users);
            }

            setUserOptions(response.users_details);
        },
    });

    const handleUserRemove = useCallback((userId: number) => {
        setUsers((oldVal = []) => (
            oldVal.filter((item) => item !== userId)
        ));
    }, [setUsers]);

    const selectedUsers = useMemo(() => (
        userOptions?.filter((user) => users.includes(user.id))
    ), [userOptions, users]);

    const userRendererParams = useCallback((userId: number, user: User) => ({
        userId,
        user,
        onUserRemove: handleUserRemove,
    }), [
        handleUserRemove,
    ]);

    return (
        <Modal
            overlayClassName={styles.overlay}
            modalContainerClassName={styles.modalContainer}
            className={styles.drefShareModal}
            heading={strings.drefShareTitle}
            headerDescription={strings.drefShareDescription}
            onClose={onCancel}
            footerActions={(
                <Button
                    name={null}
                    onClick={triggerUpdate}
                >
                    {strings.drefShareUpdate}
                </Button>
            )}
            size="md"
            childrenContainerClassName={styles.content}
        >
            <UserSearchMultiSelectInput
                name={undefined}
                value={users}
                onChange={setUsers}
                options={userOptions}
                onOptionsChange={setUserOptions}
                disabled={updatePending || getPending}
            />
            <List
                className={styles.userList}
                messageClassName={styles.message}
                data={selectedUsers}
                renderer={UserItem}
                keySelector={userKeySelector}
                rendererParams={userRendererParams}
                emptyMessage={strings.userListEmptyMessage}
                errored={false}
                pending={updatePending || getPending}
                filtered={false}
                compact
            />
        </Modal>
    );
}

export default DrefShareModal;
