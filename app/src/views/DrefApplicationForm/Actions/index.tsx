import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BooleanInput,
    Button,
    Container,
    DateInput,
    InputSection,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import NonFieldError from '#components/NonFieldError';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import {
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
} from '../common';
import { type PartialDref } from '../schema';
import NeedInput from './NeedInput';
import NsActionInput from './NSActionInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type NsActionOption = NonNullable<GlobalEnumsResponse['dref_national_society_action_title']>[number];
type NeedOption = NonNullable<GlobalEnumsResponse['dref_identified_need_title']>[number];

type Value = PartialDref;
type NeedFormFields = NonNullable<PartialDref['needs_identified']>[number];
type NsActionFormFields = NonNullable<PartialDref['national_society_actions']>[number];

function nsActionKeySelector(option: NsActionOption) {
    return option.key;
}
function needOptionKeySelector(option: NeedOption) {
    return option.key;
}

interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

function Actions(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
    } = props;

    const [selectedNeed, setSelectedNeed] = useState<NeedOption['key'] | undefined>();
    const [selectedNsAction, setSelectedNsAction] = useState<NsActionOption['key'] | undefined>();

    const strings = useTranslation(i18n);

    const {
        dref_national_society_action_title: nsActionOptions,
        dref_identified_need_title: needOptions,
    } = useGlobalEnums();

    const error = getErrorObject(formError);

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

    const handleNeedAddButtonClick = useCallback((title: NeedOption['key'] | undefined) => {
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

    const handleNsActionAddButtonClick = useCallback((title: NsActionOption['key'] | undefined) => {
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
            (d) => d.title ?? '<no-key>',
            () => true,
        )
    ), [value.needs_identified]);

    const filteredNeedOptions = useMemo(
        () => (
            needOptions?.filter(
                (n) => !needsIdentifiedMap?.[n.key],
            )
        ),
        [needsIdentifiedMap, needOptions],
    );

    const nsActionsMap = useMemo(() => (
        listToMap(
            value.national_society_actions,
            (d) => d.title ?? '<no-key>',
            () => true,
        )
    ), [value.national_society_actions]);

    const filteredNsActionOptions = useMemo(
        () => (
            nsActionOptions?.filter(
                (nsAction) => !nsActionsMap?.[nsAction.key],
            )
        ),
        [nsActionsMap, nsActionOptions],
    );

    const needsIdentifiedTitleDisplayMap = useMemo(
        () => (
            listToMap(
                needOptions,
                (need) => need.key,
                (need) => need.value,
            )
        ),
        [needOptions],
    );
    const nsActionTitleDisplayMap = useMemo(
        () => (
            listToMap(
                nsActionOptions,
                (nsAction) => nsAction.key,
                (nsAction) => nsAction.value,
            )
        ),
        [nsActionOptions],
    );

    return (
        <div className={styles.actions}>
            <Container
                className={styles.nationalSocietyActions}
                headerDescription={strings.drefFormNationalSocietiesActionsDescription}
                heading={strings.drefFormNationalSocietiesActions}
            >
                <InputSection
                    title={strings.drefFormDidNationalSocietyStartedSlow}
                >
                    <BooleanInput
                        name="did_national_society"
                        onChange={setFieldValue}
                        value={value?.did_national_society}
                        error={error?.did_national_society}
                        disabled={disabled}
                    />
                </InputSection>
                {value.did_national_society && (
                    <InputSection
                        title={strings.drefFormNsResponseStarted}
                    >
                        <DateInput
                            name="ns_respond_date"
                            value={value.ns_respond_date}
                            onChange={setFieldValue}
                            error={error?.ns_respond_date}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                <InputSection
                    numPreferredColumns={2}
                    title=" "
                >
                    <SelectInput
                        label={strings.drefFormNationalSocietiesActionsLabel}
                        name={undefined}
                        options={filteredNsActionOptions}
                        value={selectedNsAction}
                        keySelector={nsActionKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setSelectedNsAction}
                        disabled={disabled}
                    />
                    <div className={styles.addButtonContainer}>
                        <Button
                            variant="secondary"
                            name={selectedNsAction}
                            onClick={handleNsActionAddButtonClick}
                            disabled={isNotDefined(selectedNsAction) || disabled}
                        >
                            {strings.drefFormAddButton}
                        </Button>
                    </div>
                </InputSection>
                <NonFieldError
                    error={getErrorObject(error?.national_society_actions)}
                />
                {value?.national_society_actions?.map((nsAction, i) => (
                    <NsActionInput
                        key={nsAction.client_id}
                        index={i}
                        value={nsAction}
                        onChange={onNsActionChange}
                        onRemove={onNsActionRemove}
                        error={getErrorObject(error?.national_society_actions)}
                        titleDisplayMap={nsActionTitleDisplayMap}
                        disabled={disabled}
                    />
                ))}
            </Container>
            <Container
                heading={strings.ifrcNetworkActionsHeading}
            >
                <InputSection
                    title={strings.drefFormIfrc}
                    description={strings.drefFormIfrcDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="ifrc"
                        onChange={setFieldValue}
                        value={value.ifrc}
                        error={error?.ifrc}
                        disabled={disabled}
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
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container
                heading={strings.icrcActionsHeading}
            >
                <InputSection
                    title={strings.drefFormIcrc}
                    description={strings.drefFormIcrcDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="icrc"
                        onChange={setFieldValue}
                        value={value.icrc}
                        error={error?.icrc}
                        disabled={disabled}
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
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormNationalAuthorities}
                    description={strings.drefFormNationalAuthoritiesDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="national_authorities"
                        onChange={setFieldValue}
                        value={value.national_authorities}
                        error={error?.national_authorities}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormUNorOtherActors}
                    description={strings.drefFormUNorOtherActorsDescription}
                >
                    <TextArea
                        label={strings.drefFormActionDescription}
                        name="un_or_other_actor"
                        onChange={setFieldValue}
                        value={value.un_or_other_actor}
                        error={error?.un_or_other_actor}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.drefFormCoordinationMechanism}
                >
                    <BooleanInput
                        name="is_there_major_coordination_mechanism"
                        value={value.is_there_major_coordination_mechanism}
                        onChange={setFieldValue}
                        error={error?.is_there_major_coordination_mechanism}
                        disabled={disabled}
                    />
                </InputSection>
                {value.is_there_major_coordination_mechanism && (
                    <InputSection
                        description={strings.drefFormCoordinationMechanismDescription}
                    >
                        <TextArea
                            label={strings.drefFormActionDescription}
                            name="major_coordination_mechanism"
                            onChange={setFieldValue}
                            value={value.major_coordination_mechanism}
                            error={error?.major_coordination_mechanism}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
            </Container>
            {value?.type_of_dref !== TYPE_ASSESSMENT && (
                <Container
                    className={styles.needsIdentified}
                    heading={strings.drefFormNeedsIdentified}
                >
                    {/* NOTE: Only when RESPONSE */}
                    {value?.type_of_dref !== TYPE_IMMINENT && (
                        <InputSection
                            title=" "
                        >
                            <GoSingleFileInput
                                name="assessment_report"
                                accept=".pdf, .docx, .pptx"
                                onChange={setFieldValue}
                                url="/api/v2/dref-files/"
                                value={value?.assessment_report}
                                error={error?.assessment_report}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                disabled={disabled}
                                clearable
                            >
                                {strings.drefFormAssessmentReportUploadButtonLabel}
                            </GoSingleFileInput>
                            {strings.drefFormUploadTargetingSupportingDescription}
                        </InputSection>
                    )}
                    <InputSection
                        title=" "
                        numPreferredColumns={2}
                    >
                        <SelectInput
                            className={styles.input}
                            label={strings.drefFormActionFieldsLabel}
                            name={undefined}
                            onChange={setSelectedNeed}
                            keySelector={needOptionKeySelector}
                            labelSelector={stringValueSelector}
                            options={filteredNeedOptions}
                            value={selectedNeed}
                            disabled={disabled}
                        />
                        <div className={styles.addButtonContainer}>
                            <Button
                                className={styles.action}
                                variant="secondary"
                                name={selectedNeed}
                                onClick={handleNeedAddButtonClick}
                                disabled={isNotDefined(selectedNeed) || disabled}
                            >
                                {strings.drefFormAddButton}
                            </Button>
                        </div>
                    </InputSection>
                    <NonFieldError
                        error={getErrorObject(error?.needs_identified)}
                    />
                    {value?.needs_identified?.map((need, i) => (
                        <NeedInput
                            key={need.client_id}
                            index={i}
                            value={need}
                            onChange={onNeedChange}
                            onRemove={onNeedRemove}
                            error={getErrorObject(error?.needs_identified)}
                            titleDisplayMap={needsIdentifiedTitleDisplayMap}
                            disabled={disabled}
                        />
                    ))}
                    {value?.type_of_dref !== TYPE_IMMINENT && (
                        <InputSection
                            title={strings.drefFormGapsInAssessment}
                            description={(
                                <>
                                    <p>
                                        {strings.drefFormGapsInAssessmentDescriptionHeading}
                                    </p>
                                    <ul>
                                        <li>
                                            {strings.drefFormGapsInAssessmentDescriptionPoint1}
                                        </li>
                                        <li>
                                            {strings.drefFormGapsInAssessmentDescriptionPoint2}
                                        </li>
                                        <li>
                                            {strings.drefFormGapsInAssessmentDescriptionPoint3}
                                        </li>
                                        <li>
                                            {strings.drefFormGapsInAssessmentDescriptionPoint4}
                                        </li>
                                        <li>
                                            {strings.drefFormGapsInAssessmentDescriptionPoint5}
                                        </li>
                                    </ul>
                                </>
                            )}
                        >
                            <TextArea
                                label={strings.drefFormActionDescription}
                                name="identified_gaps"
                                onChange={setFieldValue}
                                value={value.identified_gaps}
                                error={error?.identified_gaps}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                </Container>
            )}
        </div>
    );
}

export default Actions;
