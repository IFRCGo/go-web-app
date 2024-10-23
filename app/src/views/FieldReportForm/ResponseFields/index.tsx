import React, { useMemo } from 'react';
import {
    Container,
    InputSection,
    NumberInput,
    RadioInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    hasSomeDefinedValue,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useUserMe from '#hooks/domain/useUserMe';
import {
    type ContactType,
    type ReportType,
    REQUEST_CHOICES_NO,
    VISIBILITY_IFRC_NS,
    VISIBILITY_IFRC_SECRETARIAT,
    VISIBILITY_PUBLIC,
    VISIBILITY_RCRC_MOVEMENT,
} from '#utils/constants';
import { useFormArrayWithEmptyCheck } from '#utils/form';

import { type PartialFormValue } from '../common';
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
    } = useFormArrayWithEmptyCheck<'contacts', ContactValue>(
        'contacts',
        onValueChange,
        (newValue) => {
            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                id,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ctype,
                ...other
            } = newValue;

            return !hasSomeDefinedValue(other);
        },
    );

    const requestOptions = useMemo(() => api_request_choices?.filter((item) => (
        item.key !== REQUEST_CHOICES_NO
    )), [api_request_choices]);

    const visibilityDescriptionMapping = useMemo(() => ({
        [VISIBILITY_PUBLIC]: strings.fieldReportConstantVisibilityPublicTooltipTitle,
        [VISIBILITY_RCRC_MOVEMENT]: strings.fieldReportConstantVisibilityRCRCMovementTooltipTitle,
        // eslint-disable-next-line max-len
        [VISIBILITY_IFRC_SECRETARIAT]: strings.fieldReportConstantVisibilityIFRCSecretariatTooltipTitle,
        [VISIBILITY_IFRC_NS]: strings.fieldReportConstantVisibilityIFRCandNSTooltipTitle,
    }), [
        strings.fieldReportConstantVisibilityPublicTooltipTitle,
        strings.fieldReportConstantVisibilityRCRCMovementTooltipTitle,
        strings.fieldReportConstantVisibilityIFRCSecretariatTooltipTitle,
        strings.fieldReportConstantVisibilityIFRCandNSTooltipTitle,
    ]);

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

    const contacts: ContactOption[] = useMemo(() => [
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
    ], [
        strings.fieldsStep4ContactRowsOriginatorLabel,
        strings.fieldsStep4ContactRowsOriginatorEVTEPIEWDesc,
        strings.fieldsStep4ContactRowsNSContactLabel,
        strings.fieldsStep4ContactRowsNSContactEVTEPIDesc,
        strings.fieldsStep4ContactRowsFederationContactLabel,
        strings.fieldsStep4ContactRowsFederationContactEVTEPIDesc,
        strings.fieldsStep4ContactRowsMediaContactLabel,
        strings.fieldsStep4ContactRowsMediaContactEVTEPIEWDesc,
    ]);

    const contactsIndexMapping = useMemo(() => listToMap(
        value.contacts,
        (item) => item.ctype,
        (_, __, index) => index,
    ), [value.contacts]);

    const contactsError = getErrorObject(error?.contacts);

    return (
        <div className={styles.responseFields}>
            {reportType !== 'COVID' && (
                <Container
                    heading={strings.fieldReportFormResponseTitle}
                    headerDescription={strings.fieldReportFormResponseLabel}
                    childrenContainerClassName={styles.content}
                >
                    <InputSection
                        title={strings.fieldsStep4PlannedResponseRowsDREFEVTEPILabel}
                        numPreferredColumns={2}
                        withAsteriskOnTitle={isDefined(value.dref_amount) || isDefined(value.dref)}
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
                        // withAsterisk={isDefined(value.dref_amount) || isDefined(value.dref)}
                        />
                        <NumberInput
                            label={strings.fieldsStep4PlannedResponseRowsDREFValueFieldLabel}
                            name="dref_amount"
                            value={value.dref_amount}
                            onChange={onValueChange}
                            disabled={disabled}
                            error={error?.dref_amount}
                            withAsterisk={isDefined(value.dref_amount) || isDefined(value.dref)}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep4PlannedResponseRowsEmergencyAppealEVTEPIEWLabel}
                        numPreferredColumns={2}
                        // eslint-disable-next-line max-len
                        withAsteriskOnTitle={isDefined(value.appeal_amount) || isDefined(value.appeal)}
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

                        // withAsterisk={isDefined(value.appeal_amount) || isDefined(value.appeal)}
                        />
                        <NumberInput
                            // eslint-disable-next-line max-len
                            label={strings.fieldsStep4PlannedResponseRowsEmergencyAppealValueFieldLabel}
                            name="appeal_amount"
                            value={value.appeal_amount}
                            onChange={onValueChange}
                            error={error?.appeal_amount}
                            disabled={disabled}
                            withAsterisk={isDefined(value.appeal_amount) || isDefined(value.appeal)}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep4PlannedResponseRowsFactEVTEPIEWLabel}
                        numPreferredColumns={2}
                        withAsteriskOnTitle={isDefined(value.num_fact) || isDefined(value.fact)}
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
                        // withAsterisk={isDefined(value.num_fact) || isDefined(value.fact)}
                        />
                        <NumberInput
                            label={strings.fieldsStep4PlannedResponseRowsFactValueFieldLabel}
                            name="num_fact"
                            value={value.num_fact}
                            onChange={onValueChange}
                            error={error?.num_fact}
                            disabled={disabled}
                            withAsterisk={isDefined(value.num_fact) || isDefined(value.fact)}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep4PlannedResponseRowsIFRCStaffEVTEPIEWLabel}
                        numPreferredColumns={2}
                        // eslint-disable-next-line max-len
                        withAsteriskOnTitle={isDefined(value.num_ifrc_staff) || isDefined(value.ifrc_staff)}
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
                        // eslint-disable-next-line max-len
                        // withAsterisk={isDefined(value.num_ifrc_staff) || isDefined(value.ifrc_staff)}
                        />
                        <NumberInput
                            label={strings.fieldsStep4PlannedResponseRowsIFRCStaffValueFieldLabel}
                            name="num_ifrc_staff"
                            value={value.num_ifrc_staff}
                            onChange={onValueChange}
                            error={error?.num_ifrc_staff}
                            disabled={disabled}
                            // eslint-disable-next-line max-len
                            withAsterisk={isDefined(value.num_ifrc_staff) || isDefined(value.ifrc_staff)}
                        />
                    </InputSection>
                    {reportType === 'EW' && (
                        <InputSection
                            title={strings.fieldsStep4PlannedResponseRowsForecastBasedActionEWLabel}
                            numPreferredColumns={2}
                            // eslint-disable-next-line max-len
                            withAsteriskOnTitle={isDefined(value.forecast_based_action) || isDefined(value.forecast_based_action_amount)}
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
                            // eslint-disable-next-line max-len
                            // withAsterisk={isDefined(value.forecast_based_action) || isDefined(value.forecast_based_action_amount)}
                            />
                            <NumberInput
                                // eslint-disable-next-line max-len
                                label={strings.fieldsStep4PlannedResponseRowsForecastBasedActionValueFieldLabel}
                                name="forecast_based_action_amount"
                                value={value.forecast_based_action_amount}
                                onChange={onValueChange}
                                error={error?.forecast_based_action_amount}
                                disabled={disabled}
                                // eslint-disable-next-line max-len
                                withAsterisk={isDefined(value.forecast_based_action) || isDefined(value.forecast_based_action_amount)}
                            />
                        </InputSection>
                    )}
                </Container>
            )}
            <Container
                heading={strings.fieldReportFormContactsTitle}
                className={styles.contactsSection}
                childrenContainerClassName={styles.content}
            >
                <NonFieldError error={getErrorObject(error?.contacts)} />
                {contacts.map((contact) => {
                    const index = contactsIndexMapping?.[contact.key];
                    return (
                        <InputSection
                            key={contact.key}
                            title={contact.title}
                            description={contact.description}
                            numPreferredColumns={2}
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
                                {resolveToString(
                                    strings.fieldReportFormVisibility,
                                    {
                                        visibilityValue: option.value,
                                        visibility: visibilityDescriptionMapping[option.key],
                                    },
                                )}
                            </p>
                        ))
                    )}
                    withAsteriskOnTitle
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
