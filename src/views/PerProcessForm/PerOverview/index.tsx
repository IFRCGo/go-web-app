import React, { useMemo, useCallback } from 'react';
import {
    useForm,
    // PartialForm,
    // getErrorObject,
    // Error,
    // SetBaseValueArg,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

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
import scrollToTop from '#utils/scrollToTop';
import { Country } from '#types/country';
import {
    NumericValueOption,
    StringValueOption,
} from '#types/common';

import { overviewSchema } from '../usePerProcessOptions';
import {
    PerOverviewFields,
    booleanOptionKeySelector,
    optionLabelSelector,
    emptyNumericOptionList,
    emptyStringOptionList,
    TypeOfAssessment,
} from '../common';
import i18n from './i18n.json';

import styles from './styles.module.css';

function numericValueOptionKeySelector<T extends NumericValueOption>(option: T) {
    return option.value;
}
function numericValueOptionLabelSelector<T extends NumericValueOption>(option: T) {
    return option.label;
}

function stringValueOptionKeySelector<T extends StringValueOption>(option: T) {
    return option.value;
}
function stringValueOptionLabelSelector<T extends StringValueOption>(option: T) {
    return option.label;
}

interface Props {
    perId?: string;
}
// eslint-disable-next-line import/prefer-default-export
function PerOverview(props: Props) {
    const {
        perId,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlertContext();

    const yesNoOptions = useMemo(
        () => [
            { value: true, label: strings.yesLabel },
            { value: false, label: strings.noLabel },
        ],
        [strings],
    );

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
    });

    const {
        trigger: savePerOverview,
    } = useLazyRequest<PerOverviewFields, Partial<PerOverviewFields>>({
        url: perId ? `api/v2/new-per/${perId}/` : 'api/v2/new-per/',
        method: perId ? 'PUT' : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
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

    const {
        value,
        setFieldValue: onValueChange,
        error: riskyError,
        setError,
        validate,
    } = useForm(overviewSchema, { value: {} });

    const error = getErrorObject(riskyError);

    const assessmentOptions = useMemo(
        () => (
            assessmentResponse?.results?.map((d) => ({
                value: d.id,
                label: d.name,
            })).sort(compareLabel) ?? emptyStringOptionList
        ),
        [assessmentResponse],
    );

    const nationalSocietyOptions = useMemo(
        () => {
            if (!countriesResponse) {
                return emptyNumericOptionList;
            }

            const ns: NumericValueOption[] = countriesResponse.results
                .filter((d) => d.independent && d.society_name)
                .map((d) => ({
                    value: d.id,
                    label: d.society_name,
                })).sort(compareLabel);

            return ns;
        },
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
        () => {
            savePerOverview(value as PerOverviewFields);
            scrollToTop();
        },
        [
            value,
            savePerOverview,
        ],
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.sharing}
            >
                {strings.perOverviewSetUpPerProcess}
                <InputSection
                    title={strings.perFormNationalSociety}
                >
                    <SelectInput
                        name="national_society"
                        onChange={onValueChange}
                        options={nationalSocietyOptions}
                        keySelector={numericValueOptionKeySelector}
                        labelSelector={numericValueOptionLabelSelector}
                        value={value?.national_society}
                        error={getErrorString(error?.national_society)}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormOrientation}
                className={styles.sharing}
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
                        value={value?.orientation_document}
                        // error={getErrorString(error?.orientation_document}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.perFormAssessment}
                className={styles.sharing}
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
                        keySelector={stringValueOptionKeySelector}
                        labelSelector={stringValueOptionLabelSelector}
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
                        keySelector={stringValueOptionKeySelector}
                        labelSelector={stringValueOptionLabelSelector}
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
                        name="assess_urban_aspect_of_country"
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
                        name="assess_climate_environment_of_country"
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

export default PerOverview;
