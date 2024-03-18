import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    InputSection,
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
import { TYPE_IMMINENT } from '#views/DrefApplicationForm/common';

import { type PartialDref } from '../../schema';
import EarlyActionsInput from './EarlyActionsInput';
import EarlyResponseInput from './EarlyResponseInput';
import IndicatorInput from './IndicatorInput';
import ReadinessInput from './ReadinessInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
type IndicatorFormFields = NonNullable<PlannedInterventionFormFields['indicators']>[number];
type ReadinessFormFields = NonNullable<PlannedInterventionFormFields['readiness_block']>[number];
type EarlyActionsFormFields = NonNullable<PlannedInterventionFormFields['early_action_block']>[number];
type EarlyResponseFormFields = NonNullable<PlannedInterventionFormFields['early_response_block']>[number];

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
    disabled?: boolean;
    drefType: number | undefined;
}

function InterventionInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        titleMap,
        disabled,
        drefType,
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
        setValue: onReadinessChange,
        removeValue: onReadinessRemove,
    } = useFormArray<'readiness_block', ReadinessFormFields>(
        'readiness_block' as const,
        onFieldChange,
    );

    const {
        setValue: onEarlyActionsChange,
        removeValue: onEarlyActionsRemove,
    } = useFormArray<'early_action_block', EarlyActionsFormFields>(
        'early_action_block' as const,
        onFieldChange,
    );

    const {
        setValue: onEarlyResponseChange,
        removeValue: onEarlyResponseRemove,
    } = useFormArray<'early_response_block', EarlyActionsFormFields>(
        'early_response_block' as const,
        onFieldChange,
    );

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

    const handleReadinessAddButtonClick = useCallback(
        () => {
            const newReadinessItem: ReadinessFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: ReadinessFormFields[] | undefined) => (
                    [...(oldValue ?? []), newReadinessItem]
                ),
                'readiness_block' as const,
            );
        },
        [onFieldChange],
    );

    const handleEarlyActionsAddButtonClick = useCallback(
        () => {
            const newEarlyActionsItem: EarlyActionsFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: EarlyActionsFormFields[] | undefined) => (
                    [...(oldValue ?? []), newEarlyActionsItem]
                ),
                'early_action_block' as const,
            );
        },
        [onFieldChange],
    );

    const handleEarlyResponseAddButtonClick = useCallback(
        () => {
            const newEarlyResponseItem: EarlyResponseFormFields = {
                client_id: randomString(),
            };

            onFieldChange(
                (oldValue: EarlyResponseFormFields[] | undefined) => (
                    [...(oldValue ?? []), newEarlyResponseItem]
                ),
                'early_response_block' as const,
            );
        },
        [onFieldChange],
    );

    return (
        <InputSection
            className={styles.interventionInput}
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
                    />
                    {drefType === TYPE_IMMINENT && (
                        <>
                            <NumberInput
                                label={strings.drefFormPeopleTargetedEarlyActionLabel}
                                name="people_targeted_by_early_action"
                                value={value.people_targeted_by_early_action}
                                onChange={onFieldChange}
                                error={error?.people_targeted_by_early_action}
                                disabled={disabled}
                            />
                            <NumberInput
                                label={strings.drefFormPeopleTargetedImmediateResponse}
                                name="people_targeted_by_immediate_response"
                                value={value.people_targeted_by_immediate_response}
                                onChange={onFieldChange}
                                error={error?.people_targeted_by_immediate_response}
                                disabled={disabled}
                            />
                        </>
                    )}
                    <NumberInput
                        label={strings.drefFormInterventionPersonTargetedLabel}
                        name="person_targeted"
                        value={value.person_targeted}
                        onChange={onFieldChange}
                        error={error?.person_targeted}
                        disabled={disabled}
                    />
                </>
            )}
        >
            <div className={styles.action}>
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                    title={strings.drefFormRemoveIntervention}
                    disabled={disabled}
                    icons={<DeleteBinTwoLineIcon />}
                >
                    {strings.drefFormRemoveIntervention}
                </Button>
            </div>
            <NonFieldError error={error} />
            <Container
                heading={strings.drefFormEarlyActionsLabel}
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleEarlyActionsAddButtonClick}
                        disabled={disabled}
                    >
                        {strings.drefAddActivitiesButtonLabel}
                    </Button>
                )}
            >
                <NonFieldError error={getErrorObject(error?.readiness_block)} />
                {value?.early_action_block?.map((early, i) => (
                    <EarlyActionsInput
                        key={early.client_id}
                        index={i}
                        value={early}
                        onChange={onEarlyActionsChange}
                        onRemove={onEarlyActionsRemove}
                        error={getErrorObject(error?.early_action_block)}
                        disabled={disabled}
                    />
                ))}
                {(
                    isNotDefined(value.early_action_block)
                    || value.early_action_block.length === 0
                ) && (
                    <div className={styles.emptyMessage}>
                        {strings.drefFormNoActivitiesMessage}
                    </div>
                )}
            </Container>
            <Container
                heading={strings.drefFormEarlyResponseLabel}
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleEarlyResponseAddButtonClick}
                        disabled={disabled}
                    >
                        {strings.drefAddActivitiesButtonLabel}
                    </Button>
                )}
            >
                <NonFieldError error={getErrorObject(error?.early_response_block)} />
                {value?.early_response_block?.map((response, i) => (
                    <EarlyResponseInput
                        key={response.client_id}
                        index={i}
                        value={response}
                        onChange={onEarlyResponseChange}
                        onRemove={onEarlyResponseRemove}
                        error={getErrorObject(error?.early_response_block)}
                        disabled={disabled}
                    />
                ))}
                {(
                    isNotDefined(value.early_response_block)
                    || value.early_response_block.length === 0
                ) && (
                    <div className={styles.emptyMessage}>
                        {strings.drefFormNoActivitiesMessage}
                    </div>
                )}
            </Container>
            <Container
                heading={strings.drefFormReadinessLabel}
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleReadinessAddButtonClick}
                        disabled={disabled}
                    >
                        {strings.drefAddActivitiesButtonLabel}
                    </Button>
                )}
            >
                <NonFieldError error={getErrorObject(error?.readiness_block)} />
                {value?.readiness_block?.map((readiness, i) => (
                    <ReadinessInput
                        key={readiness.client_id}
                        index={i}
                        value={readiness}
                        onChange={onReadinessChange}
                        onRemove={onReadinessRemove}
                        error={getErrorObject(error?.readiness_block)}
                        disabled={disabled}
                    />
                ))}
                {(
                    isNotDefined(value.readiness_block)
                    || value.readiness_block.length === 0
                ) && (
                    <div className={styles.emptyMessage}>
                        {strings.drefFormNoActivitiesMessage}
                    </div>
                )}
            </Container>
            <Container
                heading={strings.drefFormIndicatorsLabel}
                headingLevel={5}
                footerIcons={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleIndicatorAddButtonClick}
                        disabled={disabled}
                    >
                        {strings.drefAddIndicatorButtonLabel}
                    </Button>
                )}
            >
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
                    />
                ))}
                {(isNotDefined(value.indicators) || value.indicators.length === 0) && (
                    <div className={styles.emptyMessage}>
                        {strings.drefFormNoIndicatorMessage}
                    </div>
                )}
            </Container>
        </InputSection>
    );
}

export default InterventionInput;
