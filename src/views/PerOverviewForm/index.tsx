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
import RadioInput from '#components/RadioInput';
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
import { STEP_OVERVIEW, STEP_ASSESSMENT } from '#utils/per';
import type { PerProcessOutletContext } from '#utils/outletContext';
import {
    booleanValueSelector,
    stringLabelSelector,
    numericIdSelector,
    stringValueSelector,
    stringNameSelector,
} from '#utils/selectors';

import {
    overviewSchema,
    PartialOverviewFormFields,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
type GlobalEnumsResponse = GetGlobalEnums['responses']['200']['content']['application/json'];
type PerOverviewAssessmentMethods = NonNullable<GlobalEnumsResponse['per_overviewassessmentmethods']>[number];

type LatestPerOverviewResponse = paths['/api/v2/latest-per-overview/']['get']['responses']['200']['content']['application/json'];

type PerOptionsResponse = paths['/api/v2/per-options/']['get']['responses']['200']['content']['application/json'];

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];
type CountryListItem = NonNullable<CountryResponse['results']>[number];

function nsLabelSelector(option: CountryListItem) {
    return option.society_name ?? '';
}
function perAssessmentMethodsKeySelector(option: PerOverviewAssessmentMethods) {
    return option.key;
}

type PerOverviewResponse = paths['/api/v2/per-overview/{id}/']['get']['responses']['200']['content']['application/json'];
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
    } = useRequest<CountryResponse>({
        url: '/api/v2/country/',
        query: {
            limit: 500,
        },
    });

    const {
        response: perOptionsResponse,
    } = useRequest<PerOptionsResponse>({
        url: '/api/v2/per-options/',
    });

    useRequest<PerOverviewResponse>({
        skip: isNotDefined(perId),
        url: '/api/v2/per-overview/{id}/',
        pathVariables: {
            id: perId,
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

    useRequest<LatestPerOverviewResponse>({
        url: '/api/v2/latest-per-overview/',
        skip: isNotDefined(value?.country) || isDefined(value?.is_draft),
        query: {
            country_id: value?.country,
        },
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
        trigger: savePerOverview,
        pending: savePerPending,
    } = useLazyRequest<
        PerOverviewResponse,
        PartialOverviewFormFields
    >({
        url: perId ? `api/v2/per-overview/${perId}/` : 'api/v2/per-overview/',
        method: perId ? 'PUT' : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isDefined(response.id)) {
                alert.show(
                    strings.perFormSaveRequestSuccessMessage,
                    { variant: 'success' },
                );

                refetchStatusResponse();

                // Redirect from new form to edit route
                if (isNotDefined(perId) && response.phase === STEP_OVERVIEW) {
                    navigate(
                        generatePath(
                            perOverviewFormRoute.absolutePath,
                            { perId: String(response.id) },
                        ),
                    );
                }

                // Redirect to assessment form
                if (response.phase === STEP_ASSESSMENT) {
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
                strings.perFormSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const yesNoOptions = useMemo(
        () => [
            { value: true, label: strings.yesLabel },
            { value: false, label: strings.noLabel },
        ],
        [strings],
    );

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
            savePerOverview({
                ...formValues,
                is_draft: formValues.is_draft ?? true,
            });
        },
        [savePerOverview],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialOverviewFormFields) => {
            savePerOverview({
                ...formValues,
                is_draft: false,
            });
        },
        [savePerOverview],
    );

    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);
    const error = getErrorObject(formError);

    return (
        <div className={styles.overviewForm}>
            <NonFieldError error={formError} />
            <Container
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormNationalSociety}
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
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormOrientation}
                withHeaderBorder
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormDateOfOrientation}
                    description={strings.perFormDateOfOrientationDescription}
                    twoColumn
                >
                    <DateInput
                        name="date_of_orientation"
                        onChange={setFieldValue}
                        value={value?.date_of_orientation}
                        error={error?.date_of_orientation}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormUploadADoc}
                >
                    <GoMultiFileInput
                        name="orientation_documents"
                        accept=".docx, .pdf"
                        url="api/v2/per-file/multiple/"
                        value={value?.orientation_documents}
                        onChange={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={getErrorString(error?.orientation_documents)}
                        readOnly={value?.is_draft === false}
                    >
                        {strings.perFormUploadButtonLabel}
                    </GoMultiFileInput>
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormAssessment}
                withHeaderBorder
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    twoColumn
                    title={strings.perFormDateOfAssessment}
                    description={strings.perFormDateOfAssessmentDescription}
                >
                    <DateInput
                        name="date_of_assessment"
                        onChange={setFieldValue}
                        value={value?.date_of_assessment}
                        error={error?.date_of_assessment}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    twoColumn
                    title={strings.perFormTypeOfAssessment}
                >
                    <SelectInput
                        name="type_of_assessment"
                        options={perOptionsResponse?.overviewassessmenttypes}
                        keySelector={numericIdSelector}
                        labelSelector={stringNameSelector}
                        onChange={setFieldValue}
                        value={value?.type_of_assessment}
                        error={error?.type_of_assessment}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormDateOfPreviousPerAssessment}
                    twoColumn
                >
                    <DateInput
                        name="date_of_previous_assessment"
                        onChange={setFieldValue}
                        value={value?.date_of_previous_assessment}
                        readOnly
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormTypeOfPreviousPerAssessment}
                    twoColumn
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
                    title={strings.perFormBranchesInvolved}
                    description={strings.perFormbranchesInvolvedDescription}
                >
                    <TextInput
                        name="branches_involved"
                        value={value?.branches_involved}
                        onChange={setFieldValue}
                        error={error?.branches_involved}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormWhatMethodHasThisAssessmentUsed}
                    twoColumn
                >
                    <SelectInput
                        name="assessment_method"
                        options={per_overviewassessmentmethods}
                        value={value?.assessment_method}
                        keySelector={perAssessmentMethodsKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setFieldValue}
                        error={error?.assessment_method}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormEpiConsiderations}
                    description={strings.perFormEpiConsiderationsDescription}
                >
                    <RadioInput
                        name="assess_preparedness_of_country"
                        options={yesNoOptions}
                        keySelector={booleanValueSelector}
                        labelSelector={stringLabelSelector}
                        value={value?.assess_preparedness_of_country}
                        onChange={setFieldValue}
                        error={error?.assess_preparedness_of_country}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormUrbanConsiderations}
                    description={strings.perFormUrbanConsiderationsDescription}
                >
                    <RadioInput
                        name="assess_urban_aspect_of_country"
                        options={yesNoOptions}
                        keySelector={booleanValueSelector}
                        labelSelector={stringLabelSelector}
                        value={value.assess_urban_aspect_of_country}
                        onChange={setFieldValue}
                        error={error?.assess_urban_aspect_of_country}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormClimateAndEnvironmentalConsiderations}
                    description={strings.perFormClimateAndEnvironmentalConsiderationsDescription}
                >
                    <RadioInput
                        name="assess_climate_environment_of_country"
                        options={yesNoOptions}
                        keySelector={booleanValueSelector}
                        labelSelector={stringLabelSelector}
                        value={value?.assess_climate_environment_of_country}
                        onChange={setFieldValue}
                        error={error?.assess_climate_environment_of_country}
                        readOnly={value?.is_draft === false}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormProcessCycleHeading}
                withHeaderBorder
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormPerProcessCycleNumber}
                    description={strings.perFormAssessmentNumberDescription}
                    twoColumn
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
                heading={strings.perFormWorkPlanReviewsPlanned}
                withHeaderBorder
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormWorkPlanDevelopmentDate}
                    twoColumn
                >
                    <DateInput
                        error={error?.workplan_development_date}
                        name="workplan_development_date"
                        onChange={setFieldValue}
                        value={value?.workplan_development_date}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormWorkPlanRevisionDate}
                    twoColumn
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
                heading={strings.perFormContactInformation}
                withHeaderBorder
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormNsFocalPoint}
                    description={strings.perFormNSFocalPointDescription}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label={strings.perFormFocalPointNameLabel}
                        name="ns_focal_point_name"
                        value={value?.ns_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ns_focal_point_name}
                    />
                    <TextInput
                        label={strings.perFormFocalPointEmailLabel}
                        name="ns_focal_point_email"
                        value={value?.ns_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ns_focal_point_email}
                    />
                    <TextInput
                        label={strings.perFormFocalPointPhoneNumberLabel}
                        name="ns_focal_point_phone"
                        value={value?.ns_focal_point_phone}
                        onChange={setFieldValue}
                        error={error?.ns_focal_point_phone}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormNSSecondFocalPoint}
                    description={strings.perFormNSSecondFocalPointDescription}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label={strings.perFormFocalPointNameLabel}
                        name="ns_second_focal_point_name"
                        value={value?.ns_second_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.ns_second_focal_point_name}
                    />
                    <TextInput
                        label={strings.perFormFocalPointEmailLabel}
                        name="ns_second_focal_point_email"
                        value={value?.ns_second_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.ns_second_focal_point_email}
                    />
                    <TextInput
                        label={strings.perFormFocalPointPhoneNumberLabel}
                        name="ns_second_focal_point_phone"
                        value={value?.ns_second_focal_point_phone}
                        onChange={setFieldValue}
                        error={error?.ns_second_focal_point_phone}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormPartnerFocalPoint}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label={strings.perFormFocalPointNameLabel}
                        name="partner_focal_point_name"
                        value={value?.partner_focal_point_name}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_name}
                    />
                    <TextInput
                        label={strings.perFormFocalPointEmailLabel}
                        name="partner_focal_point_email"
                        value={value?.partner_focal_point_email}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_email}
                    />
                    <TextInput
                        label={strings.perFormFocalPointPhoneNumberLabel}
                        name="partner_focal_point_phone"
                        value={value?.partner_focal_point_phone}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_phone}
                    />
                    <TextInput
                        label={strings.perFormFocalPointOrganizationLabel}
                        name="partner_focal_point_organization"
                        value={value?.partner_focal_point_organization}
                        onChange={setFieldValue}
                        error={error?.partner_focal_point_organization}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormPERFacilitator}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label={strings.perFormFocalPointNameLabel}
                        name="facilitator_name"
                        value={value?.facilitator_name}
                        onChange={setFieldValue}
                        error={error?.facilitator_name}
                    />
                    <TextInput
                        label={strings.perFormFocalPointEmailLabel}
                        name="facilitator_email"
                        value={value?.facilitator_email}
                        onChange={setFieldValue}
                        error={error?.facilitator_email}
                    />
                    <TextInput
                        label={strings.perFormFocalPointPhoneNumberLabel}
                        name="facilitator_phone"
                        value={value?.facilitator_phone}
                        onChange={setFieldValue}
                        error={error?.facilitator_phone}
                    />
                    <TextInput
                        label={strings.perFormOtherContactMethodLabel}
                        name="facilitator_contact"
                        value={value?.facilitator_contact}
                        onChange={setFieldValue}
                        error={error?.facilitator_contact}
                    />
                </InputSection>
            </Container>
            <div className={styles.actions}>
                <ConfirmButton
                    name={undefined}
                    confirmHeading={strings.perOverviewConfirmHeading}
                    confirmMessage={strings.perOverviewConfirmMessage}
                    onConfirm={handleFormFinalSubmit}
                    disabled={(isDefined(statusResponse?.phase)
                        && statusResponse?.phase !== STEP_OVERVIEW)
                        || savePerPending}
                >
                    {strings.perOverviewSetUpPerProcess}
                </ConfirmButton>
            </div>
            {actionDivRef.current && (
                <Portal
                    container={actionDivRef.current}
                >
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleFormSubmit}
                        disabled={(isDefined(statusResponse?.phase)
                            && statusResponse?.phase !== STEP_OVERVIEW)
                                || savePerPending}
                    >
                        {strings.perFormSaveLabel}
                    </Button>
                </Portal>
            )}
        </div>
    );
}

Component.displayName = 'PerOverviewForm';
