import Tooltip from '#components/Tooltip';

import type {
    CycleRating,
    RatingStatus,
} from './types';

import styles from './styles.module.css';

interface Props {
    name: string;
    cycleRatings: CycleRating[];
    ariaLabel: string;
}

function getRatingStatus(rating: number): RatingStatus {
    if (rating >= 4) return 'High performing';
    if (rating >= 3) return 'Good performing';
    if (rating >= 2) return 'Needs improvement';
    if (rating >= 1) return 'Partially exists';
    return "Doesn't exist";
}

function Sparkline({
    name,
    cycleRatings,
    ariaLabel,
}: Props) {
    const bars = cycleRatings.map((cycleRating, index) => {
        const {
            color,
            cycle,
            rating,
        } = cycleRating;
        let val = Math.floor(rating) + 1;
        if (val > 5) val = 5;
        // Create a unique key using the rating value and position
        const uniqueKey = `sparkline-${cycle}-${rating.toString().replace('.', '')}-${color.replace('#', '')}-${index}`;
        return (
            <div
                key={uniqueKey}
                className={styles.sparklineBar}
                style={{
                    height: `${(rating + 2) * 12}%`,
                    backgroundColor: color,
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
                                {rating.toFixed(1)}
                                {' / 5.0'}
                            </div>
                            <div>{getRatingStatus(rating)}</div>
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
