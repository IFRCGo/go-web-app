import { isDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import Button from '#components/Button';
import Modal from '#components/Modal';
import BlockLoading from '#components/BlockLoading';
import useTranslation from '#hooks/useTranslation';
import {
    DrefApiFields,
} from '../common';

import i18n from './i18n.json';
import styles from './styles.module.css';

function getUserName(user: DrefApiFields['modified_by_details'] | undefined) {
    if (!user) {
        return 'Unknown User';
    }

    if (user.first_name) {
        return [
            user.first_name,
            user.last_name,
        ].filter(isDefined).join(' ');
    }

    if (!user.username) {
        return 'Unknown User';
    }

    return user.username;
}

interface Props {
  drefId: number;
  onOverwriteButtonClick: (newModifiedAt: string | undefined) => void;
  onCancelButtonClick: () => void;
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
    } = useRequest<DrefApiFields>({
        skip: !drefId,
        url: `api/v2/dref/${drefId}/`,
    });

    return (
        <Modal
            heading={strings.drefChangesConflictWhileSaving}
            headingLevel={3}
            onClose={onCancelButtonClick}
            hideCloseButton
            className={styles.obsoletePayloadResolutionModal}
            footerActions={(
                <>
                    <Button
                        name={undefined}
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
