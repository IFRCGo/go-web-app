import { useCallback } from 'react';
import {
    randomString,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    useFormObject,
    getErrorObject,
    useFormArray,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';

import TextArea from '#components/TextArea';
import Button from '#components/Button';
import NumberInput from '#components/NumberInput';
import InputSection from '#components/InputSection';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import { type PartialDref } from '../../schema';
import IndicatorInput from './IndicatorInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
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
            className={styles.interventionInput}
            titleClassName={styles.titleContainer}
            title={interventionLabel ?? '--'}
            numPreferredColumns={1}
            descriptionContainerClassName={styles.descriptionContainer}
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
                    {/* FIXME: use translation */}
                    Remove Intervention
                </Button>
            </div>
            <TextArea
                label={strings.drefFormListOfActivities}
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
                disabled={disabled}
                autoBullets
            />
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
