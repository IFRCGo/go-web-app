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
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import {
    type PartialFormValue,
    type ReportType,
    type Visibility,
    type ContactType,
    REQUEST_CHOICES_NO,
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

    const {
        api_request_choices,
        api_visibility_choices,
    } = useGlobalEnums();

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

    // FIXME: use memo
    const requestOptions = api_request_choices?.filter((item) => (
        item.key !== REQUEST_CHOICES_NO
    ));

    // FIXME: use memo
    const visibilityDescriptioMapping: { [key in Visibility]: string } = {
        [VISIBILITY_PUBLIC]: strings.fieldReportConstantVisibilityPublicTooltipTitle,
        [VISIBILITY_RCRC_MOVEMENT]: strings.fieldReportConstantVisibilityRCRCMovementTooltipTitle,
        // eslint-disable-next-line max-len
        [VISIBILITY_IFRC_SECRETARIAT]: strings.fieldReportConstantVisibilityIFRCSecretariatTooltipTitle,
        [VISIBILITY_IFRC_NS]: strings.fieldReportConstantVisibilityIFRCandNSTooltipTitle,
    };

    const visibilityOptions = useMemo(
        () => {
            if (isReviewCountry) {
                return api_visibility_choices?.filter(
                    (item) => item.key === VISIBILITY_IFRC_NS,
                );
            }

            if (userOrgType === 'OTHR') {
                return api_visibility_choices?.filter(
                    (item) => (
                        item.key === VISIBILITY_PUBLIC
                        || item.key === VISIBILITY_RCRC_MOVEMENT
                    ),
                );
            }
            if (userOrgType === 'NTLS') {
                return api_visibility_choices?.filter(
                    (item) => (
                        item.key === VISIBILITY_PUBLIC
                        || item.key === VISIBILITY_RCRC_MOVEMENT
                        || item.key === VISIBILITY_IFRC_NS
                    ),
                );
            }
            return api_visibility_choices;
        },
        [api_visibility_choices, userOrgType, isReviewCountry],
    );

    interface ContactOption {
        key: ContactType;
        title: string;
        description: string;
    }
    // FIXME: use memo
    const contacts: ContactOption[] = [
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
        <div className={styles.responseFields}>
            <Container
                heading={strings.fieldReportFormResponseTitle}
                headerDescription={strings.fieldReportFormResponseLabel}
                childrenContainerClassName={styles.content}
            >
                {reportType !== 'COVID' && (
                    <>
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsDREFEVTEPILabel}
                        >
                            <RadioInput
                                error={error?.dref}
                                name="dref"
                                onChange={onValueChange}
                                options={requestOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.key}
                                labelSelector={(item) => item.value}
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
                                options={requestOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.key}
                                labelSelector={(item) => item.value}
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
                                options={requestOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.key}
                                labelSelector={(item) => item.value}
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
                                options={requestOptions}
                                // FIXME: do not use inline functions
                                keySelector={(item) => item.key}
                                labelSelector={(item) => item.value}
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
                            options={requestOptions}
                            // FIXME: do not use inline functions
                            keySelector={(item) => item.key}
                            labelSelector={(item) => item.value}
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
                childrenContainerClassName={styles.content}
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
                        visibilityOptions?.map((option) => (
                            <p
                                key={option.key}
                            >
                                {/* FIXME: use translation */}
                                {`${option.value} - ${visibilityDescriptioMapping[option.key]}`}
                            </p>
                        ))
                    )}
                >
                    <RadioInput
                        error={error?.visibility}
                        name="visibility"
                        onChange={onValueChange}
                        options={visibilityOptions}
                        // FIXME: do not use inline functions
                        keySelector={(item) => item.key}
                        labelSelector={(item) => item.value}
                        value={value.visibility}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
        </div>
    );
}

export default ResponseFields;
