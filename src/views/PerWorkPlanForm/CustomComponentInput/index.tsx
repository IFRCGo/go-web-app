import { useMemo, useContext } from 'react';
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
import { numericIdSelector, stringValueSelector } from '#utils/selectors';
import ServerEnumsContext from '#contexts/server-enums';

import { PartialWorkPlan } from '../schema';

import i18n from '../i18n.json';

type Value = NonNullable<PartialWorkPlan['custom_component_responses']>[number];
type CountryResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];
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
    value: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    error: Error<Value> | undefined;
    index: number;
    onRemove: (index: number) => void;
    countryResults: CountryResponse['results'] | undefined;
}

function CustomComponentInput(props: Props) {
    const {
        onChange,
        index,
        onRemove,
        value,
        countryResults,
        error: formError,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);
    const { per_workplanstatus } = useContext(ServerEnumsContext);

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
                options={per_workplanstatus}
                onChange={onFieldChange}
                keySelector={statusKeySelector}
                labelSelector={stringValueSelector}
                value={value?.status}
                error={error?.status}
            />
            <div>
                <Button
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
