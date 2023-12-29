import {
    BlockLoading,
    Button,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { getUserName } from '#utils/domain/user';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    drefId: number;
    onOverwriteButtonClick: (newModifiedAt: string | undefined) => void;
    onCancelButtonClick: (_: boolean) => void;
}

function ObsoletePayloadResolutionModal(props: Props) {
    const {
        drefId,
        onOverwriteButtonClick,
        onCancelButtonClick,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: drefPending,
        response: drefResponse,
    } = useRequest({
        skip: isNotDefined(drefId),
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(drefId) ? {
            id: String(drefId),
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
                        name={drefResponse?.modified_at}
                        disabled={drefPending}
                        onClick={onOverwriteButtonClick}
                    >
                        {strings.drefChangesOverwriteButton}
                    </Button>
                </>
            )}
        >
            {drefPending && (
                <BlockLoading />
            )}
            {!drefPending && (
                <>
                    <div>
                        {strings.drefConflictWhileSaving}
                        <strong>
                            {getUserName(drefResponse?.modified_by_details)}
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
