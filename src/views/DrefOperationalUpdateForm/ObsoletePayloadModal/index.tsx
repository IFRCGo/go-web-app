import {
    isTruthyString,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    useRequest,
    type GoApiResponse,
} from '#utils/restRequest';
import Button from '#components/Button';
import Modal from '#components/Modal';
import BlockLoading from '#components/BlockLoading';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetDrefResponse = GoApiResponse<'/api/v2/dref/{id}/'>;

// FIXME: use common function
function getUserName(user: GetDrefResponse['modified_by_details'] | undefined) {
    return [user?.first_name, user?.last_name].filter(isTruthyString).join(' ')
        || user?.username
        || 'Unknown User';
}

interface Props {
    opsUpdateId: number;
    onOverwriteButtonClick: (newModifiedAt: string | undefined) => void;
    onCancelButtonClick: (_: boolean) => void;
}

function ObsoletePayloadResolutionModal(props: Props) {
    const {
        opsUpdateId,
        onOverwriteButtonClick,
        onCancelButtonClick,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: opsUpdatePending,
        response: opsUpdateResponse,
    } = useRequest({
        skip: isNotDefined(opsUpdateId),
        url: '/api/v2/dref-op-update/{id}/',
        pathVariables: isDefined(opsUpdateId) ? {
            id: String(opsUpdateId),
        } : undefined,
    });

    return (
        <Modal
            heading={strings.drefChangesConflictWhileSaving}
            headingLevel={3}
            className={styles.obsoletePayloadResolutionModal}
            footerActions={(
                <>
                    <Button
                        name={false}
                        variant="secondary"
                        onClick={onCancelButtonClick}
                    >
                        {strings.drefChangesCancelButton}
                    </Button>
                    <Button
                        name={opsUpdateResponse?.modified_at}
                        disabled={opsUpdatePending}
                        onClick={onOverwriteButtonClick}
                    >
                        {strings.drefChangesOverwriteButton}
                    </Button>
                </>
            )}
        >
            {opsUpdatePending && (
                <BlockLoading />
            )}
            {!opsUpdatePending && (
                <>
                    <div>
                        {strings.drefConflictWhileSaving}
                        <strong>
                            {getUserName(opsUpdateResponse?.modified_by_details)}
                        </strong>
                    </div>
                    <div>
                        {strings.drefChangesWillBeOverridden}
                    </div>
                    <br />
                    <div>
                        <strong>
                            {strings.drefChangesNoteLabel}
                        </strong>
                        {strings.drefChangesWillBeOverridden}
                    </div>
                </>
            )}
        </Modal>
    );
}

export default ObsoletePayloadResolutionModal;
