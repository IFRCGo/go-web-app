import { isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import UserSearchMultiSelectInput, { type User } from '#components/domain/UserSearchMultiSelectInput';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import { useLazyRequest, useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

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
