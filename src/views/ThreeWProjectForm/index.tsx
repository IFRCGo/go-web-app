import {
    useMemo,
    useState,
    useContext,
    useCallback,
} from 'react';
import {
    useForm,
    getErrorObject,
    getErrorString,
    useFormArray,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useParams,
    generatePath,
    useNavigate,
} from 'react-router-dom';
import {
    randomString,
    isFalsyString,
    isTruthyString,
    isDefined,
    isFalsy,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import InputSection from '#components/InputSection';
import Button from '#components/Button';
import TextInput from '#components/TextInput';
import RouteContext from '#contexts/route';
import SelectInput from '#components/SelectInput';
import DateInput from '#components/DateInput';
import NumberInput from '#components/NumberInput';
import NonFieldError from '#components/NonFieldError';
import MultiSelectInput from '#components/MultiSelectInput';
import useAlert from '#hooks/useAlert';
import Switch from '#components/parked/Switch';
import RichTextArea from '#components/parked/RichTextArea';
import RadioInput from '#components/RadioInput';
import Checkbox from '#components/Checkbox';
import TextOutput from '#components/TextOutput';
import CountrySearchSelectInput from '#components/CountrySearchSelectInput';
import DistrictMultiSelectInput, { DistrictItem } from '#components/DistrictMultiSelectInput';
import EventSelectInput, { EventItem } from '#components/EventSelectInput';
import ServerEnumsContext from '#contexts/server-enums';
import {
    PROJECT_STATUS_COMPLETED,
    PROJECT_STATUS_ONGOING,
    PROJECT_STATUS_PLANNED,
    OPERATION_TYPE_EMERGENCY,
    PROGRAMME_TYPE_DOMESTIC,
    PROGRAMME_TYPE_MULTILATERAL,
    OPERATION_TYPE_PROGRAMME,
} from '#utils/constants';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';

import useTranslation from '#hooks/useTranslation';
import { injectClientId } from '#utils/common';

import schema, { ProjectResponseBody, FormType, PartialAnnualType } from './schema';
import AnnualSplitInput from './AnnualSplitInput';

import styles from './styles.module.css';
import i18n from './i18n.json';

const defaultFormValues: FormType = {
    project_districts: [],
    secondary_sectors: [],
    visibility: 'public',
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const { projectId } = useParams<{ projectId: string }>();
    const {
        threeWProjectEdit: threeWProjectEditRoute,
    } = useContext(RouteContext);

    const {
        value,
        setValue,
        setFieldValue,
        error: formError,
        setError: onErrorSet,
        validate,
    } = useForm(schema, { value: defaultFormValues });

    const navigate = useNavigate();

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const [eventOptions, setEventOptions] = useState<
        EventItem[] | undefined | null
    >([]);

    const { pending: pendingProjectDetails } = useRequest({
        skip: isFalsyString(projectId),
        url: '/api/v2/project/{id}/',
        pathVariables: isTruthyString(projectId) ? {
            id: Number(projectId),
        } : undefined,
        onSuccess: (response) => {
            setDistrictOptions(response.project_districts_detail);
            setEventOptions([{
                ...response.event_detail,
                // FIXME: event dtype id is a must inside event mini but
                // its not defined under event_detail of this response
                dtype: { id: response.event_detail?.dtype } as EventItem['dtype'],
            }]);
            setValue({
                ...response,
                // Set beginning is_annual_report switch according to
                // the filled-in annual split details
                is_annual_report: response.annual_split_detail?.length >= 1,
                annual_split_detail: response.annual_split_detail.map((split) => ({
                    ...injectClientId(split),
                })),
            });
        },
    });

    const {
        deployments_project_status: projectStatusOptions,
        deployments_project_operation_type: operationTypeOptions,
        deployments_project_programme_type: programmeTypeOptions,
        api_visibility_char_choices: visibilityTypeOptions,
    } = useContext(ServerEnumsContext);

    const projectStatusOptionsMap = listToMap(
        projectStatusOptions,
        (d) => d.key,
        (d) => d.value,
    );

    const error = getErrorObject(formError);
    const handleProjectCountryChange = useCallback(
        (val: number | undefined, name: 'project_country') => {
            setFieldValue(val, name);
            setFieldValue(undefined, 'project_districts' as const);
            // FIXME: Add admin2 select input
        },
        [setFieldValue],
    );

    const isTotalRequired = value.status === PROJECT_STATUS_COMPLETED;

    const shouldDisableTotalTarget = !isFalsy(value.target_male)
        || !isFalsy(value.target_female)
        || !isFalsy(value.target_other);

    const shouldDisableTotalReached = !isFalsy(value.reached_male)
        || !isFalsy(value.reached_female)
        || !isFalsy(value.reached_other);

    const {
        pending: fetchingPrimarySectors,
        response: primarySectorOptions,
    } = useRequest({
        url: '/api/v2/primarysector',
    });

    const {
        pending: pendingMe,
        response: meResponse,
    } = useRequest({
        url: '/api/v2/user/me/',
    });

    const visibilityOptions = useMemo(() => {
        const orgType = meResponse?.profile?.org_type;

        if (orgType === 'OTHR') {
            return visibilityTypeOptions?.filter((x) => (
                x.key === 'public'
                || x.key === 'logged_in_user'
            ));
        }
        if (orgType === 'NTLS') {
            return visibilityTypeOptions?.filter((x) => (
                x.key === 'public'
                || x.key === 'logged_in_user'
                || x.key === 'ifrc_ns'
            ));
        }
        return visibilityTypeOptions;
    }, [
        visibilityTypeOptions,
        meResponse,
    ]);

    const {
        pending: fetchingSecondarySectors,
        response: secondarySectorOptions,
    } = useRequest({
        url: '/api/v2/secondarysector',
    });

    const {
        pending: fetchingDisasterTypes,
        response: disasterTypesResponse,
    } = useRequest({
        url: '/api/v2/disaster_type/',
    });

    const operationToDisasterMap = useMemo(() => (
        listToMap(eventOptions, (d) => d.id, (d) => d.dtype?.id)
    ), [eventOptions]);

    const [
        shouldShowCurrentEmergencyOperation,
        shouldShowCurrentOperation,
    ] = useMemo(() => {
        const operationType = value.operation_type;
        const programmeType = value.programme_type;

        const isEmergencyOperation = operationType === OPERATION_TYPE_EMERGENCY;

        return [
            isEmergencyOperation && programmeType === PROGRAMME_TYPE_DOMESTIC,
            isEmergencyOperation && programmeType === PROGRAMME_TYPE_MULTILATERAL,
        ] as const;
    }, [value]);

    const shouldDisableDisasterType = shouldShowCurrentEmergencyOperation
        || shouldShowCurrentOperation;

    let disasterTypePlaceholder = strings.projectFormDisasterTypeDefaultPlaceholder;
    if (fetchingDisasterTypes) {
        disasterTypePlaceholder = strings.projectFormFetchingDisasterTypePlaceholder;
    } else if (shouldDisableDisasterType) {
        disasterTypePlaceholder = strings.projectFormDisasterTypePlaceholder;
    }

    const {
        setValue: setAnnualSplit,
        removeValue: removeAnnualSplit,
    } = useFormArray<'annual_split_detail', PartialAnnualType>(
        'annual_split_detail',
        setFieldValue,
    );

    const handleAddAnnualSplitButtonClick = useCallback(() => {
        const client_id = randomString();
        const newAnnualSplit: PartialAnnualType = {
            client_id,
        };

        setFieldValue(
            (oldValue: PartialAnnualType[] | undefined) => (
                [...(oldValue ?? []), newAnnualSplit]
            ),
            'annual_split_detail' as const,
        );
        setFieldValue(true, 'is_annual_report');
    }, [setFieldValue]);

    const annualSplitErrors = useMemo(
        () => getErrorObject(error?.annual_split_detail),
        [error],
    );

    const handleStartDateChange = useCallback((newVal: string | undefined) => {
        setValue((oldVal) => {
            let { status } = oldVal;
            if (oldVal.is_project_completed) {
                status = PROJECT_STATUS_COMPLETED;
            } else if (isDefined(newVal)) {
                const startDate = new Date(newVal);
                const now = new Date();

                if (startDate <= now) {
                    status = PROJECT_STATUS_ONGOING;
                } else {
                    status = PROJECT_STATUS_PLANNED;
                }
            }

            return {
                ...oldVal,
                start_date: newVal,
                status,
            };
        });
    }, [
        setValue,
    ]);

    const handleTargetMaleChange = useCallback((newTarget: number | undefined) => {
        setValue((oldValue) => {
            let total = oldValue?.target_total;
            if (
                isDefined(newTarget)
                || isDefined(oldValue.target_female)
                || isDefined(oldValue.target_other)
            ) {
                total = (newTarget ?? 0)
                + (oldValue.target_female ?? 0)
                + (oldValue.target_other ?? 0);
            }

            return ({
                ...oldValue,
                target_total: total,
                target_male: newTarget,
            });
        });
    }, [setValue]);

    const handleTargetFemaleChange = useCallback((newTarget: number | undefined) => {
        setValue((oldValue) => {
            let total = oldValue?.target_total;
            if (
                isDefined(oldValue.target_male)
                || isDefined(newTarget)
                || isDefined(oldValue.target_other)
            ) {
                total = (oldValue.target_male ?? 0)
                + (newTarget ?? 0)
                + (oldValue.target_other ?? 0);
            }

            return ({
                ...oldValue,
                target_total: total,
                target_female: newTarget,
            });
        });
    }, [setValue]);

    const handleTargetOtherChange = useCallback((newTarget: number | undefined) => {
        setValue((oldValue) => {
            let total = oldValue?.target_total;
            if (
                isDefined(oldValue.target_male)
                || isDefined(oldValue.target_female)
                || isDefined(newTarget)
            ) {
                total = (oldValue.target_male ?? 0)
                + (oldValue.target_female ?? 0)
                + (newTarget ?? 0);
            }
            return ({
                ...oldValue,
                target_total: total,
                target_other: newTarget,
            });
        });
    }, [setValue]);

    const handleReachedMaleChange = useCallback((newReached: number | undefined) => {
        setValue((oldValue) => {
            let total = oldValue?.reached_total;
            if (
                isDefined(newReached)
                || isDefined(oldValue.reached_female)
                || isDefined(oldValue.reached_other)
            ) {
                total = (newReached ?? 0)
                + (oldValue.reached_female ?? 0)
                + (oldValue.reached_other ?? 0);
            }
            return ({
                ...oldValue,
                reached_total: total,
                reached_male: newReached,
            });
        });
    }, [setValue]);

    const handleReachedFemaleChange = useCallback((newReached: number | undefined) => {
        setValue((oldValue) => {
            let total = oldValue?.reached_total;
            if (
                isDefined(oldValue.reached_male)
                || isDefined(newReached)
                || isDefined(oldValue.reached_other)
            ) {
                total = (oldValue.reached_male ?? 0)
                + (newReached ?? 0)
                + (oldValue.reached_other ?? 0);
            }

            return ({
                ...oldValue,
                reached_total: total,
                reached_female: newReached,
            });
        });
    }, [setValue]);

    const handleReachedOtherChange = useCallback((newReached: number | undefined) => {
        setValue((oldValue) => {
            let total = oldValue?.reached_total;
            if (
                isDefined(oldValue.reached_male)
                || isDefined(oldValue.reached_female)
                || isDefined(newReached)
            ) {
                total = (oldValue.reached_male ?? 0)
                + (oldValue.reached_female ?? 0)
                + (newReached ?? 0);
            }
            return ({
                ...oldValue,
                reached_total: total,
                reached_other: newReached,
            });
        });
    }, [setValue]);

    const handleEventChange = useCallback((newEvent: number | undefined) => {
        setValue((oldValue) => (
            {
                ...oldValue,
                event: newEvent,
                dtype: (shouldDisableDisasterType && newEvent)
                    ? operationToDisasterMap?.[newEvent]
                    : oldValue.dtype,
            }
        ));
    }, [
        setValue,
        shouldDisableDisasterType,
        operationToDisasterMap,
    ]);

    const handleBudgetAmountChange = useCallback((newBudget: number | undefined) => {
        setValue((oldValue) => ({
            ...oldValue,
            budget_amount: newBudget,
            actual_expenditure: isNotDefined(oldValue.actual_expenditure)
                ? newBudget
                : oldValue.actual_expenditure,
        }));
    }, [setValue]);

    const handleActualExpenditureChange = useCallback((newExpenditure: number | undefined) => {
        setValue((oldValue) => ({
            ...oldValue,
            actual_expenditure: newExpenditure,
            budget_amount: isNotDefined(oldValue.budget_amount)
                ? newExpenditure
                : oldValue.budget_amount,
        }));
    }, [setValue]);

    const {
        pending: createSubmitPending,
        trigger: submitRequest,
    } = useLazyRequest({
        url: '/api/v2/project/',
        method: 'POST',
        body: (ctx: ProjectResponseBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.threeWCreateSuccessMessage,
                { variant: 'success' },
            );
            navigate(
                generatePath(
                    threeWProjectEditRoute.absolutePath,
                    { projectId: response.id },
                ),
            );
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            alert.show(
                strings.projectFormUpdateRequestFailure,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const {
        pending: updateSubmitPending,
        trigger: submitUpdateRequest,
    } = useLazyRequest({
        url: '/api/v2/project/{id}/',
        method: 'PUT',
        body: (ctx: ProjectResponseBody) => ctx,
        pathVariables: {
            id: Number(projectId),
        },
        onSuccess: () => {
            alert.show(
                strings.threeWUpdateSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            alert.show(
                strings.projectFormUpdateRequestFailure,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });
    const handleSubmit = useCallback((data: FormType) => {
        if (!projectId) {
            submitRequest(data as ProjectResponseBody);
        } else {
            submitUpdateRequest(data as ProjectResponseBody);
        }
    }, [
        submitUpdateRequest,
        submitRequest,
        projectId,
    ]);

    const submitPending = updateSubmitPending || createSubmitPending;

    const pending = submitPending
        || pendingProjectDetails;

    return (
        <div className={styles.threeWProjectForm}>
            {/* FIXME: Let's not block the UI during loading */}
            {pending ? <BlockLoading /> : (
                <>
                    <InputSection
                        title={strings.projectFormReportingNational}
                        description={strings.projectFormReportingHelpText}
                        tooltip={strings.projectFormReportingTooltip}
                    >
                        <CountrySearchSelectInput
                            error={error?.reporting_ns}
                            name="reporting_ns"
                            onChange={setFieldValue}
                            value={value.reporting_ns}
                            selectionMode="nationalSociety"
                        />
                    </InputSection>
                    <InputSection
                        title={strings.projectFormReportingNationalContact}
                        description={strings.projectFormReportingNationalContactText}
                    >
                        <TextInput
                            name="reporting_ns_contact_name"
                            label="Name"
                            onChange={setFieldValue}
                            value={value.reporting_ns_contact_name}
                        />
                        <TextInput
                            name="reporting_ns_contact_role"
                            label="Role"
                            onChange={setFieldValue}
                            value={value.reporting_ns_contact_role}
                        />
                        <TextInput
                            name="reporting_ns_contact_email"
                            label="Email"
                            onChange={setFieldValue}
                            value={value.reporting_ns_contact_email}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.projectFormCountryTitle}
                        description={strings.projectFormCountryHelpText}
                        tooltip={strings.projectFormCountryTooltip}
                    >
                        <CountrySearchSelectInput
                            error={error?.project_country}
                            label={strings.projectFormCountryLabel}
                            name="project_country"
                            onChange={handleProjectCountryChange}
                            value={value.project_country}
                        />
                        <DistrictMultiSelectInput
                            error={getErrorString(error?.project_districts)}
                            label={strings.projectFormDistrictLabel}
                            name="project_districts"
                            countryId={value?.project_country}
                            onChange={setFieldValue}
                            options={districtOptions}
                            onOptionsChange={setDistrictOptions}
                            value={value.project_districts}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.projectFormTypeOfOperation}
                        tooltip={strings.projectFormTypeOfOperationTooltip}
                        description={(
                            <>
                                <strong>{strings.projectFormProgrammeType}</strong>
                                &nbsp;
                                {strings.projectFormProgrammeTooltip}
                            </>
                        )}
                    >
                        <SelectInput
                            error={error?.operation_type}
                            label={strings.projectFormOperationType}
                            name="operation_type"
                            onChange={setFieldValue}
                            options={operationTypeOptions}
                            value={value.operation_type}
                            // FIXME: do not use inline functions
                            keySelector={(d) => d.key}
                            labelSelector={(d) => d.value}
                        />
                        <SelectInput
                            error={error?.programme_type}
                            label={strings.projectFormProgrammeTypeLabel}
                            name="programme_type"
                            onChange={setFieldValue}
                            options={programmeTypeOptions}
                            value={value.programme_type}
                            // FIXME: do not use inline functions
                            keySelector={(d) => d.key}
                            labelSelector={(d) => d.value}
                        />
                    </InputSection>
                    {shouldShowCurrentOperation && (
                        <InputSection title={strings.projectFormCurrentOperation}>
                            <EventSelectInput
                                error={error?.event}
                                name="event"
                                placeholder={strings.projectFormOperationDefaultPlaceholder}
                                value={value.event}
                                onChange={handleEventChange}
                                options={eventOptions}
                                onOptionsChange={setEventOptions}
                                countryId={value?.project_country}
                            />
                        </InputSection>
                    )}
                    {shouldShowCurrentEmergencyOperation && (
                        <InputSection
                            title={strings.projectFormCurrentEmergency}
                            description={strings.projectFormCurrentEmergencyHelpText}
                        >
                            <EventSelectInput
                                error={error?.event}
                                name="event"
                                options={eventOptions}
                                onOptionsChange={setEventOptions}
                                placeholder={strings.projectFormOperationDefaultPlaceholder}
                                value={value.event}
                                onChange={setFieldValue}
                                countryId={value?.project_country}
                                autoGeneratedSource="New field report"
                            />
                        </InputSection>
                    )}
                    <InputSection
                        title={
                            value.operation_type === OPERATION_TYPE_PROGRAMME
                                ? strings.projectFormDisasterType
                                : strings.projectFormDisasterTypeMandatory
                        }
                    >
                        <SelectInput
                            error={error?.dtype}
                            name="dtype"
                            options={disasterTypesResponse?.results}
                            disabled={shouldDisableDisasterType}
                            placeholder={disasterTypePlaceholder}
                            value={value.dtype}
                            onChange={setFieldValue}
                            // FIXME: do not use inline functions
                            keySelector={(d) => d.id}
                            labelSelector={(d) => d.name ?? '???'}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.projectFormProjectName}
                        description={strings.projectFormHelpText}
                        tooltip={strings.projectFormTooltip}
                    >
                        <TextInput
                            name="name"
                            value={value.name}
                            onChange={setFieldValue}
                            error={error?.name}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.projectFormDescription}
                        // description={strings.projectFormDescriptionHelpText}
                        // tooltip={strings.projectFormDescriptionTooltip}
                        // These texts are moved into the area as placeholder:
                    >
                        <RichTextArea
                            name="description"
                            value={value.description === null ? '' : value.description}
                            onChange={setFieldValue}
                            error={error?.description}
                            placeholder={`${strings.projectFormDescriptionHelpText} ${strings.projectFormDescriptionTooltip}`}
                        />
                    </InputSection>
                    <InputSection
                        className="multi-input-section"
                        title={strings.projectFormSectorTitle}
                        description={(
                            <>
                                <p>
                                    <strong>
                                        {strings.projectFormPrimarySector}
                                    </strong>
                                    &nbsp;
                                    {strings.projectFormPrimarySectorText}
                                </p>
                                <p>
                                    <strong>
                                        {strings.projectFormTagging}
                                    </strong>
                                    &nbsp;
                                    {strings.projectFormTaggingText}
                                </p>
                            </>
                        )}
                        tooltip={strings.projectFormTaggingTooltip}
                    >
                        <SelectInput
                            error={error?.primary_sector}
                            label={strings.projectFormPrimarySectorSelect}
                            name="primary_sector"
                            onChange={setFieldValue}
                            options={primarySectorOptions}
                            value={value.primary_sector}
                            // FIXME: do not use inline functions
                            keySelector={(d) => Number(d.key)}
                            labelSelector={(d) => d.label}
                            disabled={fetchingPrimarySectors}
                        />
                        <MultiSelectInput
                            error={getErrorString(error?.secondary_sectors)}
                            label={strings.projectFormSecondarySectorLabel}
                            name="secondary_sectors"
                            onChange={setFieldValue}
                            options={secondarySectorOptions}
                            value={value.secondary_sectors}
                            // FIXME: do not use inline functions
                            keySelector={(d) => Number(d.key)}
                            labelSelector={(d) => d.label}
                            disabled={fetchingSecondarySectors}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.projectFormMultiLabel}
                        description={strings.projectFormMultiLabelHelpText}
                        tooltip={strings.projectFormMultiLabelTooltip}
                    >
                        <DateInput
                            error={error?.start_date}
                            label={strings.projectFormStartDate}
                            name="start_date"
                            onChange={handleStartDateChange}
                            value={value.start_date}
                        />
                        <DateInput
                            error={error?.end_date}
                            label={strings.projectFormEndDate}
                            name="end_date"
                            onChange={setFieldValue}
                            value={value.end_date}
                        />
                    </InputSection>
                    <InputSection
                        className="multi-input-section"
                        title={strings.projectFormBudgetTitle}
                        description={(
                            <>
                                <p>
                                    <strong>
                                        {strings.projectFormBudget}
                                    </strong>
                                    &nbsp;
                                    {strings.projectFormBudgetText}
                                </p>
                                <p>
                                    <strong>
                                        {strings.projectFormProjectStatus}
                                    </strong>
                                    &nbsp;
                                    {strings.projectFormProjectStatusText}
                                </p>
                            </>
                        )}
                        tooltip={strings.projectFormProjectTooltip}
                    >
                        { value.is_project_completed ? (
                            <NumberInput
                                error={error?.actual_expenditure}
                                label={strings.projectFormActualExpenditure}
                                name="actual_expenditure"
                                value={value.actual_expenditure}
                                onChange={handleActualExpenditureChange}
                            />
                        ) : (
                            <NumberInput
                                error={error?.budget_amount}
                                label={strings.projectFormProjectBudget}
                                name="budget_amount"
                                value={value.budget_amount}
                                onChange={handleBudgetAmountChange}
                            />
                        )}
                        <div>
                            <Checkbox
                                label={strings.projectFormProjectCompleted}
                                name="is_project_completed"
                                value={value?.is_project_completed}
                                onChange={setFieldValue}
                            />
                            <TextOutput
                                label={strings.projectFormProjectStatusTitle}
                                value={(
                                    value.status
                                        ? projectStatusOptionsMap?.[value.status]
                                        : undefined
                                )}
                            />
                        </div>
                        <div>
                            <Switch
                                label="Annual Reporting"
                                name="is_annual_report"
                                value={value?.is_annual_report}
                                onChange={setFieldValue}
                            />
                        </div>
                    </InputSection>
                    {value?.is_annual_report ? (
                        <InputSection
                            description={strings.projectFormPeopleTargetedHelpText}
                            title={`${strings.projectFormPeopleTargeted} ${strings.projectFormAnnually}`}
                            tooltip={
                                strings.projectFormPeopleTargetedTooltip
                                + strings.projectFormAnnually
                            }
                            oneColumn
                            multiRow
                        >
                            {value?.annual_split_detail?.map((annual_split, i) => (
                                <AnnualSplitInput
                                    key={annual_split.client_id}
                                    index={i}
                                    value={annual_split}
                                    onChange={setAnnualSplit}
                                    error={annualSplitErrors?.[annual_split.client_id]}
                                    onRemove={removeAnnualSplit}
                                />
                            ))}
                            <div>
                                <Button
                                    onClick={handleAddAnnualSplitButtonClick}
                                    name={undefined}
                                    variant="secondary"
                                >
                                    {strings.addNewSplit}
                                </Button>
                            </div>
                        </InputSection>
                    ) : (
                        <>
                            <InputSection
                                description={strings.projectFormPeopleTargetedHelpText}
                                title={strings.projectFormPeopleTargeted}
                                tooltip={strings.projectFormPeopleTargetedTooltip}
                            >
                                <NumberInput
                                    name="target_male"
                                    label={strings.projectFormMale}
                                    value={value.target_male}
                                    error={error?.target_male}
                                    onChange={handleTargetMaleChange}
                                />
                                <NumberInput
                                    name="target_female"
                                    label={strings.projectFormFemale}
                                    value={value.target_female}
                                    error={error?.target_female}
                                    onChange={handleTargetFemaleChange}
                                />
                                <NumberInput
                                    name="target_other"
                                    label={strings.projectFormOther}
                                    value={value.target_other}
                                    error={error?.target_other}
                                    onChange={handleTargetOtherChange}
                                />
                                <NumberInput
                                    disabled={shouldDisableTotalTarget || value?.is_annual_report}
                                    name="target_total"
                                    label={
                                        (isTotalRequired && !shouldDisableTotalTarget)
                                            ? strings.projectFormTotalRequired
                                            : strings.projectFormTotal
                                    }
                                    value={value.target_total}
                                    error={error?.target_total}
                                    onChange={setFieldValue}
                                    className={
                                        shouldDisableTotalTarget
                                            ? styles.disable : styles.normal
                                    }
                                />
                            </InputSection>
                            <InputSection
                                title={strings.projectFormPeopleReached2}
                                description={strings.projectFormPeopleReachedHelpText}
                                tooltip={strings.projectFormPeopleReachedTooltip}
                            >
                                <NumberInput
                                    name="reached_male"
                                    label={strings.projectFormPeopleReachedMale}
                                    value={value.reached_male}
                                    error={error?.reached_male}
                                    onChange={handleReachedMaleChange}
                                />
                                <NumberInput
                                    name="reached_female"
                                    label={strings.projectFormPeopleReachedFemale}
                                    value={value.reached_female}
                                    error={error?.reached_female}
                                    onChange={handleReachedFemaleChange}
                                />
                                <NumberInput
                                    name="reached_other"
                                    label={strings.projectFormPeopleReachedOther}
                                    value={value.reached_other}
                                    error={error?.reached_other}
                                    onChange={handleReachedOtherChange}
                                />
                                <NumberInput
                                    disabled={shouldDisableTotalReached || value?.is_annual_report}
                                    name="reached_total"
                                    label={
                                        (isTotalRequired && !shouldDisableTotalReached)
                                            ? strings.projectFormTotalRequired
                                            : strings.projectFormTotal
                                    }
                                    value={value.reached_total}
                                    error={error?.reached_total}
                                    onChange={setFieldValue}
                                    className={
                                        shouldDisableTotalReached ? styles.disable : styles.normal
                                    }
                                />
                            </InputSection>
                        </>
                    )}
                    <InputSection
                        title={strings.projectFormProjectVisibility}
                        description={strings.projectFormProjectVisibilityHelpText}
                        tooltip={strings.projectFormProjectVisibilityTooltip}
                    >
                        <RadioInput
                            name="visibility"
                            value={value.visibility}
                            onChange={setFieldValue}
                            error={error?.visibility}
                            options={visibilityOptions}
                            // FIXME: do not use inline functions
                            keySelector={(d) => d.key}
                            labelSelector={(d) => d.value}
                            disabled={pendingMe}
                        />
                    </InputSection>
                    <div className={styles.formActions}>
                        {/*
                            The first hidden and disabled submit button is to disable
                            form submission on enter
                            more details on: https://www.w3.org/TR/2018/SPSD-html5-20180327/forms.html#implicit-submission
                            <button
                            className={styles.fakeSubmitButton}
                            type="submit"
                            disabled
                            />
                          */}
                        <NonFieldError
                            className={styles.nonFieldError}
                            error={error}
                            message={strings.projectFormNonFieldError}
                        />
                        <Button
                            name={undefined}
                            onClick={createSubmitHandler(validate, onErrorSet, handleSubmit)}
                            type="submit"
                            disabled={pending}
                            variant="secondary"
                        >
                            {submitPending
                                ? strings.projectFormSubmitting
                                : strings.projectFormSubmit}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
