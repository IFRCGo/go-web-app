import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Modal,
    RadioInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import type { GlobalEnums } from '#contexts/domain';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DeprecateReason = NonNullable<GlobalEnums['local_units_deprecate_reason']>[number];

type LocalUnitDeprecateBody = GoApiBody<'/api/v2/local-units/{id}/deprecate/', 'POST'>;

type DeprecateFormType = PartialForm<LocalUnitDeprecateBody>;
type FormSchema = ObjectSchema<DeprecateFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const deprecateReasonKeySelector = (
    item: DeprecateReason,
) => item.key;

const deprecateReasonLabelSelector = (
    item: DeprecateReason,
) => item.value;

const defaultFormValue: DeprecateFormType = {
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        deprecated_reason: {
            required: true,
        },
        deprecated_reason_overview: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

interface Props {
    localUnitId: number;
    onDeleteActionSuccess?: () => void;
    onClose: () => void;
    localUnitName: string;
}

function LocalUnitDeleteModal(props: Props) {
    const strings = useTranslation(i18n);
    const {
        localUnitId,
        localUnitName,
        onDeleteActionSuccess,
        onClose,
    } = props;

    const {
        local_units_deprecate_reason: deprecateReasonOptions,
    } = useGlobalEnums();

    const {
        value,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(schema, { value: defaultFormValue });

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const alert = useAlert();

    const {
        pending: deprecateLocalUnitPending,
        trigger: deprecateLocalUnit,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/local-units/{id}/deprecate/',
        body: (body: LocalUnitDeprecateBody) => body,
        pathVariables: { id: localUnitId },
        onSuccess: () => {
            const validationMessage = resolveToString(
                strings.deleteSuccessMessage,
                { localUnitName },
            );
            alert.show(
                validationMessage,
                { variant: 'success' },
            );
            if (onDeleteActionSuccess) {
                onDeleteActionSuccess();
            }
        },
        onFailure: (response) => {
            const {
                value: { messageForNotification },
            } = response;

            alert.show(
                resolveToString(
                    strings.deleteFailureMessage,
                    { localUnitName },
                ),
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
            );
        },
    });

    const handleFormSubmit = useCallback(
        (formValues: DeprecateFormType) => {
            deprecateLocalUnit(formValues as LocalUnitDeprecateBody);
        },
        [deprecateLocalUnit],
    );

    return (
        <Modal
            heading={resolveToString(
                strings.deleteLocalUnitHeading,
                { localUnitName },
            )}
            withHeaderBorder
            childrenContainerClassName={styles.localUnitDeleteFormContent}
            onClose={onClose}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={createSubmitHandler(validate, setError, handleFormSubmit)}
                    disabled={deprecateLocalUnitPending}
                >
                    {strings.submitLabel}
                </Button>
            )}
        >
            <RadioInput
                required
                name="deprecated_reason"
                listContainerClassName={styles.reasonList}
                value={value.deprecated_reason}
                label={strings.chooseDeleteReasonMessage}
                onChange={setFieldValue}
                options={deprecateReasonOptions}
                keySelector={deprecateReasonKeySelector}
                labelSelector={deprecateReasonLabelSelector}
                error={error?.deprecated_reason}
            />
            <TextArea
                required
                name="deprecated_reason_overview"
                label={strings.deleteReasonExplanation}
                value={value.deprecated_reason_overview}
                onChange={setFieldValue}
                error={error?.deprecated_reason_overview}
            />
        </Modal>
    );
}

export default LocalUnitDeleteModal;
