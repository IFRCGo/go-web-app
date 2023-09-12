import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import Button from '#components/Button';
import Modal from '#components/Modal';
import BlockLoading from '#components/BlockLoading';
import useTranslation from '#hooks/useTranslation';
import { getUserName } from '#utils/domain/user';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
