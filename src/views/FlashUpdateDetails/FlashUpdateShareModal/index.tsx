import { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import Message from '#components/Message';
import MultiSelectInput from '#components/MultiSelectInput';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import {
    useRequest,
    useLazyRequest,
    GoApiBody,
} from '#utils/restRequest';
import { numericIdSelector, stringNameSelector } from '#utils/selectors';

import styles from './styles.module.css';

type ShareRequestBody = GoApiBody<'/api/v2/share-flash-update/', 'POST'>;

interface Props {
    id: number;
    onClose: () => void;
}

function FlashUpdateShareModal(props: Props) {
    const {
        id,
        onClose,
    } = props;

    const [donors, setDonors] = useInputState<number[] | undefined>(undefined);
    const [donorGroups, setDonorGroups] = useInputState<number[] | undefined>(undefined);
    const alert = useAlert();

    const {
        pending: donorResponsePending,
        response: donorResponse,
    } = useRequest({
        url: '/api/v2/donor/',
    });

    const {
        pending: donorGroupResponsePending,
        response: donorGroupResponse,
    } = useRequest({
        url: '/api/v2/donor-group/',
    });

    const {
        pending: sharePending,
        trigger: triggerShare,
        error: shareError,
    } = useLazyRequest({
        method: 'POST',
        body: (ctx: ShareRequestBody) => ctx,
        url: '/api/v2/share-flash-update/',
        onSuccess: () => {
            alert.show(
                'Flash Update shared successfully!',
                { variant: 'success' },
            );
            onClose();
        },
    });

    const hasDonorOrDonorGroup = (donors && donors.length > 0)
        || (donorGroups && donorGroups.length > 0);

    const handleShareButtonClick = useCallback(
        () => {
            triggerShare({
                flash_update: id,
                donors,
                donor_groups: donorGroups,
            });
        },
        [triggerShare, donors, donorGroups, id],
    );

    const pending = sharePending || donorResponsePending || donorGroupResponsePending;

    return (
        <Modal
            // FIXME: use translation
            heading="Share Flash Update"
            onClose={onClose}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleShareButtonClick}
                    disabled={!hasDonorOrDonorGroup
                        || sharePending
                        || donorResponsePending
                        || donorGroupResponsePending}
                >
                    {/* FIXME: use translation */}
                    Share
                </Button>
            )}
            contentViewType="vertical"
            className={styles.flashUpdateShareModal}
        >
            {pending && (
                <Message pending />
            )}
            {!pending && (
                <>
                    {isDefined(shareError) && (
                        <div className={styles.error}>
                            {shareError.value.messageForNotification}
                        </div>
                    )}
                    <MultiSelectInput
                        // FIXME: use translation
                        label="Select Donors"
                        value={donors}
                        onChange={setDonors}
                        options={donorResponse?.results}
                        keySelector={numericIdSelector}
                        labelSelector={(donor) => donor.organization_name ?? '--'}
                        name={undefined}
                    />
                    <MultiSelectInput
                        // FIXME: use translation
                        label="Select Donor Groups"
                        value={donorGroups}
                        onChange={setDonorGroups}
                        options={donorGroupResponse?.results}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                        name={undefined}
                    />
                </>
            )}
        </Modal>
    );
}

export default FlashUpdateShareModal;
