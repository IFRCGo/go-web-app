import {
    useCallback,
    useMemo,
} from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Checklist,
    Container,
    Description,
    InputSection,
    Label,
    ListView,
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
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

import { charLimits } from '../common';
import EAPSourceInformationInput, { type SourceInformationFormFields } from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';
import ApproachesInput from './ApproachesInput';
import EarlyActionsInput from './EarlyActionsInput';
import OperationsInput from './OperationInput';

import i18n from './i18n.json';

type EapSector = components['schemas']['EapSectorEnumKey'];
type EapSectorOption = components['schemas']['EapSectorEnum'];

type EapApproach = components['schemas']['EapApproachEnumKey'];
type EapApproachOption = components['schemas']['EapApproachEnum'];

type EnablingApproachesFormFields = NonNullable<
    PartialEapFullFormType['enabling_approaches']
>[number];

type PlannedOperationFormFields = NonNullable<
    PartialEapFullFormType['planned_operations']
>[number];

type EarlyActionsFormFields = NonNullable<
    PartialEapFullFormType['early_actions']
>[number];

function sectorKeySelector(option: EapSectorOption) {
    return option.key;
}

function approachesKeySelector(option: EapApproachOption) {
    return option.key;
}

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
}

function SelectionActions(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);
    const { eap_sector: eapSectorOptions, eap_approach: eapApproachOptions } = useGlobalEnums();

    const eapSectorLabelMapping = useMemo(
        () => listToMap(
            eapSectorOptions,
            ({ key }) => key,
            ({ value: label }) => label,
        ),
        [eapSectorOptions],
    );

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'theory_of_change_table',
        },
    });

    const { response: apCodeOptions } = useRequest({
        url: '/api/v2/eap/options/',
    });

    const { setValue: onOperationChange, removeValue: onOperationRemove } = useFormArray<'planned_operations', PlannedOperationFormFields>(
        'planned_operations',
        setFieldValue,
    );

    const handleOperationChecklistChange = useCallback(
        (sectors: EapSector[] | undefined) => {
            setFieldValue(
                (previousValue: PlannedOperationFormFields[] | undefined) => {
                    const previousValueMapping = listToMap(
                        previousValue,
                        ({ sector }) => sector,
                    );

                    return sectors?.map((sector) => {
                        const prevSectorValue = previousValueMapping?.[sector];

                        if (prevSectorValue) {
                            return prevSectorValue;
                        }

                        return {
                            sector,
                        } satisfies PlannedOperationFormFields;
                    });
                },
                'planned_operations',
            );
        },
        [setFieldValue],
    );

    const selectedSectors = value?.planned_operations?.map(
        ({ sector }) => sector,
    );

    const eapApproachLabelMapping = useMemo(
        () => listToMap(
            eapApproachOptions,
            ({ key }) => key,
            ({ value: label }) => label,
        ),
        [eapApproachOptions],
    );

    const { setValue: onApproachChange, removeValue: onApproachRemove } = useFormArray<'enabling_approaches', EnablingApproachesFormFields>(
        'enabling_approaches',
        setFieldValue,
    );

    const handleApproachChecklistChange = useCallback(
        (approaches: EapApproach[] | undefined) => {
            setFieldValue(
                (previousValue: EnablingApproachesFormFields[] | undefined) => {
                    const previousValueMapping = listToMap(
                        previousValue,
                        ({ approach }) => approach,
                    );

                    return approaches?.map((approach) => {
                        const prevApproachValue = previousValueMapping?.[approach];

                        if (prevApproachValue) {
                            return prevApproachValue;
                        }

                        return {
                            approach,
                        } satisfies EnablingApproachesFormFields;
                    });
                },
                'enabling_approaches',
            );
        },
        [setFieldValue],
    );

    const selectedApproaches = value?.enabling_approaches?.map(
        ({ approach }) => approach,
    );

    const {
        setValue: onSourceInformationChange,
        removeValue: onSourceInformationRemove,
    } = useFormArray<
        'evidence_base_source_of_information',
        SourceInformationFormFields
    >('evidence_base_source_of_information', setFieldValue);

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'evidence_base_source_of_information' as const,
        );
    }, [setFieldValue]);

    const { setValue: onEarlyActionsChange, removeValue: onEarlyActionsRemove } = useFormArray<'early_actions', EarlyActionsFormFields>(
        'early_actions',
        setFieldValue,
    );

    const handleEarlyActionsAdd = useCallback(() => {
        const newEarlyActionsItem: EarlyActionsFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: EarlyActionsFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newEarlyActionsItem,
            ],
            'early_actions' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage
            spacingOffset={-2}
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.actionsStatementSectionHeading}
                    content={(
                        <ListView withSpacingOpticalCorrection layout="block">
                            <Label strong>
                                {strings.actionsSectionCriteriaIntroduction1}
                            </Label>
                            <Description>
                                {strings.actionsSectionCriteriaComment1}
                            </Description>
                            <Label strong>
                                {strings.actionsSectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.actionsSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.actionsSectionCriteriaComment22}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.actionsSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.actionsSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.actionsSectionCriteriaComment32}
                                </Description>
                            </ListView>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.actionsSectionCriteriaIntroduction41}
                                </Label>
                                <Label>
                                    {strings.actionsSectionCriteriaIntroduction42}
                                </Label>
                            </ListView>
                            <Description>
                                {strings.actionsSectionCriteriaComment4}
                            </Description>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.actionsSectionCriteriaIntroduction51}
                                </Label>
                                <Label>
                                    {strings.actionsSectionCriteriaIntroduction52}
                                </Label>
                            </ListView>
                            <Description>
                                {strings.actionsSectionCriteriaComment5}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={(
                    <ListView spacing="sm">
                        {strings.selectionActionsHeading}
                        <ExplanatoryNote
                            heading={strings.selectionActionsHeading}
                            ariaLabel={strings.selectionActionsHeading}
                            title={strings.selectionActionsHeading}
                            content={(
                                <Description>
                                    {strings.selectionActionsTooltipDescription}
                                </Description>
                            )}
                        />
                    </ListView>
                )}
                variant="form"
            >
                <ListView layout="block">
                    <InputSection
                        title={strings.selectionProcessTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.selectionProcessTitle}
                                ariaLabel={strings.selectionProcessTitle}
                                title={strings.selectionProcessTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.selectionActionExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.selectionProcessExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.selectionActionRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>
                                                        {strings.selectionProcessRequiredPoint1}
                                                    </li>
                                                    <li>
                                                        {strings.selectionProcessRequiredPoint2}
                                                    </li>
                                                    <li>
                                                        {strings.selectionProcessRequiredPoint3}
                                                    </li>
                                                    <li>
                                                        {strings.selectionProcessRequiredPoint4}
                                                    </li>
                                                    <li>
                                                        {strings.selectionProcessRequiredPoint5}
                                                    </li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.selectionProcessDescription1}</li>
                                <li>{strings.selectionProcessDescription2}</li>
                                <li>{strings.selectionProcessDescription3}</li>
                                <li>{strings.selectionProcessDescription4}</li>
                                <li>{strings.selectionProcessDescription5}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <Container
                            heading={strings.earlyActionsOutputValue}
                            headingLevel={6}
                            headerDescription={(
                                <NonFieldError
                                    error={getErrorObject(error?.early_actions)}
                                />
                            )}
                            empty={isNotDefined(value.early_actions)
                                || value.early_actions.length === 0}
                            emptyMessage={strings.earlyActionsEmptyMessage}
                            withPadding
                            withBorder
                            withCompactMessage
                        >
                            <ListView layout="block">
                                {value?.early_actions?.map((action, index) => (
                                    <EarlyActionsInput
                                        key={action.client_id}
                                        index={index}
                                        value={action}
                                        onChange={onEarlyActionsChange}
                                        onRemove={onEarlyActionsRemove}
                                        error={getErrorObject(error?.early_actions)}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </ListView>
                        </Container>
                        <Button
                            name={undefined}
                            onClick={handleEarlyActionsAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.earlyActionsAddButtonLabel}
                        </Button>
                        <TextArea
                            label={strings.selectionActionDescriptionLabel}
                            name="early_action_selection_process"
                            value={value?.early_action_selection_process}
                            onChange={setFieldValue}
                            error={error?.early_action_selection_process}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.early_action_selection_process}
                        />
                        <MultiImageWithCaptionInput
                            name="early_action_selection_process_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.early_action_selection_process_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.early_action_selection_process_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.selectionActionSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.selectionActionImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.theoryOfChangeTableTitle}
                        description={(
                            <Link
                                external
                                href={templateUrl?.url}
                                withUnderline
                                withLinkIcon
                            >
                                {strings.downloadTableLabel}
                            </Link>
                        )}
                        withAsteriskOnTitle
                    >
                        <GoSingleFileInput
                            name="theory_of_change_table_file"
                            accept=".docx"
                            url="/api/v2/eap-file/"
                            value={value.theory_of_change_table_file}
                            error={error?.theory_of_change_table_file}
                            label={strings.selectionActionUploadTableLabel}
                            onChange={setFieldValue}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            disabled={disabled}
                            readOnly={readOnly}
                            required
                            clearable
                        >
                            {strings.selectionActionUploadLabel}
                        </GoSingleFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.evidenceBaseTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.evidenceBaseTitle}
                                title={strings.evidenceBaseTitle}
                                ariaLabel={strings.evidenceBaseTitle}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Label strong>
                                            {strings.selectionActionExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.evidenceBaseExplanatoryNote}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        description={strings.evidenceBaseDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.selectionActionDescriptionLabel}
                            name="evidence_base"
                            value={value?.evidence_base}
                            onChange={setFieldValue}
                            error={error?.evidence_base}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.evidence_base}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.selectionAttachFilesTitle}
                        description={strings.selectionAttachFilesDescription}
                    >
                        <GoMultiFileInput
                            name="evidence_base_relevant_files"
                            accept=".pdf, .docx, .pptx, image/*"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value.evidence_base_relevant_files}
                            error={getErrorString(error?.evidence_base_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            readOnly={readOnly}
                            useCurrentLanguageForMutation
                        >
                            {strings.selectionActionUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.selectionSourceOfInformationTitle}
                        description={strings.selectionSourceOfInformationDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.evidence_base_source_of_information)}
                        />
                        {value.evidence_base_source_of_information?.map((source, index) => (
                            <EAPSourceInformationInput
                                key={source.client_id}
                                index={index}
                                value={source}
                                onChange={onSourceInformationChange}
                                onRemove={onSourceInformationRemove}
                                error={getErrorObject(error?.evidence_base_source_of_information)}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        ))}
                        <Button
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.earlyActionsAddButtonLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
            <Container
                heading={strings.selectionActionPlannedOperationHeading}
                headerDescription={
                    strings.selectionActionPlannedOperationHeadingDescription
                }
                variant="form"
            >
                <ListView layout="block">
                    <InputSection
                        title={strings.plannedOperationTitle}
                        description={strings.plannedOperationDescription}
                        withAsteriskOnTitle
                    >
                        <NonFieldError error={getErrorObject(error?.planned_operations)} />
                        <Checklist
                            name={undefined}
                            options={eapSectorOptions}
                            value={selectedSectors}
                            onChange={handleOperationChecklistChange}
                            disabled={disabled}
                            keySelector={sectorKeySelector}
                            labelSelector={stringValueSelector}
                            checkListLayout="grid"
                            checkListLayoutPreferredGridColumns={3}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    {value?.planned_operations?.map((operation, index) => (
                        <OperationsInput
                            operationTitle={eapSectorLabelMapping?.[operation.sector]}
                            key={operation.sector}
                            index={index}
                            value={operation}
                            onChange={onOperationChange}
                            onRemove={onOperationRemove}
                            error={getErrorObject(error?.planned_operations)}
                            disabled={disabled}
                            readOnly={readOnly}
                            sectorApCodeOption={apCodeOptions?.sector_ap_codes}
                        />
                    ))}
                    <InputSection
                        title={strings.enablingApproachesTitle}
                        description={strings.enablingApproachesDescription}
                        withAsteriskOnTitle
                    >
                        <NonFieldError error={getErrorObject(error?.enabling_approaches)} />
                        <Checklist
                            name={undefined}
                            options={eapApproachOptions}
                            onChange={handleApproachChecklistChange}
                            value={selectedApproaches}
                            disabled={disabled}
                            keySelector={approachesKeySelector}
                            labelSelector={stringValueSelector}
                            checkListLayout="grid"
                            checkListLayoutPreferredGridColumns={3}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    {value?.enabling_approaches?.map((approach, index) => (
                        <ApproachesInput
                            approachTitle={eapApproachLabelMapping?.[approach.approach]}
                            key={approach.approach}
                            index={index}
                            value={approach}
                            onChange={onApproachChange}
                            onRemove={onApproachRemove}
                            error={getErrorObject(error?.enabling_approaches)}
                            approachApCodeOption={apCodeOptions?.approach_ap_codes}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    ))}
                    <InputSection
                        title={strings.useFulnessActionsTitle}
                        description={strings.useFulnessActionsDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.useFulnessActionsTitle}
                                ariaLabel={strings.useFulnessActionsTitle}
                                title={strings.useFulnessActionsTitle}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Label strong>
                                            {strings.selectionActionExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.useFulnessActionsExplanatoryNote}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.selectionActionDescriptionLabel}
                            name="usefulness_of_actions"
                            value={value?.usefulness_of_actions}
                            onChange={setFieldValue}
                            error={error?.usefulness_of_actions}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.usefulness_of_actions}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.feasibilityTitle}
                        description={strings.feasibilityDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.feasibilityTitle}
                                ariaLabel={strings.feasibilityTitle}
                                title={strings.feasibilityTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.selectionActionExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.feasibilityExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.selectionActionRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.feasibilityRequiredPoint1}</li>
                                                    <li>{strings.feasibilityRequiredPoint2}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.selectionActionDescriptionLabel}
                            name="feasibility"
                            value={value?.feasibility}
                            onChange={setFieldValue}
                            error={error?.feasibility}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.feasibility}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default SelectionActions;
