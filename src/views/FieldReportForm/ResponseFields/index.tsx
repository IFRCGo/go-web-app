import React, { useMemo } from 'react';
import { listToMap, isDefined } from '@togglecorp/fujs';
import {
    Error,
    EntriesAsList,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import Header from '#components/Header';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import RadioInput from '#components/RadioInput';
import useTranslation from '#hooks/useTranslation';
import useUserMe from '#hooks/domain/useUserMe';

import {
    type PartialFormValue,
    type ReportType,
    type Visibility,
    type ContactType,
    VISIBILITY_IFRC_SECRETARIAT,
    VISIBILITY_PUBLIC,
    VISIBILITY_RCRC_MOVEMENT,
    VISIBILITY_IFRC_NS,
} from '../common';

import ContactInput, { type ContactValue } from './ContactInput';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: PartialFormValue;
    reportType: ReportType;
    disabled?: boolean;
    isReviewCountry?: boolean;
}

function ResponseFields(props: Props) {
    const {
        error: formError,
        onValueChange,
        value,
        reportType,
        isReviewCountry,
        disabled,
    } = props;

    const userMe = useUserMe();
    const userOrgType = userMe?.profile.org_type;

    const strings = useTranslation(i18n);

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const {
        setValue: setContactValue,
    } = useFormArray<'contacts', ContactValue>(
        'contacts',
        onValueChange,
    );

    // visibility: VisibilityD1bEnum

    // dref: DrefEnum
    // appeal: AppealEnum
    // fact: FactEnum
    // ifrc_staff: IfrcStaffEnum
    // imminent_dref: ImminentDrefEnum
    // forecast_based_action: ForecastBasedActionEnum

    interface Option {
        value: 0 | 1 | 2 | 3;
        label: string;
    }

    // FIXME: get this from server and apply filter
    const drefOptions: Option[] = [
        { label: 'Planned', value: 2 },
        { label: 'Requested', value: 1 },
        { label: 'Allocated', value: 3 },
    ];
    // FIXME: get this from server and apply filter
    const appealOptions: Option[] = [
        { label: 'Planned', value: 2 },
        { label: 'Requested', value: 1 },
        { label: 'Launched', value: 3 },
    ];
    // FIXME: get this from server and apply filter
    const responseOptions: Option[] = [
        { label: 'Planned', value: 2 },
        { label: 'Requested', value: 1 },
        { label: 'Deployed', value: 3 },
    ];

    // FIXME: get this from server and apply filter
    const visibilityOptions = useMemo<{ label: string, value: Visibility }[]>(
        () => {
            if (isReviewCountry) {
                return [
                    {
                        label: strings.fieldReportConstantVisibilityIFRCandNSLabel,
                        value: VISIBILITY_IFRC_NS,
                    },
                ];
            }

            if (userOrgType === 'OTHR') {
                return [
                    {
                        label: strings.fieldReportConstantVisibilityPublicLabel,
                        value: VISIBILITY_PUBLIC,
                    },
                    {
                        label: strings.fieldReportConstantVisibilityRCRCMovementLabel,
                        value: VISIBILITY_RCRC_MOVEMENT,
                    },
                ];
            }
            if (userOrgType === 'NTLS') {
                return [
                    {
                        label: strings.fieldReportConstantVisibilityPublicLabel,
                        value: VISIBILITY_PUBLIC,
                    },
                    {
                        label: strings.fieldReportConstantVisibilityRCRCMovementLabel,
                        value: VISIBILITY_RCRC_MOVEMENT,
                    },
                    {
                        label: strings.fieldReportConstantVisibilityIFRCandNSLabel,
                        value: VISIBILITY_IFRC_NS,
                    },
                ];
            }
            return [
                {
                    label: strings.fieldReportConstantVisibilityPublicLabel,
                    value: VISIBILITY_PUBLIC,
                },
                {
                    label: strings.fieldReportConstantVisibilityRCRCMovementLabel,
                    value: VISIBILITY_RCRC_MOVEMENT,
                },
                {
                    label: strings.fieldReportConstantVisibilityIFRCSecretariatLabel,
                    value: VISIBILITY_IFRC_SECRETARIAT,
                },
                {
                    label: strings.fieldReportConstantVisibilityIFRCandNSLabel,
                    value: VISIBILITY_IFRC_NS,
                },
            ];
        },
        [strings, userOrgType, isReviewCountry],
    );

    interface Contact {
        key: ContactType;
        title: string;
        description: string;
    }
    // FIXME: use memo
    const contacts: Contact[] = [
        {
            key: 'Originator',
            title: strings.fieldsStep4ContactRowsOriginatorLabel,
            description: strings.fieldsStep4ContactRowsOriginatorEVTEPIEWDesc,
        },
        {
            key: 'NationalSociety',
            title: strings.fieldsStep4ContactRowsNSContactLabel,
            description: strings.fieldsStep4ContactRowsNSContactEVTEPIDesc,
        },
        {
            key: 'Federation',
            title: strings.fieldsStep4ContactRowsFederationContactLabel,
            description: strings.fieldsStep4ContactRowsFederationContactEVTEPIDesc,
        },
        {
            key: 'Media',
            title: strings.fieldsStep4ContactRowsMediaContactLabel,
            description: strings.fieldsStep4ContactRowsMediaContactEVTEPIEWDesc,
        },
    ];

    // FIXME: use memo
    const mapping = listToMap(
        value.contacts,
        (item) => item.ctype,
        (_, __, index) => index,
    );

    const contactsError = getErrorObject(error?.contacts);

    return (
        <>
            <Container
                heading={strings.fieldReportFormResponseTitle}
                headingDescription={(
                    <Header
                        heading={strings.fieldReportFormResponseLabel}
                        headingDescription={strings.fieldReportFormResponseDescription}
                        headingLevel={6}
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
                                name="dref"
                                onChange={onValueChange}
                                options={drefOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.value}
                                labelSelector={(item) => item.label}
                                value={value.dref}
                                disabled={disabled}
                                clearable
                            />
                            <NumberInput
                                label={strings.fieldsStep4PlannedResponseRowsDREFValueFieldLabel}
                                name="dref_amount"
                                value={value.dref_amount}
                                onChange={onValueChange}
                                disabled={disabled}
                                error={error?.dref_amount}
                            />
                        </InputSection>
                        <InputSection
                            // eslint-disable-next-line max-len
                            title={strings.fieldsStep4PlannedResponseRowsEmergencyAppealEVTEPIEWLabel}
                        >
                            <RadioInput
                                error={error?.appeal}
                                name="appeal"
                                onChange={onValueChange}
                                options={appealOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.value}
                                labelSelector={(item) => item.label}
                                value={value.appeal}
                                clearable
                                disabled={disabled}
                            />
                            <NumberInput
                                // eslint-disable-next-line max-len
                                label={strings.fieldsStep4PlannedResponseRowsEmergencyAppealValueFieldLabel}
                                name="appeal_amount"
                                value={value.appeal_amount}
                                onChange={onValueChange}
                                error={error?.appeal_amount}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsFactEVTEPIEWLabel}
                        >
                            <RadioInput
                                error={error?.fact}
                                name="fact"
                                onChange={onValueChange}
                                options={responseOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.value}
                                labelSelector={(item) => item.label}
                                value={value.fact}
                                clearable
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.fieldsStep4PlannedResponseRowsFactValueFieldLabel}
                                name="num_fact"
                                value={value.num_fact}
                                onChange={onValueChange}
                                error={error?.num_fact}
                                disabled={disabled}
                            />
                        </InputSection>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsIFRCStaffEVTEPIEWLabel}
                        >
                            <RadioInput
                                error={error?.ifrc_staff}
                                name="ifrc_staff"
                                onChange={onValueChange}
                                options={responseOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.value}
                                labelSelector={(item) => item.label}
                                value={value.ifrc_staff}
                                clearable
                                disabled={disabled}
                            />
                            <NumberInput
                                // eslint-disable-next-line max-len
                                label={strings.fieldsStep4PlannedResponseRowsIFRCStaffValueFieldLabel}
                                name="num_ifrc_staff"
                                value={value.num_ifrc_staff}
                                onChange={onValueChange}
                                error={error?.num_ifrc_staff}
                                disabled={disabled}
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
                            name="forecast_based_action"
                            onChange={onValueChange}
                            options={responseOptions}
                            // FIXME: do not use inline functions
                            keySelector={(item) => item.value}
                            labelSelector={(item) => item.label}
                            value={value.forecast_based_action}
                            clearable
                            disabled={disabled}
                        />
                        <NumberInput
                            // eslint-disable-next-line max-len
                            label={strings.fieldsStep4PlannedResponseRowsForecastBasedActionValueFieldLabel}
                            name="forecast_based_action_amount"
                            value={value.forecast_based_action_amount}
                            onChange={onValueChange}
                            error={error?.forecast_based_action_amount}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
            </Container>
            <Container
                heading={strings.fieldReportFormContactsTitle}
                className={styles.contactsSection}
            >
                {contacts.map((contact) => {
                    const index = mapping?.[contact.key];
                    return (
                        <InputSection
                            key={contact.key}
                            title={contact.title}
                            description={contact.description}
                            multiRow
                            twoColumn
                        >
                            <ContactInput
                                name={index}
                                contactType={contact.key}
                                value={isDefined(index) ? value?.contacts?.[index] : undefined}
                                error={isDefined(index) ? contactsError?.[contact.key] : undefined}
                                onChange={setContactValue}
                                disabled={disabled}
                            />
                        </InputSection>
                    );
                })}
                <InputSection
                    title={strings.fieldReportFormVisibilityLabel}
                    description={(
                        <>
                            <p>
                                {strings.fieldReportConstantVisibilityPublicLabel} - {strings.fieldReportConstantVisibilityPublicTooltipTitle}
                            </p>
                            <p>
                                {strings.fieldReportConstantVisibilityRCRCMovementLabel} - {strings.fieldReportConstantVisibilityRCRCMovementTooltipTitle}
                            </p>
                            {userOrgType !== 'OTHR' && userOrgType !== 'NTLS' && (
                                <p>
                                    {strings.fieldReportConstantVisibilityIFRCSecretariatLabel} - {strings.fieldReportConstantVisibilityIFRCSecretariatTooltipTitle}
                                </p>
                            )}
                            {userOrgType !== 'OTHR' && (
                                <p>
                                    {strings.fieldReportConstantVisibilityIFRCandNSLabel} - {strings.fieldReportConstantVisibilityIFRCandNSTooltipTitle}
                                </p>
                            )}
                        </>
                    )}
                >
                    <RadioInput
                        error={error?.visibility}
                        name="visibility"
                        onChange={onValueChange}
                        options={visibilityOptions}
                        // FIXME: do not use inline functions
                        keySelector={(item) => item.value}
                        labelSelector={(item) => item.label}
                        value={value.visibility}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
        </>
    );
}

export default ResponseFields;
