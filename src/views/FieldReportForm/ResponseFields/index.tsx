import React from 'react';
import {
    PartialForm,
    Error,
    EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Header from '#components/Header';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';
import RadioInput from '#components/RadioInput';
import LanguageContext from '#root/languageContext';
import useReduxState from '#hooks/useReduxState';
import { useCallback } from 'react';

import {
    FormType,
    optionLabelSelector,
    ReportType,
    NumericValueOption,
    numericOptionKeySelector,
    VISIBILITY_IFRC_SECRETARIAT,
    VISIBILITY_PUBLIC,
    VISIBILITY_RCRC_MOVEMENT,
    VISIBILITY_IFRC_NS
} from '../common';

import styles from './styles.module.scss';

type Value = PartialForm<FormType>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    reportType: ReportType;
    isReviewCountry?: boolean;
}

function ResponseFields(props: Props) {
    const { strings } = React.useContext(LanguageContext);
    const {
        error: formError,
        onValueChange,
        value,
        reportType,
        isReviewCountry,
    } = props;

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError]
    );

    const user = useReduxState('me');

    const [
        drefOptions,
        appealOptions,
        responseOptions,
    ] = React.useMemo(() => [
        // FIXME: use translations
        [
            { label: 'Planned', value: 2 },
            { label: 'Requested', value: 1 },
            { label: 'Allocated', value: 3 },
        ] as NumericValueOption[],
        [
            { label: 'Planned', value: 2 },
            { label: 'Requested', value: 1 },
            { label: 'Launched', value: 3 },
        ] as NumericValueOption[],
        [
            { label: 'Planned', value: 2 },
            { label: 'Requested', value: 1 },
            { label: 'Deployed', value: 3 },
        ] as NumericValueOption[],
    ], []);

    const visibilityOptions = useCallback(() => {
        let r = [] as NumericValueOption[];

        if(user?.data.profile.org_type==='OTHR') {
            r = [
                { label: strings.fieldReportConstantVisibilityPublicLabel, value: VISIBILITY_PUBLIC },
                { label: strings.fieldReportConstantVisibilityRCRCMovementLabel, value: VISIBILITY_RCRC_MOVEMENT },
            ];
        } else if(user?.data.profile.org_type==='NTLS') {
            r =  [
                { label: strings.fieldReportConstantVisibilityPublicLabel, value: VISIBILITY_PUBLIC },
                { label: strings.fieldReportConstantVisibilityRCRCMovementLabel, value: VISIBILITY_RCRC_MOVEMENT },
                { label: strings.fieldReportConstantVisibilityIFRCandNSLabel, value: VISIBILITY_IFRC_NS },
            ];
        } else {
            r =  [
                { label: strings.fieldReportConstantVisibilityPublicLabel, value: VISIBILITY_PUBLIC },
                { label: strings.fieldReportConstantVisibilityRCRCMovementLabel, value: VISIBILITY_RCRC_MOVEMENT },
                { label: strings.fieldReportConstantVisibilityIFRCSecretariatLabel, value: VISIBILITY_IFRC_SECRETARIAT },
                { label: strings.fieldReportConstantVisibilityIFRCandNSLabel, value: VISIBILITY_IFRC_NS },
            ];
        }

        if (isReviewCountry) {
            r = [ { label: strings.fieldReportConstantVisibilityIFRCandNSLabel, value: VISIBILITY_IFRC_NS } ];
        }

        return  r;
    }, [strings, user.data.profile.org_type, isReviewCountry]);

    return (
        <>
            <Container
                heading={strings.fieldReportFormResponseTitle}
                description={(
                    <Header
                        heading={strings.fieldReportFormResponseLabel}
                        description={strings.fieldReportFormResponseDescription}
                        headingSize="extraSmall"
                    />
                )}
            >
                { reportType !== 'COVID' && (
                    <>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsDREFEVTEPILabel}
                        >
                            <RadioInput
                                error={error?.dref}
                                name={"dref" as const}
                                onChange={onValueChange}
                                options={drefOptions}
                                keySelector={numericOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.dref}
                                clearable
                            />
                            <NumberInput
                                label={strings.fieldsStep4PlannedResponseRowsDREFValueFieldLabel}
                                name="dref_amount"
                                value={value.dref_amount}
                                onChange={onValueChange}
                                error={error?.dref_amount}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsEmergencyAppealEVTEPIEWLabel}
                        >
                            <RadioInput
                                error={error?.appeal}
                                name={"appeal" as const}
                                onChange={onValueChange}
                                options={appealOptions}
                                keySelector={numericOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.appeal}
                                clearable
                            />
                            <NumberInput
                                label={strings.fieldsStep4PlannedResponseRowsEmergencyAppealValueFieldLabel}
                                name="appeal_amount"
                                value={value.appeal_amount}
                                onChange={onValueChange}
                                error={error?.appeal_amount}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsFactEVTEPIEWLabel}
                        >
                            <RadioInput
                                error={error?.fact}
                                name={"fact" as const}
                                onChange={onValueChange}
                                options={responseOptions}
                                keySelector={numericOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.fact}
                                clearable
                            />
                            <NumberInput
                                label={strings.fieldsStep4PlannedResponseRowsFactValueFieldLabel}
                                name="num_fact"
                                value={value.num_fact}
                                onChange={onValueChange}
                                error={error?.num_fact}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsIFRCStaffEVTEPIEWLabel}
                        >
                            <RadioInput
                                error={error?.ifrc_staff}
                                name={"ifrc_staff" as const}
                                onChange={onValueChange}
                                options={responseOptions}
                                keySelector={numericOptionKeySelector}
                                labelSelector={optionLabelSelector}
                                value={value.ifrc_staff}
                                clearable
                            />
                            <NumberInput
                                label={strings.fieldsStep4PlannedResponseRowsIFRCStaffValueFieldLabel}
                                name="num_ifrc_staff"
                                value={value.num_ifrc_staff}
                                onChange={onValueChange}
                                error={error?.num_ifrc_staff}
                            />
                        </InputSection>
                    </>
                )}
                {reportType === 'EW' && (
                    <InputSection
                        title={strings.fieldsStep4PlannedResponseRowsForecastBasedActionEWLabel}
                    >
                        <RadioInput
                            error={error?.forecast_based_action}
                            name={"forecast_based_action" as const}
                            onChange={onValueChange}
                            options={responseOptions}
                            keySelector={numericOptionKeySelector}
                            labelSelector={optionLabelSelector}
                            value={value.forecast_based_action}
                            clearable
                        />
                        <NumberInput
                            label={strings.fieldsStep4PlannedResponseRowsForecastBasedActionValueFieldLabel}
                            name="forecast_based_action_amount"
                            value={value.forecast_based_action_amount}
                            onChange={onValueChange}
                            error={error?.forecast_based_action_amount}
                        />
                    </InputSection>
                )}
            </Container>
            <Container
                heading={strings.fieldReportFormContactsTitle}
                className={styles.contactsSection}
            >
                <InputSection
                    title={strings.fieldsStep4ContactRowsOriginatorLabel}
                    description={strings.fieldsStep4ContactRowsOriginatorEVTEPIEWDesc}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        name="contact_originator_name"
                        value={value.contact_originator_name}
                        onChange={onValueChange}
                        error={error?.contact_originator_name}
                        label={strings.cmpContactName}
                    />
                    <TextInput
                        name="contact_originator_title"
                        value={value.contact_originator_title}
                        onChange={onValueChange}
                        error={error?.contact_originator_title}
                        label={strings.cmpContactTitle}
                    />
                    <TextInput
                        name="contact_originator_email"
                        value={value.contact_originator_email}
                        onChange={onValueChange}
                        error={error?.contact_originator_email}
                        label={strings.cmpContactEmail}
                    />
                    <TextInput
                        name="contact_originator_phone"
                        value={value.contact_originator_phone}
                        onChange={onValueChange}
                        error={error?.contact_originator_phone}
                        label={strings.cmpContactPhone}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep4ContactRowsNSContactLabel}
                    description={strings.fieldsStep4ContactRowsNSContactEVTEPIDesc}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        name="contact_nat_soc_name"
                        value={value.contact_nat_soc_name}
                        onChange={onValueChange}
                        error={error?.contact_nat_soc_name}
                        label={strings.cmpContactName}
                    />
                    <TextInput
                        name="contact_nat_soc_title"
                        value={value.contact_nat_soc_title}
                        onChange={onValueChange}
                        error={error?.contact_nat_soc_title}
                        label={strings.cmpContactTitle}
                    />
                    <TextInput
                        name="contact_nat_soc_email"
                        value={value.contact_nat_soc_email}
                        onChange={onValueChange}
                        error={error?.contact_nat_soc_email}
                        label={strings.cmpContactEmail}
                    />
                    <TextInput
                        name="contact_nat_soc_phone"
                        value={value.contact_nat_soc_phone}
                        onChange={onValueChange}
                        error={error?.contact_nat_soc_phone}
                        label={strings.cmpContactPhone}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep4ContactRowsFederationContactLabel}
                    description={strings.fieldsStep4ContactRowsFederationContactEVTEPIDesc}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        name="contact_federation_name"
                        value={value.contact_federation_name}
                        onChange={onValueChange}
                        error={error?.contact_federation_name}
                        label={strings.cmpContactName}
                    />
                    <TextInput
                        name="contact_federation_title"
                        value={value.contact_federation_title}
                        onChange={onValueChange}
                        error={error?.contact_federation_title}
                        label={strings.cmpContactTitle}
                    />
                    <TextInput
                        name="contact_federation_email"
                        value={value.contact_federation_email}
                        onChange={onValueChange}
                        error={error?.contact_federation_email}
                        label={strings.cmpContactEmail}
                    />
                    <TextInput
                        name="contact_federation_phone"
                        value={value.contact_federation_phone}
                        onChange={onValueChange}
                        error={error?.contact_federation_phone}
                        label={strings.cmpContactPhone}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep4ContactRowsMediaContactLabel}
                    description={strings.fieldsStep4ContactRowsMediaContactEVTEPIEWDesc}
                    multiRow
                    twoColumn
                >
                    <TextInput
                        name="contact_media_name"
                        value={value.contact_media_name}
                        onChange={onValueChange}
                        error={error?.contact_media_name}
                        label={strings.cmpContactName}
                    />
                    <TextInput
                        name="contact_media_title"
                        value={value.contact_media_title}
                        onChange={onValueChange}
                        error={error?.contact_media_title}
                        label={strings.cmpContactTitle}
                    />
                    <TextInput
                        name="contact_media_email"
                        value={value.contact_media_email}
                        onChange={onValueChange}
                        error={error?.contact_media_email}
                        label={strings.cmpContactEmail}
                    />
                    <TextInput
                        name="contact_media_phone"
                        value={value.contact_media_phone}
                        onChange={onValueChange}
                        error={error?.contact_media_phone}
                        label={strings.cmpContactPhone}
                    />
                </InputSection>


                <InputSection
                    title={strings.fieldReportFormVisibilityLabel}
                    description={(
                        <>
                            <p>
                                {strings.fieldReportConstantVisibilityPublicLabel} - {strings.fieldReportConstantVisibilityPublicTooltipTitle}<br/>
                            </p>
                            <p>
                                {strings.fieldReportConstantVisibilityRCRCMovementLabel} - {strings.fieldReportConstantVisibilityRCRCMovementTooltipTitle}<br/>
                            </p>
                            {
                                user?.data.profile.org_type === 'OTHR' || user?.data.profile.org_type === 'NTLS' ? null :
                                    <p>
                                        {strings.fieldReportConstantVisibilityIFRCSecretariatLabel} - {strings.fieldReportConstantVisibilityIFRCSecretariatTooltipTitle}
                                    </p>
                            }
                            {
                                user?.data.profile.org_type === 'OTHR'  ? null :
                                    <p>
                                        {strings.fieldReportConstantVisibilityIFRCandNSLabel} - {strings.fieldReportConstantVisibilityIFRCandNSTooltipTitle}
                                    </p>
                            }
                        </>
                    )}
                >
                    <RadioInput
                        error={error?.visibility}
                        name={"visibility" as const}
                        onChange={onValueChange}
                        options={visibilityOptions()}
                        keySelector={numericOptionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={value.visibility}
                    />
                </InputSection>
            </Container>
        </>
    );
}

export default ResponseFields;
