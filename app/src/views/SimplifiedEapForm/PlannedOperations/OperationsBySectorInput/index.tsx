import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    InputSection,
    NumberInput,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialSimplifiedEapType } from '../../schema';
import ActivityInput from './ActivityInput';

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];
type EarlyActionFormFields = NonNullable<PlannedOperationFormFields['early_action_activities']>[number];
type PrepositioningFormFields = NonNullable<PlannedOperationFormFields['prepositioning_activities']>[number];
type ReadinessFormFields = NonNullable<PlannedOperationFormFields['readiness_activities']>[number];

const defaultOperationValue: PlannedOperationFormFields = {
    client_id: '-1',
};

interface Props {
    value: PlannedOperationFormFields;
    error: ArrayError<PlannedOperationFormFields> | undefined;
    onChange: (value: SetValueArg<PlannedOperationFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    sectorTitle?: string | undefined;
}

function OperationsBySectorInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        sectorTitle,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultOperationValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const {
        setValue: onEarlyActionChange,
        removeValue: onEarlyActionRemove,
    } = useFormArray<'early_action_activities', EarlyActionFormFields>(
        'early_action_activities' as const,
        onFieldChange,
    );
    const {
        setValue: onPrepositioningChange,
        removeValue: onPrepositioningRemove,
    } = useFormArray<'prepositioning_activities', EarlyActionFormFields>(
        'prepositioning_activities' as const,
        onFieldChange,
    );
    const {
        setValue: onReadinessChange,
        removeValue: onReadinessRemove,
    } = useFormArray<'readiness_activities', EarlyActionFormFields>(
        'readiness_activities' as const,
        onFieldChange,
    );

    const handleEarlyActionAddButtonClick = useCallback(
        () => {
            const newActionItem: EarlyActionFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: EarlyActionFormFields[] | undefined) => (
                    [...(oldValue ?? []), newActionItem]
                ),
                'early_action_activities' as const,
            );
        },
        [onFieldChange],
    );

    const handlePrepositioningAddButtonClick = useCallback(
        () => {
            const newActionItem: EarlyActionFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: PrepositioningFormFields[] | undefined) => (
                    [...(oldValue ?? []), newActionItem]
                ),
                'prepositioning_activities' as const,
            );
        },
        [onFieldChange],
    );

    const handleReadinessAddButtonClick = useCallback(
        () => {
            const newActionItem: EarlyActionFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: ReadinessFormFields[] | undefined) => (
                    [...(oldValue ?? []), newActionItem]
                ),
                'readiness_activities' as const,
            );
        },
        [onFieldChange],
    );

    console.log('value', value);
    return (
        <InputSection
            title={sectorTitle}
            description={(
                <>
                    <NumberInput
                        label="People Targeted"
                        name="people_targeted"
                        value={value?.people_targeted}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.people_targeted}
                    />
                    <NumberInput
                        label="Budget"
                        name="budget_per_sector"
                        value={value?.budget_per_sector}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.budget_per_sector}
                    />
                    <NumberInput
                        label="AP Code"
                        name="ap_code"
                        value={value?.ap_code}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.ap_code}
                    />
                </>
            )}
        >
            <Button
                name={index}
                onClick={onRemove}
                variant="tertiary"
                title="Button"
                disabled={disabled}
                icons={<DeleteBinTwoLineIcon />}
            >
                Remove
            </Button>
            <Container
                heading="Readiness Activities"
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleReadinessAddButtonClick}
                        disabled={disabled}
                    >
                        Add Activity
                    </Button>
                )}
            >
                <NonFieldError error={getErrorObject(error?.readiness_activities)} />
                {value?.readiness_activities?.map((indicator, i) => (
                    <ActivityInput
                        key={indicator.client_id}
                        index={i}
                        value={indicator}
                        onChange={onReadinessChange}
                        onRemove={onReadinessRemove}
                        error={getErrorObject(error?.readiness_activities)}
                        disabled={disabled}
                    />
                ))}
            </Container>
            <Container
                heading="Pre-positioning Activities"
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handlePrepositioningAddButtonClick}
                        disabled={disabled}
                    >
                        Add Activity
                    </Button>
                )}
            >
                <NonFieldError error={getErrorObject(error?.prepositioning_activities)} />
                {value?.prepositioning_activities?.map((indicator, i) => (
                    <ActivityInput
                        key={indicator.client_id}
                        index={i}
                        value={indicator}
                        onChange={onPrepositioningChange}
                        onRemove={onPrepositioningRemove}
                        error={getErrorObject(error?.prepositioning_activities)}
                        disabled={disabled}
                    />
                ))}
            </Container>
            <Container
                heading="Early Action Activities"
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleEarlyActionAddButtonClick}
                        disabled={disabled}
                    >
                        Add Activity
                    </Button>
                )}
            >
                <NonFieldError error={getErrorObject(error?.early_action_activities)} />
                {value?.early_action_activities?.map((indicator, i) => (
                    <ActivityInput
                        key={indicator.client_id}
                        index={i}
                        value={indicator}
                        onChange={onEarlyActionChange}
                        onRemove={onEarlyActionRemove}
                        error={getErrorObject(error?.early_action_activities)}
                        disabled={disabled}
                    />
                ))}
            </Container>
        </InputSection>
    );
}

export default OperationsBySectorInput;
