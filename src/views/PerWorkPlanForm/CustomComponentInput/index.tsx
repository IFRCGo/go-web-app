import { useMemo } from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    SetValueArg,
    useFormObject,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString, isDefined } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextArea from '#components/TextArea';
import type { paths } from '#generated/types';
import { isValidNationalSociety } from '#utils/common';
import { numericIdSelector } from '#utils/selectors';

import {
    numericValueSelector,
    stringLabelSelector,
    PartialWorkPlan,
} from '../common';

import i18n from '../i18n.json';

type Value = NonNullable<PartialWorkPlan['custom_component_responses']>[number];
type CountryResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
type CountryItem = NonNullable<CountryResponse['results']>[number];

function nsLabelSelector(option: Omit<CountryItem, 'society_name'> & { 'society_name': string }) {
    return option.society_name;
}

interface Props {
    value: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    error: Error<Value> | undefined;
    index: number;
    onRemove: (index: number) => void;
    workPlanStatusOptions: {
        value: number;
        label: string;
    }[];
    countryResults: CountryResponse['results'] | undefined;
}

function CustomComponentInput(props: Props) {
    const {
        onChange,
        index,
        onRemove,
        value,
        workPlanStatusOptions,
        countryResults,
        error: formError,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

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

    return (
        <>
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
            <div>
                <Button
                    // FIXME: add title attribute
                    name={index}
                    onClick={onRemove}
                    variant="secondary"
                    actions={<DeleteBinLineIcon />}
                >
                    {strings.perFormRemoveButton}
                </Button>
            </div>
        </>
    );
}

export default CustomComponentInput;
