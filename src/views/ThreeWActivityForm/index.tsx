import {
    useRef,
    useMemo,
    useState,
    useCallback,
} from 'react';
import { LegendIcon } from '@ifrc-go/icons';
import {
    randomString,
    unique,
    listToGroupList,
    isNotDefined,
    isFalsyString,
    isTruthyString,
    isDefined,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import {
    useForm,
    getErrorObject,
    getErrorString,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useParams,
    useLocation,
} from 'react-router-dom';

import useRouting from '#hooks/useRouting';
import useTranslation from '#hooks/useTranslation';
import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import Page from '#components/Page';
import InputSection from '#components/InputSection';
import Container from '#components/Container';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';
import DateInput from '#components/DateInput';
import useCountry from '#hooks/domain/useCountry';
import useNationalSociety from '#hooks/domain/useNationalSociety';
import useBooleanState from '#hooks/useBooleanState';
import RadioInput from '#components/RadioInput';
import NonFieldError from '#components/NonFieldError';
import Checklist from '#components/Checklist';
import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';
import TextInput from '#components/TextInput';
import useAlert from '#hooks/useAlert';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import TextOutput from '#components/TextOutput';
import Modal from '#components/Modal';
import DistrictSearchMultiSelectInput, {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { injectClientId } from '#utils/common';
import { type GlobalEnums } from '#contexts/domain';
import ActivityEventSearchSelectInput, {
    type EventItem,
} from '#components/domain/ActivityEventSearchSelectInput';
import { type GoApiResponse } from '#utils/restRequest';

import schema, {
    type FormType,
    type ActivityRequestBody,
    type FormFields,
} from './schema';
import ActivitiesBySectorInput from './ActivitiesBySectorInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EruResponse = GoApiResponse<'/api/v2/eru/'>;

const defaultFormValues: FormType = {
    activity_lead: 'national_society',
};

type ProjectStatus = NonNullable<GlobalEnums['deployments_emergency_project_status']>[number];

function calculateStatus(
    startDate: string | undefined | null,
    endDate: string | undefined | null,
): ProjectStatus['key'] | undefined {
    if (isNotDefined(startDate)) {
        return undefined;
    }

    const start = new Date(startDate);
    const now = new Date();

    if (start.getTime() > now.getTime()) {
        return 'planned';
    }

    if (isDefined(endDate)) {
        const end = new Date(endDate);
        if (end.getTime() < now.getTime()) {
            return 'complete';
        }
    }

    return 'on_going';
}
const activityLeadKeySelector = (item: NonNullable<GlobalEnums['deployments_emergency_project_activity_lead']>[number]) => item.key;
const valueSelector = (item: { value: string }) => item.value;
const idSelector = (item: { id: number }) => item.id;
const deployedEruLabelSelector = (item: NonNullable<EruResponse['results']>[number]) => (
    `${item.eru_owner.national_society_country.society_name}
    (${item.type_display})`
);
const titleSelector = (item: { title: string }) => item.title;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    // NOTE: We are only showing has_no_data_on_people_reached after the user
    // submits for the first time. This is to force/enable user to add data
    const beforeSubmitRef = useRef(true);

    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        setError: onErrorSet,
        validate,
    } = useForm(
        schema,
        { value: defaultFormValues },
        beforeSubmitRef,
    );
    const { activityId: activityIdFromParams } = useParams<{ activityId: string }>();

    const { state } = useLocation();

    const activityId = activityIdFromParams ?? state?.activityId as string | undefined;

    const [
        submitConfirmationShown,
        {
            setTrue: showSubmitConfirmation,
            setFalse: hideSubmitConfirmation,
        },
    ] = useBooleanState(false);

    const error = getErrorObject(formError);
    const [finalValues, setFinalValues] = useState<ActivityRequestBody | undefined>();

    const [eventOptions, setEventOptions] = useState<
        EventItem[] | undefined | null
    >([]);

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const {
        pending,
    } = useRequest({
        skip: isFalsyString(activityId),
        url: '/api/v2/emergency-project/{id}/',
        pathVariables: isTruthyString(activityId) ? {
            id: Number(activityId),
        } : undefined,
        onSuccess: (response) => {
            setDistrictOptions(response.districts_details);
            setEventOptions([{
                ...response.event_details,
                // FIXME: event dtype id is required inside event mini but
                // its not defined under event_detail of this response
                // This should be fixed in server
                dtype: { id: response.event_details?.dtype } as EventItem['dtype'],
            }]);

            // type Activity = NonNullable<(typeof value)['activities']>[number];
            setValue({
                ...response,
                sectors: unique(
                    response.activities?.map((activity) => activity.sector) ?? [],
                    (item) => item,
                ),
                activities: response.activities?.map((activity) => {
                    const val = injectClientId({
                        ...activity,
                        custom_supplies: mapToList(
                            activity.custom_supplies,
                            (item, key) => ({
                                client_id: randomString(),
                                supply_label: key,
                                supply_value: item,
                            }),
                        ),
                        supplies: mapToList(
                            activity.supplies,
                            (item, key) => ({
                                client_id: randomString(),
                                supply_action: key,
                                supply_value: item,
                            }),
                        ),
                        points: activity.points?.map(injectClientId),
                    });
                    return val;
                }),
            });
        },
    });

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
    const alert = useAlert();
    const { navigate } = useRouting();

    const {
        pending: createProjectPending,
        trigger: createProject,
    } = useLazyRequest({
        url: '/api/v2/emergency-project/',
        method: 'POST',
        body: (ctx: ActivityRequestBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                // FIXME: Add translations
                'Successfully created a response activity.',
                { variant: 'success' },
            );
            // FIXME: Redirect to view page after its completed
            navigate(
                'threeWActivityEdit',
                { params: { activityId: response.id } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            // FIXME: Add appropriate error handling
            alert.show(
                // FIXME: Add translations
                'Failed to create a response activity.',
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const {
        pending: updateProjectPending,
        trigger: updateProject,
    } = useLazyRequest({
        url: '/api/v2/emergency-project/{id}/',
        method: 'PUT',
        body: (ctx: ActivityRequestBody) => ctx,
        pathVariables: {
            id: Number(activityId),
        },
        onSuccess: () => {
            alert.show(
                // FIXME: Add translations
                'Successfully updated activities',
                { variant: 'success' },
            );
            // FIXME: Redirect to view page after its completed
            navigate(
                'threeWActivityEdit',
                { params: { activityId } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            // FIXME: Add appropriate error handling
            alert.show(
                // FIXME: Add translations
                'Failed to update project activities',
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const handleProjectCountryChange = useCallback(
        (val: number | undefined, name: 'country') => {
            setFieldValue(val, name);
            setFieldValue(undefined, 'districts');
        },
        [setFieldValue],
    );

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

    const sectorOptionsMap = useMemo(() => (
        listToMap(
            optionsResponse?.sectors,
            (sector) => sector.id,
            (sector) => sector,
        )
    ), [optionsResponse?.sectors]);

    const actionOptionsMap = useMemo(() => (
        listToMap(
            optionsResponse?.actions,
            (action) => action.id,
            (action) => action,
        )
    ), [optionsResponse?.actions]);

    const handleStartDateChange = useCallback((newDate: string | undefined) => {
        setValue((oldVal) => {
            const status = calculateStatus(newDate, oldVal?.end_date);

            return {
                ...oldVal,
                start_date: newDate,
                status,
            };
        }, true);
    }, [setValue]);

    const handleEndDateChange = useCallback((newDate: string | undefined) => {
        setValue((oldVal) => {
            const status = calculateStatus(oldVal?.start_date, newDate);

            return {
                ...oldVal,
                end_date: newDate,
                status,
            };
        }, true);
    }, [setValue]);

    const handleSectorsChange = useCallback((newSectors: number[] | undefined) => {
        setValue((oldVal) => {
            const sectorValuesMap = listToMap(
                oldVal?.sectors,
                (item) => item,
                () => true,
            );

            return {
                ...oldVal,
                sectors: newSectors,
                // NOTE: removing all the activities of a sector when sector is removed
                activities: oldVal
                    ?.activities
                    ?.filter((activity) => activity.sector && sectorValuesMap?.[activity.sector]),
            };
        }, true);
    }, [setValue]);

    const handleSubmitClick = useCallback(() => {
        // NOTE: Before submit is used to show/hide has_no_data_on_people_reached
        // conditionally depending on whether or not user has input data on people
        // at the first submission. We are doing this to enable user to not set this
        // boolean
        beforeSubmitRef.current = false;

        const submit = createSubmitHandler(
            validate,
            onErrorSet,
            (valFromArgs) => {
                const val = valFromArgs as FormFields;
                const finalValue = {
                    ...val,
                    activities: val?.activities?.map((activity) => ({
                        ...activity,
                        custom_supplies: listToMap(
                            activity?.custom_supplies,
                            (item) => item.supply_label,
                            (item) => item.supply_value,
                        ),
                        supplies: listToMap(
                            activity?.supplies,
                            (item) => item.supply_action,
                            (item) => item.supply_value,
                        ),
                    })),
                };
                setFinalValues(finalValue);
                showSubmitConfirmation();
            },
        );
        submit();
    }, [
        showSubmitConfirmation,
        validate,
        onErrorSet,
    ]);

    const handleFinalSubmitClick = useCallback(() => {
        if (isNotDefined(finalValues)) {
            return;
        }
        if (isNotDefined(activityId)) {
            createProject(finalValues);
        } else {
            updateProject(finalValues);
        }
    }, [
        finalValues,
        activityId,
        updateProject,
        createProject,
    ]);

    const selectedEventDetail = useMemo(() => (
        eventOptions?.find((event) => event.id === value?.event)
    ), [
        eventOptions,
        value?.event,
    ]);

    const countries = useCountry();
    const nationalSocieties = useNationalSociety();

    const selectedCountryDetail = useMemo(() => (
        countries?.find((country) => country.id === value?.country)
    ), [
        countries,
        value?.country,
    ]);

    const selectedNationalSocietyDetail = useMemo(() => (
        nationalSocieties?.find((country) => country.id === value?.reporting_ns)
    ), [
        nationalSocieties,
        value?.reporting_ns,
    ]);

    const selectedDeployedEruLabel = useMemo(() => {
        const selectedEru = erusResponse?.results?.find((eru) => eru.id === value?.deployed_eru);
        if (isNotDefined(selectedEru)) {
            return undefined;
        }
        return deployedEruLabelSelector(selectedEru);
    }, [
        erusResponse,
        value?.deployed_eru,
    ]);

    const disabled = pending || createProjectPending || updateProjectPending;

    return (
        <Page
            className={styles.threeWActivityPage}
            title={strings.threeWFormTitle}
            heading={strings.threeWFormHeading}
            description={strings.threeWFormDescription}
            withBackgroundColorInMainSection
            info={isNotDefined(activityId) && (
                <NavigationTabList
                    className={styles.tabList}
                    variant="secondary"
                >
                    <NavigationTab
                        to="newThreeWProject"
                    >
                        {strings.newThreeWProjectTabLabel}
                    </NavigationTab>
                    <NavigationTab
                        to="newThreeWActivity"
                    >
                        {strings.newThreeWActivityTabLabel}
                    </NavigationTab>
                </NavigationTabList>
            )}
        >
            <div className={styles.threeWActivityForm}>
                <InputSection
                    // FIXME: Add translation
                    title="IFRC supported Operation"
                    // FIXME: Add translation
                    description="If operation does not appear in the dropdown, the operation does not yet exist in GO. In that case, please submit a new Field Report to generate the operation, then come back to this form"
                >
                    <ActivityEventSearchSelectInput
                        name="event"
                        value={value?.event}
                        onChange={setFieldValue}
                        error={error?.event}
                        options={eventOptions}
                        onOptionsChange={setEventOptions}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    // FIXME: Add translation
                    title="Country and Province/Region"
                    // FIXME: Add translation
                    description="Select areas where activities reported in this form are occurring"
                >
                    <CountrySelectInput
                        error={error?.country}
                        // FIXME: Add translation
                        label="Country"
                        name="country"
                        onChange={handleProjectCountryChange}
                        value={value.country}
                        disabled={disabled}
                    />
                    <DistrictSearchMultiSelectInput
                        error={getErrorString(error?.districts)}
                        // FIXME: Add translation
                        label="Region/Province"
                        name="districts"
                        countryId={value?.country}
                        onChange={setFieldValue}
                        options={districtOptions}
                        onOptionsChange={setDistrictOptions}
                        value={value.districts}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    // FIXME: Add translation
                    title="Estimated Start and End Dates"
                    description={(
                        <>
                            <p>
                                {/* FIXME: Add translation */}
                                Select the date when the work on the activity begins.
                            </p>
                            <p>
                                {/* FIXME: Add translation */}
                                The project status (planned and ongoing) is automatically
                                defined by the entered dates. If there is no End Date,
                                it can be left empty
                            </p>
                        </>
                    )}
                    numPreferredColumns={2}
                >
                    <DateInput
                        name="start_date"
                        // FIXME: Add translation
                        label="Start date"
                        value={value?.start_date}
                        disabled={disabled}
                        error={error?.start_date}
                        onChange={handleStartDateChange}
                    />
                    <DateInput
                        name="end_date"
                        // FIXME: Add translation
                        label="End date"
                        value={value?.end_date}
                        disabled={disabled}
                        error={error?.end_date}
                        onChange={handleEndDateChange}
                    />
                    <TextOutput
                        className={styles.statusDisplay}
                        // FIXME: Add translation
                        label="Project Status"
                        value={isDefined(value?.status) ? projectStatusOptionsMap?.[value?.status] : '--'}
                        strongValue
                    />
                </InputSection>
                <InputSection
                    // FIXME: Add translation
                    title="Activity Description"
                >
                    <TextInput
                        name="title"
                        value={value?.title}
                        disabled={disabled}
                        error={error?.title}
                        onChange={setFieldValue}
                        // FIXME: Add translation
                        placeholder="Enter brief description"
                    />
                </InputSection>
                <InputSection
                    // FIXME: Add translation
                    title="Who is Leading the Activity?"
                >
                    <SegmentInput
                        name="activity_lead"
                        onChange={setFieldValue}
                        options={activityLeaderOptions}
                        keySelector={activityLeadKeySelector}
                        labelSelector={valueSelector}
                        value={value?.activity_lead}
                        disabled={disabled}
                        error={error?.activity_lead}
                    />
                </InputSection>
                {value?.activity_lead === 'national_society' && (
                    <>
                        <InputSection
                            // FIXME: Add translation
                            title="National Society"
                            // FIXME: Add translation
                            description="Which RCRC actor (NS/IFRC/ICRC) is conducting the activity?"
                        >
                            <NationalSocietySelectInput
                                name="reporting_ns"
                                onChange={setFieldValue}
                                value={value?.reporting_ns}
                                disabled={disabled}
                                error={error?.reporting_ns}
                            />
                        </InputSection>
                        <InputSection
                            // FIXME: Add translation
                            title="Contact Information"
                            // FIXME: Add translation
                            description="Who should be contacted for any coordination matters related to this response activity?"
                        >
                            <TextInput
                                name="reporting_ns_contact_name"
                                // FIXME: Add translation
                                label="Name"
                                value={value?.reporting_ns_contact_name}
                                disabled={disabled}
                                onChange={setFieldValue}
                                error={error?.reporting_ns_contact_name}
                            />
                            <TextInput
                                name="reporting_ns_contact_role"
                                // FIXME: Add translation
                                label="Role"
                                value={value?.reporting_ns_contact_role}
                                disabled={disabled}
                                onChange={setFieldValue}
                                error={error?.reporting_ns_contact_role}
                            />
                            <TextInput
                                name="reporting_ns_contact_email"
                                // FIXME: Add translation
                                label="Email"
                                value={value?.reporting_ns_contact_email}
                                disabled={disabled}
                                onChange={setFieldValue}
                                error={error?.reporting_ns_contact_email}
                            />
                        </InputSection>
                    </>
                )}
                {value?.activity_lead === 'deployed_eru' && (
                    <InputSection
                        // FIXME: Add translation
                        title="Name of ERU"
                        // FIXME: Add translation
                        description="Which ERU is conducting the response activity?"
                    >
                        <RadioInput
                            name="deployed_eru"
                            value={value?.deployed_eru}
                            disabled={disabled}
                            onChange={setFieldValue}
                            options={erusResponse?.results}
                            listContainerClassName={styles.radio}
                            keySelector={idSelector}
                            labelSelector={deployedEruLabelSelector}
                            error={error?.deployed_eru}
                        />
                    </InputSection>
                )}
                <Container
                    // FIXME: Add translation
                    heading="Activity Reporting"
                    childrenContainerClassName={styles.sectorsContainer}
                >
                    <InputSection
                        // FIXME: Add translation
                        title="Types of Actions Taken"
                        // FIXME: Add translation
                        description="Select the actions that are being across all of the locations tagged above"
                    >
                        <NonFieldError
                            error={getErrorObject(error?.activities)}
                        />
                        <NonFieldError
                            error={getErrorString(error?.sectors)}
                        />
                        <Checklist
                            name="sectors"
                            options={optionsResponse?.sectors}
                            onChange={handleSectorsChange}
                            listContainerClassName={styles.sectorCheckboxes}
                            value={value?.sectors}
                            disabled={disabled}
                            keySelector={idSelector}
                            labelSelector={titleSelector}
                        />
                    </InputSection>
                    <div className={styles.sectors}>
                        {value?.sectors?.map((sector) => (
                            <ActivitiesBySectorInput
                                key={sector}
                                sectorKey={sector}
                                sectorDetails={sectorOptionsMap?.[sector]}
                                activities={activitiesBySector?.[sector]}
                                setValue={setValue}
                                disabled={disabled}
                                error={formError}
                                setFieldValue={setFieldValue}
                                actions={actionItemsBySector?.[sector]}
                            />
                        ))}
                    </div>
                </Container>
                <div className={styles.footer}>
                    <NonFieldError
                        className={styles.nonFieldError}
                        error={error}
                        // FIXME: Add translation
                        message="Please correct all the errors above before submission."
                    />
                    <Button
                        name={undefined}
                        onClick={handleSubmitClick}
                        type="submit"
                        variant="secondary"
                        disabled={createProjectPending || updateProjectPending}
                    >
                        Submit
                    </Button>
                </div>
                {submitConfirmationShown && (
                    <Modal
                        // FIXME: Use translations
                        heading="3W Monitoring Form"
                        className={styles.confirmModal}
                        onClose={hideSubmitConfirmation}
                        footerClassName={styles.footer}
                        footerContentClassName={styles.footerContent}
                        childrenContainerClassName={styles.modalBody}
                        footerContent={(
                            <>
                                <Button
                                    name={undefined}
                                    onClick={handleFinalSubmitClick}
                                    disabled={createProjectPending || updateProjectPending}
                                >
                                    {/* FIXME: Use translations */}
                                    Submit
                                </Button>
                                <div className={styles.note}>
                                    {/* FIXME: Use translations */}
                                    If you have any questions, contact the IM team &nbsp;
                                    <a
                                        href={`mailto:${selectedEventDetail?.emergency_response_contact_email ?? 'im@ifrc.org'}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={styles.link}
                                    >
                                        {selectedEventDetail?.emergency_response_contact_email ?? 'im@ifrc.org'}
                                    </a>
                                </div>
                            </>
                        )}
                    >
                        <div className={styles.message}>
                            {/* FIXME: Use translations */}
                            You are about to submit your entry for 3W for &nbsp;
                            <span className={styles.eventName}>
                                {selectedEventDetail?.name}
                            </span>
                            {/* FIXME: Use translations */}
                            &nbsp;emergency. Please review your selections below before submission.
                        </div>
                        <div className={styles.meta}>
                            <TextOutput
                                className={styles.metaItem}
                                labelClassName={styles.metaLabel}
                                valueClassName={styles.metaValue}
                                // FIXME: Use translations
                                label="Country"
                                value={selectedCountryDetail?.name}
                                strongValue
                            />
                            <TextOutput
                                className={styles.metaItem}
                                labelClassName={styles.metaLabel}
                                valueClassName={styles.metaValue}
                                // FIXME: Use translations
                                label="Start date"
                                value={value?.start_date}
                                valueType="date"
                                strongValue
                            />
                            <TextOutput
                                className={styles.metaItem}
                                labelClassName={styles.metaLabel}
                                valueClassName={styles.metaValue}
                                // FIXME: Use translations
                                label="Who is leading the Activity?"
                                strongValue
                                value={(value?.activity_lead === 'deployed_eru') ? (
                                    selectedDeployedEruLabel
                                ) : (
                                    selectedNationalSocietyDetail?.society_name
                                )}
                            />
                            <TextOutput
                                className={styles.metaItem}
                                labelClassName={styles.metaLabel}
                                valueClassName={styles.sectorsList}
                                // FIXME: Use translations
                                label="Actions Taken"
                                value={value?.sectors?.map((sectorId) => (
                                    <div
                                        className={styles.sector}
                                        key={sectorId}
                                    >
                                        {sectorOptionsMap?.[sectorId].title ?? '---'}
                                        {(value?.activities?.filter(
                                            (activity) => (
                                                activity.sector === sectorId
                                                && isDefined(activity.action)
                                            ),
                                        ).map((activity) => (
                                            <TextOutput
                                                icon={(<LegendIcon />)}
                                                key={activity.client_id}
                                                value={(
                                                    activity.action
                                                        ? (actionOptionsMap?.[
                                                            activity.action
                                                        ].title ?? '---')
                                                        : undefined
                                                )}
                                            />
                                        )))}
                                    </div>
                                ))}
                            />
                        </div>
                    </Modal>
                )}
            </div>
        </Page>
    );
}

Component.displayName = 'ThreeWActivityForm';
