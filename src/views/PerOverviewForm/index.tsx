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
import { isNotDefined, isDefined } from '@togglecorp/fujs';

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
import useTranslation from '#hooks/useTranslation';
import useAlertContext from '#hooks/useAlert';
import { useLazyRequest, useRequest } from '#utils/restRequest';
import { compareLabel } from '#utils/common';
import RouteContext from '#contexts/route';
import type { GET } from '#types/serverResponse';
import { PerProcessOutletContext } from '#utils/per';
import {
    booleanValueSelector,
    numericValueSelector,
    stringLabelSelector,
    stringNameSelector,
    numericIdSelector,
    stringKeySelector,
    stringValueSelector,
} from '#utils/selectors';

import {
    overviewSchema,
    PartialOverviewFormFields,
} from './common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerOverviewResponse = GET['api/v2/per-overview/:id'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const {
        statusResponse,
        actionDivRef,
        refetchStatusResponse,
    } = useOutletContext<PerProcessOutletContext>();

    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const strings = useTranslation(i18n);
    const alert = useAlertContext();
    const navigate = useNavigate();
    const {
        perAssessmentForm: perAssessmentFormRoute,
    } = useContext(RouteContext);

    const yesNoOptions = useMemo(
        () => [
            { value: true, label: strings.yesLabel },
            { value: false, label: strings.noLabel },
        ],
        [strings],
    );

    const {
        value,
        setValue,
        setFieldValue,
        error: formError,
        setError,
        validate,
    } = useForm(overviewSchema, { value: {} });

    const error = getErrorObject(formError);

    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options/',
    });

    const {
        response: countriesResponse,
    } = useRequest<GET['api/v2/country']>({
        url: 'api/v2/country/',
        query: {
            limit: 500,
        },
    });

    useRequest<PerOverviewResponse>({
        skip: isNotDefined(perId),
        url: `api/v2/per-overview/${perId}`,
        onSuccess: (response) => {
            const {
                // orientation_document_details,
                ...formValues
            } = response;

            setFileIdToUrlMap(
                (prevValue) => ({
                    ...prevValue,
                    // FIXME: add document details
                    // [orientation_document_details.id]: orientation_document_details.file,
                }),
            );
            setValue(formValues);
        },
    });

    const {
        trigger: savePerOverview,
        pending: savePerPending,
    } = useLazyRequest<PerOverviewResponse, PartialOverviewFormFields>({
        url: perId ? `api/v2/per-overview/${perId}/` : 'api/v2/per-overview/',
        method: perId ? 'PUT' : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isDefined(response.id)) {
                refetchStatusResponse();
                navigate(
                    generatePath(
                        perAssessmentFormRoute.absolutePath,
                        { perId: String(response.id) },
                    ),
                );
            }

            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                // formErrors,
            },
            debugMessage,
        }) => {
            alert.show(
                <p>
                    {strings.perFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const countryOptions = useMemo(
        () => (
            countriesResponse?.results
                .filter((country) => !!country.independent && !!country.iso)
                .map((country) => ({
                    value: country.id,
                    label: country.name,
                })).sort(compareLabel) ?? []
        ),
        [countriesResponse],
    );

    const handleSubmit = useCallback(
        (formValues: PartialOverviewFormFields) => {
            savePerOverview({
                is_draft: true,
                ...formValues,
            });
        },
        [savePerOverview],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialOverviewFormFields) => {
            savePerOverview({
                is_draft: false,
                ...formValues,
            });
        },
        [savePerOverview],
    );

    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);

    return (
        <form className={styles.overviewForm}>
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
                        options={countryOptions}
                        keySelector={numericValueSelector}
                        labelSelector={stringLabelSelector}
                        value={value?.country}
                        error={getErrorString(error?.country)}
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
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormUploadADoc}
                >
                    <GoMultiFileInput
                        name="orientation_documents_file"
                        accept=".docx, .pdf"
                        onChange={setFieldValue}
                        url="api/v2/per-file/"
                        value={value?.orientation_documents_file}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        disabled
                    >
                        Upload
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
                        disabled={perOptionsPending}
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
                        error={error?.date_of_previous_assessment}
                    />
                </InputSection>
                {/* FIXME: Implement this field (probably auto filled)
                <InputSection
                    title={strings.perFormTypeOfPreviousPerAssessment}
                    twoColumn
                >
                    <SelectInput
                        name="type_of_previous_assessment"
                        options={perOptionsResponse?.overviewassessmenttypes}
                        keySelector={(assessmentType) => assessmentType.id}
                        labelSelector={(assessmentType) => assessmentType.name}
                        onChange={setFieldValue}
                        value={value?.type_of_previous_assessment}
                        error={getErrorString(error?.type_of_previous_assessment)}
                    />
                </InputSection>
                */}
                <InputSection
                    title={strings.perFormBranchesInvolved}
                    description={strings.perFormbranchesInvolvedDescription}
                >
                    <TextInput
                        name="branches_involved"
                        value={value?.branches_involved}
                        onChange={setFieldValue}
                        error={error?.branches_involved}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormWhatMethodHasThisAssessmentUsed}
                    twoColumn
                >
                    <SelectInput
                        name="method_asmt_used"
                        value={value?.method_asmt_used}
                        options={perOptionsResponse?.overviewassessmentmethods}
                        keySelector={stringKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setFieldValue}
                        error={error?.method_asmt_used}
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
                    disabled={isDefined(statusResponse?.phase) || savePerPending}
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
                        disabled={savePerPending}
                    >
                        {strings.perFormSaveLabel}
                    </Button>
                </Portal>
            )}
        </form>
    );
}

Component.displayName = 'PerOverviewForm';
