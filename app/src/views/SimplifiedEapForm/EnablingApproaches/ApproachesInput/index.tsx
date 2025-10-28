import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    ExpandableContainer,
    ListView,
    NumberInput,
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

import { type PartialSimplifiedEapType } from '../../schema';
import ActivityInput from './ActivityInput';

import i18n from './i18n.json';

type EnableApproachesFormFields = NonNullable<PartialSimplifiedEapType['enable_approaches']>[number];
type EarlyActionFormFields = NonNullable<EnableApproachesFormFields['early_action_activities']>[number];
type PrepositioningFormFields = NonNullable<EnableApproachesFormFields['prepositioning_activities']>[number];
type ReadinessFormFields = NonNullable<EnableApproachesFormFields['readiness_activities']>[number];

const defaultApproachValue: EnableApproachesFormFields = {
    client_id: '-1',
};

interface Props {
    value: EnableApproachesFormFields;
    error: ArrayError<EnableApproachesFormFields> | undefined;
    onChange: (value: SetValueArg<EnableApproachesFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    titleMap: Record<string, string> | undefined;
}

function OperationsBySectorInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        titleMap,
    } = props;

    const strings = useTranslation(i18n);
    const onFieldChange = useFormObject(index, onChange, defaultApproachValue);

    const approachLabel = isDefined(value.title)
        ? titleMap?.[value.title]
        : undefined;

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
    } = useFormArray<'prepositioning_activities', PrepositioningFormFields>(
        'prepositioning_activities' as const,
        onFieldChange,
    );
    const {
        setValue: onReadinessChange,
        removeValue: onReadinessRemove,
    } = useFormArray<'readiness_activities', ReadinessFormFields>(
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
            const newActionItem: PrepositioningFormFields = {
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
            const newActionItem: ReadinessFormFields = {
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

    return (
        <ExpandableContainer
            heading={approachLabel ?? '--'}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="outline"
                    title="Button"
                    disabled={disabled}
                    before={<DeleteBinTwoLineIcon />}
                >
                    {strings.approachRemoveButton}
                </Button>
            )}
            withPadding
            withBackground
            initiallyExpanded
        >
            <ListView layout="block">
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                >
                    <NumberInput
                        label={strings.approachBudget}
                        name="budget_per_approach"
                        value={value?.budget_per_approach}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.budget_per_approach}
                    />
                    <NumberInput
                        label={strings.approachApCode}
                        name="ap_code"
                        value={value?.ap_code}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.ap_code}
                    />
                    <NumberInput
                        label={strings.approachIndicatorTarget}
                        name="indicator_target"
                        value={value?.indicator_target}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.indicator_target}
                    />
                </ListView>
                <ListView layout="block">
                    <Container
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={strings.approachReadinessActivities}
                        headingLevel={5}
                        headerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handleReadinessAddButtonClick}
                                disabled={disabled}
                            >
                                {strings.approachAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.readiness_activities)
                            || value.readiness_activities.length === 0}
                        emptyMessage={strings.approachNoActivitesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.readiness_activities)
                            }
                            />
                        )}
                    >
                        {value?.readiness_activities?.map((activity, i) => (
                            <ActivityInput
                                key={activity.client_id}
                                index={i}
                                value={activity}
                                onChange={onReadinessChange}
                                onRemove={onReadinessRemove}
                                error={getErrorObject(error?.readiness_activities)}
                                disabled={disabled}
                            />
                        ))}
                    </Container>
                    <Container
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={strings.approachPrepositioningActivities}
                        headingLevel={5}
                        headerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handlePrepositioningAddButtonClick}
                                disabled={disabled}
                            >
                                {strings.approachAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.prepositioning_activities)
                            || value.prepositioning_activities.length === 0}
                        emptyMessage={strings.approachNoActivitesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.prepositioning_activities)
                            }
                            />
                        )}
                    >
                        {value?.prepositioning_activities?.map((activity, i) => (
                            <ActivityInput
                                key={activity.client_id}
                                index={i}
                                value={activity}
                                onChange={onPrepositioningChange}
                                onRemove={onPrepositioningRemove}
                                error={getErrorObject(error?.prepositioning_activities)}
                                disabled={disabled}
                            />
                        ))}
                    </Container>
                    <Container
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={strings.approachEarlyActionActivities}
                        headingLevel={5}
                        headerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handleEarlyActionAddButtonClick}
                                disabled={disabled}
                            >
                                {strings.approachAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.early_action_activities)
                            || value.early_action_activities.length === 0}
                        emptyMessage={strings.approachNoActivitesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.early_action_activities)
                            }
                            />
                        )}
                    >
                        {value?.early_action_activities?.map((activity, i) => (
                            <ActivityInput
                                key={activity.client_id}
                                index={i}
                                value={activity}
                                onChange={onEarlyActionChange}
                                onRemove={onEarlyActionRemove}
                                error={getErrorObject(error?.early_action_activities)}
                                disabled={disabled}
                            />
                        ))}
                    </Container>
                </ListView>
            </ListView>
        </ExpandableContainer>
    );
}

export default OperationsBySectorInput;
