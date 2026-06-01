import {
    useCallback,
    useRef,
} from 'react';

import styles from './styles.module.css';

const STEP = 5;

function clamp(value: number) {
    return Math.min(100, Math.max(0, Math.round(value)));
}

interface Props {
    // Stable identifier echoed back through onChange so callers avoid per-row closures.
    name: string;
    value: number;
    onChange: (value: number, name: string) => void;
}

// Thin 0–100 opacity slider (GO ships no slider primitive). Pointer drag +
// keyboard, ARIA slider semantics.
function OpacitySlider(props: Props) {
    const { name, value, onChange } = props;

    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const valueFromClientX = useCallback(
        (clientX: number) => {
            const track = trackRef.current;
            if (!track) {
                return value;
            }
            const rect = track.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            return Math.round(ratio * 100);
        },
        [value],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onChange(valueFromClientX(e.clientX), name);
        },
        [name, onChange, valueFromClientX],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (draggingRef.current) {
                onChange(valueFromClientX(e.clientX), name);
            }
        },
        [name, onChange, valueFromClientX],
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
                next = value - STEP;
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                next = value + STEP;
            } else if (e.key === 'Home') {
                next = 0;
            } else if (e.key === 'End') {
                next = 100;
            }
            if (next !== undefined) {
                e.preventDefault();
                onChange(clamp(next), name);
            }
        },
        [name, value, onChange],
    );

    return (
        <div className={styles.opacitySlider}>
            {/* FIXME: use strings */}
            <span className={styles.opacityLabel}>Opacity</span>
            <div
                ref={trackRef}
                className={styles.opacityTrack}
                role="slider"
                tabIndex={0}
                aria-label="Layer opacity (percent)"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
                aria-valuetext={`${value}%`}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div
                    className={styles.opacityFill}
                    style={{ width: `${value}%` }}
                />
                <div
                    className={styles.opacityHandle}
                    style={{ left: `${value}%` }}
                />
            </div>
            <span className={styles.opacityValue}>{`${value}%`}</span>
        </div>
    );
}

export default OpacitySlider;
