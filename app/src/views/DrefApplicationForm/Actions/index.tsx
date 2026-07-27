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
    Description,
    InlineLayout,
    InputSection,
    ListView,
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
import TabPage from '#components/TabPage';
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
    readOnly: boolean;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

function Actions(props: Props) {
    const {
        value,
        readOnly,
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
        <TabPage>
            <Container
                heading={strings.drefFormNationalSocietiesActions}
                headerDescription={strings.drefFormNationalSocietiesActionsDescription}
            >
                <ListView layout="block">
                    <InputSection title={strings.drefFormDidNationalSocietyStartedSlow}>
                        <BooleanInput
                            name="did_national_society"
                            readOnly={readOnly}
                            onChange={setFieldValue}
                            value={value?.did_national_society}
                            error={error?.did_national_society}
                            disabled={disabled}
                        />
                    </InputSection>
                    {value.did_national_society && (
                        <InputSection
                            title={strings.drefFormNsResponseStarted}
                            numPreferredColumns={2}
                        >
                            <DateInput
                                name="ns_respond_date"
                                readOnly={readOnly}
                                value={value.ns_respond_date}
                                onChange={setFieldValue}
                                error={error?.ns_respond_date}
                                disabled={disabled}
                            />
                        </InputSection>
                    )}
                    <InputSection>
                        <InlineLayout
                            after={(
                                <Button
                                    name={selectedNsAction}
                                    onClick={handleNsActionAddButtonClick}
                                    disabled={isNotDefined(selectedNsAction)
                                        || disabled
                                        || readOnly}
                                >
                                    {strings.drefFormAddButton}
                                </Button>
                            )}
                            contentAlignment="end"
                        >
                            <SelectInput
                                label={strings.drefFormNationalSocietiesActionsLabel}
                                name={undefined}
                                readOnly={readOnly}
                                options={filteredNsActionOptions}
                                value={selectedNsAction}
                                keySelector={nsActionKeySelector}
                                labelSelector={stringValueSelector}
                                onChange={setSelectedNsAction}
                                disabled={disabled}
                            />
                        </InlineLayout>
                    </InputSection>
                    <ListView
                        backgroundColor="foreground"
                        withPadding
                    >
                        <NonFieldError
                            error={getErrorObject(error?.national_society_actions)}
                        />
                    </ListView>
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
                            readOnly={readOnly}
                        />
                    ))}
                </ListView>
            </Container>
            <Container heading={strings.ifrcNetworkActionsHeading}>
                <ListView layout="block">
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
                        />
                    </InputSection>
                </ListView>
            </Container>
            <Container heading={strings.icrcActionsHeading}>
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
                        readOnly={readOnly}
                    />
                </InputSection>
            </Container>
            <Container heading={strings.drefFormNationalOtherActors}>
                <ListView layout="block">
                    <InputSection title={strings.drefFormInternationalAssistance}>
                        <BooleanInput
                            name="government_requested_assistance"
                            value={value.government_requested_assistance}
                            onChange={setFieldValue}
                            error={error?.government_requested_assistance}
                            disabled={disabled}
                            readOnly={readOnly}
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
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
                            readOnly={readOnly}
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
                                readOnly={readOnly}
                            />
                        </InputSection>
                    )}
                </ListView>
            </Container>
            {value?.type_of_dref !== TYPE_ASSESSMENT && (
                <Container heading={strings.drefFormNeedsIdentified}>
                    <ListView layout="block">
                        {value?.type_of_dref !== TYPE_IMMINENT && (
                            <InputSection>
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
                                    readOnly={readOnly}
                                    useCurrentLanguageForMutation
                                >
                                    {strings.drefFormAssessmentReportUploadButtonLabel}
                                </GoSingleFileInput>
                                <Description>
                                    {strings.drefFormUploadTargetingSupportingDescription}
                                </Description>
                            </InputSection>
                        )}
                        <InputSection>
                            <InlineLayout
                                after={(
                                    <Button
                                        name={selectedNeed}
                                        onClick={handleNeedAddButtonClick}
                                        disabled={isNotDefined(selectedNeed)
                                            || disabled
                                            || readOnly}
                                    >
                                        {strings.drefFormAddButton}
                                    </Button>
                                )}
                            >
                                <SelectInput
                                    label={strings.drefFormActionFieldsLabel}
                                    name={undefined}
                                    onChange={setSelectedNeed}
                                    keySelector={needOptionKeySelector}
                                    labelSelector={stringValueSelector}
                                    options={filteredNeedOptions}
                                    value={selectedNeed}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            </InlineLayout>
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
                                readOnly={readOnly}
                            />
                        ))}
                        {value?.type_of_dref !== TYPE_IMMINENT && (
                            <InputSection
                                title={strings.drefFormGapsInAssessment}
                                description={(
                                    <ListView
                                        layout="block"
                                        withSpacingOpticalCorrection
                                        spacing="sm"
                                    >
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
                                    </ListView>
                                )}
                            >
                                <TextArea
                                    label={strings.drefFormActionDescription}
                                    name="identified_gaps"
                                    onChange={setFieldValue}
                                    value={value.identified_gaps}
                                    error={error?.identified_gaps}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            </InputSection>
                        )}
                    </ListView>
                </Container>
            )}
        </TabPage>
    );
}

export default Actions;
