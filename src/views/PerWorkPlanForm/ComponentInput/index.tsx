import { useMemo } from 'react';
import {
    SetValueArg,
    useFormObject,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import type { GET } from '#types/serverResponse';
import type { paths } from '#generated/types';
import { isValidNationalSociety } from '#utils/common';
import useTranslation from '#hooks/useTranslation';
import {
    numericIdSelector,
    numericValueSelector,
    stringLabelSelector,
} from '#utils/selectors';

import { PartialWorkPlan } from '../common';

import i18n from '../i18n.json';

type CountryResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];
type AssessmentResponse = GET['api/v2/per-prioritization/:id'];
type ComponentResponse = AssessmentResponse['component_responses'][number];
type CountryItem = NonNullable<CountryResponse['results']>[number];

function nsLabelSelector(option: Omit<CountryItem, 'society_name'> & { 'society_name': string }) {
    return option.society_name;
}

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    error: Error<Value> | undefined;
    component: ComponentResponse['component_details'];
    workPlanStatusOptions?: {
        value: number;
        label: string;
    }[];
    countryResults: CountryResponse['results'] | undefined;
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        workPlanStatusOptions,
        countryResults,
        error: formError,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const nationalSocietyOptions = useMemo(
        () => (
            countryResults?.map(
                (country) => {
                    if (isValidNationalSociety(country)) {
                        return country;
                    }

                    return undefined;
                },
            ).filter(isDefined)
        ),
        [countryResults],
    );

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
                error={error?.actions}
            />
            <DateInput
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
                error={error?.due_date}
            />
            <SelectInput
                name="supported_by"
                placeholder={strings.perFormSelectNSPlaceholder}
                options={nationalSocietyOptions}
                onChange={onFieldChange}
                keySelector={numericIdSelector}
                labelSelector={nsLabelSelector}
                value={value?.supported_by}
                error={error?.supported_by}
            />
            <SelectInput
                name="status"
                placeholder={strings.perFormSelectStatusLabel}
                options={workPlanStatusOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.status}
                error={error?.status}
            />
        </>
    );
}

export default ComponentInput;
