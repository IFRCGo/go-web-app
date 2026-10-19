import Tooltip from '#components/Tooltip';

import {
    getPERRatingLevel,
    PER_RATING_LEVEL_COLORS,
} from './ratingScale';
import type { CycleRating } from './types';
import usePERRatingLevelLabels from './usePERRatingLevelLabels';

import styles from './styles.module.css';

interface Props {
    name: string;
    cycleRatings: CycleRating[];
    ariaLabel: string;
}

function Sparkline({
    name,
    cycleRatings,
    ariaLabel,
}: Props) {
    const ratingLevelLabels = usePERRatingLevelLabels();

    const bars = cycleRatings.map((cycleRating) => {
        const {
            cycle,
            rating,
        } = cycleRating;
        const level = getPERRatingLevel(rating);
        return (
            <div
                key={cycle}
                className={styles.sparklineBar}
                style={{
                    height: `${(rating + 2) * 12}%`,
                    backgroundColor: PER_RATING_LEVEL_COLORS[level],
                }}
            >
                <Tooltip
                    title={name}
                    description={(
                        <>
                            <div>
                                Cycle
                                {' '}
                                {cycle}
                            </div>
                            <div>
                                {rating.toFixed(2)}
                                {' / 5.0'}
                            </div>
                            <div>{ratingLevelLabels[level]}</div>
                        </>
                    )}
                />
            </div>
        );
    });

    return (
        <div
            className={styles.sparklineContainer}
            aria-label={ariaLabel}
        >
            {bars}
        </div>
    );
}

export default Sparkline;
