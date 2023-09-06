import Button from '#components/Button';
import Modal from '#components/Modal';
import UserSearchMultiSelectInput, { type User } from '#components/domain/UserSearchMultiSelectInput';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import { useLazyRequest, useRequest } from '#utils/restRequest';
import { isDefined } from '@togglecorp/fujs';

interface Props {
    drefId: number;
    onCancel: () => void;
    onSuccess: () => void;
}

function DrefShareModal(props: Props) {
    const {
        drefId,
        onCancel,
        onSuccess,
    } = props;

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
                // FIXME: use translation
                'Successfully updated sharing preferences!',
                { variant: 'success' },
            );
            onSuccess();
        },
    });

    const {
        pending: getPending,
        // response: usersResponse,
    } = useRequest({
        url: '/api/v2/dref-share-user/{id}/',
        pathVariables: { id: drefId },
        onSuccess: (response) => {
            if (isDefined(response.users)) {
                setUsers(response.users);
            }

            setUserOptions(response.users_details);
        },
    });

    return (
        <Modal
            // FIXME: use translations
            heading="Share DREF"
            // FIXME: use translations
            headerDescription="Add or remove users you with whom you want to share the DREF."
            onClose={onCancel}
            footerActions={(
                <Button
                    name={null}
                    onClick={triggerUpdate}
                >
                    {/* FIXME: use translations */}
                    Update
                </Button>
            )}
            size="sm"
        >
            <UserSearchMultiSelectInput
                name={undefined}
                value={users}
                onChange={setUsers}
                options={userOptions}
                onOptionsChange={setUserOptions}
                disabled={updatePending || getPending}
            />
        </Modal>
    );
}

export default DrefShareModal;
