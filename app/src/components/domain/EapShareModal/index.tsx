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
    listToMap,
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
    eapId: number;
    onCancel: () => void;
    onSuccess: () => void;
}

const userKeySelector = (item: User) => item.id;

function EapShareModal(props: Props) {
    const {
        eapId,
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
        url: '/api/v2/eap-registration/{id}/share/',
        pathVariables: { id: eapId },
        body: () => ({
            users,
        }),
        onSuccess: () => {
            alert.show(
                strings.eapShareSuccessfully,
                { variant: 'success' },
            );
            onSuccess();
        },
        onFailure: () => {
            alert.show(
                strings.eapShareFailed,
                { variant: 'danger' },
            );
        },
    });

    const {
        pending: usersPending,
    } = useRequest({
        skip: isNotDefined(eapId),
        url: '/api/v2/eap-share-users/{id}/',
        pathVariables: { id: eapId },
        onSuccess: (response) => {
            if (isDefined(response.users)) {
                setUsers(response.users);
            }

            setUserOptions(response.users_details);
        },
    });

    const handleUserRemove = useCallback((userId: number) => {
        setUsers((oldVal = []) => {
            const index = oldVal.indexOf(userId);

            if (index === -1) return oldVal;

            const userList = [...oldVal];
            userList.splice(index, 1);

            return userList;
        });
    }, [setUsers]);

    const userOptionsMap = useMemo(() => listToMap(
        userOptions,
        (item) => item.id,
    ), [userOptions]);

    const selectedUsers = useMemo(() => (
        users?.map((item) => userOptionsMap?.[item])
    ), [userOptionsMap, users]);

    const userRendererParams = useCallback((userId: number, user: User) => ({
        userId,
        user,
        onUserRemove: handleUserRemove,
    }), [
        handleUserRemove,
    ]);

    return (
        <Modal
            heading={strings.eapShareTitle}
            headerDescription={strings.eapShareDescription}
            onClose={onCancel}
            footerActions={(
                <Button
                    name={null}
                    onClick={triggerUpdate}
                >
                    {strings.eapShareUpdate}
                </Button>
            )}
            size="md"
            withHeaderBorder
        >
            <ListView layout="block">
                <UserSearchMultiSelectInput
                    label={strings.eapSelectUserLabel}
                    name={undefined}
                    value={users}
                    onChange={setUsers}
                    options={userOptions}
                    onOptionsChange={setUserOptions}
                    disabled={updatePending || usersPending}
                />
                <Container
                    emptyMessage={strings.userListEmptyMessage}
                    pending={updatePending || usersPending}
                    headingLevel={6}
                    heading={strings.eapAlreadySharedHeading}
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

export default EapShareModal;
