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
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { stringValueSelector } from '#utils/selectors';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialWorkPlan } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PrioritizationResponse = GoApiResponse<'/api/v2/per-prioritization/{id}/', 'PATCH'>;

type Value = NonNullable<PartialWorkPlan['prioritized_action_responses']>[number];
type ComponentResponse = NonNullable<PrioritizationResponse['prioritized_action_responses']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PerWorkPlanStatusOption = NonNullable<GlobalEnumsResponse['per_workplanstatus']>[number];

function statusKeySelector(option: PerWorkPlanStatusOption) {
    return option.key;
}

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    error: Error<Value> | undefined;
    component: ComponentResponse['component_details'];
    readOnly?: boolean;
}

function PrioritizedActionInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        error: formError,
        readOnly,
    } = props;

    const { per_workplanstatus } = useGlobalEnums();
    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    return (
        <Container
            className={styles.prioritizedActionInput}
            // FIXME: use translations
            heading={isTruthyString(component.component_letter)
                ? `${component.component_num}(${component.component_letter}). ${component.title}`
                : `${component.component_num}. ${component.title}`}
            headingLevel={4}
            spacing="compact"
            childrenContainerClassName={styles.content}
        >
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder={strings.componentActionsInputPlaceholder}
                rows={2}
                error={error?.actions}
                readOnly={readOnly}
            />
            <DateInput
                label={strings.componentDueDateInputLabel}
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
                error={error?.due_date}
                readOnly={readOnly}
            />
            <NationalSocietySelectInput
                name="supported_by"
                label={strings.componentSupportedByInputLabel}
                placeholder={strings.componentSupportedByInputPlaceholder}
                onChange={onFieldChange}
                value={value?.supported_by}
                error={error?.supported_by}
                readOnly={readOnly}
            />
            <SelectInput
                name="status"
                label={strings.componentStatusInputLabel}
                placeholder={strings.componentStatusInputPlaceholder}
                options={per_workplanstatus}
                onChange={onFieldChange}
                keySelector={statusKeySelector}
                labelSelector={stringValueSelector}
                value={value?.status}
                error={error?.status}
                readOnly={readOnly}
            />
        </Container>
    );
}

export default PrioritizedActionInput;
