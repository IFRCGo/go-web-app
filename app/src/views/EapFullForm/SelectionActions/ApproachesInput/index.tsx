import { useCallback } from 'react';
import {
    AddLineIcon,
    DeleteBinTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    ExpandableContainer,
    InfoPopup,
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

import { type PartialEapFullFormType } from '../../schema';
import IndicatorInput from '../IndicatorInput';

import i18n from './i18n.json';

type EnableApproachesFormFields = NonNullable<PartialEapFullFormType['enabling_approaches']>[number];
type EarlyActionFormFields = NonNullable<EnableApproachesFormFields['early_action_activities']>[number];
type PrepositioningFormFields = NonNullable<EnableApproachesFormFields['prepositioning_activities']>[number];
type ReadinessFormFields = NonNullable<EnableApproachesFormFields['readiness_activities']>[number];
type IndicatorFormFields = NonNullable<EnableApproachesFormFields['indicators']>[number];

const defaultApproachValue: EnableApproachesFormFields = {
    approach: 10,
};

interface Props {
    value: EnableApproachesFormFields;
    error: ArrayError<EnableApproachesFormFields> | undefined;
    onChange: (value: SetValueArg<EnableApproachesFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    approachTitle?: React.ReactNode;
    readOnly?: boolean;
}

function ApproachesInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        approachTitle,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const onFieldChange = useFormObject(index, onChange, defaultApproachValue);

    const error = (value && value.approach && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.approach])
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

    const {
        setValue: onIndicatorChange,
        removeValue: onIndicatorRemove,
    } = useFormArray<'indicators', IndicatorFormFields>(
        'indicators' as const,
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

    const handleIndicatorAddButtonClick = useCallback(
        () => {
            const newIndicator: IndicatorFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: IndicatorFormFields[] | undefined) => (
                    [...(oldValue ?? []), newIndicator]
                ),
                'indicators' as const,
            );
        },
        [onFieldChange],
    );

    return (
        <ExpandableContainer
            heading={approachTitle ?? '--'}
            headerActions={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="action"
                    title={strings.approachRemoveButton}
                    disabled={disabled || readOnly}
                >
                    <DeleteBinTwoLineIcon />
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
                        readOnly={readOnly}
                        error={error?.budget_per_approach}
                    />
                    <NumberInput
                        label={strings.approachApCode}
                        name="ap_code"
                        value={value?.ap_code}
                        onChange={onFieldChange}
                        disabled={disabled}
                        readOnly={readOnly}
                        error={error?.ap_code}
                    />
                </ListView>
                <ListView
                    layout="block"
                    spacing="2xs"
                >
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        withCompactMessage
                        headingLevel={6}
                        heading={strings.approachIndicators}
                        footerActions={(
                            <Button
                                name={undefined}
                                onClick={handleIndicatorAddButtonClick}
                                spacing="sm"
                                disabled={disabled || readOnly}
                                before={<AddLineIcon />}
                            >
                                {strings.approachAddIndicatorsButtonLabel}
                            </Button>
                        )}
                        empty={isNotDefined(value.indicators) || value.indicators.length === 0}
                        emptyMessage={strings.approachNoIndicatorsMessage}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.indicators)}
                        />
                        <ListView layout="block">
                            {value.indicators?.map((indicator, i) => (
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
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={(
                            <>
                                {strings.approachReadinessActivities}
                                <InfoPopup
                                    description={strings.approachReadinessActivitiesDescription}
                                />
                            </>
                        )}
                        headingLevel={5}
                        footerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handleReadinessAddButtonClick}
                                disabled={disabled || readOnly}
                                spacing="sm"
                                before={<AddLineIcon />}
                            >
                                {strings.approachAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.readiness_activities)
                            || value.readiness_activities.length === 0}
                        emptyMessage={strings.approachNoActivitiesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.readiness_activities)
                            }
                            />
                        )}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.readiness_activities)}
                        />
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
                                    readOnly={readOnly}
                                />
                            ))}
                        </ListView>
                    </Container>
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={(
                            <>
                                {strings.approachPrepositioningActivities}
                                <InfoPopup
                                    description={
                                        strings.approachPrepositioningActivitiesDescription
                                    }
                                />
                            </>
                        )}
                        headingLevel={5}
                        footerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handlePrepositioningAddButtonClick}
                                disabled={disabled || readOnly}
                                spacing="sm"
                                before={<AddLineIcon />}
                            >
                                {strings.approachAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.prepositioning_activities)
                            || value.prepositioning_activities.length === 0}
                        emptyMessage={strings.approachNoActivitiesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.prepositioning_activities)
                            }
                            />
                        )}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.prepositioning_activities)}
                        />
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
                                    readOnly={readOnly}
                                />
                            ))}
                        </ListView>
                    </Container>
                    <Container
                        spacing="sm"
                        withDarkBackground
                        withHeaderBorder
                        withPadding
                        heading={(
                            <>
                                {strings.approachEarlyActionActivities}
                                <InfoPopup
                                    description={strings.approachEarlyActionActivitiesDescription}
                                />
                            </>
                        )}
                        headingLevel={5}
                        footerActions={(
                            <Button
                                styleVariant="outline"
                                name={undefined}
                                onClick={handleEarlyActionAddButtonClick}
                                disabled={disabled || readOnly}
                                spacing="sm"
                                before={<AddLineIcon />}
                            >
                                {strings.approachAddActivityButton}
                            </Button>
                        )}
                        withCompactMessage
                        empty={isNotDefined(value.early_action_activities)
                            || value.early_action_activities.length === 0}
                        emptyMessage={strings.approachNoActivitiesMessage}
                        headerDescription={(
                            <NonFieldError error={
                                getErrorObject(error?.early_action_activities)
                            }
                            />
                        )}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.early_action_activities)}
                        />
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
                                    readOnly={readOnly}
                                />
                            ))}
                        </ListView>
                    </Container>
                </ListView>
            </ListView>
        </ExpandableContainer>
    );
}

export default ApproachesInput;
