import React from 'react';
import {
    Error,
    getErrorObject,
    SetValueArg,
    useFormObject,
    getErrorString as listErrorToString,
} from '@togglecorp/toggle-form';

import useTranslation from '#hooks/useTranslation';
import TextArea from '#components/TextArea';
import Checklist from '#components/Checklist';

import {
    type PartialFormValue,
    type OrganizationType,
    type ReportType,
    type CategoryType,
} from '../../common';

// import styles from './styles.css';
import i18n from './i18n.json';

export type ActionValue = NonNullable<PartialFormValue['actions_taken']>[number];

interface ActionInputProps {
    name: number | undefined;
    organizationType: OrganizationType;
    error: Error<ActionValue> | undefined;
    onChange: (value: SetValueArg<ActionValue>, index: number | undefined) => void;
    value: ActionValue | undefined;
    disabled?: boolean;
    actionOptions: { id: number; name?: string | null, category?: CategoryType }[] | undefined;
    reportType: ReportType;

    healthNotes?: React.ReactNode;
    nsNotes?: React.ReactNode;
    socioecoNotes?: React.ReactNode;
}

function ActionInput(props: ActionInputProps) {
    const {
        name,
        organizationType,
        error: formError,
        onChange,
        value,
        disabled,
        actionOptions,
        reportType,

        healthNotes,
        nsNotes,
        socioecoNotes,
    } = props;

    const strings = useTranslation(i18n);

    const setFieldValue = useFormObject(
        name,
        onChange,
        () => ({
            organization: organizationType,
        }),
    );

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    // FIXME: use memo
    const actionOptionsForHealth = actionOptions?.filter((item) => item.category === 'Health');
    const actionOptionsForNs = actionOptions?.filter((item) => item.category === 'NS Institutional Strengthening');
    const actionOptionsForSocioeco = actionOptions?.filter((item) => item.category === 'Socioeconomic Interventions');

    // FIXME: add non-field errors
    return (
        <>
            {reportType !== 'COVID' && (
                <Checklist
                    name="actions"
                    onChange={setFieldValue}
                    options={actionOptions}
                    // FIXME: do not use inline functions
                    labelSelector={(item) => item.name ?? String(item.id)}
                    keySelector={(item) => item.id}
                    value={value?.actions}
                    error={listErrorToString(error?.actions)}
                    disabled={disabled}
                />
            )}
            {reportType === 'COVID' && organizationType === 'NTLS' && (
                <>
                    <div>
                        <div>
                            {/* FIXME: use translations */}
                            Health
                        </div>
                        <Checklist
                            name="actions"
                            onChange={setFieldValue}
                            options={actionOptionsForHealth}
                            // FIXME: do not use inline functions
                            labelSelector={(item) => item.name ?? '?'}
                            keySelector={(item) => item.id}
                            value={value?.actions}
                            error={listErrorToString(error?.actions)}
                            disabled={disabled}
                        />
                        {healthNotes}
                    </div>
                    <div>
                        <div>
                            {/* FIXME: use translations */}
                            NS Institutional Strengthening
                        </div>
                        <Checklist
                            name="actions"
                            onChange={setFieldValue}
                            options={actionOptionsForNs}
                            // FIXME: do not use inline functions
                            labelSelector={(item) => item.name ?? '?'}
                            keySelector={(item) => item.id}
                            value={value?.actions}
                            error={listErrorToString(error?.actions)}
                            disabled={disabled}
                        />
                        {nsNotes}
                    </div>
                    <div>
                        <div>
                            {/* FIXME: use translations */}
                            Socioeconomic Interventions
                        </div>
                        <Checklist
                            name="actions"
                            onChange={setFieldValue}
                            options={actionOptionsForSocioeco}
                            // FIXME: do not use inline functions
                            labelSelector={(item) => item.name ?? '?'}
                            keySelector={(item) => item.id}
                            value={value?.actions}
                            error={listErrorToString(error?.actions)}
                            disabled={disabled}
                        />
                        {socioecoNotes}
                    </div>
                </>
            )}
            <TextArea
                label={strings.cmpActionDescriptionLabel}
                name="summary"
                onChange={setFieldValue}
                value={value?.summary}
                error={error?.summary}
                // eslint-disable-next-line max-len
                placeholder={strings.fieldsStep3CheckboxSectionsFederationActionsEVTEPIEWPlaceholder}
                disabled={disabled}
            />
        </>
    );
}

export default ActionInput;
