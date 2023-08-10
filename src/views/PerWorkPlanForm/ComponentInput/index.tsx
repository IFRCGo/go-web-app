import { useMemo, useContext } from 'react'; import {
    SetValueArg,
    useFormObject,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import type { paths } from '#generated/types';
import { isValidNationalSociety } from '#utils/domain/country';
import useTranslation from '#hooks/useTranslation';
import ServerEnumsContext from '#contexts/server-enums';
import {
    numericIdSelector,
    stringValueSelector,
} from '#utils/selectors';

import { PartialWorkPlan } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
    readOnly?: boolean;
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        countryResults,
        error: formError,
        readOnly,
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
        <Container
            className={styles.componentInput}
            heading={`${component?.component_num}. ${component?.title}`}
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
            <SelectInput
                name="supported_by"
                label={strings.componentSupportedByInputLabel}
                placeholder={strings.componentSupportedByInputPlaceholder}
                options={nationalSocietyOptions}
                onChange={onFieldChange}
                keySelector={numericIdSelector}
                labelSelector={nsLabelSelector}
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

export default ComponentInput;
