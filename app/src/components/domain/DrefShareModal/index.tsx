import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Container,
    ListView,
    Modal,
    RawList,
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

import ShareUserItem from '../ShareUserItem';

import i18n from './i18n.json';

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
            withHeaderBorder
        >
            <ListView layout="block">
                <UserSearchMultiSelectInput
                    // FIXME: use strings
                    label="Select users"
                    name={undefined}
                    value={users}
                    onChange={setUsers}
                    options={userOptions}
                    onOptionsChange={setUserOptions}
                    disabled={updatePending || getPending}
                />
                <Container
                    emptyMessage={strings.userListEmptyMessage}
                    pending={updatePending || getPending}
                    headingLevel={6}
                    // FIXME: use strings
                    heading="Already shared to"
                    withHeaderBorder
                    empty={isNotDefined(selectedUsers) || selectedUsers.length === 0}
                >
                    <ListView
                        withWrap
                        spacing="xs"
                    >
                        <RawList
                            data={selectedUsers}
                            renderer={ShareUserItem}
                            keySelector={userKeySelector}
                            rendererParams={userRendererParams}
                        />
                    </ListView>
                </Container>
            </ListView>
        </Modal>
    );
}

export default DrefShareModal;
