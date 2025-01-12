import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import { RatingBar as RatingBarComponent } from './RatingBar';
import RatingChange from './RatingChange';
import RatingScale from './RatingScale';
import RatingStatusBadge from './RatingStatusBadge';
import Sparkline from './Sparkline';
import type { Props } from './types';

import styles from './styles.module.css';

function PERRatingAnalysis({
    overallRating,
    areaData,
    componentData,
    className,
}: Props) {
    const [sortBy, setSortBy] = useState<'number' | 'rating'>('number');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSortChange = (newSortBy: 'number' | 'rating', newDirection: 'asc' | 'desc') => {
        if (newSortBy !== sortBy) {
            setSortDirection(newSortBy === 'rating' ? 'desc' : 'asc');
        } else {
            setSortDirection(newDirection);
        }
        setSortBy(newSortBy);
    };

    const sortedComponentData = [...componentData].sort((a, b) => {
        if (sortBy === 'number') {
            return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
        }
        return sortDirection === 'asc' ? a.rating - b.rating : b.rating - a.rating;
    });

    return (
        <div className={_cs(styles.container, className)} style={{ marginTop: 6 }}>
            <div className={styles.ratingItem}>
                <span className={styles.ratingName}>
                    <h3 className={styles.sectionTitle}>Average PER rating</h3>
                </span>
                <div className={styles.ratingContent}>
                    <div className={styles.ratingScaleContainer}>
                        <RatingScale maxValue={5} currentValue={overallRating.rating} />
                    </div>
                    <div className={styles.barContainer} style={{ marginTop: 1 }}>
                        <RatingBarComponent
                            value={overallRating.rating}
                            maxValue={5}
                            color={overallRating.color}
                            backgroundColor="var(--go-ui-color-gray-30)"
                        />
                    </div>
                    <div className={styles.ratingValueContainer} style={{ marginTop: 3 }}>
                        <span className={styles.ratingValue}>
                            {overallRating?.rating ? overallRating.rating.toFixed(1) : '-'}
                        </span>
                        <RatingStatusBadge
                            status={overallRating.status}
                            rating={overallRating.rating}
                        />
                        <Sparkline
                            ratings={overallRating.cycleRatings.map(
                                (c) => c.rating,
                            )}
                            colors={overallRating.cycleRatings.map(
                                (c) => c.color,
                            )}
                        />
                        {overallRating.change !== 0 && (
                            <RatingChange
                                value={overallRating.change}
                                direction={overallRating.changeDirection}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Areas</h3>
                </div>
                <div className={styles.ratingList}>
                    {areaData.map((area) => (
                        <div key={area.name} className={styles.ratingItem}>
                            <span className={styles.ratingName}>
                                {area.name}
                            </span>
                            <div className={styles.ratingContent}>
                                <div className={styles.barContainer}>
                                    <RatingBarComponent
                                        value={area.rating}
                                        maxValue={5}
                                        color={area.areaColor}
                                        backgroundColor="var(--go-ui-color-gray-30)"
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span className={styles.ratingValue}>
                                        {area?.rating ? area.rating.toFixed(1) : '-'}
                                    </span>
                                    <RatingStatusBadge
                                        status={area.status}
                                        rating={area.rating}
                                    />
                                    <Sparkline
                                        ratings={area.cycleRatings.map(
                                            (c) => c.rating,
                                        )}
                                        colors={area.cycleRatings.map(
                                            (c) => c.color,
                                        )}
                                    />
                                    {area.change !== 0 && (
                                        <RatingChange
                                            value={area.change}
                                            direction={area.changeDirection}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Components</h3>
                    <div className={styles.headerRight}>
                        <button
                            type="button"
                            className={_cs(styles.sortButton, sortBy === 'number' && styles.active)}
                            onClick={() => handleSortChange('number', sortDirection === 'asc' ? 'desc' : 'asc')}
                        >
                            Sort by number
                            {' '}
                            {sortDirection === 'asc' ? '↑' : '↓'}
                        </button>
                        <button
                            type="button"
                            className={_cs(styles.sortButton, sortBy === 'rating' && styles.active)}
                            onClick={() => handleSortChange('rating', sortDirection === 'asc' ? 'desc' : 'asc')}
                        >
                            Sort by rating
                            {' '}
                            {sortDirection === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
                <div className={styles.ratingList}>
                    {sortedComponentData.map((component) => (
                        <div key={component.id} className={styles.ratingItem}>
                            <span className={styles.ratingName}>
                                <span className={styles.ratingPrefix}>
                                    {component.id}
                                    .
                                </span>
                                {component.name}
                            </span>
                            <div className={styles.ratingContent}>
                                <div className={styles.barContainer}>
                                    <RatingBarComponent
                                        value={component.rating}
                                        maxValue={5}
                                        color={component.areaColor}
                                        backgroundColor="var(--go-ui-color-gray-30)"
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span className={styles.ratingValue}>
                                        {component.rating.toFixed(1)}
                                    </span>
                                    <RatingStatusBadge
                                        status={component.status}
                                        rating={component.rating}
                                    />
                                    <Sparkline
                                        ratings={component.cycleRatings.map(
                                            (c) => c.rating,
                                        )}
                                        colors={component.cycleRatings.map(
                                            (c) => c.color,
                                        )}
                                    />
                                    {component.change !== 0 && (
                                        <RatingChange
                                            value={component.change}
                                            direction={component.changeDirection}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PERRatingAnalysis;
