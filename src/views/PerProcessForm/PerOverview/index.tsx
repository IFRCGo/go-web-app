import React, { useCallback } from 'react';
import {
    getErrorObject,
    PartialForm,
    Error,
    useForm,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';

import useTranslation from '#hooks/useTranslation';
import i18n from './i18n.json';

import { ListResponse, useLazyRequest, useRequest } from '#utils/restRequest';
import { compareLabel } from '#utils/common';

import useAlertContext from '#hooks/useAlert';
import { Country, NumericValueOption } from '#types';
import usePerProcessOptions, { overviewSchema } from '../usePerProcessOptions';

import {
    PerOverviewFields,
    booleanOptionKeySelector,
    optionLabelSelector,
    emptyNumericOptionList,
    TypeOfAssessment,
} from '../common';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import SelectInput from '#components/SelectInput';
import DateInput from '#components/DateInput';
import TextInput from '#components/TextInput';
import RadioInput from '#components/RadioInput';
import Button from '#components/Button';
import NumberInput from '#components/NumberInput';

import styles from './styles.module.css';
import scrollToTop from '#utils/scrollToTop';

type Value = PartialForm<PerOverviewFields>;

type StepTypes = 'overview' | 'assessment';

interface Props {
    className?: string;
    error?: Error<Value> | undefined;
    onValueSet: (value: SetBaseValueArg<Value>) => void;
    nationalSocietyOptions?: NumericValueOption[];
    fetchingNationalSociety?: boolean;
    perId?: string;
}
// eslint-disable-next-line import/prefer-default-export
function PerOverview(props: Props) {
    const strings = useTranslation(i18n);

    const {
        onValueSet,
        error: formError,
        perId,
    } = props;

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const {
        value,
        setFieldValue: onValueChange,
    } = useForm(overviewSchema, { value: {} as PartialForm<PerOverviewFields> });

    const alert = useAlertContext();

    const [currentStep, setCurrentStep] = React.useState<StepTypes>('overview');

    const {
        yesNoOptions,
    } = usePerProcessOptions();

    const {
        pending: fetchingPerOptions,
        response: assessmentResponse,
    } = useRequest<ListResponse<TypeOfAssessment>>({
        url: `api/v2/per-assessmenttype/`,
    });

    const assessmentOptions = React.useMemo(() => (
        assessmentResponse?.results?.map(d => ({
            value: d.id,
            label: d.name,
        })).sort(compareLabel) ?? emptyNumericOptionList
    ), [assessmentResponse]);

    const {
        response: countriesResponse,
    } = useRequest<ListResponse<Country>>({
        url: 'api/v2/country/',
    });

    const [
        nationalSocietyOptions,
    ] = React.useMemo(() => {
        if (!countriesResponse) {
            return [emptyNumericOptionList, emptyNumericOptionList];
        }

        const ns: NumericValueOption[] = countriesResponse.results
            .filter(d => d.independent && d.society_name)
            .map(d => ({
                value: d.id,
                label: d.society_name,
            })).sort(compareLabel);

        const c: NumericValueOption[] = countriesResponse.results
            .filter(d => d.independent && d.iso)
            .map(d => ({
                value: d.id,
                label: d.name,
            })).sort(compareLabel);

        return [ns, c] as const;
    }, [countriesResponse]);

    const {
        pending: perSubmitPending,
        trigger: submitRequest,
    } = useLazyRequest<PerOverviewFields, Partial<PerOverviewFields>>({
        url: perId ? `api/v2/new-per/${perId}/` : 'api/v2/new-per/',
        method: perId ? 'PUT' : 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
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

    const handleSubmit = React.useCallback((finalValues) => {
        console.warn('finalValues', finalValues);
        onValueSet(finalValues);
        submitRequest(finalValues);
    }, [onValueSet, submitRequest]);

    const handleFileInputChange = React.useCallback((event) => {
        event.preventDefault();
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            onValueChange(file, 'orientation_document');
            // uploadFile(file);
        }
    }, [onValueChange]);

    const handleTabChange = useCallback((newStep: string) => {
        scrollToTop();
        // setCurrentStep(Number(newStep));
    }, []);

    const handleSubmitButtonClick = React.useCallback(() => {
        scrollToTop();
        if (currentStep === 'overview') {
            const nextStepMap: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                [key in Exclude<StepTypes, 'assessment'>]: Exclude<StepTypes, 'overview'>;
            } = {
                overview: 'assessment',
            };
            submitRequest(value as PerOverviewFields);
            handleTabChange(nextStepMap[currentStep]);
        }
    }, [
        value,
        currentStep,
        handleTabChange,
        submitRequest,
    ]);

    return (
        // <form
        //   onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        // >
        <>
            <Container
                className={styles.sharing}
                visibleOverflow
            >
                {strings.perFormSetUpPerProcess}
                <InputSection
                    title={strings.perFormNationalSociety}
                >
                    <SelectInput
                        name="national_society"
                        onChange={onValueChange}
                        options={nationalSocietyOptions}
                        keySelector={(d) => d.value}
                        labelSelector={(d) => d.label}
                        value={value?.national_society}
                        error={error?.national_society}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormOrientation}
                className={styles.sharing}
                visibleOverflow
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
                        accept='.docx, pdf'
                        type="file"
                        onChange={handleFileInputChange}
                        value={value?.orientation_document}
                        error={error?.orientation_document}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormAssessment}
                className={styles.sharing}
                visibleOverflow
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
                        name={"type_of_assessment" as const}
                        options={assessmentOptions}
                        keySelector={(d) => d.value}
                        labelSelector={(d) => d.label}
                        pending={fetchingPerOptions}
                        onChange={onValueChange}
                        value={value?.type_of_assessment}
                        error={error?.type_of_assessment}
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
                        name={"type_of_per_assessment" as const}
                        options={assessmentOptions}
                        keySelector={(d) => d.value}
                        labelSelector={(d) => d.label}
                        onChange={onValueChange}
                        value={value?.type_of_per_assessment}
                        error={error?.type_of_per_assessment}
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
                        name={"is_epi" as const}
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
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
                        name={"assess_urban_aspect_of_country" as const}
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
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
                        name={"assess_climate_environment_of_country" as const}
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={value?.assess_climate_environment_of_country}
                        onChange={onValueChange}
                        error={error?.assess_climate_environment_of_country}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormProcessCycleHeading}
                visibleOverflow
            >
                <InputSection
                    title={strings.perFormPerProcessCycleNumber}
                    description={strings.perFormAssessmentNumberDescription}
                >
                    <NumberInput
                        name="assessment_number"
                        value={value?.assessment_number}
                        onChange={onValueChange}
                        error={error?.assessment_number}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormWorkPlanReviewsPlanned}
                className={styles.sharing}
                visibleOverflow
            >
                <InputSection
                    title={strings.perFormWorkPlanDevelopmentDate}
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
                className={styles.sharing}
                visibleOverflow
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
                        onClick={handleSubmitButtonClick}
                    >
                        {strings.perOverviewSetUpPerProcess}
                    </Button>
                </div>
            </Container>
        </>
        // </form>
    );
}

export default PerOverview;
