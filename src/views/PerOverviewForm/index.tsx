import React, { useMemo, useCallback, useContext } from 'react';
import { useParams, useNavigate, generatePath } from 'react-router-dom';
import {
    useForm,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    PartialForm,
} from '@togglecorp/toggle-form';
import { isNotDefined, isDefined } from '@togglecorp/fujs';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import SelectInput from '#components/SelectInput';
import DateInput from '#components/DateInput';
import TextInput from '#components/TextInput';
import RadioInput from '#components/RadioInput';
import Button from '#components/Button';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';
import useAlertContext from '#hooks/useAlert';
import { ListResponse, useLazyRequest, useRequest } from '#utils/restRequest';
import { compareLabel } from '#utils/common';
import { Country } from '#types/country';
import RouteContext from '#contexts/route';

import {
    PerOverviewFormFields,
    PerOverviewResponseFields,
    booleanValueSelector,
    TypeOfAssessment,
    overviewSchema,
    numericValueSelector,
    stringValueSelector,
    stringLabelSelector,
} from './common';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();

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
        setFieldValue: onValueChange,
        error: riskyError,
        setError,
        validate,
    } = useForm(overviewSchema, { value: {} });

    const error = getErrorObject(riskyError);

    const {
        pending: fetchingPerOptions,
        response: assessmentResponse,
    } = useRequest<ListResponse<TypeOfAssessment>>({
        url: 'api/v2/per-assessmenttype/',
    });

    const {
        response: countriesResponse,
    } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
        query: {
            limit: 500,
        },
    });

    useRequest<PerOverviewResponseFields>({
        skip: isNotDefined(perId),
        url: `api/v2/new-per/${perId}`,
        onSuccess: (response) => {
            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                id,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                country_details,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                created_at,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                updated_at,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                user,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                user_details,
                ...formValues
            } = response;

            setValue(formValues);
        },
    });

    const {
        trigger: savePerOverview,
    } = useLazyRequest<PerOverviewResponseFields, Partial<PerOverviewFormFields>>({
        url: perId ? `api/v2/new-per/${perId}/` : 'api/v2/new-per/',
        method: perId ? 'PUT' : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isNotDefined(perId) && isDefined(response.id)) {
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

    const assessmentOptions = useMemo(
        () => (
            assessmentResponse?.results?.map((d) => ({
                value: d.id,
                label: d.name,
            })).sort(compareLabel) ?? []
        ),
        [assessmentResponse],
    );

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

    // FIXME: use FileInput
    const handleFileInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            event.preventDefault();
            const { files } = event.target;
            if (files && files.length > 0) {
                const file = files[0];
                onValueChange(file, 'orientation_document');
                // uploadFile(file);
            }
        },
        [onValueChange],
    );

    const handleSubmit = useCallback(
        (formValues: PartialForm<PerOverviewFormFields>) => {
            savePerOverview(formValues as PerOverviewFormFields);
        },
        [savePerOverview],
    );

    return (
        <form
            className={styles.overviewForm}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormNationalSociety}
                >
                    <SelectInput
                        name="country"
                        onChange={onValueChange}
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
                >
                    <DateInput
                        name="date_of_orientation"
                        onChange={onValueChange}
                        value={value?.date_of_orientation}
                        error={error?.date_of_orientation}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormUploadADoc}
                >
                    <input
                        className={styles.fileInput}
                        name="orientation_document"
                        accept=".docx, pdf"
                        type="file"
                        onChange={handleFileInputChange}
                        // value={value?.orientation_document}
                        // error={getErrorString(error?.orientation_document}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormAssessment}
                withHeaderBorder
                childrenContainerClassName={styles.sectionContent}
            >
                <InputSection
                    title={strings.perFormDateOfAssessment}
                    description={strings.perFormDateOfAssessmentDescription}
                >
                    <DateInput
                        name="date_of_assessment"
                        onChange={onValueChange}
                        value={value?.date_of_assessment}
                        error={error?.date_of_assessment}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormTypeOfAssessment}
                >
                    <SelectInput
                        name="type_of_assessment"
                        options={assessmentOptions}
                        keySelector={stringValueSelector}
                        labelSelector={stringLabelSelector}
                        onChange={onValueChange}
                        value={value?.type_of_assessment}
                        error={error?.type_of_assessment}
                        disabled={fetchingPerOptions}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormDateOfPreviousPerAssessment}
                >
                    <DateInput
                        name="date_of_previous_assessment"
                        onChange={onValueChange}
                        value={value?.date_of_previous_assessment}
                        error={error?.date_of_previous_assessment}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormTypeOfPreviousPerAssessment}
                >
                    <SelectInput
                        name="type_of_per_assessment"
                        options={assessmentOptions}
                        keySelector={stringValueSelector}
                        labelSelector={stringLabelSelector}
                        onChange={onValueChange}
                        value={value?.type_of_per_assessment}
                        error={getErrorString(error?.type_of_per_assessment)}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormBranchesInvolved}
                    description={strings.perFormbranchesInvolvedDescription}
                >
                    <TextInput
                        name="branches_involved"
                        value={value?.branches_involved}
                        onChange={onValueChange}
                        error={error?.branches_involved}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormWhatMethodHasThisAssessmentUsed}
                >
                    <TextInput
                        name="method_asmt_used"
                        value={value?.method_asmt_used}
                        onChange={onValueChange}
                        error={error?.method_asmt_used}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormEpiConsiderations}
                    description={strings.perFormEpiConsiderationsDescription}
                >
                    <RadioInput
                        name="is_epi"
                        options={yesNoOptions}
                        keySelector={booleanValueSelector}
                        labelSelector={stringLabelSelector}
                        value={value?.is_epi}
                        onChange={onValueChange}
                        error={error?.is_epi}
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
                        onChange={onValueChange}
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
                        onChange={onValueChange}
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
                >
                    <NumberInput
                        readOnly
                        name="assessment_number"
                        value={value?.assessment_number}
                        onChange={onValueChange}
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
                        onChange={onValueChange}
                        value={value?.workplan_development_date}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormWorkPlanRevisionDate}
                    twoColumn
                >
                    <DateInput
                        name="workplan_revision_date"
                        onChange={onValueChange}
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
                        label="Name"
                        name="ns_focal_point_name"
                        value={value?.ns_focal_point_name}
                        onChange={onValueChange}
                        error={error?.ns_focal_point_name}
                    />
                    <TextInput
                        label="Email"
                        name="ns_focal_point_email"
                        value={value?.ns_focal_point_email}
                        onChange={onValueChange}
                        error={error?.ns_focal_point_email}
                    />
                    <TextInput
                        label="Phone Number"
                        name="ns_focal_point_phone"
                        value={value?.ns_focal_point_phone}
                        onChange={onValueChange}
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
                        label="Name"
                        name="ns_second_focal_point_name"
                        value={value?.ns_second_focal_point_name}
                        onChange={onValueChange}
                        error={error?.ns_second_focal_point_name}
                    />
                    <TextInput
                        label="Email"
                        name="ns_second_focal_point_email"
                        value={value?.ns_second_focal_point_email}
                        onChange={onValueChange}
                        error={error?.ns_second_focal_point_email}
                    />
                    <TextInput
                        label="Phone Number"
                        name="ns_second_focal_point_phone"
                        value={value?.ns_second_focal_point_phone}
                        onChange={onValueChange}
                        error={error?.ns_second_focal_point_phone}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormPartnerFocalPoint}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label="Name"
                        name="partner_focal_point_name"
                        value={value?.partner_focal_point_name}
                        onChange={onValueChange}
                        error={error?.partner_focal_point_name}
                    />
                    <TextInput
                        label="Email"
                        name="partner_focal_point_email"
                        value={value?.partner_focal_point_email}
                        onChange={onValueChange}
                        error={error?.partner_focal_point_email}
                    />
                    <TextInput
                        label="Phone Number"
                        name="partner_focal_point_phone"
                        value={value?.partner_focal_point_phone}
                        onChange={onValueChange}
                        error={error?.partner_focal_point_phone}
                    />
                    <TextInput
                        label="Organization"
                        name="partner_focal_point_organization"
                        value={value?.partner_focal_point_organization}
                        onChange={onValueChange}
                        error={error?.partner_focal_point_organization}
                    />
                </InputSection>
                <InputSection
                    title={strings.perFormPERFacilitator}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        label="Name"
                        name="facilitator_name"
                        value={value?.facilitator_name}
                        onChange={onValueChange}
                        error={error?.facilitator_name}
                    />
                    <TextInput
                        label="Email"
                        name="facilitator_email"
                        value={value?.facilitator_email}
                        onChange={onValueChange}
                        error={error?.facilitator_email}
                    />
                    <TextInput
                        label="Phone Number"
                        name="facilitator_phone"
                        value={value?.facilitator_phone}
                        onChange={onValueChange}
                        error={error?.facilitator_phone}
                    />
                    <TextInput
                        label="Other contact method"
                        name="facilitator_contact"
                        value={value?.facilitator_contact}
                        onChange={onValueChange}
                        error={error?.facilitator_contact}
                    />
                </InputSection>
                <div className={styles.actions}>
                    <Button
                        name={undefined}
                        variant="secondary"
                        type="submit"
                    >
                        {strings.perOverviewSetUpPerProcess}
                    </Button>
                </div>
            </Container>
        </form>
    );
}

Component.displayName = 'PerOverviewForm';
