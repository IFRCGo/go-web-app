import React from 'react';
import {
    PartialForm,
    useFormObject,
    getErrorObject,
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';
import {
    _cs,
    isDefined,
    isFalsy,
} from '@togglecorp/fujs';

import { DeleteBinLineIcon } from '@ifrc-go/icons';
import NumberInput from '#components/NumberInput';
import useTranslation from '#hooks/useTranslation';
import Button from '#components/Button';

import { AnnualSplit } from '../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialForm<AnnualSplit>;

const defaultValue: Value = {};

interface Props {
    className?: string;
    onChange: (value: SetValueArg<Value>, index: number) => void;
    error: Error<AnnualSplit> | undefined;
    index: number;
    value: Value;
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

    const setFieldValue = useFormObject(index, onChange, defaultValue);
    const error = getErrorObject(errorFromProps);

    // Calculate and set target total
    React.useEffect(() => {
        if (
            isFalsy(value.target_male)
            && isFalsy(value.target_female)
            && isFalsy(value.target_other)
        ) {
            return;
        }

        const total = (value.target_male ?? 0)
            + (value.target_female ?? 0)
            + (value.target_other ?? 0);

        if (!Number.isNaN(total)) {
            setFieldValue(total, 'target_total');
        }
    }, [value?.target_male, value?.target_female, value?.target_other, setFieldValue]);

    // Calculate and set reached total
    React.useEffect(() => {
        if (
            isFalsy(value.reached_male)
        && isFalsy(value.reached_female)
        && isFalsy(value.reached_other)
        ) {
            return;
        }

        const total = (value?.reached_male ?? 0)
            + (value?.reached_female ?? 0)
            + (value?.reached_other ?? 0);

        if (!Number.isNaN(total)) {
            setFieldValue(total, 'reached_total');
        }
    }, [value?.reached_male, value?.reached_female, value?.reached_other, setFieldValue]);

    const shouldDisableReachedTotal = isDefined(value.reached_male)
    || isDefined(value.reached_female)
    || isDefined(value.reached_other);

    const shouldDisableTargetTotal = isDefined(value.target_male)
    || isDefined(value.target_female)
    || isDefined(value.target_other);

    return (
        <div className={_cs(styles.annualSplitInput, className)}>
            <input type="hidden" name="id" value={value?.id} />
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
                onChange={setFieldValue}
                error={error?.target_male}
            />
            <NumberInput
                label={strings.threeWTargetFemale}
                name="target_female"
                value={value?.target_female}
                onChange={setFieldValue}
                error={error?.target_female}
            />
            <NumberInput
                label={strings.threeWTargetOther}
                name="target_other"
                value={value?.target_other}
                onChange={setFieldValue}
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
                onChange={setFieldValue}
                error={error?.reached_male}
            />
            <NumberInput
                label={strings.threeWReachedFemale}
                name="reached_female"
                value={value?.reached_female}
                onChange={setFieldValue}
                error={error?.reached_female}
            />
            <NumberInput
                label={strings.threeWReachedOther}
                name="reached_other"
                value={value?.reached_other}
                onChange={setFieldValue}
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
