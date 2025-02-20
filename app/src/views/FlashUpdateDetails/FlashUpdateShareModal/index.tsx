import { useCallback } from 'react';
import {
    Button,
    Message,
    Modal,
    MultiSelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import {
    type GoApiBody,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
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

    const strings = useTranslation(i18n);

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
                strings.flashUpdateSharedSuccessfully,
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
            heading={strings.flashUpdateShareTitle}
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
                    {strings.flashUpdateShareButtonLabel}
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
                        label={strings.flashUpdateSelectDonors}
                        value={donors}
                        onChange={setDonors}
                        options={donorResponse?.results}
                        keySelector={numericIdSelector}
                        labelSelector={(donor) => donor.organization_name ?? '--'}
                        name={undefined}
                    />
                    <MultiSelectInput
                        label={strings.flashUpdateSelectDonorsGroup}
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
