import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import { RatingBar as RatingBarComponent } from './RatingBar';
import RatingChange from './RatingChange';
import RatingStatusBadge from './RatingStatusBadge';
import Sparkline from './Sparkline';
import type { Props } from './types';

import i18n from './i18n.json';
import styles from './styles.module.css';

function PERRatingAnalysis({
    overallRating,
    areaData,
    componentData,
    className,
}: Props) {
    const strings = useTranslation(i18n);
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
        return sortDirection === 'asc'
            ? Number(a.rating ?? 0) - Number(b.rating ?? 0)
            : Number(b.rating ?? 0) - Number(a.rating ?? 0);
    });

    return (
        <div
            className={_cs(styles.container, className)}
            style={{ marginTop: 6 }}
            aria-label={strings?.ratingContainerLabel ?? 'PER rating analysis'}
        >
            <div className={styles.ratingItem}>
                <span className={styles.ratingName}>
                    <h3 className={styles.sectionTitle}>
                        {strings?.ratingAverageLabel ?? 'Average PER rating'}
                    </h3>
                </span>
                <div className={styles.ratingContent}>
                    <div className={styles.barContainer} style={{ marginTop: 1 }}>
                        <RatingBarComponent
                            value={Number(overallRating.rating)}
                            maxValue={5}
                            color={overallRating.color}
                            backgroundColor="var(--go-ui-color-gray-30)"
                            aria-label={strings?.ratingBarLabel?.replace('{value}', overallRating.rating.toString())?.replace('{maxValue}', '5') ?? `Rating bar showing ${overallRating.rating} out of 5`}
                        />
                    </div>
                    <div className={styles.ratingValueContainer} style={{ marginTop: 3 }}>
                        <span
                            className={styles.ratingValue}
                            aria-label={strings?.ratingValueLabel?.replace('{value}', Number(overallRating.rating).toFixed(1)) ?? `Rating value: ${Number(overallRating.rating).toFixed(1)}`}
                        >
                            {overallRating?.rating ? Number(overallRating.rating).toFixed(1) : '-'}
                        </span>
                        <RatingStatusBadge
                            status={overallRating.status}
                            rating={Number(overallRating.rating)}
                        />
                        <Sparkline
                            ratings={overallRating.cycleRatings.map(
                                (c) => Number(c.rating),
                            )}
                            colors={overallRating.cycleRatings.map(
                                (c) => c.color,
                            )}
                            aria-label={strings?.ratingSparklineLabel ?? 'Rating trend chart'}
                        />
                        {overallRating.change !== 0 && (
                            <RatingChange
                                value={overallRating.change}
                                direction={overallRating.changeDirection}
                                aria-label={strings?.ratingChangeLabel?.replace('{value}', overallRating.change.toString()) ?? `Rating change of ${overallRating.change}`}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        Areas
                    </h3>
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
                                        value={Number(area.rating)}
                                        maxValue={5}
                                        color={area.areaColor ?? 'gray'}
                                        backgroundColor="var(--go-ui-color-gray-30)"
                                        aria-label={strings?.ratingBarLabel?.replace('{value}', area.rating.toString())?.replace('{maxValue}', '5') ?? `Rating bar showing ${area.rating} out of 5`}
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span
                                        className={styles.ratingValue}
                                        aria-label={strings?.ratingValueLabel?.replace('{value}', Number(area.rating).toFixed(1)) ?? `Rating value: ${Number(area.rating).toFixed(1)}`}
                                    >
                                        {area?.rating ? Number(area.rating).toFixed(1) : '-'}
                                    </span>
                                    <RatingStatusBadge
                                        status={area.status}
                                        rating={Number(area.rating)}
                                    />
                                    <Sparkline
                                        ratings={area.cycleRatings.map(
                                            (c) => Number(c.rating),
                                        )}
                                        colors={area.cycleRatings.map(
                                            (c) => c.color,
                                        )}
                                        aria-label={strings?.ratingSparklineLabel ?? 'Rating trend chart'}
                                    />
                                    {area.change !== 0 && (
                                        <RatingChange
                                            value={area.change}
                                            direction={area.changeDirection}
                                            aria-label={strings?.ratingChangeLabel ? strings.ratingChangeLabel.replace('{value}', area.change.toString()) : `Rating change of ${area.change}`}
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
                    <h3 className={styles.sectionTitle}>
                        Components
                    </h3>
                    <div className={styles.sortButtons}>
                        <button
                            type="button"
                            className={_cs(
                                styles.button,
                                styles.compact,
                            )}
                            onClick={() => handleSortChange('number', sortDirection === 'asc' ? 'desc' : 'asc')}
                            aria-label={'Sort button'
                                ?.replace('{type}', strings?.ratingSortByNumber ?? 'by number')
                                ?.replace('{direction}', sortDirection === 'asc' ? ('↑') : ('↓'))
                                ?? `Sort by number ${sortDirection === 'asc' ? '↑' : '↓'}`}
                        >
                            Sort by number
                            {' '}
                            {sortDirection === 'asc' ? ('↑') : ('↓')}
                        </button>
                        <button
                            type="button"
                            className={_cs(
                                styles.button,
                                styles.compact,
                            )}
                            onClick={() => handleSortChange('rating', sortDirection === 'asc' ? 'desc' : 'asc')}
                            aria-label={strings?.ratingSortButton
                                ?.replace('{type}', strings?.ratingSortByRating ?? 'by rating')
                                ?.replace('{direction}', sortDirection === 'asc' ? ('↑') : ('↓'))
                                ?? `Sort by rating ${sortDirection === 'asc' ? '↑' : '↓'}`}
                        >
                            {strings?.ratingSortByRating ?? 'Sort by rating'}
                            {' '}
                            {sortDirection === 'asc' ? ('↑') : ('↓')}
                        </button>
                    </div>
                </div>
                <div className={styles.ratingList}>
                    {sortedComponentData.map((component) => (
                        <div key={component.id} className={styles.ratingItem}>
                            <span className={styles.ratingName}>
                                <span
                                    className={styles.ratingPrefix}
                                    aria-label={strings?.ratingComponentPrefixLabel?.replace('{number}', component.id.toString()) ?? `Component ${component.id}`}
                                >
                                    {component.id}
                                    .
                                </span>
                                {component.name}
                            </span>
                            <div className={styles.ratingContent}>
                                <div className={styles.barContainer}>
                                    <RatingBarComponent
                                        value={Number(component.rating)}
                                        maxValue={5}
                                        color={component.areaColor ?? 'gray'}
                                        backgroundColor="var(--go-ui-color-gray-30)"
                                        aria-label={strings?.ratingBarLabel?.replace('{value}', component.rating.toString())?.replace('{maxValue}', '5') ?? `Rating bar showing ${component.rating} out of 5`}
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span
                                        className={styles.ratingValue}
                                        aria-label={strings?.ratingValueLabel?.replace('{value}', Number(component.rating).toFixed(1)) ?? `Rating value: ${Number(component.rating).toFixed(1)}`}
                                    >
                                        {Number(component.rating).toFixed(1)}
                                    </span>
                                    <RatingStatusBadge
                                        status={component.status}
                                        rating={Number(component.rating)}
                                    />
                                    <Sparkline
                                        ratings={component.cycleRatings.map(
                                            (c) => Number(c.rating),
                                        )}
                                        colors={component.cycleRatings.map(
                                            (c) => c.color,
                                        )}
                                        aria-label={strings?.ratingSparklineLabel ?? 'Rating trend chart'}
                                    />
                                    {component.change !== 0 && (
                                        <RatingChange
                                            value={component.change}
                                            direction={component.changeDirection}
                                            aria-label={strings?.ratingChangeLabel?.replace('{value}', component.change.toString()) ?? `Rating change of ${component.change}`}
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
