import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    InputSection,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialFinalReport } from '../../schema';
import IndicatorInput from './IndicatorInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedInterventionFormFields = NonNullable<PartialFinalReport['planned_interventions']>[number];
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
    readOnly: boolean;
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
    } = useFormArray<'indicators', IndicatorFormFields>(
        'indicators' as const,
        onFieldChange,
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
                        label={strings.drefFormInterventionPersonAssistedLabel}
                        name="person_assisted"
                        value={value.person_assisted}
                        onChange={onFieldChange}
                        error={error?.person_assisted}
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
            <div className={styles.action}>
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="action"
                    title={strings.drefFormRemoveIntervention}
                    disabled={disabled || readOnly}
                    before={<DeleteBinTwoLineIcon />}
                >
                    {strings.drefFinalReportRemoveIntervention}
                </Button>
            </div>
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
                label={strings.finalReportPlannedInterventionNarrativeAchievement}
                name="narrative_description_of_achievements"
                value={value.narrative_description_of_achievements}
                onChange={onFieldChange}
                error={error?.narrative_description_of_achievements}
                disabled={disabled}
                readOnly={readOnly}
                autoBullets
            />
            <TextArea
                label={strings.finalReportPlannedInterventionLessonsLearnt}
                name="lessons_learnt"
                value={value.lessons_learnt}
                onChange={onFieldChange}
                error={error?.lessons_learnt}
                disabled={disabled}
                readOnly={readOnly}
                autoBullets
            />
            <TextArea
                label={strings.finalReportPlannedInterventionChallenges}
                name="challenges"
                value={value.challenges}
                onChange={onFieldChange}
                error={error?.challenges}
                disabled={disabled}
                readOnly={readOnly}
                autoBullets
            />
            <Container
                heading={strings.drefFormIndicatorsLabel}
                headingLevel={5}
            >
                <NonFieldError error={getErrorObject(error?.indicators)} />
                {value?.indicators?.map((indicator, i) => (
                    <IndicatorInput
                        key={indicator.client_id}
                        index={i}
                        value={indicator}
                        onChange={onIndicatorChange}
                        error={getErrorObject(error?.indicators)}
                        disabled={disabled}
                        readOnly={readOnly}
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
