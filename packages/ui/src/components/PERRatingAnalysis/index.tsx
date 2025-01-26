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
    const strings = useTranslation(i18n)?.strings;
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
        <div
            className={_cs(styles.container, className)}
            style={{ marginTop: 6 }}
            aria-label={strings?.ariaLabels?.container ?? 'PER rating analysis'}
        >
            <div className={styles.ratingItem}>
                <span className={styles.ratingName}>
                    <h3 className={styles.sectionTitle}>
                        {strings?.sections?.averageRating ?? 'Average PER rating'}
                    </h3>
                </span>
                <div className={styles.ratingContent}>
                    <div className={styles.barContainer} style={{ marginTop: 1 }}>
                        <RatingBarComponent
                            value={overallRating.rating}
                            maxValue={5}
                            color={overallRating.color}
                            backgroundColor="var(--go-ui-color-gray-30)"
                            aria-label={strings?.ariaLabels?.ratingBar?.replace('{value}', overallRating.rating.toString())?.replace('{maxValue}', '5') ?? `Rating bar showing ${overallRating.rating} out of 5`}
                        />
                    </div>
                    <div className={styles.ratingValueContainer} style={{ marginTop: 3 }}>
                        <span
                            className={styles.ratingValue}
                            aria-label={strings?.ariaLabels?.ratingValue?.replace('{value}', overallRating.rating.toFixed(1)) ?? `Rating value: ${overallRating.rating.toFixed(1)}`}
                        >
                            {overallRating?.rating ? overallRating.rating.toFixed(1) : (strings?.fallback?.noRating ?? '-')}
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
                            aria-label={strings?.ariaLabels?.sparkline ?? 'Rating trend chart'}
                        />
                        {overallRating.change !== 0 && (
                            <RatingChange
                                value={overallRating.change}
                                direction={overallRating.changeDirection}
                                aria-label={strings?.ariaLabels?.ratingChange?.replace('{value}', overallRating.change.toString()) ?? `Rating change of ${overallRating.change}`}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        {strings?.sections?.areas ?? 'Areas'}
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
                                        value={area.rating}
                                        maxValue={5}
                                        color={area.areaColor}
                                        backgroundColor="var(--go-ui-color-gray-30)"
                                        aria-label={strings?.ariaLabels?.ratingBar?.replace('{value}', area.rating.toString())?.replace('{maxValue}', '5') ?? `Rating bar showing ${area.rating} out of 5`}
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span
                                        className={styles.ratingValue}
                                        aria-label={strings?.ariaLabels?.ratingValue?.replace('{value}', area.rating?.toFixed(1)) ?? `Rating value: ${area.rating?.toFixed(1)}`}
                                    >
                                        {area?.rating ? area.rating.toFixed(1) : (strings?.fallback?.noRating ?? '-')}
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
                                        aria-label={strings?.ariaLabels?.sparkline ?? 'Rating trend chart'}
                                    />
                                    {area.change !== 0 && (
                                        <RatingChange
                                            value={area.change}
                                            direction={area.changeDirection}
                                            aria-label={strings?.ariaLabels?.ratingChange?.replace('{value}', area.change.toString()) ?? `Rating change of ${area.change}`}
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
                        {strings?.sections?.components ?? 'Components'}
                    </h3>
                    <div className={styles.sortButtons}>
                        <button
                            type="button"
                            className={_cs(
                                styles.button,
                                styles.compact,
                            )}
                            onClick={() => handleSortChange('number', sortDirection === 'asc' ? 'desc' : 'asc')}
                            aria-label={strings?.ariaLabels?.sortButton
                                ?.replace('{type}', strings?.sort?.byNumber ?? 'by number')
                                ?.replace('{direction}', sortDirection === 'asc' ? (strings?.sort?.ascending ?? '↑') : (strings?.sort?.descending ?? '↓'))
                                ?? `Sort by number ${sortDirection === 'asc' ? '↑' : '↓'}`}
                        >
                            {strings?.sort?.byNumber ?? 'Sort by number'}
                            {' '}
                            {sortDirection === 'asc' ? (strings?.sort?.ascending ?? '↑') : (strings?.sort?.descending ?? '↓')}
                        </button>
                        <button
                            type="button"
                            className={_cs(
                                styles.button,
                                styles.compact,
                            )}
                            onClick={() => handleSortChange('rating', sortDirection === 'asc' ? 'desc' : 'asc')}
                            aria-label={strings?.ariaLabels?.sortButton
                                ?.replace('{type}', strings?.sort?.byRating ?? 'by rating')
                                ?.replace('{direction}', sortDirection === 'asc' ? (strings?.sort?.ascending ?? '↑') : (strings?.sort?.descending ?? '↓'))
                                ?? `Sort by rating ${sortDirection === 'asc' ? '↑' : '↓'}`}
                        >
                            {strings?.sort?.byRating ?? 'Sort by rating'}
                            {' '}
                            {sortDirection === 'asc' ? (strings?.sort?.ascending ?? '↑') : (strings?.sort?.descending ?? '↓')}
                        </button>
                    </div>
                </div>
                <div className={styles.ratingList}>
                    {sortedComponentData.map((component) => (
                        <div key={component.id} className={styles.ratingItem}>
                            <span className={styles.ratingName}>
                                <span
                                    className={styles.ratingPrefix}
                                    aria-label={strings?.ariaLabels?.componentPrefix?.replace('{number}', component.id.toString()) ?? `Component ${component.id}`}
                                >
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
                                        aria-label={strings?.ariaLabels?.ratingBar?.replace('{value}', component.rating.toString())?.replace('{maxValue}', '5') ?? `Rating bar showing ${component.rating} out of 5`}
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span
                                        className={styles.ratingValue}
                                        aria-label={strings?.ariaLabels?.ratingValue?.replace('{value}', component.rating.toFixed(1)) ?? `Rating value: ${component.rating.toFixed(1)}`}
                                    >
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
                                        aria-label={strings?.ariaLabels?.sparkline ?? 'Rating trend chart'}
                                    />
                                    {component.change !== 0 && (
                                        <RatingChange
                                            value={component.change}
                                            direction={component.changeDirection}
                                            aria-label={strings?.ariaLabels?.ratingChange?.replace('{value}', component.change.toString()) ?? `Rating change of ${component.change}`}
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
