import React, { useMemo } from 'react';
import {
    randomString,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    PartialForm,
    Error,
    EntriesAsList,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import SelectInput from '#components/SelectInput';
import RadioInput from '#components/RadioInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import GoSingleFileInput from '#components/GoSingleFileInput';
import {
    BooleanValueOption,
    StringValueOption,
} from '#types/common';
import useTranslation from '#hooks/useTranslation';

import {
    optionLabelSelector,
    DrefFields,
    booleanOptionKeySelector,
    Need,
    NsAction,
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
} from '../common';
import NeedInput from './NeedInput';
import NsActionInput from './NSActionInput';
import i18n from './i18n.json';

import styles from './styles.module.css';

type Value = PartialForm<DrefFields>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    yesNoOptions: BooleanValueOption[];
    needOptions: StringValueOption[];
    nsActionOptions: StringValueOption[];
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    drefType?: number;
}

function ActionsFields(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        onValueChange,
        value,
        yesNoOptions,
        needOptions,
        nsActionOptions,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        drefType,
    } = props;

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const [need, setNeed] = React.useState<string | undefined>();
    const [nsAction, setNsAction] = React.useState<string | undefined>();
    const {
        setValue: onNeedChange,
        removeValue: onNeedRemove,
    } = useFormArray<'needs_identified', PartialForm<Need>>(
        'needs_identified',
        onValueChange,
    );
    const {
        setValue: onNsActionChange,
        removeValue: onNsActionRemove,
    } = useFormArray<'national_society_actions', PartialForm<NsAction>>(
        'national_society_actions',
        onValueChange,
    );

    type Needs = typeof value.needs_identified;
    const handleNeedAddButtonClick = React.useCallback((title?: string) => {
        const clientId = randomString();
        const newNeedList: PartialForm<Need> = {
            clientId,
            title,
        };

        onValueChange(
            (oldValue: PartialForm<Needs>) => (
                [...(oldValue ?? []), newNeedList]
            ),
            'needs_identified' as const,
        );
        setNeed(undefined);
    }, [onValueChange, setNeed]);

    type NsActions = typeof value.needs_identified;
    const handleNsActionAddButtonClick = React.useCallback((title?: string) => {
        const clientId = randomString();
        const newNsActionList: PartialForm<NsAction> = {
            clientId,
            title,
        };

        onValueChange(
            (oldValue: PartialForm<NsActions>) => (
                [...(oldValue ?? []), newNsActionList]
            ),
            'national_society_actions' as const,
        );
        setNsAction(undefined);
    }, [onValueChange, setNsAction]);

    const needsIdentifiedMap = React.useMemo(() => (
        listToMap(
            value.needs_identified,
            (d) => d.title ?? '',
            () => true,
        )
    ), [value.needs_identified]);

    const filteredNeedOptions = useMemo(() => (
        needsIdentifiedMap
            ? needOptions.filter((n) => !needsIdentifiedMap[n.value])
            : []
    ), [
        needsIdentifiedMap,
        needOptions,
    ]);

    const nsActionsMap = React.useMemo(() => (
        listToMap(
            value.national_society_actions,
            (d) => d.title ?? '',
            () => true,
        )
    ), [value.national_society_actions]);

    const filteredNsActionOptions = useMemo(() => (
        nsActionsMap
            ? nsActionOptions.filter((n) => !nsActionsMap[n.value])
            : []
    ), [
        nsActionsMap,
        nsActionOptions,
    ]);

    const isThereCoordinationMechanism = value.is_there_major_coordination_mechanism;
    const didNationalSocietyStarted = value.did_national_society;

    return (
        <>
            <Container
                className={styles.nationalSocietyActions}
                headerDescription={strings.drefFormNationalSocietiesActionsDescription}
                heading={strings.drefFormNationalSocietiesActions}
            >
                <InputSection
                    title={
                        drefType !== TYPE_IMMINENT
                            ? strings.drefFormDidNationalSocietyStartedSlow
                            : strings.drefFormDidNationalSocietyStartedImminent
                    }
                >
                    <RadioInput
                        name="did_national_society"
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
                        onChange={onValueChange}
                        value={value?.did_national_society}
                        error={error?.did_national_society}
                    />
                </InputSection>
                {didNationalSocietyStarted
                    && (
                        <InputSection
                            title={
                                drefType === TYPE_IMMINENT
                                    ? strings.drefFormNSAnticipatoryAction
                                    : strings.drefFormNsResponseStarted
                            }
                        >
                            <DateInput
                                name="ns_respond_date"
                                value={value.ns_respond_date}
                                onChange={onValueChange}
                                error={error?.ns_respond_date}
                            />
                        </InputSection>
                    )}
                <InputSection>
                    <SelectInput
                        label={strings.drefFormNationalSocietiesActionsLabel}
                        name={undefined}
                        options={filteredNsActionOptions}
                        value={nsAction}
                        keySelector={(d) => d.value}
                        labelSelector={(d) => d.label}
                        onChange={setNsAction}
                    />
                    <div className={styles.actions}>
                        <Button
                            variant="secondary"
                            name={nsAction}
                            onClick={handleNsActionAddButtonClick}
                            disabled={isNotDefined(nsAction)}
                        >
                            {strings.drefFormAddButton}
                        </Button>
                    </div>
                </InputSection>
                {value?.national_society_actions?.map((n, i) => (
                    <NsActionInput
                        key={n.clientId}
                        index={i}
                        value={n}
                        onChange={onNsActionChange}
                        onRemove={onNsActionRemove}
                        error={getErrorObject(error?.national_society_actions)}
                        nsActionOptions={nsActionOptions}
                    />
                ))}
            </Container>
            <Container
                heading={strings.drefFormMovementPartners}
            >
                <InputSection
                    title={strings.drefFormIfrc}
                    description={strings.drefFormIfrcDescription}
                >
                    <TextArea
                        label={strings.drefFormDescription}
                        name="ifrc"
                        onChange={onValueChange}
                        value={value.ifrc}
                        error={error?.ifrc}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormIcrc}
                    description={strings.drefFormIcrcDescription}
                >
                    <TextArea
                        label={strings.drefFormDescription}
                        name="icrc"
                        onChange={onValueChange}
                        value={value.icrc}
                        error={error?.icrc}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormPartnerNationalSociety}
                    description={strings.drefFormPartnerNationalSocietyDescription}
                >
                    <TextArea
                        name="partner_national_society"
                        onChange={onValueChange}
                        value={value.partner_national_society}
                        error={error?.partner_national_society}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.drefFormNationalOtherActors}
                className={styles.otherActors}
            >
                <InputSection
                    title={strings.drefFormInternationalAssistance}
                >
                    <RadioInput
                        name="government_requested_assistance"
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={value.government_requested_assistance}
                        onChange={onValueChange}
                        error={error?.government_requested_assistance}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalAuthorities}
                >
                    <TextArea
                        label={strings.drefFormDescription}
                        name="national_authorities"
                        onChange={onValueChange}
                        value={value.national_authorities}
                        error={error?.national_authorities}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormUNorOtherActors}
                    oneColumn
                    multiRow
                >
                    <TextArea
                        label={strings.drefFormDescription}
                        name="un_or_other_actor"
                        onChange={onValueChange}
                        value={value.un_or_other_actor}
                        error={error?.un_or_other_actor}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormCoordinationMechanism}
                    oneColumn
                    multiRow
                >
                    <RadioInput
                        name="is_there_major_coordination_mechanism"
                        options={yesNoOptions}
                        keySelector={booleanOptionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={value.is_there_major_coordination_mechanism}
                        onChange={onValueChange}
                        error={error?.is_there_major_coordination_mechanism}
                    />
                </InputSection>
                {
                    isThereCoordinationMechanism
                    && (
                        <InputSection
                            description={strings.drefFormCoordinationMechanismDescription}
                        >
                            <TextArea
                                label={strings.drefFormDescription}
                                name="major_coordination_mechanism"
                                onChange={onValueChange}
                                value={value.major_coordination_mechanism}
                                error={error?.major_coordination_mechanism}
                            />
                        </InputSection>
                    )
                }
            </Container>
            {drefType !== TYPE_ASSESSMENT
                && (
                    <Container
                        className={styles.needsIdentified}
                        heading={
                            drefType === TYPE_IMMINENT
                                ? strings.drefFormImminentNeedsIdentified
                                : strings.drefFormNeedsIdentified
                        }
                    >
                        {drefType !== TYPE_IMMINENT
                            && (
                                <InputSection>
                                    <GoSingleFileInput
                                        name="assessment_report"
                                        accept=".pdf, .docx, .pptx"
                                        onChange={onValueChange}
                                        url="api/v2/dref-files/"
                                        value={value?.assessment_report}
                                        fileIdToUrlMap={fileIdToUrlMap}
                                        setFileIdToUrlMap={setFileIdToUrlMap}
                                    >
                                        {strings.drefFormAssessmentReportUploadButtonLabel}
                                    </GoSingleFileInput>
                                </InputSection>
                            )}
                        <InputSection>
                            <SelectInput
                                label={strings.drefFormActionFieldsLabel}
                                name={undefined}
                                onChange={setNeed}
                                keySelector={(d) => d.value}
                                labelSelector={(d) => d.label}
                                options={filteredNeedOptions}
                                value={need}
                            />
                            <div className={styles.actions}>
                                <Button
                                    variant="secondary"
                                    name={need}
                                    onClick={handleNeedAddButtonClick}
                                    disabled={isNotDefined(need)}
                                >
                                    {strings.drefFormAddButton}
                                </Button>
                            </div>
                        </InputSection>
                        {value?.needs_identified?.map((n, i) => (
                            <NeedInput
                                key={n.clientId}
                                index={i}
                                value={n}
                                onChange={onNeedChange}
                                onRemove={onNeedRemove}
                                error={getErrorObject(error?.needs_identified)}
                                needOptions={needOptions}
                            />
                        ))}
                        {drefType !== TYPE_IMMINENT && (
                            <InputSection
                                title={strings.drefFormGapsInAssessment}
                                oneColumn
                                multiRow
                            >
                                <TextArea
                                    label={strings.drefFormDescription}
                                    name="identified_gaps"
                                    onChange={onValueChange}
                                    value={value.identified_gaps}
                                    error={error?.identified_gaps}
                                />
                            </InputSection>
                        )}
                    </Container>
                )}
        </>
    );
}

export default ActionsFields;
