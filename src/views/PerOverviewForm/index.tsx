import {
    useMemo,
    useCallback,
    useContext,
    useState,
} from 'react';
import {
    useParams,
    useNavigate,
    generatePath,
    useOutletContext,
} from 'react-router-dom';
import {
    useForm,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import { isNotDefined, isDefined, listToMap } from '@togglecorp/fujs';

import Portal from '#components/Portal';
import Button from '#components/Button';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import SelectInput from '#components/SelectInput';
import DateInput from '#components/DateInput';
import TextInput from '#components/TextInput';
import BooleanInput from '#components/BooleanInput';
import ConfirmButton from '#components/ConfirmButton';
import NumberInput from '#components/NumberInput';
import GoMultiFileInput from '#components/GoMultiFileInput';
import NonFieldError from '#components/NonFieldError';
import useTranslation from '#hooks/useTranslation';
import useAlertContext from '#hooks/useAlert';
import { useLazyRequest, useRequest } from '#utils/restRequest';
import { isValidNationalSociety } from '#utils/common';
import RouteContext from '#contexts/route';
import ServerEnumsContext from '#contexts/server-enums';
import type { paths } from '#generated/types';
import { PER_PHASE_OVERVIEW, PER_PHASE_ASSESSMENT } from '#utils/per';
import type { PerProcessOutletContext } from '#utils/outletContext';
import {
    numericIdSelector,
    stringValueSelector,
    stringNameSelector,
} from '#utils/selectors';

import {
    PerOverviewRequestBody,
    PerOverviewResponse,
    overviewSchema,
    PartialOverviewFormFields,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
type GlobalEnumsResponse = GetGlobalEnums['responses']['200']['content']['application/json'];
type PerOverviewAssessmentMethods = NonNullable<GlobalEnumsResponse['per_overviewassessmentmethods']>[number];

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];
type CountryListItem = NonNullable<CountryResponse['results']>[number];

function nsLabelSelector(option: CountryListItem) {
    return option.society_name ?? '';
}
function perAssessmentMethodsKeySelector(option: PerOverviewAssessmentMethods) {
    return option.key;
}

const emptyFileIdToUrlMap: Record<number, string> = {};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlertContext();
    const navigate = useNavigate();
    const { perId } = useParams<{ perId: string }>();
    const {
        statusResponse,
        actionDivRef,
        refetchStatusResponse,
    } = useOutletContext<PerProcessOutletContext>();
    const {
        perAssessmentForm: perAssessmentFormRoute,
        perOverviewForm: perOverviewFormRoute,
    } = useContext(RouteContext);

    const { per_overviewassessmentmethods } = useContext(ServerEnumsContext);

    const {
        value,
        setValue,
        setFieldValue,
        error: formError,
        setError,
        validate,
    } = useForm(overviewSchema, { value: {} });

    const [
        fileIdToUrlMap,
        setFileIdToUrlMap,
    ] = useState<Record<number, string>>(emptyFileIdToUrlMap);

    const {
        response: countryResponse,
    } = useRequest({
        url: '/api/v2/country/',
        query: {
            limit: 500,
        },
    });

    const {
        response: perOptionsResponse,
    } = useRequest({
        url: '/api/v2/per-options/',
    });

    useRequest({
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

            setValue({
                ...formValues,
            });
        },
    });

    useRequest({
        url: '/api/v2/latest-per-overview/',
        skip: isNotDefined(value?.country) || isDefined(value?.is_draft),
        query: {
            country_id: Number(value?.country),
            // FIXME: typing for query not available
        } as never,
        onSuccess: (response) => {
            const lastAssessment = response.results?.[0];
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
        method: 'PUT',
        pathVariables: isDefined(perId) ? {
            id: Number(perId),
        } : undefined,
        body: (ctx: PerOverviewRequestBody) => ctx,
        onSuccess: (response) => {
            if (response && isDefined(response.id)) {
                alert.show(
                    strings.saveRequestSuccessMessage,
                    { variant: 'success' },
                );

                refetchStatusResponse();

                // Redirect from new form to edit route
                if (isNotDefined(perId) && response.phase === PER_PHASE_OVERVIEW) {
                    navigate(
                        generatePath(
                            perOverviewFormRoute.absolutePath,
                            { perId: String(response.id) },
                        ),
                    );
                }

                // Redirect to assessment form
                if (response.phase === PER_PHASE_ASSESSMENT) {
                    navigate(
                        generatePath(
                            perAssessmentFormRoute.absolutePath,
                            { perId: String(response.id) },
                        ),
                    );
                }
            }
            // TODO: log error?
        },
        onFailure: ({
            value: {
                messageForNotification,
                // TODO:
                // formErrors,
            },
            debugMessage,
        }) => {
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
        onSuccess: (responseUnsafe) => {
            // FIXME: server should send type
            const response = responseUnsafe as PerOverviewResponse;
            if (response && isDefined(response.id)) {
                alert.show(
                    strings.saveRequestSuccessMessage,
                    { variant: 'success' },
                );

                refetchStatusResponse();

                // Redirect from new form to edit route
                if (isNotDefined(perId) && response.phase === PER_PHASE_OVERVIEW) {
                    navigate(
                        generatePath(
                            perOverviewFormRoute.absolutePath,
                            { perId: String(response.id) },
                        ),
                    );
                }

                // Redirect to assessment form
                if (response.phase === PER_PHASE_ASSESSMENT) {
                    navigate(
                        generatePath(
                            perAssessmentFormRoute.absolutePath,
                            { perId: String(response.id) },
                        ),
                    );
                }
            }
            // TODO: log error?
        },
        onFailure: ({
            value: {
                messageForNotification,
                // TODO:
                // formErrors,
            },
            debugMessage,
        }) => {
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

    const savePerPending = createPerPending || updatePerPending;

    const nationalSocietyOptions = useMemo(
        () => (
            countryResponse?.results?.map(
                (country) => {
                    if (isValidNationalSociety(country)) {
                        return country;
                    }

                    return undefined;
                },
            ).filter(isDefined)
        ),
        [countryResponse],
    );

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

    const handleFormSubmit = useMemo(
        () => createSubmitHandler(validate, setError, handleSubmit),
        [validate, setError, handleSubmit],
    );
    const handleFormFinalSubmit = useMemo(
        () => createSubmitHandler(validate, setError, handleFinalSubmit),
        [validate, setError, handleFinalSubmit],
    );
    const error = getErrorObject(formError);

    const readOnlyMode = value?.is_draft === false;

    return (
        <Container
            className={styles.overviewForm}
            heading={readOnlyMode ? strings.overviewEditHeading : strings.overviewSetupHeading}
            headingLevel={2}
            childrenContainerClassName={styles.content}
            withHeaderBorder
            footerActions={(
                <ConfirmButton
                    name={undefined}
                    confirmHeading={strings.submitConfirmHeading}
                    confirmMessage={strings.submitConfirmMessage}
                    onConfirm={handleFormFinalSubmit}
                    disabled={(isDefined(statusResponse?.phase)
                        && statusResponse?.phase !== PER_PHASE_OVERVIEW)
                        || savePerPending}
                >
                    {strings.submitButtonLabel}
                </ConfirmButton>
            )}
        >
            <NonFieldError error={formError} />
            <Container
                className={styles.container}
                childrenContainerClassName={styles.sectionContent}
                withInternalPadding
                spacing="loose"
            >
                <InputSection
                    title={strings.nationalSocietyInputLabel}
                    withoutPadding
                    twoColumn
                >
                    <SelectInput
                        name="country"
                        onChange={setFieldValue}
                        options={nationalSocietyOptions}
                        keySelector={numericIdSelector}
                        labelSelector={nsLabelSelector}
                        value={value?.country}
                        error={getErrorString(error?.country)}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.orientationSectionHeading}
                className={styles.container}
                childrenContainerClassName={styles.sectionContent}
                withInternalPadding
                withHeaderBorder
                spacing="loose"
            >
                <InputSection
                    title={strings.dateOfOrientationInputLabel}
                    description={strings.dateOfOrientationInputDescription}
                    twoColumn
                    withoutPadding
                >
                    <DateInput
                        name="date_of_orientation"
                        onChange={setFieldValue}
                        value={value?.date_of_orientation}
                        error={error?.date_of_orientation}
                    />
                </InputSection>
                <InputSection
                    title={strings.uploadADocInputLabel}
                    withoutPadding
                >
                    <GoMultiFileInput
                        name="orientation_documents"
                        accept=".docx, .pdf"
                        url="/api/v2/per-file/multiple/"
                        value={value?.orientation_documents}
                        onChange={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={getErrorString(error?.orientation_documents)}
                    >
                        {strings.uploadButtonLabel}
                    </GoMultiFileInput>
                </InputSection>
            </Container>
            <Container
                heading={strings.assessmentSectionHeading}
                className={styles.container}
                childrenContainerClassName={styles.sectionContent}
                withHeaderBorder
                withInternalPadding
                spacing="loose"
            >
                <InputSection
                    twoColumn
                    title={strings.dateOfAssessmentInputLabel}
                    description={strings.dateOfAssessmentInputDescription}
                    withoutPadding
                >
                    <DateInput
                        name="date_of_assessment"
                        onChange={setFieldValue}
                        value={value?.date_of_assessment}
                        error={error?.date_of_assessment}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
                <InputSection
                    twoColumn
                    title={strings.typeOfAssessmentInputLabel}
                    withoutPadding
                >
                    <SelectInput
                        name="type_of_assessment"
                        options={perOptionsResponse?.overviewassessmenttypes}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                        onChange={setFieldValue}
                        value={value?.type_of_assessment}
                        error={error?.type_of_assessment}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
                <InputSection
                    title={strings.dateOfPreviousPerAssessmentInputLabel}
                    twoColumn
                    withoutPadding
                >
                    <DateInput
                        name="date_of_previous_assessment"
                        onChange={setFieldValue}
                        value={value?.date_of_previous_assessment}
                        readOnly
                    />
                </InputSection>
                <InputSection
                    title={strings.typeOfPreviousPerAssessmentInputLabel}
                    twoColumn
                    withoutPadding
                >
                    <SelectInput
                        name="type_of_previous_assessment"
                        options={perOptionsResponse?.overviewassessmenttypes}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                        onChange={setFieldValue}
                        value={value?.type_of_previous_assessment}
                        readOnly
                    />
                </InputSection>
                <InputSection
                    title={strings.branchesInvolvedInputLabel}
                    description={strings.branchesInvolvedInputDescription}
                    withoutPadding
                >
                    <TextInput
                        name="branches_involved"
                        value={value?.branches_involved}
                        onChange={setFieldValue}
                        error={error?.branches_involved}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
                <InputSection
                    title={strings.whatMethodHasThisAssessmentUsedInputLabel}
                    twoColumn
                    withoutPadding
                >
                    <SelectInput
                        name="assessment_method"
                        options={per_overviewassessmentmethods}
                        value={value?.assessment_method}
                        keySelector={perAssessmentMethodsKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setFieldValue}
                        error={error?.assessment_method}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
                <InputSection
                    title={strings.epiConsiderationsInputLabel}
                    description={strings.epiConsiderationsInputDescription}
                    withoutPadding
                >
                    <BooleanInput
                        name="assess_preparedness_of_country"
                        value={value?.assess_preparedness_of_country}
                        onChange={setFieldValue}
                        error={error?.assess_preparedness_of_country}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
                <InputSection
                    title={strings.urbanConsiderationsInputLabel}
                    description={strings.urbanConsiderationsInputDescription}
                    withoutPadding
                >
                    <BooleanInput
                        name="assess_urban_aspect_of_country"
                        value={value.assess_urban_aspect_of_country}
                        onChange={setFieldValue}
                        error={error?.assess_urban_aspect_of_country}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
                <InputSection
                    title={strings.climateAndEnvironmentalConsiderationsInputLabel}
                    description={strings.climateAndEnvironmentalConsiderationsInputDescription}
                    withoutPadding
                >
                    <BooleanInput
                        name="assess_climate_environment_of_country"
                        value={value?.assess_climate_environment_of_country}
                        onChange={setFieldValue}
                        error={error?.assess_climate_environment_of_country}
                        readOnly={readOnlyMode}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.processCycleHeading}
                className={styles.container}
                childrenContainerClassName={styles.sectionContent}
                withHeaderBorder
                withInternalPadding
                spacing="loose"
            >
                <InputSection
                    title={strings.perProcessCycleNumberInputLabel}
                    description={strings.assessmentNumberInputDescription}
                    twoColumn
                    withoutPadding
                >
                    <NumberInput
                        readOnly
                        name="assessment_number"
                        value={value?.assessment_number}
                        onChange={setFieldValue}
                        error={error?.assessment_number}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.workPlanHeading}
                className={styles.container}
                childrenContainerClassName={styles.sectionContent}
                withHeaderBorder
                withInternalPadding
                spacing="loose"
            >
                <InputSection
                    title={strings.workPlanDevelopmentDateInputLabel}
                    twoColumn
                    withoutPadding
                >
                    <DateInput
                        error={error?.workplan_development_date}
                        name="workplan_development_date"
                        onChange={setFieldValue}
                        value={value?.workplan_development_date}
                    />
                </InputSection>
                <InputSection
                    title={strings.workPlanRevisionDateInputLabel}
                    twoColumn
                    withoutPadding
                >
                    <DateInput
                        name="workplan_revision_date"
                        onChange={setFieldValue}
                        value={value?.workplan_revision_date}
                        error={error?.workplan_revision_date}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.contactInformationInputLabel}
                className={styles.container}
                childrenContainerClassName={styles.sectionContent}
                withHeaderBorder
                withInternalPadding
                spacing="loose"
            >
                <InputSection
                    title={strings.nsFocalPointInputLabel}
                    description={strings.nsFocalPointInputDescription}
                    multiRow
                    twoColumn
                    withoutPadding
                >
                    <TextInput
                        label={strings.focalPointNameInputLabel}
                        name="ns_focal_point_name"
                        value={value?.ns_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ns_focal_point_name}
                    />
                    <TextInput
                        label={strings.focalPointEmailInputLabel}
                        name="ns_focal_point_email"
                        value={value?.ns_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ns_focal_point_email}
                    />
                    <TextInput
                        label={strings.focalPointPhoneNumberInputLabel}
                        name="ns_focal_point_phone"
                        value={value?.ns_focal_point_phone}
                        onChange={setFieldValue}
                        error={error?.ns_focal_point_phone}
                    />
                </InputSection>
                <InputSection
                    title={strings.nsSecondFocalPointInputLabel}
                    description={strings.nsSecondFocalPointInputDescription}
                    multiRow
                    twoColumn
                    withoutPadding
                >
                    <TextInput
                        label={strings.focalPointNameInputLabel}
                        name="ns_second_focal_point_name"
                        value={value?.ns_second_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ns_second_focal_point_name}
                    />
                    <TextInput
                        label={strings.focalPointEmailInputLabel}
                        name="ns_second_focal_point_email"
                        value={value?.ns_second_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ns_second_focal_point_email}
                    />
                    <TextInput
                        label={strings.focalPointPhoneNumberInputLabel}
                        name="ns_second_focal_point_phone"
                        value={value?.ns_second_focal_point_phone}
                        onChange={setFieldValue}
                        error={error?.ns_second_focal_point_phone}
                    />
                </InputSection>
                <InputSection
                    title={strings.partnerFocalPointInputLabel}
                    multiRow
                    twoColumn
                    withoutPadding
                >
                    <TextInput
                        label={strings.focalPointNameInputLabel}
                        name="partner_focal_point_name"
                        value={value?.partner_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_name}
                    />
                    <TextInput
                        label={strings.focalPointEmailInputLabel}
                        name="partner_focal_point_email"
                        value={value?.partner_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_email}
                    />
                    <TextInput
                        label={strings.focalPointPhoneNumberInputLabel}
                        name="partner_focal_point_phone"
                        value={value?.partner_focal_point_phone}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_phone}
                    />
                    <TextInput
                        label={strings.focalPointOrganizationInputLabel}
                        name="partner_focal_point_organization"
                        value={value?.partner_focal_point_organization}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_organization}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFacilitatorInputLabel}
                    multiRow
                    twoColumn
                    withoutPadding
                >
                    <TextInput
                        label={strings.focalPointNameInputLabel}
                        name="facilitator_name"
                        value={value?.facilitator_name}
                        onChange={setFieldValue}
                        error={error?.facilitator_name}
                    />
                    <TextInput
                        label={strings.focalPointEmailInputLabel}
                        name="facilitator_email"
                        value={value?.facilitator_email}
                        onChange={setFieldValue}
                        error={error?.facilitator_email}
                    />
                    <TextInput
                        label={strings.focalPointPhoneNumberInputLabel}
                        name="facilitator_phone"
                        value={value?.facilitator_phone}
                        onChange={setFieldValue}
                        error={error?.facilitator_phone}
                    />
                    <TextInput
                        label={strings.otherContactMethodInputLabel}
                        name="facilitator_contact"
                        value={value?.facilitator_contact}
                        onChange={setFieldValue}
                        error={error?.facilitator_contact}
                    />
                </InputSection>
            </Container>
            {actionDivRef.current && (
                <Portal
                    container={actionDivRef.current}
                >
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleFormSubmit}
                        disabled={savePerPending}
                    >
                        {strings.saveButtonLabel}
                    </Button>
                </Portal>
            )}
        </Container>
    );
}

Component.displayName = 'PerOverviewForm';
