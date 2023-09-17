import { useCallback } from 'react';
import {
    useFormObject,
    getErrorObject,
    type SetValueArg,
    type Error,
} from '@togglecorp/toggle-form';
import {
    _cs,
    randomString,
    isDefined,
    isTruthy,
} from '@togglecorp/fujs';

import { DeleteBinLineIcon } from '@ifrc-go/icons';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';
import NonFieldError from '#components/NonFieldError';
import Button from '#components/Button';

import { type PartialAnnualType } from '../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

function updateTargetTotal(oldValue: PartialAnnualType): PartialAnnualType {
    if (
        isTruthy(oldValue?.target_male)
        || isTruthy(oldValue?.target_female)
        || isTruthy(oldValue?.target_other)
    ) {
        const total = (oldValue.target_male ?? 0)
            + (oldValue.target_female ?? 0)
            + (oldValue.target_other ?? 0);
        return {
            ...oldValue,
            target_total: total,
        };
    }
    return oldValue;
}
function updateReachedTotal(oldValue: PartialAnnualType): PartialAnnualType {
    if (
        isTruthy(oldValue?.reached_male)
        || isTruthy(oldValue?.reached_female)
        || isTruthy(oldValue?.reached_other)
    ) {
        const total = (oldValue.reached_male ?? 0)
            + (oldValue.reached_female ?? 0)
            + (oldValue.reached_other ?? 0);
        return {
            ...oldValue,
            reached_total: total,
        };
    }
    return oldValue;
}

interface Props {
    className?: string;
    onChange: (value: SetValueArg<PartialAnnualType>, index: number) => void;
    onRemove: (index: number) => void;
    error: Error<PartialAnnualType> | undefined;
    index: number;
    value: PartialAnnualType;
    disabled?: boolean;
}

function AnnualSplitInput(props: Props) {
    const {
        className,
        onChange,
        error: errorFromProps,
        index,
        value,
        onRemove,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({ client_id: randomString() }),
    );

    const error = getErrorObject(errorFromProps);

    const handleTargetMaleChange = useCallback((newTarget: number | undefined) => {
        onChange((oldValue) => (
            updateTargetTotal({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                target_male: newTarget,
            })
        ), index);
    }, [onChange, index]);

    const handleTargetFemaleChange = useCallback((newTarget: number | undefined) => {
        onChange((oldValue) => (
            updateTargetTotal({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                target_female: newTarget,
            })
        ), index);
    }, [onChange, index]);

    const handleTargetOtherChange = useCallback((newTarget: number | undefined) => {
        onChange((oldValue) => (
            updateTargetTotal({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                target_other: newTarget,
            })
        ), index);
    }, [onChange, index]);

    const handleReachedMaleChange = useCallback((newReached: number | undefined) => {
        onChange((oldValue) => (
            updateReachedTotal({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                reached_male: newReached,
            })
        ), index);
    }, [onChange, index]);

    const handleReachedFemaleChange = useCallback((newReached: number | undefined) => {
        onChange((oldValue) => (
            updateReachedTotal({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                reached_female: newReached,
            })
        ), index);
    }, [onChange, index]);

    const handleReachedOtherChange = useCallback((newReached: number | undefined) => {
        onChange((oldValue) => (
            updateReachedTotal({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                reached_other: newReached,
            })
        ), index);
    }, [onChange, index]);

    const shouldDisableReachedTotal = isDefined(value.reached_male)
        || isDefined(value.reached_female)
        || isDefined(value.reached_other);

    const shouldDisableTargetTotal = isDefined(value.target_male)
        || isDefined(value.target_female)
        || isDefined(value.target_other);

    return (
        <div className={_cs(styles.annualSplitInput, className)}>
            <NonFieldError error={error} />
            <div className="break" />
            <span className={styles.bold}>
                <NumberInput
                    label={strings.threeWYear}
                    name="year"
                    value={value?.year}
                    onChange={setFieldValue}
                    error={error?.year}
                    disabled={disabled}
                    withAsterisk
                />
            </span>
            <NumberInput
                label={strings.threeWBudgetAmount}
                name="budget_amount"
                value={value?.budget_amount}
                onChange={setFieldValue}
                error={error?.budget_amount}
                disabled={disabled}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="secondary"
                // FIXME: use translations
                title="Delete Annual Split"
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </Button>
            <div className="break" />
            <NumberInput
                label={strings.threeWTargetMale}
                name="target_male"
                value={value?.target_male}
                onChange={handleTargetMaleChange}
                error={error?.target_male}
                disabled={disabled}
            />
            <NumberInput
                label={strings.threeWTargetFemale}
                name="target_female"
                value={value?.target_female}
                onChange={handleTargetFemaleChange}
                error={error?.target_female}
                disabled={disabled}
            />
            <NumberInput
                label={strings.threeWTargetOther}
                name="target_other"
                value={value?.target_other}
                onChange={handleTargetOtherChange}
                error={error?.target_other}
                disabled={disabled}
            />
            <span className={styles.bold}>
                <NumberInput
                    label={strings.threeWTargetTotal + (shouldDisableTargetTotal ? '' : '*')}
                    name="target_total"
                    value={value?.target_total}
                    onChange={setFieldValue}
                    disabled={shouldDisableTargetTotal || disabled}
                    error={error?.target_total}
                    withAsterisk
                />
            </span>
            <NumberInput
                label={strings.threeWReachedMale}
                name="reached_male"
                value={value?.reached_male}
                onChange={handleReachedMaleChange}
                error={error?.reached_male}
                disabled={disabled}
            />
            <NumberInput
                label={strings.threeWReachedFemale}
                name="reached_female"
                value={value?.reached_female}
                onChange={handleReachedFemaleChange}
                error={error?.reached_female}
                disabled={disabled}
            />
            <NumberInput
                label={strings.threeWReachedOther}
                name="reached_other"
                value={value?.reached_other}
                onChange={handleReachedOtherChange}
                error={error?.reached_other}
                disabled={disabled}
            />
            <span className={styles.bold}>
                <NumberInput
                    label={strings.threeWReachedTotal + (shouldDisableReachedTotal ? '' : '*')}
                    name="reached_total"
                    value={value?.reached_total}
                    onChange={setFieldValue}
                    disabled={shouldDisableReachedTotal || disabled}
                    error={error?.reached_total}
                    withAsterisk
                />
            </span>
        </div>
    );
}

export default AnnualSplitInput;
