import { useMemo, useState, useCallback } from 'react';
import {
    isDefined,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';
import {
    useForm,
    getErrorObject,
    getErrorString,
    // createSubmitHandler,
} from '@togglecorp/toggle-form';

import InputSection from '#components/InputSection';
import Container from '#components/Container';
import {
    useRequest,
} from '#utils/restRequest';
import DateInput from '#components/DateInput';
import RadioInput from '#components/RadioInput';
import NonFieldError from '#components/NonFieldError';
import Checklist from '#components/Checklist';
import SegmentInput from '#components/parked/SegmentInput';
import TextInput from '#components/TextInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import TextOutput from '#components/TextOutput';
import DistrictSearchMultiSelectInput, { DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import ActivityEventSearchSelectInput, {
    EventItem,
} from '#components/domain/ActivityEventSearchSelectInput';

import schema, {
    FormType,
} from './schema';
import ActivitiesBySectorInput from './ActivitiesBySectorInput';

import styles from './styles.module.css';

const defaultFormValues: FormType = {
    activity_lead: 'national_society',
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        setError: onErrorSet,
        validate,
    } = useForm(schema, { value: defaultFormValues });

    const error = getErrorObject(formError);

    const {
        deployments_emergency_project_status: projectStatusOptions,
        deployments_emergency_project_activity_lead: activityLeaderOptions,
    } = useGlobalEnums();

    const projectStatusOptionsMap = listToMap(
        projectStatusOptions,
        (d) => d.key,
        (d) => d.value,
    );

    const {
        pending: fetchingERUs,
        response: erusResponse,
    } = useRequest({
        url: '/api/v2/eru/',
        query: {
            limit: 500,
            deployed_to__isnull: false,
        },
    });

    const {
        response: optionsResponse,
    } = useRequest({
        url: '/api/v2/emergency-project/options/',
    });

    const handleProjectCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            setFieldValue(val, name);
            setFieldValue(undefined, 'districts');
        },
        [setFieldValue],
    );

    const [eventOptions, setEventOptions] = useState<
        EventItem[] | undefined | null
    >([]);

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const activitiesBySector = useMemo(() => (
        listToGroupList(
            (value?.activities ?? []).filter((activity) => isDefined(activity.sector)),
            (activity) => activity.sector ?? 0,
            (activity, _, index) => ({
                ...activity,
                mainIndex: index,
            }),
        )
    ), [value?.activities]);

    const actionItemsBySector = useMemo(() => (
        listToGroupList(
            optionsResponse?.actions ?? [],
            (action) => action.sector,
            (action) => action,
        )
    ), [optionsResponse?.actions]);

    const sectorsMap = useMemo(() => (
        listToMap(
            optionsResponse?.sectors,
            (sector) => sector.id,
            (sector) => sector,
        )
    ), [optionsResponse?.sectors]);

    return (
        <div className={styles.threeWActivityForm}>
            <InputSection
                title="IFRC supported Operation"
                description="If operation does not appear in the dropdown, the operation does not yet exist in GO. In that case, please submit a new Field Report to generate the operation, then come back to this form"
            >
                <ActivityEventSearchSelectInput
                    name="event"
                    value={value?.event}
                    onChange={setFieldValue}
                    error={error?.event}
                    options={eventOptions}
                    onOptionsChange={setEventOptions}
                />
            </InputSection>
            <InputSection
                title="Country and Province/Region"
                description="Select areas where activities reported in this form are occurring"
            >
                <CountrySelectInput
                    error={error?.country}
                    label="Country"
                    name="country"
                    onChange={handleProjectCountryChange}
                    value={value.country}
                />
                <DistrictSearchMultiSelectInput
                    error={getErrorString(error?.districts)}
                    label="Region/Province"
                    name="districts"
                    countryId={value?.country}
                    onChange={setFieldValue}
                    options={districtOptions}
                    onOptionsChange={setDistrictOptions}
                    value={value.districts}
                />
            </InputSection>
            <InputSection
                title="Estimated Start and End Dates"
                description={(
                    <>
                        <p>
                            Select the date when the work on the activity begins.
                        </p>
                        <p>
                            The project status (planned and ongoing) is automatically
                            defined by the entered dates. If there is no End Date,
                            it can be left empty
                        </p>
                    </>
                )}
                twoColumn
                multiRow
            >
                <DateInput
                    name="start_date"
                    label="Start date"
                    value={value?.start_date}
                    error={error?.start_date}
                    onChange={setFieldValue}
                />
                <DateInput
                    name="end_date"
                    label="End date"
                    value={value?.end_date}
                    error={error?.end_date}
                    onChange={setFieldValue}
                />
                <TextOutput
                    className={styles.statusDisplay}
                    label="Project Status"
                    value={isDefined(value?.status) ? projectStatusOptionsMap?.[value?.status] : '--'}
                    strongValue
                />
            </InputSection>
            <InputSection
                title="Activity Description"
            >
                <TextInput
                    name="title"
                    value={value?.title}
                    error={error?.title}
                    onChange={setFieldValue}
                    placeholder="Enter brief description"
                />
            </InputSection>
            <InputSection title="Who is Leading the Activity?">
                <SegmentInput
                    name="activity_lead"
                    onChange={setFieldValue}
                    options={activityLeaderOptions}
                    // FIXME: do not use inline functions
                    keySelector={(d) => d.key}
                    labelSelector={(d) => d.value}
                    value={value?.activity_lead}
                    error={error?.activity_lead}
                />
            </InputSection>
            {value?.activity_lead === 'national_society' && (
                <>
                    <InputSection
                        title="National Society"
                        description="Which RCRC actor (NS/IFRC/ICRC) is conducting the activity?"
                    >
                        <NationalSocietySelectInput
                            name="reporting_ns"
                            onChange={setFieldValue}
                            value={value?.reporting_ns}
                            error={error?.reporting_ns}
                        />
                    </InputSection>
                    <InputSection
                        title="Contact Information"
                        description="Who should be contacted for
                        any coordination matters related to this response activity?"
                    >
                        <TextInput
                            name="reporting_ns_contact_name"
                            label="Name"
                            value={value?.reporting_ns_contact_name}
                            onChange={setFieldValue}
                            error={error?.reporting_ns_contact_name}
                        />
                        <TextInput
                            name="reporting_ns_contact_role"
                            label="Role"
                            value={value?.reporting_ns_contact_role}
                            onChange={setFieldValue}
                            error={error?.reporting_ns_contact_role}
                        />
                        <TextInput
                            name="reporting_ns_contact_email"
                            label="Email"
                            value={value?.reporting_ns_contact_email}
                            onChange={setFieldValue}
                            error={error?.reporting_ns_contact_email}
                        />
                    </InputSection>
                </>
            )}
            {value?.activity_lead === 'deployed_eru' && (
                <InputSection
                    title="Name of ERU"
                    description="Which ERU is conducting the response activity?"
                >
                    <RadioInput
                        name="deployed_eru"
                        value={value?.deployed_eru}
                        onChange={setFieldValue}
                        options={erusResponse?.results}
                        listContainerClassName={styles.radio}
                        keySelector={(d) => d.id}
                        labelSelector={(d) => (
                            `${d.eru_owner?.national_society_country?.society_name}
                            (${d.type_display})`
                        )}
                        error={error?.deployed_eru}
                    />
                </InputSection>
            )}
            <Container
                heading="Activity Reporting"
                childrenContainerClassName={styles.sectorsContainer}
            >
                <InputSection
                    title="Types of Actions Taken"
                    description="Select the actions that are being across all of the locations tagged above"
                    multiRow
                    oneColumn
                >
                    <NonFieldError
                        error={getErrorObject(error?.activities)}
                    />
                    <Checklist
                        name="sectors"
                        options={optionsResponse?.sectors}
                        onChange={setFieldValue}
                        value={value?.sectors}
                        // FIXME: Use selectors
                        keySelector={(item) => item.id}
                        labelSelector={(item) => item.title}
                    />
                </InputSection>
                <div className={styles.sectors}>
                    {value?.sectors?.map((sector) => (
                        <ActivitiesBySectorInput
                            key={sector}
                            sectorKey={sector}
                            sectorDetails={sectorsMap?.[sector]}
                            activities={activitiesBySector?.[sector]}
                            setValue={setValue}
                            error={formError}
                            setFieldValue={setFieldValue}
                            actions={actionItemsBySector?.[sector]}
                        />
                    ))}
                </div>
            </Container>
        </div>
    );
}
