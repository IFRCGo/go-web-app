import {
    type ElementRef,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    useLocation,
    useParams,
} from 'react-router-dom';
import { LegendIcon } from '@ifrc-go/icons';
import {
    Button,
    Checklist,
    Container,
    DateInput,
    InputSection,
    Message,
    Modal,
    NavigationTabList,
    RadioInput,
    SegmentInput,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { injectClientId } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
    mapToList,
    randomString,
    unique,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    useForm,
} from '@togglecorp/toggle-form';

import ActivityEventSearchSelectInput, { type EventItem } from '#components/domain/ActivityEventSearchSelectInput';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import NonEnglishFormCreationMessage from '#components/domain/NonEnglishFormCreationMessage';
import NavigationTab from '#components/NavigationTab';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import { type GlobalEnums } from '#contexts/domain';
import useCountry from '#hooks/domain/useCountry';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety from '#hooks/domain/useNationalSociety';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import ActivitiesBySectorInput from './ActivitiesBySectorInput';
import schema, {
    type ActivityRequestBody,
    type ActivityRequestPostBody,
    type FormFields,
    type FormType,
} from './schema';

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
    item.eru_owner.national_society_country.society_name
);
const deployedEruDescriptionSelector = (item: NonNullable<EruResponse['results']>[number]) => (
    item.type_display
);
const titleSelector = (item: { title: string }) => item.title;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    // NOTE: We are only showing has_no_data_on_people_reached after the user
    // submits for the first time. This is to force/enable user to add data
    const beforeSubmitRef = useRef(true);
    const formContentRef = useRef<ElementRef<'div'>>(null);

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
    const currentLanguage = useCurrentLanguage();

    const error = getErrorObject(formError);
    const [finalValues, setFinalValues] = useState<
        ActivityRequestBody | ActivityRequestPostBody | undefined
    >();

    const [eventOptions, setEventOptions] = useState<
        EventItem[] | undefined | null
    >([]);

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const {
        pending: fetchingActivity,
        response: activityResponse,
        error: activityResponseError,
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
            limit: 9999,
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
        pending: createActivityPending,
        trigger: createActivity,
    } = useLazyRequest({
        url: '/api/v2/emergency-project/',
        method: 'POST',
        body: (ctx: ActivityRequestPostBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.alertMessageSuccessful,
                { variant: 'success' },
            );
            navigate(
                'threeWActivityDetail',
                { params: { activityId: response.id } },
            );
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                debugMessage,
            } = err;

            onErrorSet(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['activities', NUM, 'supplies', NUM]);
                    if (isDefined(match)) {
                        const [activity_index, supply_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.activities?.[activity_index]?.supplies?.[supply_index]?.client_id;
                    }
                    match = matchArray(locations, ['activities', NUM, 'custom_supplies', NUM]);
                    if (isDefined(match)) {
                        const [activity_index, supply_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.activities?.[activity_index]?.custom_supplies?.[supply_index]?.client_id;
                    }
                    match = matchArray(locations, ['activities', NUM, 'points', NUM]);
                    if (isDefined(match)) {
                        const [activity_index, point_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.activities?.[activity_index]?.points?.[point_index]?.client_id;
                    }
                    match = matchArray(locations, ['activities', NUM]);
                    if (isDefined(match)) {
                        const [activity_index] = match;

                        return value?.activities?.[activity_index]?.client_id;
                    }
                    return undefined;
                },
            ));

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
        pending: updateActivityPending,
        trigger: updateActivity,
    } = useLazyRequest({
        url: '/api/v2/emergency-project/{id}/',
        method: 'PATCH',
        body: (ctx: ActivityRequestBody) => ctx,
        pathVariables: {
            id: Number(activityId),
        },
        onSuccess: (response) => {
            alert.show(
                // FIXME: Add translations
                'Successfully updated activities',
                { variant: 'success' },
            );
            navigate(
                'threeWActivityDetail',
                { params: { activityId: response.id } },
            );
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                debugMessage,
            } = err;

            onErrorSet(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['activities', NUM, 'supplies', NUM]);
                    if (isDefined(match)) {
                        const [activity_index, supply_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.activities?.[activity_index]?.supplies?.[supply_index]?.client_id;
                    }
                    match = matchArray(locations, ['activities', NUM, 'custom_supplies', NUM]);
                    if (isDefined(match)) {
                        const [activity_index, supply_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.activities?.[activity_index]?.custom_supplies?.[supply_index]?.client_id;
                    }
                    match = matchArray(locations, ['activities', NUM, 'points', NUM]);
                    if (isDefined(match)) {
                        const [activity_index, point_index] = match;
                        // eslint-disable-next-line max-len
                        return value?.activities?.[activity_index]?.points?.[point_index]?.client_id;
                    }
                    match = matchArray(locations, ['activities', NUM]);
                    if (isDefined(match)) {
                        const [activity_index] = match;

                        return value?.activities?.[activity_index]?.client_id;
                    }
                    return undefined;
                },
            ));

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
                formContentRef.current?.scrollIntoView();
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
            () => {
                formContentRef.current?.scrollIntoView();
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
            createActivity(finalValues as ActivityRequestPostBody);
        } else {
            updateActivity(finalValues as ActivityRequestBody);
        }
    }, [
        finalValues,
        activityId,
        updateActivity,
        createActivity,
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

    const disabled = fetchingActivity || createActivityPending || updateActivityPending;

    // TODO: Use content language from server if applicable
    // const contentOriginalLanguage = activityResponse
    //     ?.translation_module_original_language ?? 'en';
    const contentOriginalLanguage = 'en';

    const nonEnglishCreate = isNotDefined(activityId) && currentLanguage !== 'en';
    const languageMismatch = isDefined(activityId)
        && isDefined(activityResponse)
        && currentLanguage !== contentOriginalLanguage;
    const shouldHideForm = languageMismatch
        || nonEnglishCreate
        || fetchingActivity
        || isDefined(activityResponseError);

    return (
        <Page
            elementRef={formContentRef}
            className={styles.threeWActivityForm}
            title={strings.threeWFormTitle}
            heading={strings.threeWFormHeading}
            description={strings.threeWFormDescription}
            withBackgroundColorInMainSection
            info={!shouldHideForm && isNotDefined(activityId) && (
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
            mainSectionClassName={styles.content}
        >
            {fetchingActivity && (
                <Message
                    pending
                />
            )}
            {nonEnglishCreate && (
                <NonEnglishFormCreationMessage />
            )}
            {languageMismatch && (
                <LanguageMismatchMessage
                    originalLanguage={contentOriginalLanguage}
                />
            )}
            {isDefined(activityResponseError) && (
                <FormFailedToLoadMessage
                    description={activityResponseError.value.messageForNotification}
                />
            )}
            {!shouldHideForm && (
                <>
                    <NonFieldError
                        className={styles.nonFieldError}
                        error={error}
                        withFallbackError
                    />
                    <InputSection
                        title={strings.supportedOperationTitle}
                        description={strings.supportedOperationDescription}
                        withAsteriskOnTitle
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
                        title={strings.countryProvinceTitle}
                        description={strings.countryProvinceDescription}
                        numPreferredColumns={2}
                        withAsteriskOnTitle
                    >
                        <CountrySelectInput
                            error={error?.country}
                            label={strings.countryLabel}
                            name="country"
                            onChange={handleProjectCountryChange}
                            value={value.country}
                            disabled={disabled}
                            withAsterisk
                        />
                        <DistrictSearchMultiSelectInput
                            error={getErrorString(error?.districts)}
                            label={strings.regionProvinceLabel}
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
                        title={strings.estimateDateTitle}
                        description={(
                            <>
                                <p>
                                    {strings.estimateDateDescriptionOne}
                                </p>
                                <p>
                                    {strings.estimateDateDescriptionTwo}
                                </p>
                            </>
                        )}
                        numPreferredColumns={2}
                    >
                        <DateInput
                            name="start_date"
                            label={strings.startDateLabel}
                            value={value?.start_date}
                            disabled={disabled}
                            error={error?.start_date}
                            onChange={handleStartDateChange}
                            withAsterisk
                        />
                        <DateInput
                            name="end_date"
                            label={strings.endDateLabel}
                            value={value?.end_date}
                            disabled={disabled}
                            error={error?.end_date}
                            onChange={handleEndDateChange}
                            withAsterisk
                        />
                        <TextInput
                            className={styles.statusDisplay}
                            label={strings.projectStatusLabel}
                            value={isDefined(value?.status)
                                ? projectStatusOptionsMap?.[value?.status]
                                : undefined}
                            readOnly
                            name={undefined}
                            onChange={() => {}}
                            // strongValue
                        />
                    </InputSection>
                    <InputSection
                        title={strings.activityDescriptionTitle}
                        withAsteriskOnTitle
                    >
                        <TextInput
                            name="title"
                            value={value?.title}
                            disabled={disabled}
                            error={error?.title}
                            onChange={setFieldValue}
                            placeholder={strings.enterDescriptionPlaceholder}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.leadingActivityTitle}
                        withAsteriskOnTitle
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
                                title={strings.nationalSocietyInputTitle}
                                description={strings.nationalSocietyInputDescription}
                                withAsteriskOnTitle
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
                                title={strings.contactInformationTitle}
                                description={strings.contactInformationDescription}
                                numPreferredColumns={3}
                                withAsteriskOnTitle
                            >
                                <TextInput
                                    name="reporting_ns_contact_name"
                                    label={strings.nsNameLabel}
                                    value={value?.reporting_ns_contact_name}
                                    disabled={disabled}
                                    onChange={setFieldValue}
                                    error={error?.reporting_ns_contact_name}
                                    withAsterisk
                                />
                                <TextInput
                                    name="reporting_ns_contact_role"
                                    label={strings.nsRoleLabel}
                                    value={value?.reporting_ns_contact_role}
                                    disabled={disabled}
                                    onChange={setFieldValue}
                                    error={error?.reporting_ns_contact_role}
                                    withAsterisk
                                />
                                <TextInput
                                    name="reporting_ns_contact_email"
                                    label={strings.nsEmailLabel}
                                    value={value?.reporting_ns_contact_email}
                                    disabled={disabled}
                                    onChange={setFieldValue}
                                    error={error?.reporting_ns_contact_email}
                                    withAsterisk
                                />
                            </InputSection>
                        </>
                    )}
                    {value?.activity_lead === 'deployed_eru' && (
                        <InputSection
                            title={strings.eruDeployedTitle}
                            description={strings.eruDeployedDescription}
                            withAsteriskOnTitle
                        >
                            <RadioInput
                                name="deployed_eru"
                                value={value?.deployed_eru}
                                disabled={disabled}
                                onChange={setFieldValue}
                                options={erusResponse?.results}
                                listContainerClassName={styles.deployedEruList}
                                keySelector={idSelector}
                                labelSelector={deployedEruLabelSelector}
                                descriptionSelector={deployedEruDescriptionSelector}
                                error={error?.deployed_eru}
                            />
                        </InputSection>
                    )}
                    <Container
                        heading={strings.activityReportingheading}
                        childrenContainerClassName={styles.sectorsContainer}
                    >
                        <InputSection
                            title={strings.actionTakenTitle}
                            description={strings.actionTakenDescription}
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
                        <Button
                            name={undefined}
                            onClick={handleSubmitClick}
                            type="submit"
                            variant="secondary"
                            disabled={disabled}
                        >
                            {strings.submitButton}
                        </Button>
                    </div>
                    {submitConfirmationShown && (
                        <Modal
                            heading={strings.monitoring3wHeading}
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
                                        disabled={disabled}
                                    >
                                        {strings.submitButton}
                                    </Button>
                                    <div className={styles.note}>
                                        {strings.noteHeading}
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
                                {strings.messageHeading}
                                <span className={styles.eventName}>
                                    {selectedEventDetail?.name}
                                </span>
                                {strings.messageEmergencyDescription}
                                {strings.messageEmergencyDescriptionTwo}
                            </div>
                            <div className={styles.meta}>
                                <TextOutput
                                    className={styles.metaItem}
                                    labelClassName={styles.metaLabel}
                                    valueClassName={styles.metaValue}
                                    label={strings.countryLabel}
                                    value={selectedCountryDetail?.name}
                                    strongValue
                                />
                                <TextOutput
                                    className={styles.metaItem}
                                    labelClassName={styles.metaLabel}
                                    valueClassName={styles.metaValue}
                                    label={strings.startDateLabel}
                                    value={value?.start_date}
                                    valueType="date"
                                    strongValue
                                />
                                <TextOutput
                                    className={styles.metaItem}
                                    labelClassName={styles.metaLabel}
                                    valueClassName={styles.metaValue}
                                    label={strings.leadingActivityTitle}
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
                                    label={strings.actionTakenLabel}
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
                </>
            )}
        </Page>
    );
}

Component.displayName = 'ThreeWActivityForm';
