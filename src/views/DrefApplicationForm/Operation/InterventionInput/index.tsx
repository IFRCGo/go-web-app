import { useCallback, useMemo } from 'react';
import {
    randomString,
    isDefined,
} from '@togglecorp/fujs';
import {
    ArrayError,
    useFormObject,
    getErrorObject,
    useFormArray,
    SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';

import TextArea from '#components/TextArea';
import Button from '#components/Button';
import NumberInput from '#components/NumberInput';
import InputSection from '#components/InputSection';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import { PartialDref } from '../../schema';
import IndicatorInput from './IndicatorInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
type IndicatorFormFields = NonNullable<PlannedInterventionFormFields['indicators']>[number];

const defaultInterventionValue: PlannedInterventionFormFields = {
    client_id: randomString(),
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
}

function InterventionInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        titleMap,
    } = props;

    const interventionLabel = useMemo(() => (
        isDefined(value.title) ? titleMap?.[value.title] : undefined
    ), [titleMap, value]);

    const onFieldChange = useFormObject(index, onChange, defaultInterventionValue);
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

    // FIXME: work on styling
    return (
        <InputSection
            className={styles.interventionInput}
            titleClassName={styles.titleContainer}
            title={(
                <>
                    <div className={styles.label}>
                        {interventionLabel}
                    </div>
                    <Button
                        name={index}
                        onClick={onRemove}
                        variant="tertiary"
                        title={strings.drefFormRemoveIntervention}
                    >
                        <DeleteBinTwoLineIcon />
                    </Button>
                </>
            )}
            multiRow={false}
            twoColumn
            normalDescription
            descriptionContainerClassName={styles.descriptionContainer}
            description={(
                <>
                    <NumberInput
                        label={strings.drefFormInterventionBudgetLabel}
                        name="budget"
                        value={value.budget}
                        onChange={onFieldChange}
                        error={error?.budget}
                    />
                    <NumberInput
                        label={strings.drefFormInterventionPersonTargetedLabel}
                        name="person_targeted"
                        value={value.person_targeted}
                        onChange={onFieldChange}
                        error={error?.person_targeted}
                    />
                </>
            )}
        >
            <TextArea
                label={strings.drefFormListOfActivities}
                name="description"
                value={value.description}
                onChange={onFieldChange}
                error={error?.description}
                autoBullets
            />
            <Container
                heading={strings.drefFormIndicatorsLabel}
                headingLevel={4}
                actions={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={handleIndicatorAddButtonClick}
                    >
                        {strings.drefAddIndicatorButtonLabel}
                    </Button>
                )}
            >
                {value?.indicators?.map(
                    (indicator, i) => (
                        <IndicatorInput
                            key={indicator.client_id}
                            index={i}
                            value={indicator}
                            onChange={onIndicatorChange}
                            onRemove={onIndicatorRemove}
                            error={getErrorObject(error?.indicators)}
                        />
                    ),
                )}
                {(!value || !value.indicators || value.indicators.length === 0) && (
                    <div className={styles.emptyMessage}>
                        {strings.drefFormNoIndicatorMessage}
                    </div>
                )}
            </Container>
        </InputSection>
    );
}

export default InterventionInput;
