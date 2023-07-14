import { useCallback, useEffect, useRef } from 'react';
import { _cs, listToMap } from '@togglecorp/fujs';
import type { SetValueArg } from '@togglecorp/toggle-form';

import RawButton from '#components/RawButton';

import styles from './styles.module.css';

const date = new Date();
date.setDate(1);
date.setMonth(0);

const keyList = Array.from(Array(12).keys());
const defaultValue = listToMap(
    keyList,
    (key) => key,
    () => false,
);

interface Props<NAME> {
    className?: string;
    value: Record<number, boolean> | undefined;
    name: NAME;
    onChange: (
        newValue: SetValueArg<Record<number, boolean> | undefined>,
        name: NAME,
    ) => void;
}

function MultiMonthSelectInput<NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        onChange,
    } = props;

    const shiftPressedRef = useRef<boolean>(false);

    useEffect(
        () => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Shift') {
                    shiftPressedRef.current = true;
                }
            };

            const handleKeyUp = () => {
                shiftPressedRef.current = false;
            };

            document.addEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keyup', handleKeyUp);
                document.removeEventListener('keydown', handleKeyDown);
            };
        },
        [],
    );

    const handleClick = useCallback(
        (month: number) => {
            if (!onChange) {
                return;
            }

            onChange(
                (prevValue) => {
                    const prevValueList = Object.values(prevValue ?? {});
                    const numTruthyValues = prevValueList.filter(Boolean).length;

                    if (month === 12
                        || !shiftPressedRef.current
                        || numTruthyValues === 0
                        || prevValue?.[12]
                        // Clicked on previously selected month
                        || (numTruthyValues === 1 && prevValue?.[month])
                    ) {
                        return {
                            ...defaultValue,
                            [month]: true,
                        };
                    }

                    const truthyValueStartIndex = prevValueList.findIndex(Boolean);
                    const newValueList = [...prevValueList];
                    const lengthDiff = Math.abs(month - truthyValueStartIndex);
                    newValueList.splice(
                        Math.min(truthyValueStartIndex, month),
                        lengthDiff,
                        ...Array(lengthDiff + 1).fill(true),
                    );
                    const maxIndex = Math.max(truthyValueStartIndex, month) + 1;
                    const remaining = newValueList.length - maxIndex;
                    newValueList.splice(
                        maxIndex,
                        remaining,
                        ...Array(remaining).fill(false),
                    );
                    newValueList.splice(12, 1, false);

                    return listToMap(
                        newValueList,
                        (_, key) => key,
                        (currentValue) => currentValue,
                    );
                },
                name,
            );
        },
        [onChange, name],
    );

    return (
        <div className={_cs(styles.multiMonthSelectInput, className)}>
            <div className={styles.monthList}>
                {keyList.map(
                    (key) => {
                        date.setMonth(key);
                        const monthName = date.toLocaleString(
                            navigator.language,
                            { month: 'short' },
                        );

                        return (
                            <RawButton
                                key={key}
                                className={_cs(styles.month, value?.[key] && styles.active)}
                                name={key}
                                onClick={handleClick}
                            >
                                <span className={styles.name}>
                                    {monthName}
                                </span>
                                <span className={styles.visualQue}>
                                    <span className={styles.startBorder} />
                                    <span className={styles.circle} />
                                    <span className={styles.endBorder} />
                                </span>
                            </RawButton>
                        );
                    },
                )}
            </div>
            <div className={styles.separator} />
            <RawButton
                name={12}
                onClick={handleClick}
                className={_cs(styles.month, value?.[12] && styles.active)}
            >
                {/* FIXME: use translation */}
                <span className={styles.name}>
                    Yearly Average
                </span>
            </RawButton>
        </div>
    );
}

export default MultiMonthSelectInput;
