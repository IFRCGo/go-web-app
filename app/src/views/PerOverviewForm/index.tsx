import {
    useCallback,
    useRef,
    useState,
} from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import {
    BooleanInput,
    Button,
    ConfirmButton,
    Container,
    DateInput,
    InputSection,
    ListView,
    NumberInput,
    Portal,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    useForm,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import NationalSocietySelectInput from '#components/domain/NationalSocietySelectInput';
import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useUserMe from '#hooks/domain/useUserMe';
import useAlertContext from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    PER_PHASE_ASSESSMENT,
    PER_PHASE_OVERVIEW,
} from '#utils/domain/per';
import type { PerProcessOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    overviewSchema,
    type PartialOverviewFormFields,
    type PerOverviewRequestBody,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type PerOverviewAssessmentMethods = NonNullable<GlobalEnumsResponse['per_overviewassessmentmethods']>[number];

function perAssessmentMethodsKeySelector(option: PerOverviewAssessmentMethods) {
    return option.key;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlertContext();
    const { navigate } = useRouting();
    const { perId } = useParams<{ perId: string }>();
    const {
        statusResponse,
        actionDivRef,
        refetchStatusResponse,
        readOnly,
    } = useOutletContext<PerProcessOutletContext>();

    const { per_overviewassessmentmethods } = useGlobalEnums();
    const userMe = useUserMe();

    const formContentRef = useRef<HTMLDivElement>(null);
    const isSettingUpProcess = useRef(false);

    const {
        value,
        setValue,
        setFieldValue,
        error: formError,
        setError,
        validate,
    } = useForm(
        overviewSchema,
        // FIXME: use value from enum
        { value: { assessment_method: 'per' } },
        isSettingUpProcess,
    );

    const [
        fileIdToUrlMap,
        setFileIdToUrlMap,
    ] = useState<Record<number, string>>({});

    const {
        response: perOptionsResponse,
        pending: perOptionsPending,
    } = useRequest({
        url: '/api/v2/per-options/',
    });

    const {
        pending: fetchingPerOverview,
        // response: perOverviewResponse,
        error: perOverviewResponseError,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: {
            id: Number(perId),
        },
        onSuccess: (response) => {
            const {
                orientation_documents_details,
                ...formValues
            } = response;

            setFileIdToUrlMap(
                (prevValue) => ({
                    ...prevValue,
                    ...listToMap(
                        orientation_documents_details ?? [],
                        (document) => document.id,
                        (document) => document.file,
                    ),
                }),
            );

            setValue(formValues);
        },
    });

    useRequest({
        url: '/api/v2/country/{id}/latest-per-overview/',
        skip: isNotDefined(value?.country) || isDefined(value?.is_draft),
        pathVariables: {
            id: Number(value?.country),
        },
        onSuccess: (response) => {
            const lastAssessment = response;
            if (lastAssessment) {
                const lastAssessmentNumber = lastAssessment.assessment_number ?? 0;
                setFieldValue(lastAssessmentNumber + 1, 'assessment_number');
                setFieldValue(lastAssessment.date_of_assessment, 'date_of_previous_assessment');
                setFieldValue(lastAssessment.type_of_assessment.id, 'type_of_previous_assessment');
            } else {
                setFieldValue(1, 'assessment_number');
            }
        },
    });

    const {
        trigger: updatePerOverview,
        pending: updatePerPending,
    } = useLazyRequest({
        url: '/api/v2/per-overview/{id}/',
        method: 'PATCH',
        pathVariables: isDefined(perId) ? {
            id: Number(perId),
        } : undefined,
        body: (ctx: PerOverviewRequestBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.saveRequestSuccessMessage,
                { variant: 'success' },
            );

            refetchStatusResponse();

            // Redirect from new form to edit route
            if (isNotDefined(perId) && response.phase === PER_PHASE_OVERVIEW) {
                navigate(
                    'perOverviewForm',
                    { params: { perId: response.id } },
                );
            }

            // Redirect to assessment form
            if (response.phase === PER_PHASE_ASSESSMENT && value?.is_draft !== false) {
                navigate(
                    'perAssessmentForm',
                    { params: { perId: response.id } },
                );

                // Move the page position to top when moving on to next step
                window.scrollTo(0, 0);
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(transformObjectError(formErrors, () => undefined));
            alert.show(
                strings.saveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const {
        trigger: createPerOverview,
        pending: createPerPending,
    } = useLazyRequest({
        url: '/api/v2/per-overview/',
        method: 'POST',
        body: (ctx: PerOverviewRequestBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.saveRequestSuccessMessage,
                { variant: 'success' },
            );

            refetchStatusResponse();

            // Redirect from new form to edit route
            if (isNotDefined(perId) && response.phase === PER_PHASE_OVERVIEW) {
                navigate(
                    'perOverviewForm',
                    { params: { perId: response.id } },
                );
            }

            // Redirect to assessment form
            if (response.phase === PER_PHASE_ASSESSMENT) {
                navigate(
                    'perAssessmentForm',
                    { params: { perId: response.id } },
                );
            }
            // Move the page position to top when moving on to next step
            window.scrollTo(0, 0);
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(transformObjectError(formErrors, () => undefined));
            alert.show(
                strings.saveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
        useCurrentLanguageForMutation: true,
    });

    const handleSubmit = useCallback(
        (formValues: PartialOverviewFormFields) => {
            if (isDefined(perId)) {
                updatePerOverview({
                    ...formValues,
                    is_draft: formValues.is_draft ?? true,
                } as PerOverviewRequestBody);
            } else {
                createPerOverview({
                    ...formValues,
                    is_draft: formValues.is_draft ?? true,
                } as PerOverviewRequestBody);
            }
        },
        [perId, updatePerOverview, createPerOverview],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialOverviewFormFields) => {
            if (isDefined(perId)) {
                updatePerOverview({
                    ...formValues,
                    is_draft: false,
                } as PerOverviewRequestBody);
            } else {
                createPerOverview({
                    ...formValues,
                    is_draft: false,
                } as PerOverviewRequestBody);
            }
        },
        [perId, updatePerOverview, createPerOverview],
    );

    const handleFormError = useCallback(() => {
        setTimeout(() => formContentRef.current?.scrollIntoView(), 200);
    }, []);

    const handleSetupPerProcess = useCallback(() => {
        isSettingUpProcess.current = true;
        const handler = createSubmitHandler(
            validate,
            setError,
            handleFinalSubmit,
            handleFormError,
        );
        handler();
        isSettingUpProcess.current = false;
    }, [handleFormError, handleFinalSubmit, validate, setError]);

    const handleSave = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
            handleFormError,
        );
        handler();
    }, [handleFormError, handleSubmit, validate, setError]);
    const error = getErrorObject(formError);

    const currentPerStep = statusResponse?.phase;
    const submissionDisabled = readOnly
        || (isDefined(currentPerStep) && currentPerStep !== PER_PHASE_OVERVIEW);

    const partialReadOnly = value?.is_draft === false;

    const dataPending = fetchingPerOverview;
    const savePerPending = createPerPending || updatePerPending;
    const disabled = savePerPending;

    return (
        <Container
            pending={dataPending}
            errored={isDefined(perOverviewResponseError)}
            errorMessage={perOverviewResponseError?.value?.messageForNotification}
            elementRef={formContentRef}
            className={styles.overviewForm}
            heading={partialReadOnly
                ? strings.overviewEditHeading
                : strings.overviewSetupHeading}
            withCenteredHeading
            headingLevel={2}
            footerActions={(
                <ConfirmButton
                    name={undefined}
                    confirmHeading={strings.submitConfirmHeading}
                    confirmMessage={strings.submitConfirmMessage}
                    onConfirm={handleSetupPerProcess}
                    disabled={submissionDisabled || savePerPending}
                >
                    {strings.submitButtonLabel}
                </ConfirmButton>
            )}
            spacing="xl"
        >
            {/* eslint-disable-next-line max-len */}
            {/* FIXME(frozenhelium): actionDivRef.current read in render to conditionally mount a Portal — valid DOM pattern */}
            {/* eslint-disable-next-line react-hooks/refs */}
            {actionDivRef.current && (
                // eslint-disable-next-line react-hooks/refs
                <Portal container={actionDivRef.current}>
                    <Button
                        name={undefined}
                        onClick={handleSave}
                        disabled={savePerPending || readOnly}
                    >
                        {strings.saveButtonLabel}
                    </Button>
                </Portal>
            )}
            <ListView
                layout="block"
                spacing="lg"
            >
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
                <InputSection
                    title={strings.nationalSocietyInputLabel}
                    numPreferredColumns={2}
                    withAsteriskOnTitle
                >
                    <NationalSocietySelectInput
                        name="country"
                        onChange={setFieldValue}
                        value={value?.country}
                        error={getErrorString(error?.country)}
                        readOnly={partialReadOnly || readOnly}
                        disabled={disabled}
                        regions={!userMe?.is_superuser
                            ? userMe?.is_per_admin_for_regions : undefined}
                        countries={!userMe?.is_superuser
                            ? userMe?.is_per_admin_for_countries : undefined}
                        autoFocus
                    />
                </InputSection>
                <Container
                    heading={strings.orientationSectionHeading}
                    spacing="lg"
                >
                    <ListView layout="block">
                        <InputSection
                            title={strings.dateOfOrientationInputLabel}
                            description={strings.dateOfOrientationInputDescription}
                            numPreferredColumns={2}
                            withAsteriskOnTitle={isNotDefined(value?.date_of_assessment)}
                        >
                            <DateInput
                                name="date_of_orientation"
                                onChange={setFieldValue}
                                value={value?.date_of_orientation}
                                error={error?.date_of_orientation}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection title={strings.uploadADocInputLabel}>
                            <GoMultiFileInput
                                name="orientation_documents"
                                accept=".docx, .pdf"
                                url="/api/v2/per-file/multiple/"
                                value={value?.orientation_documents}
                                onChange={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={getErrorString(error?.orientation_documents)}
                                disabled={disabled}
                                readOnly={readOnly}
                            >
                                {strings.uploadButtonLabel}
                            </GoMultiFileInput>
                        </InputSection>
                    </ListView>
                </Container>
                <Container
                    heading={strings.assessmentSectionHeading}
                    spacing="lg"
                >
                    <ListView layout="block">
                        <InputSection
                            numPreferredColumns={2}
                            title={strings.dateOfAssessmentInputLabel}
                            description={strings.dateOfAssessmentInputDescription}
                            withAsteriskOnTitle={isNotDefined(value?.date_of_orientation)}
                        >
                            <DateInput
                                name="date_of_assessment"
                                onChange={setFieldValue}
                                value={value?.date_of_assessment}
                                error={error?.date_of_assessment}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            numPreferredColumns={2}
                            title={strings.typeOfAssessmentInputLabel}
                            withAsteriskOnTitle={isDefined(value.date_of_assessment)}
                        >
                            <SelectInput
                                name="type_of_assessment"
                                options={perOptionsResponse?.overviewassessmenttypes}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                onChange={setFieldValue}
                                value={value?.type_of_assessment}
                                error={error?.type_of_assessment}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled || perOptionsPending}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.dateOfPreviousPerAssessmentInputLabel}
                            numPreferredColumns={2}
                        >
                            <DateInput
                                name="date_of_previous_assessment"
                                onChange={setFieldValue}
                                value={value?.date_of_previous_assessment}
                                error={error?.date_of_previous_assessment}
                                disabled={disabled}
                                readOnly
                            />
                        </InputSection>
                        <InputSection
                            title={strings.typeOfPreviousPerAssessmentInputLabel}
                            numPreferredColumns={2}
                        >
                            <SelectInput
                                name="type_of_previous_assessment"
                                options={perOptionsResponse?.overviewassessmenttypes}
                                keySelector={numericIdSelector}
                                labelSelector={stringNameSelector}
                                onChange={setFieldValue}
                                value={value?.type_of_previous_assessment}
                                error={error?.type_of_previous_assessment}
                                disabled={disabled || perOptionsPending}
                                readOnly
                            />
                        </InputSection>
                        <InputSection
                            title={strings.branchesInvolvedInputLabel}
                            description={strings.branchesInvolvedInputDescription}
                        >
                            <TextInput
                                name="branches_involved"
                                value={value?.branches_involved}
                                onChange={setFieldValue}
                                error={error?.branches_involved}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.whatMethodHasThisAssessmentUsedInputLabel}
                            numPreferredColumns={2}
                        >
                            <SelectInput
                                name="assessment_method"
                                options={per_overviewassessmentmethods}
                                value={value?.assessment_method}
                                keySelector={perAssessmentMethodsKeySelector}
                                labelSelector={stringValueSelector}
                                onChange={setFieldValue}
                                error={error?.assessment_method}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.epiConsiderationsInputLabel}
                            description={strings.epiConsiderationsInputDescription}
                        >
                            <BooleanInput
                                name="assess_preparedness_of_country"
                                value={value?.assess_preparedness_of_country}
                                onChange={setFieldValue}
                                error={error?.assess_preparedness_of_country}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.urbanConsiderationsInputLabel}
                            description={strings.urbanConsiderationsInputDescription}
                        >
                            <BooleanInput
                                name="assess_urban_aspect_of_country"
                                value={value.assess_urban_aspect_of_country}
                                onChange={setFieldValue}
                                error={error?.assess_urban_aspect_of_country}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.climateAndEnvironmentalConsiderationsInputLabel}
                            // eslint-disable-next-line max-len
                            description={strings.climateAndEnvironmentalConsiderationsInputDescription}
                        >
                            <BooleanInput
                                name="assess_climate_environment_of_country"
                                value={value?.assess_climate_environment_of_country}
                                onChange={setFieldValue}
                                error={error?.assess_climate_environment_of_country}
                                readOnly={partialReadOnly || readOnly}
                                disabled={disabled}
                            />
                        </InputSection>
                    </ListView>
                </Container>
                <Container
                    heading={strings.processCycleHeading}
                    spacing="lg"
                >
                    <InputSection
                        title={strings.perProcessCycleNumberInputLabel}
                        description={strings.assessmentNumberInputDescription}
                        numPreferredColumns={2}
                    >
                        <NumberInput
                            readOnly
                            name="assessment_number"
                            value={value?.assessment_number}
                            onChange={setFieldValue}
                            error={error?.assessment_number}
                            disabled={disabled}
                        />
                    </InputSection>
                </Container>
                <Container
                    heading={strings.workPlanHeading}
                    spacing="lg"
                >
                    <ListView layout="block">
                        <InputSection
                            title={strings.workPlanDevelopmentDateInputLabel}
                            numPreferredColumns={2}
                        >
                            <DateInput
                                name="workplan_development_date"
                                value={value?.workplan_development_date}
                                error={error?.workplan_development_date}
                                onChange={setFieldValue}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.workPlanRevisionDateInputLabel}
                            numPreferredColumns={2}
                        >
                            <DateInput
                                name="workplan_revision_date"
                                onChange={setFieldValue}
                                value={value?.workplan_revision_date}
                                error={error?.workplan_revision_date}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </InputSection>
                    </ListView>
                </Container>
                <Container
                    heading={strings.contactInformationInputLabel}
                    spacing="lg"
                >
                    <ListView layout="block">
                        <InputSection
                            title={strings.nsFocalPointInputLabel}
                            description={strings.nsFocalPointInputDescription}
                            numPreferredColumns={4}
                        >
                            <TextInput
                                label={strings.focalPointNameInputLabel}
                                name="ns_focal_point_name"
                                value={value?.ns_focal_point_name}
                                onChange={setFieldValue}
                                error={error?.ns_focal_point_name}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointEmailInputLabel}
                                name="ns_focal_point_email"
                                value={value?.ns_focal_point_email}
                                onChange={setFieldValue}
                                error={error?.ns_focal_point_email}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointPhoneNumberInputLabel}
                                name="ns_focal_point_phone"
                                value={value?.ns_focal_point_phone}
                                onChange={setFieldValue}
                                error={error?.ns_focal_point_phone}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.nsSecondFocalPointInputLabel}
                            description={strings.nsSecondFocalPointInputDescription}
                            numPreferredColumns={4}
                        >
                            <TextInput
                                label={strings.focalPointNameInputLabel}
                                name="ns_second_focal_point_name"
                                value={value?.ns_second_focal_point_name}
                                onChange={setFieldValue}
                                error={error?.ns_second_focal_point_name}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointEmailInputLabel}
                                name="ns_second_focal_point_email"
                                value={value?.ns_second_focal_point_email}
                                onChange={setFieldValue}
                                error={error?.ns_second_focal_point_email}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointPhoneNumberInputLabel}
                                name="ns_second_focal_point_phone"
                                value={value?.ns_second_focal_point_phone}
                                onChange={setFieldValue}
                                error={error?.ns_second_focal_point_phone}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.partnerFocalPointInputLabel}
                            numPreferredColumns={4}
                        >
                            <TextInput
                                label={strings.focalPointNameInputLabel}
                                name="partner_focal_point_name"
                                value={value?.partner_focal_point_name}
                                onChange={setFieldValue}
                                error={error?.partner_focal_point_name}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointEmailInputLabel}
                                name="partner_focal_point_email"
                                value={value?.partner_focal_point_email}
                                onChange={setFieldValue}
                                error={error?.partner_focal_point_email}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointPhoneNumberInputLabel}
                                name="partner_focal_point_phone"
                                value={value?.partner_focal_point_phone}
                                onChange={setFieldValue}
                                error={error?.partner_focal_point_phone}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointOrganizationInputLabel}
                                name="partner_focal_point_organization"
                                value={value?.partner_focal_point_organization}
                                onChange={setFieldValue}
                                error={error?.partner_focal_point_organization}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.perFacilitatorInputLabel}
                            numPreferredColumns={4}
                        >
                            <TextInput
                                label={strings.focalPointNameInputLabel}
                                name="facilitator_name"
                                value={value?.facilitator_name}
                                onChange={setFieldValue}
                                error={error?.facilitator_name}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointEmailInputLabel}
                                name="facilitator_email"
                                value={value?.facilitator_email}
                                onChange={setFieldValue}
                                error={error?.facilitator_email}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.focalPointPhoneNumberInputLabel}
                                name="facilitator_phone"
                                value={value?.facilitator_phone}
                                onChange={setFieldValue}
                                error={error?.facilitator_phone}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                            <TextInput
                                label={strings.otherContactMethodInputLabel}
                                name="facilitator_contact"
                                value={value?.facilitator_contact}
                                onChange={setFieldValue}
                                error={error?.facilitator_contact}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        </InputSection>
                    </ListView>
                </Container>
            </ListView>
        </Container>
    );
}

Component.displayName = 'PerOverviewForm';
