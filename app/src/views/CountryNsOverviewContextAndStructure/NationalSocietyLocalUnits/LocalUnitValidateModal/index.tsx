import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    Container,
    ListView,
    Modal,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    stringLabelSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

import LocalUnitView from '../LocalUnitView';

import i18n from './i18n.json';

type LocalUnitsRevertRequestPostBody = GoApiBody<'/api/v2/local-units/{id}/revert/', 'POST'>;

type ReviewAction = 'accept' | 'reject';
type ReviewActionOption = {
    key: ReviewAction,
    label: string,
}

function reviewActionKeySelector(option: ReviewActionOption) {
    return option.key;
}

const reviewActionOptions: ReviewActionOption[] = [
    { key: 'accept', label: 'Accept changes' },
    { key: 'reject', label: 'Reject changes' },
];

interface Props {
    localUnitId: number;
    onActionSuccess?: () => void;
    onClose: () => void;
    localUnitName: string | null | undefined;
}

function LocalUnitValidateModal(props: Props) {
    const strings = useTranslation(i18n);
    const {
        localUnitId,
        localUnitName,
        onActionSuccess,
        onClose,
    } = props;

    const alert = useAlert();
    const {
        pending: validateLocalUnitPending,
        trigger: validateLocalUnit,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/local-units/{id}/validate/',
        pathVariables: { id: localUnitId },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: (response) => {
            const validationMessage = resolveToString(
                strings.validationSuccessMessage,
                { localUnitName: response.local_branch_name ?? response.english_branch_name },
            );
            alert.show(
                validationMessage,
                { variant: 'success' },
            );

            if (isDefined(onActionSuccess)) {
                onActionSuccess();
            }
        },
        onFailure: (response) => {
            const {
                value: { messageForNotification },
                debugMessage,
            } = response;

            alert.show(
                resolveToString(
                    strings.validationFailureMessage,
                    { localUnitName },
                ),
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );

            onClose();
        },
    });

    const {
        pending: revertChangesPending,
        trigger: revertChanges,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/local-units/{id}/revert/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
        body: (formFields: LocalUnitsRevertRequestPostBody) => formFields,
        onSuccess: () => {
            alert.show(
                strings.revertChangesSuccessMessage,
                { variant: 'success' },
            );

            if (isDefined(onActionSuccess)) {
                onActionSuccess();
            }
        },
        onFailure: (error) => {
            const {
                value: {
                    formErrors,
                },
            } = error;

            alert.show(
                strings.revertChangesFailedMessage,
                {
                    variant: 'danger',
                    description: formErrors.non_field_errors,
                },
            );
        },
    });

    const [reviewAction, setReviewAction] = useState<ReviewAction | undefined>();
    const [rejectionReason, setRejectionReason] = useState<string | undefined>();

    const handleSubmitButtonClick = useCallback((action: ReviewAction | undefined) => {
        if (action === 'accept') {
            validateLocalUnit(null);
        } else if (action === 'reject' && isTruthyString(rejectionReason)) {
            revertChanges({ reason: rejectionReason });
        }
    }, [validateLocalUnit, revertChanges, rejectionReason]);

    return (
        <Modal
            onClose={onClose}
            heading={
                resolveToString(
                    strings.validateLocalUnitHeading,
                    { localUnitName: localUnitName ?? '' },
                )
            }
            footerActions={(
                <Button
                    name={reviewAction}
                    onClick={handleSubmitButtonClick}
                    disabled={validateLocalUnitPending
                        || revertChangesPending
                        || isNotDefined(reviewAction)
                        || (reviewAction === 'reject' && isFalsyString(rejectionReason))}
                >
                    {strings.submitButtonLabel}
                </Button>
            )}
            withHeaderBorder
            headingLevel={4}
        >
            <ListView
                layout="block"
                spacing="lg"
            >
                <Container
                    heading={strings.requestedChangesTitle}
                    headingLevel={5}
                >
                    <LocalUnitView
                        localUnitId={localUnitId}
                    />
                </Container>
                <RadioInput
                    name={undefined}
                    options={reviewActionOptions}
                    keySelector={reviewActionKeySelector}
                    labelSelector={stringLabelSelector}
                    value={reviewAction}
                    clearable
                    onChange={setReviewAction}
                />
                {reviewAction === 'reject' && (
                    <TextArea
                        name="reason"
                        required
                        label={strings.rejectionReasonLabel}
                        value={rejectionReason}
                        onChange={setRejectionReason}
                    />
                )}
            </ListView>
        </Modal>
    );
}

export default LocalUnitValidateModal;
