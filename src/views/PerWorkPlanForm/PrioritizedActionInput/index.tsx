import { useCallback } from 'react';
import {
    type SetValueArg,
    useFormObject,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { isTruthyString } from '@togglecorp/fujs';

import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import NonFieldError from '#components/NonFieldError';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';
import { stringValueSelector } from '#utils/selectors';
import { resolveToString } from '#utils/translation';
import { NATIONAL_SOCIETY } from '#utils/constants';
import { type PartialWorkPlan } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PrioritizationResponse = GoApiResponse<'/api/v2/per-prioritization/{id}/', 'PATCH'>;

type Value = NonNullable<PartialWorkPlan['prioritized_action_responses']>[number];
type ComponentResponse = NonNullable<PrioritizationResponse['prioritized_action_responses']>[number];

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
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    error: Error<Value> | undefined;
    component: ComponentResponse['component_details'];
    readOnly?: boolean;
    disabled?: boolean;
}

function PrioritizedActionInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        error: formError,
        readOnly,
        disabled,
    } = props;

    const { per_workplanstatus, per_supported_by_organization_type } = useGlobalEnums();
    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);
    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    const handleOrganizationTypeChange = useCallback((
        organizationType: PerWorkPlanOrganizationTypeOption['key'] | undefined,
    ) => {
        onFieldChange(organizationType, 'supported_by_organization_type' as const);
        if (organizationType !== NATIONAL_SOCIETY) {
            onFieldChange(undefined, 'supported_by');
        }
    }, [onFieldChange]);

    return (
        <Container
            className={styles.prioritizedActionInput}
            heading={isTruthyString(component.component_letter)
                ? resolveToString(
                    strings.componentHeading,
                    {
                        componentNumber: component.component_num,
                        componentLetter: component.component_letter,
                        componentTitle: component.title,
                    },
                )
                : resolveToString(
                    strings.componentHeadingOther,
                    {
                        componentNumber: component.component_num,
                        componentTitle: component.title,
                    },
                )}
            headingLevel={4}
            spacing="compact"
            childrenContainerClassName={styles.content}
        >
            <NonFieldError error={error} />
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder={strings.componentActionsInputPlaceholder}
                rows={2}
                error={error?.actions}
                readOnly={readOnly}
                disabled={disabled}
            />
            <DateInput
                label={strings.componentDueDateInputLabel}
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
                error={error?.due_date}
                readOnly={readOnly}
                disabled={disabled}
            />
            <SelectInput
                name="supported_by_organization_type"
                label={strings.componentSupportedByOrganizationInputLabel}
                placeholder={strings.componentOrganizationInputPlaceholder}
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
                    label={strings.componentSupportedByInputLabel}
                    placeholder={strings.componentSupportedByInputPlaceholder}
                    onChange={onFieldChange}
                    value={value?.supported_by}
                    error={error?.supported_by}
                    readOnly={readOnly}
                    disabled={disabled}
                />
            )}
            <SelectInput
                name="status"
                label={strings.componentStatusInputLabel}
                placeholder={strings.componentStatusInputPlaceholder}
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

export default PrioritizedActionInput;
