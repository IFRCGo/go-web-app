import { useCallback } from 'react';
import {
    AddLineIcon,
    DeleteBinTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    ExpandableContainer,
    ListView,
    NumberInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
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

import OperationActivityInput from '#components/domain/OperationActivityInput';
import NonFieldError from '#components/NonFieldError';

import { type PartialSimplifiedEapType } from '../../schema';

import i18n from './i18n.json';

type PlannedOperationFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];
type EarlyActionFormFields = NonNullable<PlannedOperationFormFields['early_action_activities']>[number];
type PrepositioningFormFields = NonNullable<PlannedOperationFormFields['prepositioning_activities']>[number];
type ReadinessFormFields = NonNullable<PlannedOperationFormFields['readiness_activities']>[number];

const defaultOperationValue: PlannedOperationFormFields = {
    sector: 101,
};

interface Props {
    value: PlannedOperationFormFields;
    error: ArrayError<PlannedOperationFormFields> | undefined;
    onChange: (value: SetValueArg<PlannedOperationFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    operationTitle?: React.ReactNode;
}

function OperationsBySectorInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        operationTitle,
    } = props;

    const strings = useTranslation(i18n);
    const onFieldChange = useFormObject(index, onChange, defaultOperationValue);

    const error = (value && value.sector && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.sector])
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
            heading={operationTitle ?? '--'}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="action"
                    disabled={disabled}
                    title={strings.operationRemoveButton}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            )}
            withPadding
            withBackground
            initiallyExpanded
            withHeaderBorder
            // FIXME: add non field error and error indicator
        >
            <ListView layout="block">
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                >
                    <NumberInput
                        label={strings.operationPeopleTargeted}
                        name="people_targeted"
                        value={value?.people_targeted}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.people_targeted}
                    />
                    <NumberInput
                        label={strings.operationBudget}
                        name="budget_per_sector"
                        value={value?.budget_per_sector}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.budget_per_sector}
                    />
                    <NumberInput
                        label={strings.operationApCode}
                        name="ap_code"
                        value={value?.ap_code}
                        onChange={onFieldChange}
                        disabled={disabled}
                        error={error?.ap_code}
                    />
                </ListView>
                <ListView
                    layout="block"
                    spacing="2xs"
                    // FIXME: following can be converted into a component and reused
                >
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={strings.operationReadinessActivities}
                        headingLevel={5}
                        footerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handleReadinessAddButtonClick}
                                spacing="sm"
                                disabled={disabled}
                                before={<AddLineIcon />}
                            >
                                {strings.operationAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.readiness_activities)
                            || value.readiness_activities.length === 0}
                        emptyMessage={strings.operationNoActivitiesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.readiness_activities)
                            }
                            />
                        )}
                    >
                        <ListView layout="block">
                            {value?.readiness_activities?.map((activity, i) => (
                                <OperationActivityInput
                                    key={activity.client_id}
                                    index={i}
                                    value={activity}
                                    onChange={onReadinessChange}
                                    onRemove={onReadinessRemove}
                                    error={getErrorObject(error?.readiness_activities)}
                                    disabled={disabled}
                                />
                            ))}
                        </ListView>
                    </Container>
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={strings.operationPrepositioningActivities}
                        headingLevel={5}
                        footerActions={(
                            <Button
                                name={undefined}
                                onClick={handlePrepositioningAddButtonClick}
                                disabled={disabled}
                                styleVariant="outline"
                                spacing="sm"
                                before={<AddLineIcon />}
                            >
                                {strings.operationAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.prepositioning_activities)
                            || value.prepositioning_activities.length === 0}
                        emptyMessage={strings.operationNoActivitiesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.prepositioning_activities)
                            }
                            />
                        )}
                    >
                        <ListView layout="block">
                            {value?.prepositioning_activities?.map((activity, i) => (
                                <OperationActivityInput
                                    key={activity.client_id}
                                    index={i}
                                    value={activity}
                                    onChange={onPrepositioningChange}
                                    onRemove={onPrepositioningRemove}
                                    error={getErrorObject(error?.prepositioning_activities)}
                                    disabled={disabled}
                                />
                            ))}
                        </ListView>
                    </Container>
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={strings.operationEarlyActionActivities}
                        headingLevel={5}
                        footerActions={(
                            <Button
                                name={undefined}
                                onClick={handleEarlyActionAddButtonClick}
                                disabled={disabled}
                                styleVariant="outline"
                                spacing="sm"
                                before={<AddLineIcon />}
                            >
                                {strings.operationAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.early_action_activities)
                            || value.early_action_activities.length === 0}
                        emptyMessage={strings.operationNoActivitiesMessage}
                        headerDescription={(
                            <NonFieldError error={getErrorObject(error?.early_action_activities)} />
                        )}
                    >
                        <ListView layout="block">
                            {value?.early_action_activities?.map((activity, i) => (
                                <OperationActivityInput
                                    key={activity.client_id}
                                    index={i}
                                    value={activity}
                                    onChange={onEarlyActionChange}
                                    onRemove={onEarlyActionRemove}
                                    error={getErrorObject(error?.early_action_activities)}
                                    disabled={disabled}
                                />
                            ))}
                        </ListView>
                    </Container>
                </ListView>
            </ListView>
        </ExpandableContainer>
    );
}

export default OperationsBySectorInput;
