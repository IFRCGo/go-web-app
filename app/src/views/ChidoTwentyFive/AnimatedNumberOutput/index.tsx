import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    NumberOutput,
    type NumberOutputProps,
} from '@ifrc-go/ui';
import {
    bound,
    isNotDefined,
} from '@togglecorp/fujs';

const ANIMATION_DURATION = 800;

function useAnimationFrame<VALUE>(
    value: VALUE,
    interpolationFn: (
        initialValue: VALUE,
        finalValue: VALUE,
        progress: number,
    ) => VALUE,
    initialValue = value,
): VALUE {
    const [transitionValue, setTransitionValue] = useState(initialValue);
    const startTimestampRef = useRef<number>(0);
    const animationFrameRef = useRef<number>();
    const initialValueRef = useRef(initialValue);

    useEffect(() => {
        function step(timestamp?: number) {
            if (!timestamp) {
                animationFrameRef.current = window.requestAnimationFrame(step);
                return;
            }

            if (!startTimestampRef.current) {
                startTimestampRef.current = timestamp;
            }

            const diff = timestamp - startTimestampRef.current;
            const progress = bound(
                diff / ANIMATION_DURATION,
                0,
                1,
            );
            const newValue = interpolationFn(initialValueRef.current, value, progress);
            setTransitionValue(newValue);

            if (diff < ANIMATION_DURATION) {
                animationFrameRef.current = window.requestAnimationFrame(step);
            }
        }

        step();

        return () => {
            startTimestampRef.current = 0;
            initialValueRef.current = value;
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [value, interpolationFn]);

    return transitionValue;
}

function interpolateNumber(
    initialValue: number | null | undefined,
    finalValue: number | null | undefined,
    progress: number,
) {
    if (isNotDefined(initialValue) || isNotDefined(finalValue)) {
        return undefined;
    }

    return Math.round(initialValue + (finalValue - initialValue) * progress);
}

function AnimatedNumberOutput(props: NumberOutputProps) {
    const {
        value,
        ...otherProps
    } = props;

    const modifiedValue = useAnimationFrame(
        value,
        interpolateNumber,
    );

    return (
        <NumberOutput
            value={modifiedValue}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        />
    );
}

export default AnimatedNumberOutput;
