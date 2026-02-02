import {
    useCallback,
    useMemo,
} from 'react';
import { CheckboxMultipleBlankFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Checklist,
    Heading,
    InlineLayout,
    InputSection,
    ListView,
    Modal,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { listToMap } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import { type PartialSimplifiedEapType } from '../schema';
import OperationInput from './OperationsInput';

import i18n from './i18n.json';

type EapSector = components['schemas']['EapSectorEnumKey'];
type EapSectorOption = components['schemas']['EapSectorEnum'];

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];
function sectorKeySelector(option: EapSectorOption) {
    return option.key;
}

interface Props {
    value: PartialSimplifiedEapType;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    readOnly?: boolean;
}

function PlannedOperations(props: Props) {
    const {
        value,
        error: formError,
        disabled,
        setFieldValue,
        readOnly,
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

    const [
        showQualityCriteria,
        {
            setTrue: setShowQualityCriteriaTrue,
            setFalse: setShowQualityCriteriaFalse,
        },
    ] = useBooleanState(false);

    const {
        setValue: onOperationChange,
        removeValue: onOperationRemove,
    } = useFormArray<'planned_operations', PlannedOperationFormFields>(
        'planned_operations',
        setFieldValue,
    );

    const handleOperationChecklistChange = useCallback((sectors: EapSector[] | undefined) => {
        setFieldValue((previousValue: PlannedOperationFormFields[] | undefined) => {
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
        }, 'planned_operations');
    }, [setFieldValue]);

    const selectedSectors = value?.planned_operations?.map(({ sector }) => sector);

    return (
        <TabPage spacingOffset={-6}>
            <InlineLayout
                after={(
                    <Button
                        name={undefined}
                        onClick={setShowQualityCriteriaTrue}
                        after={(<CheckboxMultipleBlankFillIcon />)}
                    >
                        {strings.plannedSectionCriteriaButtonLabel}
                    </Button>
                )}
            />
            <ListView
                layout="block"
                spacing="sm"
            >
                <Heading variant="form">
                    {strings.plannedOperationsTitle}
                </Heading>
                <InputSection
                    title={strings.plannedOperationsTitle}
                    description={strings.plannedOperationsDescription}
                    tooltip={strings.plannedOperationsTooltipDescription}
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
                        onRemove={onOperationRemove}
                        error={getErrorObject(error?.planned_operations)}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                ))}
            </ListView>
            {showQualityCriteria && (
                <Modal
                    onClose={setShowQualityCriteriaFalse}
                    heading={strings.plannedSectionHeading}
                >
                    <ListView layout="block">
                        <Heading level={5}>
                            {strings.eapPlannedSectionHeading}
                        </Heading>
                        <TextOutput
                            label={strings.plannedSectionCriteriaIntroduction1}
                            value={(
                                <ul>
                                    <li>{strings.plannedSectionCriteriaComment11}</li>
                                    <li>{strings.plannedSectionCriteriaComment12}</li>
                                </ul>
                            )}
                            strongLabel
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.plannedSectionCriteriaIntroduction2}
                            value={(
                                <ul>
                                    <li>{strings.plannedSectionCriteriaComment21}</li>
                                    <li>{strings.plannedSectionCriteriaComment22}</li>
                                    <li>{strings.plannedSectionCriteriaComment23}</li>
                                </ul>
                            )}
                            strongLabel
                            withoutLabelColon
                        />
                        <Heading level={5}>
                            {strings.monitoringSectionCriteriaHeading}
                        </Heading>
                        <TextOutput
                            label={strings.plannedSectionCriteriaIntroduction3}
                            value={(
                                <ul>
                                    <li>{strings.plannedSectionCriteriaComment31}</li>
                                    <li>{strings.plannedSectionCriteriaComment32}</li>
                                </ul>
                            )}
                            strongLabel
                            withoutLabelColon
                        />
                    </ListView>
                </Modal>
            )}
        </TabPage>
    );
}

export default PlannedOperations;
