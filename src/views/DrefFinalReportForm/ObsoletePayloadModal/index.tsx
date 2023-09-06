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

type GetFinalReportResponse = GoApiResponse<'/api/v2/dref-final-report/{id}/'>;

// FIXME: use common function
function getUserName(user: GetFinalReportResponse['modified_by_details'] | undefined) {
    return [user?.first_name, user?.last_name].filter(isTruthyString).join(' ')
        || user?.username
        || 'Unknown User';
}

interface Props {
    finalReportId: number;
    onOverwriteButtonClick: (newModifiedAt: string | undefined) => void;
    onCancelButtonClick: (_: boolean) => void;
}

function ObsoletePayloadResolutionModal(props: Props) {
    const {
        finalReportId,
        onOverwriteButtonClick,
        onCancelButtonClick,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: finalReportPending,
        response: finalReportResponse,
    } = useRequest({
        skip: isNotDefined(finalReportId),
        url: '/api/v2/dref-final-report/{id}/',
        pathVariables: isDefined(finalReportId) ? {
            id: String(finalReportId),
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
                        name={finalReportResponse?.modified_at}
                        disabled={finalReportPending}
                        onClick={onOverwriteButtonClick}
                    >
                        {strings.drefChangesOverwriteButton}
                    </Button>
                </>
            )}
        >
            {finalReportPending && (
                <BlockLoading />
            )}
            {!finalReportPending && (
                <>
                    <div>
                        {strings.drefConflictWhileSaving}
                        <strong>
                            {getUserName(finalReportResponse?.modified_by_details)}
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
