import { useCallback } from 'react';
import {
    useFormObject,
    getErrorObject,
    SetValueArg,
    Error,
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
import Button from '#components/Button';

import { PartialAnnualType } from '../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    onChange: (value: SetValueArg<PartialAnnualType>, index: number) => void;
    error: Error<PartialAnnualType> | undefined;
    index: number;
    value: PartialAnnualType;
    onRemove: (index: number) => void;
}

function AnnualSplitInput(props: Props) {
    const {
        className,
        onChange,
        error: errorFromProps,
        index,
        value,
        onRemove,
    } = props;

    const strings = useTranslation(i18n);

    const setFieldValue = useFormObject(index, onChange, { client_id: randomString() });
    const error = getErrorObject(errorFromProps);

    const handleTargetMaleChange = useCallback((newTarget: number | undefined) => {
        onChange((oldValue) => {
            let total = oldValue?.target_total;
            if (
                isTruthy(newTarget)
                || isTruthy(oldValue?.target_female)
                || isTruthy(oldValue?.target_other)
            ) {
                total = (newTarget ?? 0)
                + (oldValue?.target_female ?? 0)
                + (oldValue?.target_other ?? 0);
            }

            return ({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                target_total: total,
                target_male: newTarget,
            });
        }, index);
    }, [onChange, index]);

    const handleTargetFemaleChange = useCallback((newTarget: number | undefined) => {
        onChange((oldValue) => {
            let total = oldValue?.target_total;
            if (
                isTruthy(oldValue?.target_male)
                || isTruthy(newTarget)
                || isTruthy(oldValue?.target_other)
            ) {
                total = (oldValue?.target_male ?? 0)
                + (newTarget ?? 0)
                + (oldValue?.target_other ?? 0);
            }

            return ({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                target_total: total,
                target_female: newTarget,
            });
        }, index);
    }, [onChange, index]);

    const handleTargetOtherChange = useCallback((newTarget: number | undefined) => {
        onChange((oldValue) => {
            let total = oldValue?.target_total;
            if (
                isTruthy(oldValue?.target_male)
                || isTruthy(oldValue?.target_female)
                || isTruthy(newTarget)
            ) {
                total = (oldValue?.target_male ?? 0)
                + (oldValue?.target_female ?? 0)
                + (newTarget ?? 0);
            }

            return ({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                target_total: total,
                target_other: newTarget,
            });
        }, index);
    }, [onChange, index]);

    const handleReachedMaleChange = useCallback((newReached: number | undefined) => {
        onChange((oldValue) => {
            let total = oldValue?.reached_total;
            if (
                isTruthy(newReached)
                || isTruthy(oldValue?.reached_female)
                || isTruthy(oldValue?.reached_other)
            ) {
                total = (newReached ?? 0)
                + (oldValue?.reached_female ?? 0)
                + (oldValue?.reached_other ?? 0);
            }
            return ({
                ...oldValue,
                reached_total: total,
                client_id: oldValue?.client_id ?? randomString(),
                reached_male: newReached,
            });
        }, index);
    }, [onChange, index]);

    const handleReachedFemaleChange = useCallback((newReached: number | undefined) => {
        onChange((oldValue) => {
            let total = oldValue?.reached_total;
            if (
                isTruthy(oldValue?.reached_male)
                || isTruthy(newReached)
                || isTruthy(oldValue?.reached_other)
            ) {
                total = (oldValue?.reached_male ?? 0)
                + (newReached ?? 0)
                + (oldValue?.reached_other ?? 0);
            }

            return ({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                reached_total: total,
                reached_female: newReached,
            });
        }, index);
    }, [onChange, index]);

    const handleReachedOtherChange = useCallback((newReached: number | undefined) => {
        onChange((oldValue) => {
            let total = oldValue?.reached_total;
            if (
                isTruthy(oldValue?.reached_male)
                || isTruthy(oldValue?.reached_female)
                || isTruthy(newReached)
            ) {
                total = (oldValue?.reached_male ?? 0)
                + (oldValue?.reached_female ?? 0)
                + (newReached ?? 0);
            }

            return ({
                ...oldValue,
                client_id: oldValue?.client_id ?? randomString(),
                reached_total: total,
                reached_other: newReached,
            });
        }, index);
    }, [onChange, index]);

    const shouldDisableReachedTotal = isDefined(value.reached_male)
        || isDefined(value.reached_female)
        || isDefined(value.reached_other);

    const shouldDisableTargetTotal = isDefined(value.target_male)
        || isDefined(value.target_female)
        || isDefined(value.target_other);

    return (
        <div className={_cs(styles.annualSplitInput, className)}>
            <span className={styles.bold}>
                <NumberInput
                    label={strings.threeWYear}
                    name="year"
                    value={value?.year}
                    onChange={setFieldValue}
                    error={error?.year}
                />
            </span>
            <NumberInput
                label={strings.threeWBudgetAmount}
                name="budget_amount"
                value={value?.budget_amount}
                onChange={setFieldValue}
                error={error?.budget_amount}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="secondary"
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
            />
            <NumberInput
                label={strings.threeWTargetFemale}
                name="target_female"
                value={value?.target_female}
                onChange={handleTargetFemaleChange}
                error={error?.target_female}
            />
            <NumberInput
                label={strings.threeWTargetOther}
                name="target_other"
                value={value?.target_other}
                onChange={handleTargetOtherChange}
                error={error?.target_other}
            />
            <span className={styles.bold}>
                <NumberInput
                    label={strings.threeWTargetTotal + (shouldDisableTargetTotal ? '' : '*')}
                    name="target_total"
                    value={value?.target_total}
                    onChange={setFieldValue}
                    disabled={shouldDisableTargetTotal}
                    error={error?.target_total}
                />
            </span>
            <NumberInput
                label={strings.threeWReachedMale}
                name="reached_male"
                value={value?.reached_male}
                onChange={handleReachedMaleChange}
                error={error?.reached_male}
            />
            <NumberInput
                label={strings.threeWReachedFemale}
                name="reached_female"
                value={value?.reached_female}
                onChange={handleReachedFemaleChange}
                error={error?.reached_female}
            />
            <NumberInput
                label={strings.threeWReachedOther}
                name="reached_other"
                value={value?.reached_other}
                onChange={handleReachedOtherChange}
                error={error?.reached_other}
            />
            <span className={styles.bold}>
                <NumberInput
                    label={strings.threeWReachedTotal + (shouldDisableReachedTotal ? '' : '*')}
                    name="reached_total"
                    value={value?.reached_total}
                    onChange={setFieldValue}
                    disabled={shouldDisableReachedTotal}
                    error={error?.reached_total}
                />
            </span>
        </div>
    );
}

export default AnnualSplitInput;
