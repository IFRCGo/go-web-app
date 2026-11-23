import { _cs } from '@togglecorp/fujs';

import { getPerRatingColor } from '#utils/domain/per';

import {
    getPERRatingLevel,
    PER_RATING_LEVEL_TEXT_COLORS,
} from './ratingScale';
import usePERRatingLevelLabels from './usePERRatingLevelLabels';

import styles from './styles.module.css';

interface Props {
    rating: number;
    className?: string;
}

function RatingStatusBadge({ rating, className }: Props) {
    const ratingLevelLabels = usePERRatingLevelLabels();
    const level = getPERRatingLevel(rating);

    return (
        <div
            className={_cs(styles.ratingStatus, className)}
            style={{
                backgroundColor: getPerRatingColor(level),
                color: PER_RATING_LEVEL_TEXT_COLORS[level],
            }}
        >
            {ratingLevelLabels[level]}
        </div>
    );
}

export default RatingStatusBadge;
