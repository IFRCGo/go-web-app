import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import { LabelValue } from '#types/common';
import type { GET } from '#types/serverResponse';
import useTranslation from '#hooks/useTranslation';

import {
    PartialWorkPlan,
    numericValueSelector,
    stringLabelSelector,
} from '../common';

import i18n from '../i18n.json';

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];
type AssessmentResponse = GET['api/v2/per-prioritization/:id'];
type ComponentResponse = AssessmentResponse['component_responses'][number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: ComponentResponse['component_details'];
    workPlanStatusOptions?: LabelValue[];
    nsOptions?: {
        label: string;
        value: number;
    }[];
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        workPlanStatusOptions,
        nsOptions,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    return (
        <>
            <div>
                {`${component?.component_num}. ${component?.title}`}
            </div>
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder={strings.perFormActionsPlaceholder}
                rows={2}
            />
            <DateInput
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
            />
            <SelectInput
                name="supported_by"
                placeholder={strings.perFormSelectNSPlaceholder}
                options={nsOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.supported_by}
            />
            <SelectInput
                name="status"
                placeholder={strings.perFormSelectStatusLabel}
                options={workPlanStatusOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.status}
            />
        </>
    );
}

export default ComponentInput;
