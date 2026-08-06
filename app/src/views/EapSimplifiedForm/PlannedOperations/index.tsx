import {
    useCallback,
    useMemo,
} from 'react';
import {
    Checklist,
    Container,
    Description,
    Heading,
    InputSection,
    Label,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import ConfirmationModal from '#components/domain/ConfirmationModal';
import ExplanatoryNote from '#components/ExplanatoryNote';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useChecklistFormArray from '#hooks/domain/useChecklistFormArray';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type GoApiResponse } from '#utils/restRequest';

import GuidanceSeap from '../GuidanceSeap';
import { type PartialSimplifiedEapType } from '../schema';
import OperationInput from './OperationsInput';

import i18n from './i18n.json';

type EapSector = components['schemas']['EapSectorEnumKey'];
type EapSectorOption = components['schemas']['EapSectorEnum'];

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];
type EapSectorApCodeOption = NonNullable<GoApiResponse<'/api/v2/eap/options/'>['sector_ap_codes']>;

function sectorKeySelector(option: EapSectorOption) {
    return option.key;
}

function operationSectorSelector(operation: PlannedOperationFormFields) {
    return operation.sector;
}

function createOperation(sector: EapSector) {
    return { sector } satisfies PlannedOperationFormFields;
}

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    readOnly?: boolean;
    sectorApCodeOption?: EapSectorApCodeOption;
}

function PlannedOperations(props: Props) {
    const {
        value,
        error: formError,
        disabled,
        setFieldValue,
        readOnly,
        sectorApCodeOption,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);
    const { eap_sector: eapSectorOptions } = useGlobalEnums();

    const eapSectorLabelMapping = useMemo(() => (
        listToMap(
            eapSectorOptions,
            ({ key }) => key,
            ({ value: label }) => label,
        )
    ), [eapSectorOptions]);

    const {
        setValue: onOperationChange,
        removeValue: onOperationRemove,
    } = useFormArray<'planned_operations', PlannedOperationFormFields>(
        'planned_operations',
        setFieldValue,
    );

    const setPlannedOperations = useCallback((getNewValue: (
        previousValue: PlannedOperationFormFields[] | undefined,
    ) => PlannedOperationFormFields[] | undefined) => {
        setFieldValue(getNewValue, 'planned_operations');
    }, [setFieldValue]);

    const {
        selectedKeys: selectedSectors,
        pendingRemoval: pendingSectorRemoval,
        handleChecklistChange: handleOperationChecklistChange,
        handleRemoveClick: handleOperationRemoveClick,
        handleRemovalCancel: handleSectorRemovalCancel,
        handleRemovalConfirm: handleSectorRemovalConfirm,
    } = useChecklistFormArray({
        value: value?.planned_operations,
        keySelector: operationSectorSelector,
        createItem: createOperation,
        setValue: setPlannedOperations,
        removeValue: onOperationRemove,
    });

    return (
        <TabPage
            headerAction={(
                <GuidanceSeap
                    heading={strings.plannedSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <Heading level={5}>
                                {strings.eapPlannedSectionHeading}
                            </Heading>
                            <Label strong>
                                {strings.plannedSectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.plannedSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.plannedSectionCriteriaComment12}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.plannedSectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.plannedSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.plannedSectionCriteriaComment22}
                                </Description>
                                <Description>
                                    {strings.plannedSectionCriteriaComment23}
                                </Description>
                            </ListView>
                            <Heading level={5}>
                                {strings.monitoringSectionCriteriaHeading}
                            </Heading>
                            <Label strong>
                                {strings.plannedSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.plannedSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.plannedSectionCriteriaComment32}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.plannedOperationsTitle}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.plannedOperationsTitle}
                        description={strings.plannedOperationsDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.plannedOperationsTitle}
                                ariaLabel={strings.plannedOperationsTitle}
                                title={strings.plannedOperationsTitle}
                                content={(
                                    <Description>
                                        {strings.plannedOperationsTooltipDescription}
                                    </Description>
                                )}
                            />
                        )}
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
                        <OperationInput
                            operationTitle={eapSectorLabelMapping?.[operation.sector]}
                            key={operation.sector}
                            index={index}
                            value={operation}
                            onChange={onOperationChange}
                            onRemove={handleOperationRemoveClick}
                            error={getErrorObject(error?.planned_operations)}
                            sectorApCodeOption={sectorApCodeOption}
                            disabled={disabled}
                            readOnly={readOnly}
                            leadTimeframeUnit={value?.seap_lead_timeframe_unit}
                        />
                    ))}
                </ListView>
            </Container>
            {isDefined(pendingSectorRemoval) && (
                <ConfirmationModal
                    message={pendingSectorRemoval.type === 'checklist'
                        ? strings.plannedOperationsSectorUnselectConfirmation
                        : strings.plannedOperationsSectorRemoveConfirmation}
                    onCancel={handleSectorRemovalCancel}
                    onConfirm={handleSectorRemovalConfirm}
                />
            )}
        </TabPage>
    );
}

export default PlannedOperations;
