import { useMemo, useContext } from 'react';
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
import type { paths } from '#generated/types';
import { isValidNationalSociety } from '#utils/common';
import useTranslation from '#hooks/useTranslation';
import ServerEnumsContext from '#contexts/server-enums';
import {
    numericIdSelector,
    stringValueSelector,
} from '#utils/selectors';

import { PartialWorkPlan } from '../schema';

import i18n from '../i18n.json';

type CountryResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
type PrioritizationResponse = paths['/api/v2/per-prioritization/{id}/']['put']['responses']['200']['content']['application/json'];

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];
type ComponentResponse = NonNullable<PrioritizationResponse['component_responses']>[number];
type CountryItem = NonNullable<CountryResponse['results']>[number];

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
type GlobalEnumsResponse = GetGlobalEnums['responses']['200']['content']['application/json'];
type PerWorkPlanStatusOption = NonNullable<GlobalEnumsResponse['per_workplanstatus']>[number];

function statusKeySelector(option: PerWorkPlanStatusOption) {
    return option.key;
}

function nsLabelSelector(option: Omit<CountryItem, 'society_name'> & { 'society_name': string }) {
    return option.society_name;
}

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    error: Error<Value> | undefined;
    component: ComponentResponse['component_details'];
    countryResults: CountryResponse['results'] | undefined;
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        countryResults,
        error: formError,
    } = props;

    const { per_workplanstatus } = useContext(ServerEnumsContext);
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
                options={per_workplanstatus}
                onChange={onFieldChange}
                keySelector={statusKeySelector}
                labelSelector={stringValueSelector}
                value={value?.status}
                error={error?.status}
            />
        </>
    );
}

export default ComponentInput;
