import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Checklist,
    Container,
    InputSection,
    ListView,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
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
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import { type PartialEapFullFormType } from '../schema';
import ApproachesInput from './ApproachesInput';
import EarlyActionsInput from './EarlyActionsInput';
import EvidenceBaseSourceInformationInput from './EvidenceBaseSourceInformation';
import OperationsInput from './OperationInput';

import i18n from './i18n.json';

type EapSector = components['schemas']['EapSectorEnumKey'];
type EapSectorOption = components['schemas']['EapSectorEnum'];

type EapApproach = components['schemas']['EapApproachEnumKey'];
type EapApproachOption = components['schemas']['EapApproachEnum'];

type EnablingApproachesFormFields = NonNullable<
    PartialEapFullFormType['enable_approaches']
>[number];

type PlannedOperationFormFields = NonNullable<
    PartialEapFullFormType['planned_operations']
>[number];

type EvidenceSourceInformationFormFields = NonNullable<
    PartialEapFullFormType['evidence_base_source_of_information']
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
}

function SelectionActions(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
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

    const { setValue: onApproachChange, removeValue: onApproachRemove } = useFormArray<'enable_approaches', EnablingApproachesFormFields>(
        'enable_approaches',
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
                'enable_approaches',
            );
        },
        [setFieldValue],
    );

    const selectedApproaches = value?.enable_approaches?.map(
        ({ approach }) => approach,
    );

    const {
        setValue: onSourceInformationChange,
        removeValue: onSourceInformationRemove,
    } = useFormArray<
        'evidence_base_source_of_information',
        EvidenceSourceInformationFormFields
    >('evidence_base_source_of_information', setFieldValue);

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: EvidenceSourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: EvidenceSourceInformationFormFields[] | undefined) => [
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
        <TabPage>
            <Container>
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.eapFullFormSelectionProcessTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormSelectionProcessDescription1}</li>
                                <li>{strings.eapFullFormSelectionProcessDescription2}</li>
                                <li>{strings.eapFullFormSelectionProcessDescription3}</li>
                                <li>{strings.eapFullFormSelectionProcessDescription4}</li>
                                <li>{strings.eapFullFormSelectionProcessDescription5}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextOutput
                            // FIXME use translation strings
                            withLightText
                            value="Early Actions"
                        />
                        {value?.early_actions?.map((action, index) => (
                            <EarlyActionsInput
                                key={action.client_id}
                                index={index}
                                value={action}
                                onChange={onEarlyActionsChange}
                                onRemove={onEarlyActionsRemove}
                                error={getErrorObject(error?.early_actions)}
                                disabled={disabled}
                            />
                        ))}
                        <Button
                            name={undefined}
                            onClick={handleEarlyActionsAdd}
                            disabled={disabled}
                        >
                            {/* FIXME use translation strings */}
                            Add
                        </Button>
                        <TextArea
                            label={strings.eapFullFormSelectionActionDescriptionLabel}
                            name="early_action_selection_process"
                            value={value?.early_action_selection_process}
                            onChange={setFieldValue}
                            error={error?.early_action_selection_process}
                            disabled={disabled}
                        />
                        <MultiImageWithCaptionInput
                            name="early_action_selection_process_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.early_action_selection_process_images}
                            onChange={setFieldValue}
                            error={getErrorObject(
                                error?.early_action_selection_process_images,
                            )}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.eapFullFormSelectionActionUploadLabel}
                            disabled={disabled}
                        />
                        <GoSingleFileInput
                            accept=".pdf"
                            required
                            name="theory_of_change_table_file"
                            value={value.theory_of_change_table_file}
                            url="/api/v2/eap-file/"
                            error={error?.theory_of_change_table_file}
                            disabled={disabled}
                            // FIXME Use translation strings
                            label="Upload"
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            onChange={setFieldValue}
                        >
                            {/* FIXME Use translation strings */}
                            Upload
                        </GoSingleFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormEvidenceBaseTitle}
                        description={strings.eapFullFormEvidenceBaseDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormSelectionActionDescriptionLabel}
                            name="evidence_base"
                            value={value?.evidence_base}
                            onChange={setFieldValue}
                            error={error?.evidence_base}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormSelectionAttachFilesTitle}
                        description={strings.eapFullFormSelectionAttachFilesDescription}
                    >
                        <GoMultiFileInput
                            name="evidence_base_relevant_files"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value.evidence_base_relevant_files}
                            error={getErrorString(error?.evidence_base_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            useCurrentLanguageForMutation
                        >
                            {strings.eapFullFormSelectionActionUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormSelectionSourceOfInformationTitle}
                        description={
                            strings.eapFullFormSelectionSourceOfInformationDescription
                        }
                    >
                        <NonFieldError
                            error={getErrorObject(error?.evidence_base_source_of_information)}
                        />
                        {value.evidence_base_source_of_information?.map((source, index) => (
                            <EvidenceBaseSourceInformationInput
                                key={source.client_id}
                                index={index}
                                value={source}
                                onChange={onSourceInformationChange}
                                onRemove={onSourceInformationRemove}
                                error={getErrorObject(
                                    error?.evidence_base_source_of_information,
                                )}
                                disabled={disabled}
                            />
                        ))}
                        <Button
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            disabled={disabled}
                        >
                            {strings.eapFullFormSelectionSourceOfInformationAddNewLabel}
                        </Button>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormPlannedOperationTitle}
                        description={strings.eapFullFormPlannedOperationDescription}
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
                        />
                    ))}
                    <InputSection
                        title={strings.eapFullFormEnablingApproachesTitle}
                        description={strings.eapFullFormEnablingApproachesDescription}
                    >
                        <NonFieldError error={getErrorObject(error?.planned_operations)} />
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
                        />
                    </InputSection>
                    {value?.enable_approaches?.map((approach, index) => (
                        <ApproachesInput
                            approachTitle={eapApproachLabelMapping?.[approach.approach]}
                            key={approach.approach}
                            index={index}
                            value={approach}
                            onChange={onApproachChange}
                            onRemove={onApproachRemove}
                            error={getErrorObject(error?.enable_approaches)}
                            disabled={disabled}
                        />
                    ))}
                    <InputSection
                        // FIXME Use translation strings
                        title="Usefulness of actions in case of non-occurring event"
                        description="Describe how your selected actions will contribute
                        to the well-being of the population even if the expected event
                        does not materialize. Include a description of the measures
                        taken to ensure that the actions taken will be of maximum use
                        for the targeted population in a future event."
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormSelectionActionDescriptionLabel}
                            name="usefulness_of_actions"
                            value={value?.usefulness_of_actions}
                            onChange={setFieldValue}
                            error={error?.usefulness_of_actions}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        // FIXME Use translation strings
                        title="Feasibility"
                        description="Indicate how feasible it is to implement the proposed
                        early actions in the planned timeframe. Has it been tested?  Have
                        similar actions been carried out by the NS in past operations and/or
                        in as short a time with similar resources? If not, was a simulation conducted?
                        If Cash and Voucher Assistance (CVA) is chosen as an early action,
                        describe how necessary information for disbursement is collected in the
                        short period of time and how national legislative requirements are met."
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormSelectionActionDescriptionLabel}
                            name="feasibility"
                            value={value?.feasibility}
                            onChange={setFieldValue}
                            error={error?.feasibility}
                            disabled={disabled}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default SelectionActions;
