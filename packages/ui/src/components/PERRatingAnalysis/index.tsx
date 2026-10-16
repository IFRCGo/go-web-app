import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import RatingBarComponent from './RatingBar';
import RatingChange from './RatingChange';
import {
    getPERRatingLevel,
    PER_RATING_LEVEL_COLORS,
} from './ratingScale';
import RatingStatusBadge from './RatingStatusBadge';
import Sparkline from './Sparkline';
import type { Props } from './types';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type { Props } from './types';

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
            aria-label={strings.ratingContainerLabel}
        >
            <div className={styles.ratingItem}>
                <span
                    className={styles.ratingName}
                    title={strings.ratingAverageLabel}
                >
                    <h3 className={styles.sectionTitle}>
                        {strings.ratingAverageLabel}
                    </h3>
                </span>
                <div className={styles.ratingContent}>
                    <div className={styles.barContainer}>
                        <RatingBarComponent
                            value={Number(overallRating.rating)}
                            maxValue={5}
                            color={PER_RATING_LEVEL_COLORS[
                                getPERRatingLevel(overallRating.rating)
                            ]}
                            backgroundColor="var(--go-ui-color-gray-30)"
                        />
                    </div>
                    <div className={styles.ratingValueContainer}>
                        <span
                            className={styles.ratingValue}
                            aria-label={resolveToString(
                                strings.ratingValueLabel,
                                { value: Number(overallRating.rating).toFixed(2) },
                            )}
                        >
                            {overallRating?.rating ? Number(overallRating.rating).toFixed(2) : '-'}
                        </span>
                        <RatingStatusBadge
                            rating={Number(overallRating.rating)}
                        />
                        <Sparkline
                            name={strings.ratingAverageLabel}
                            cycleRatings={overallRating.cycleRatings}
                            ariaLabel={strings.ratingSparklineLabel}
                        />
                        {overallRating.change !== 0 ? (
                            <RatingChange
                                value={overallRating.change}
                                direction={overallRating.changeDirection}
                            />
                        ) : (
                            <div className={styles.ratingChangePlaceholder} aria-hidden="true" />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        {strings.ratingAreasHeading}
                    </h3>
                </div>
                <div className={styles.ratingList}>
                    {areaData.map((area) => (
                        <div key={area.name} className={styles.ratingItem}>
                            <span
                                className={styles.ratingName}
                                title={area.name}
                            >
                                {area.name}
                            </span>
                            <div className={styles.ratingContent}>
                                <div className={styles.barContainer}>
                                    <RatingBarComponent
                                        value={Number(area.rating)}
                                        maxValue={5}
                                        color={area.areaColor ?? 'gray'}
                                        backgroundColor="var(--go-ui-color-gray-30)"
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span
                                        className={styles.ratingValue}
                                        aria-label={resolveToString(
                                            strings.ratingValueLabel,
                                            { value: Number(area.rating).toFixed(2) },
                                        )}
                                    >
                                        {area?.rating ? Number(area.rating).toFixed(2) : '-'}
                                    </span>
                                    <RatingStatusBadge
                                        rating={Number(area.rating)}
                                    />
                                    <Sparkline
                                        name={area.name}
                                        cycleRatings={area.cycleRatings}
                                        ariaLabel={strings.ratingSparklineLabel}
                                    />
                                    {area.change !== 0 ? (
                                        <RatingChange
                                            value={area.change}
                                            direction={area.changeDirection}
                                        />
                                    ) : (
                                        <div className={styles.ratingChangePlaceholder} aria-hidden="true" />
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
                        {strings.ratingComponentsHeading}
                    </h3>
                    <div className={styles.sortButtons}>
                        <button
                            type="button"
                            className={_cs(
                                styles.button,
                                styles.compact,
                            )}
                            onClick={() => handleSortChange('number', sortDirection === 'asc' ? 'desc' : 'asc')}
                        >
                            {strings.ratingSortByComponent}
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
                            aria-label={resolveToString(
                                strings.ratingSortButtonLabel,
                                {
                                    type: strings.ratingSortByRating,
                                    direction: sortDirection === 'asc' ? '↑' : '↓',
                                },
                            )}
                        >
                            {strings.ratingSortByRating}
                            {' '}
                            {sortDirection === 'asc' ? ('↑') : ('↓')}
                        </button>
                    </div>
                </div>
                <div className={styles.ratingList}>
                    {sortedComponentData.map((component) => (
                        <div key={component.key} className={styles.ratingItem}>
                            <span
                                className={styles.ratingName}
                                title={`${component.id}. ${component.name}`}
                            >
                                <span
                                    className={styles.ratingPrefix}
                                    aria-label={resolveToString(
                                        strings.ratingComponentPrefixLabel,
                                        { number: component.id },
                                    )}
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
                                    />
                                </div>
                                <div className={styles.ratingValueContainer}>
                                    <span
                                        className={styles.ratingValue}
                                        aria-label={resolveToString(
                                            strings.ratingValueLabel,
                                            { value: Number(component.rating).toFixed(2) },
                                        )}
                                    >
                                        {Number(component.rating).toFixed(2)}
                                    </span>
                                    <RatingStatusBadge
                                        rating={Number(component.rating)}
                                    />
                                    <Sparkline
                                        name={component.name}
                                        cycleRatings={component.cycleRatings}
                                        ariaLabel={strings.ratingSparklineLabel}
                                    />
                                    {component.change !== 0 ? (
                                        <RatingChange
                                            value={component.change}
                                            direction={component.changeDirection}
                                        />
                                    ) : (
                                        <div className={styles.ratingChangePlaceholder} aria-hidden="true" />
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
