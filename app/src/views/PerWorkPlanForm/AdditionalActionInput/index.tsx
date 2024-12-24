import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateInput,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { randomString } from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { NATIONAL_SOCIETY } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialWorkPlan } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = NonNullable<PartialWorkPlan['additional_action_responses']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PerWorkPlanStatusOption = NonNullable<GlobalEnumsResponse['per_workplanstatus']>[number];
type PerWorkPlanOrganizationTypeOption = NonNullable<GlobalEnumsResponse['per_supported_by_organization_type']>[number];

function statusKeySelector(option: PerWorkPlanStatusOption) {
    return option.key;
}
function organizationTypeKeySelector(option: PerWorkPlanOrganizationTypeOption) {
    return option.key;
}

interface Props {
    value: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    error: Error<Value> | undefined;
    index: number;
    onRemove: (index: number) => void;
    actionNumber: number;
    readOnly?: boolean;
    disabled?: boolean
}

function AdditionalActionInput(props: Props) {
    const {
        onChange,
        index,
        onRemove,
        value,
        error: formError,
        actionNumber,
        readOnly,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);
    const { per_workplanstatus, per_supported_by_organization_type } = useGlobalEnums();

    const defaultValue = useMemo(
        () => ({
            client_id: randomString(),
        }),
        [],
    );

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultValue,
    );

    const handleOrganizationTypeChange = useCallback((
        organizationType: PerWorkPlanOrganizationTypeOption['key'] | undefined,
    ) => {
        onFieldChange(organizationType, 'supported_by_organization_type' as const);
        /* if (organizationType !== NATIONAL_SOCIETY) {
*     onFieldChange(undefined, 'supported_by');
* } */
    }, [onFieldChange]);

    return (
        <Container
            className={styles.additionalActionInput}
            heading={resolveToString(
                strings.actionInputHeading,
                { actionNumber },
            )}
            headingLevel={4}
            childrenContainerClassName={styles.content}
            spacing="compact"
            actions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                    title={strings.actionInputRemoveButtonLabel}
                >
                    <DeleteBinLineIcon />
                </Button>
            )}
        >
            <NonFieldError error={error} />
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder={strings.actionInputActionsPlaceholder}
                rows={2}
                withAsterisk
                error={error?.actions}
                readOnly={readOnly}
                disabled={disabled}
            />
            <DateInput
                label={strings.actionInputDueDateLabel}
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
                error={error?.due_date}
                readOnly={readOnly}
                disabled={disabled}
            />
            <SelectInput
                name="supported_by_organization_type"
                label={strings.actionSupportedByOrganizationInputLabel}
                placeholder={
                    strings.actionSupportedByOrganizationInputPlaceholder
                }
                options={per_supported_by_organization_type}
                onChange={handleOrganizationTypeChange}
                keySelector={organizationTypeKeySelector}
                labelSelector={stringValueSelector}
                value={value?.supported_by_organization_type}
                error={error?.supported_by_organization_type}
                readOnly={readOnly}
                disabled={disabled}
            />
            {value?.supported_by_organization_type === NATIONAL_SOCIETY && (
                <NationalSocietySelectInput
                    name="supported_by"
                    label={strings.actionInputSupportedByLabel}
                    placeholder={strings.actionInputSupportedByLabel}
                    onChange={onFieldChange}
                    value={value?.supported_by}
                    error={error?.supported_by}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
            <SelectInput
                name="status"
                label={strings.actionInputStatusLabel}
                placeholder={strings.actionStatusInputPlaceholder}
                options={per_workplanstatus}
                withAsterisk
                onChange={onFieldChange}
                keySelector={statusKeySelector}
                labelSelector={stringValueSelector}
                value={value?.status}
                error={error?.status}
                readOnly={readOnly}
                disabled={disabled}
            />
        </Container>
    );
}

export default AdditionalActionInput;
