import { useMemo, useCallback, useState } from 'react';
import {
    randomString,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    Error,
    EntriesAsList,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import Container from '#components/Container';
import InputSection from '#components/InputSection';
import SelectInput from '#components/SelectInput';
import BooleanInput from '#components/BooleanInput';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import GoSingleFileInput from '#components/GoSingleFileInput';

import useTranslation from '#hooks/useTranslation';
import { GET } from '#types/serverResponse';
import { stringKeySelector, stringValueSelector } from '#utils/selectors';

import {
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
} from '../common';
import { PartialDref } from '../schema';

import NeedInput from './NeedInput';
import NsActionInput from './NSActionInput';
import i18n from './i18n.json';

import styles from './styles.module.css';

type Value = PartialDref;
type NeedFormFields = NonNullable<PartialDref['needs_identified']>[number];
type NsActionFormFields = NonNullable<PartialDref['national_society_actions']>[number];

interface Props {
    drefOptions: GET['api/v2/dref-options'] | undefined;
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function Actions(props: Props) {
    const strings = useTranslation(i18n);

    const {
        drefOptions,
        value,
        setFieldValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const error = getErrorObject(formError);

    const [selectedNeed, setSelectedNeed] = useState<string | undefined>();
    const [selectedNsAction, setSelectedNsAction] = useState<string | undefined>();
    const {
        setValue: onNeedChange,
        removeValue: onNeedRemove,
    } = useFormArray<'needs_identified', NeedFormFields>(
        'needs_identified',
        setFieldValue,
    );
    const {
        setValue: onNsActionChange,
        removeValue: onNsActionRemove,
    } = useFormArray<'national_society_actions', NsActionFormFields>(
        'national_society_actions',
        setFieldValue,
    );

    const handleNeedAddButtonClick = useCallback((title: string | undefined) => {
        const newNeedItem: NeedFormFields = {
            client_id: randomString(),
            title,
        };

        setFieldValue(
            (oldValue: NeedFormFields[] | undefined) => (
                [...(oldValue ?? []), newNeedItem]
            ),
            'needs_identified' as const,
        );

        setSelectedNeed(undefined);
    }, [setFieldValue, setSelectedNeed]);

    const handleNsActionAddButtonClick = useCallback((title: string | undefined) => {
        const newNsActionItem: NsActionFormFields = {
            client_id: randomString(),
            title,
        };

        setFieldValue(
            (oldValue: NsActionFormFields[] | undefined) => (
                [...(oldValue ?? []), newNsActionItem]
            ),
            'national_society_actions' as const,
        );

        setSelectedNsAction(undefined);
    }, [setFieldValue, setSelectedNsAction]);

    const needsIdentifiedMap = useMemo(() => (
        listToMap(
            value.needs_identified,
            (d) => d.title ?? '',
            () => true,
        )
    ), [value.needs_identified]);

    const filteredNeedOptions = useMemo(
        () => (
            drefOptions?.needs_identified?.filter(
                (n) => !needsIdentifiedMap?.[n.key],
            )
        ),
        [needsIdentifiedMap, drefOptions],
    );

    const nsActionsMap = useMemo(() => (
        listToMap(
            value.national_society_actions,
            (d) => d.title ?? '',
            () => true,
        )
    ), [value.national_society_actions]);

    const filteredNsActionOptions = useMemo(
        () => (
            drefOptions?.national_society_actions?.filter(
                (n) => !nsActionsMap?.[n.key],
            )
        ),
        [nsActionsMap, drefOptions],
    );

    const hasMajorCoordinationMechanism = value.is_there_major_coordination_mechanism;
    const didNsStartedAnyActions = value.did_national_society;

    const needsIdenfiedTitleDisplayMap = useMemo(
        () => (
            listToMap(
                drefOptions?.needs_identified,
                stringKeySelector,
                stringValueSelector,
            )
        ),
        [drefOptions],
    );
    const nsActionTitleDisplayMap = useMemo(
        () => (
            listToMap(
                drefOptions?.national_society_actions,
                stringKeySelector,
                stringValueSelector,
            )
        ),
        [drefOptions],
    );

    return (
        <div className={styles.actions}>
            <Container
                className={styles.nationalSocietyActions}
                headerDescription={strings.drefFormNationalSocietiesActionsDescription}
                heading={strings.drefFormNationalSocietiesActions}
            >
                <InputSection
                    title={
                        value?.type_of_dref !== TYPE_IMMINENT
                            ? strings.drefFormDidNationalSocietyStartedSlow
                            : strings.drefFormDidNationalSocietyStartedImminent
                    }
                >
                    <BooleanInput
                        name="did_national_society"
                        onChange={setFieldValue}
                        value={value?.did_national_society}
                        error={error?.did_national_society}
                    />
                </InputSection>
                {didNsStartedAnyActions && (
                    <InputSection
                        title={
                            value?.type_of_dref === TYPE_IMMINENT
                                ? strings.drefFormNSAnticipatoryAction
                                : strings.drefFormNsResponseStarted
                        }
                    >
                        <DateInput
                            name="ns_respond_date"
                            value={value.ns_respond_date}
                            onChange={setFieldValue}
                            error={error?.ns_respond_date}
                        />
                    </InputSection>
                )}
                <InputSection>
                    <SelectInput
                        label={strings.drefFormNationalSocietiesActionsLabel}
                        name={undefined}
                        options={filteredNsActionOptions}
                        value={selectedNsAction}
                        keySelector={stringKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setSelectedNsAction}
                    />
                    <div className={styles.addNsActionButtonContainer}>
                        <Button
                            variant="secondary"
                            name={selectedNsAction}
                            onClick={handleNsActionAddButtonClick}
                            disabled={isNotDefined(selectedNsAction)}
                        >
                            {strings.drefFormAddButton}
                        </Button>
                    </div>
                </InputSection>
                {value?.national_society_actions?.map((nsAction, i) => (
                    <NsActionInput
                        key={nsAction.client_id}
                        index={i}
                        value={nsAction}
                        onChange={onNsActionChange}
                        onRemove={onNsActionRemove}
                        error={getErrorObject(error?.national_society_actions)}
                        titleDisplayMap={nsActionTitleDisplayMap}
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
                        onChange={setFieldValue}
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
                        onChange={setFieldValue}
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
                        onChange={setFieldValue}
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
                    <BooleanInput
                        name="government_requested_assistance"
                        value={value.government_requested_assistance}
                        onChange={setFieldValue}
                        error={error?.government_requested_assistance}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalAuthorities}
                >
                    <TextArea
                        label={strings.drefFormDescription}
                        name="national_authorities"
                        onChange={setFieldValue}
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
                        onChange={setFieldValue}
                        value={value.un_or_other_actor}
                        error={error?.un_or_other_actor}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormCoordinationMechanism}
                    oneColumn
                    multiRow
                >
                    <BooleanInput
                        name="is_there_major_coordination_mechanism"
                        value={value.is_there_major_coordination_mechanism}
                        onChange={setFieldValue}
                        error={error?.is_there_major_coordination_mechanism}
                    />
                </InputSection>
                {
                    hasMajorCoordinationMechanism
                    && (
                        <InputSection
                            description={strings.drefFormCoordinationMechanismDescription}
                        >
                            <TextArea
                                label={strings.drefFormDescription}
                                name="major_coordination_mechanism"
                                onChange={setFieldValue}
                                value={value.major_coordination_mechanism}
                                error={error?.major_coordination_mechanism}
                            />
                        </InputSection>
                    )
                }
            </Container>
            {value?.type_of_dref !== TYPE_ASSESSMENT
                && (
                    <Container
                        className={styles.needsIdentified}
                        heading={
                            value?.type_of_dref === TYPE_IMMINENT
                                ? strings.drefFormImminentNeedsIdentified
                                : strings.drefFormNeedsIdentified
                        }
                    >
                        {value?.type_of_dref !== TYPE_IMMINENT && (
                            <InputSection>
                                <GoSingleFileInput
                                    name="assessment_report"
                                    accept=".pdf, .docx, .pptx"
                                    onChange={setFieldValue}
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
                                onChange={setSelectedNeed}
                                keySelector={stringKeySelector}
                                labelSelector={stringValueSelector}
                                options={filteredNeedOptions}
                                value={selectedNeed}
                            />
                            <div className={styles.addNeedButtonContainer}>
                                <Button
                                    variant="secondary"
                                    name={selectedNeed}
                                    onClick={handleNeedAddButtonClick}
                                    disabled={isNotDefined(selectedNeed)}
                                >
                                    {strings.drefFormAddButton}
                                </Button>
                            </div>
                        </InputSection>
                        {value?.needs_identified?.map((need, i) => (
                            <NeedInput
                                key={need.client_id}
                                index={i}
                                value={need}
                                onChange={onNeedChange}
                                onRemove={onNeedRemove}
                                error={getErrorObject(error?.needs_identified)}
                                titleDisplayMap={needsIdenfiedTitleDisplayMap}
                            />
                        ))}
                        {value?.type_of_dref !== TYPE_IMMINENT && (
                            <InputSection
                                title={strings.drefFormGapsInAssessment}
                                oneColumn
                                multiRow
                            >
                                <TextArea
                                    label={strings.drefFormDescription}
                                    name="identified_gaps"
                                    onChange={setFieldValue}
                                    value={value.identified_gaps}
                                    error={error?.identified_gaps}
                                />
                            </InputSection>
                        )}
                    </Container>
                )}
        </div>
    );
}

export default Actions;
