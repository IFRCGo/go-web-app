import {
    BlockLoading,
    Button,
    Description,
    ListView,
    Modal,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { getUserName } from '#utils/domain/user';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    fullEapId?: number;
    simplifiedEapId?: number;
    onOverwriteButtonClick: (newModifiedAt: string | undefined) => void;
    onCancelButtonClick: (_: boolean) => void;
}

function EapObsoleteResolutionModal(props: Props) {
    const {
        fullEapId,
        simplifiedEapId,
        onOverwriteButtonClick,
        onCancelButtonClick,
    } = props;

    const strings = useTranslation(i18n);

    const { pending: fullEapPending, response: fullEapResponse } = useRequest({
        skip: isNotDefined(fullEapId) || isDefined(simplifiedEapId),
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(fullEapId) ? { id: fullEapId } : undefined,
    });

    const { pending: simplifiedEapPending, response: simplifiedEapResponse } = useRequest({
        skip: isNotDefined(simplifiedEapId) || isDefined(fullEapId),
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(simplifiedEapId)
            ? {
                id: Number(simplifiedEapId),
            }
            : undefined,
    });

    const response = fullEapResponse ?? simplifiedEapResponse;
    const pending = fullEapPending || simplifiedEapPending;

    return (
        <Modal
            heading={strings.changesConflictWhileSaving}
            headingLevel={3}
            withoutCloseButton
            footerActions={(
                <ListView>
                    <Button name={false} onClick={onCancelButtonClick}>
                        {strings.changesCancelButton}
                    </Button>
                    <Button
                        name={response?.modified_at}
                        disabled={pending}
                        onClick={onOverwriteButtonClick}
                    >
                        {strings.changesOverwriteButton}
                    </Button>
                </ListView>
            )}
        >
            {pending ? <BlockLoading /> : (
                <ListView layout="block">
                    <TextOutput
                        label={strings.conflictWhileSaving}
                        strongValue
                        value={getUserName(response?.modified_by_details)}
                    />
                    <Description>{strings.changesWillBeOverridden}</Description>
                    <TextOutput
                        label={strings.changesNoteLabel}
                        strongLabel
                        value={strings.changesWillBeOverridden}
                    />
                </ListView>
            )}
        </Modal>
    );
}

export default EapObsoleteResolutionModal;
