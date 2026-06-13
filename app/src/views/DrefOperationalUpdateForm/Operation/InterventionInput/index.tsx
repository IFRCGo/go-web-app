import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    InlineLayout,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialOpsUpdate } from '../../schema';
import IndicatorInput from './IndicatorInput';

import i18n from './i18n.json';

type PlannedInterventionFormFields = NonNullable<PartialOpsUpdate['planned_interventions']>[number];
type IndicatorFormFields = NonNullable<PlannedInterventionFormFields['indicators']>[number];

const defaultInterventionValue: PlannedInterventionFormFields = {
    client_id: '-1',
};

interface Props {
    value: PlannedInterventionFormFields;
    error: ArrayError<PlannedInterventionFormFields> | undefined;
    onChange: (
        value: SetValueArg<PlannedInterventionFormFields>,
        index: number,
    ) => void;
    onRemove: (index: number) => void;
    index: number;
    titleMap: Record<string, string> | undefined;
    readOnly?: boolean;
    disabled?: boolean;
}

function InterventionInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        titleMap,
        readOnly,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, defaultInterventionValue);

    const interventionLabel = isDefined(value.title)
        ? titleMap?.[value.title]
        : undefined;

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const {
        setValue: onIndicatorChange,
        removeValue: onIndicatorRemove,
    } = useFormArray<'indicators', IndicatorFormFields>(
        'indicators' as const,
        onFieldChange,
    );

    const handleIndicatorAddButtonClick = useCallback(
        () => {
            const newIndicatorItem: IndicatorFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: IndicatorFormFields[] | undefined) => (
                    [...(oldValue ?? []), newIndicatorItem]
                ),
                'indicators' as const,
            );
        },
        [onFieldChange],
    );

    return (
        <InputSection
            title={interventionLabel ?? '--'}
            numPreferredColumns={1}
            description={(
                <>
                    <NumberInput
                        label={strings.drefFormInterventionBudgetLabel}
                        name="budget"
                        value={value.budget}
                        onChange={onFieldChange}
                        error={error?.budget}
                        disabled={disabled}
                        readOnly={readOnly}
                        withAsterisk
                    />
                    <NumberInput
                        label={strings.drefFormInterventionPersonTargetedLabel}
                        name="person_targeted"
                        value={value.person_targeted}
                        onChange={onFieldChange}
                        error={error?.person_targeted}
                        disabled={disabled}
                        readOnly={readOnly}
                        withAsterisk
                    />
                    <NumberInput
                        label={strings.drefOperationalUpdateIndicatorMaleLabel}
                        name="male"
                        value={value.male}
                        onChange={onFieldChange}
                        error={error?.male}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.drefOperationalUpdateIndicatorFemaleLabel}
                        name="female"
                        value={value.female}
                        onChange={onFieldChange}
                        error={error?.female}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                </>
            )}
        >
            <InlineLayout
                after={(
                    <Button
                        name={index}
                        onClick={onRemove}
                        variant="tertiary"
                        title={strings.drefFormRemoveIntervention}
                        disabled={disabled}
                        readOnly={readOnly}
                        before={<DeleteBinTwoLineIcon />}
                    >
                        {strings.drefOperationalUpdateFormRemoveIntervention}
                    </Button>
                )}
            />
            <NonFieldError error={error} />
            <TextArea
                label={strings.drefFormListOfActivities}
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
                readOnly={readOnly}
                disabled={disabled}
                autoBullets
            />
            <TextArea
                label={strings.drefOperationalUpdateProgressTowardsOutcome}
                name="progress_towards_outcome"
                value={value.progress_towards_outcome}
                onChange={onFieldChange}
                error={error?.progress_towards_outcome}
                disabled={disabled}
                readOnly={readOnly}
            />
            <Container
                heading={strings.drefFormIndicatorsLabel}
                headingLevel={5}
                footerIcons={(
                    <Button
                        name={undefined}
                        onClick={handleIndicatorAddButtonClick}
                        disabled={disabled || readOnly}
                    >
                        {strings.drefAddIndicatorButtonLabel}
                    </Button>
                )}
                empty={isNotDefined(value.indicators) || value.indicators.length === 0}
                emptyMessage={strings.drefFormNoIndicatorMessage}
            >
                <ListView layout="block">
                    <NonFieldError error={getErrorObject(error?.indicators)} />
                    {value?.indicators?.map((indicator, i) => (
                        <IndicatorInput
                            key={indicator.client_id}
                            index={i}
                            value={indicator}
                            onChange={onIndicatorChange}
                            onRemove={onIndicatorRemove}
                            error={getErrorObject(error?.indicators)}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    ))}
                </ListView>
            </Container>
        </InputSection>
    );
}

export default InterventionInput;
