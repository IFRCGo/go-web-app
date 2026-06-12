import {
    useCallback,
    useRef,
} from 'react';
import { InputLabel } from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import { JBA_LEAD_TIME_DAYS } from '../../malawi/constants';

import styles from './styles.module.css';

const MIN_DAY = JBA_LEAD_TIME_DAYS[0];
const MAX_DAY = JBA_LEAD_TIME_DAYS[JBA_LEAD_TIME_DAYS.length - 1] ?? MIN_DAY;
// Number of gaps between steps (9 for a 1-10 range); drives the position math.
const STEP_COUNT = JBA_LEAD_TIME_DAYS.length - 1;

function clamp(value: number) {
    return Math.min(MAX_DAY, Math.max(MIN_DAY, value));
}

// Percentage position [0, 100] of a day value along the track.
function pctOf(value: number) {
    return ((value - MIN_DAY) / STEP_COUNT) * 100;
}

function dayLabel(day: number) {
    return `${day} ${day > 1 ? 'days' : 'day'}`;
}

interface Props {
    value: number;
    onChange: (value: number) => void;
}

// Forecast lead-time selector: a horizontal slider with a numbered 1-10 scale
// (design handoff "B2"). Replaces the previous radio-button group.
function LeadTimeFilter(props: Props) {
    const { value, onChange } = props;

    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const dayFromClientX = useCallback(
        (clientX: number) => {
            const track = trackRef.current;
            if (!track) {
                return value;
            }
            const rect = track.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            return Math.round(ratio * STEP_COUNT) + MIN_DAY;
        },
        [value],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onChange(dayFromClientX(e.clientX));
        },
        [dayFromClientX, onChange],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (draggingRef.current) {
                onChange(dayFromClientX(e.clientX));
            }
        },
        [dayFromClientX, onChange],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            draggingRef.current = false;
            e.currentTarget.releasePointerCapture?.(e.pointerId);
        },
        [],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            let next: number | undefined;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                next = value - 1;
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                next = value + 1;
            } else if (e.key === 'Home') {
                next = MIN_DAY;
            } else if (e.key === 'End') {
                next = MAX_DAY;
            }
            if (next !== undefined) {
                e.preventDefault();
                onChange(clamp(next));
            }
        },
        [value, onChange],
    );

    const handleNumberClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            onChange(Number(e.currentTarget.dataset.day));
        },
        [onChange],
    );

    const pct = pctOf(value);

    return (
        <div className={styles.leadTimeFilter}>
            {/* FIXME: use strings */}
            <InputLabel>
                Forecast lead time
            </InputLabel>
            <div className={styles.slider}>
                <div
                    ref={trackRef}
                    className={styles.track}
                    role="slider"
                    tabIndex={0}
                    aria-label="Forecast lead time in days"
                    aria-valuemin={MIN_DAY}
                    aria-valuemax={MAX_DAY}
                    aria-valuenow={value}
                    aria-valuetext={dayLabel(value)}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <div
                        className={styles.fill}
                        style={{ width: `${pct}%` }}
                    />
                    <div
                        className={styles.handle}
                        style={{ left: `${pct}%` }}
                    />
                </div>
                <div className={styles.numberRow}>
                    {JBA_LEAD_TIME_DAYS.map((day, index) => (
                        <button
                            key={day}
                            type="button"
                            data-day={day}
                            className={_cs(styles.number, day === value && styles.active)}
                            style={{ left: `${(index / STEP_COUNT) * 100}%` }}
                            onClick={handleNumberClick}
                            aria-label={dayLabel(day)}
                            aria-pressed={day === value}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LeadTimeFilter;
