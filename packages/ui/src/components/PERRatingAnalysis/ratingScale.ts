// NOTE: A PER rating goes from 1 ("Does not exist") to 5 ("High performance").
// 0 means "Not reviewed", it is never averaged in so it has no level.
export type PERRatingLevel = 1 | 2 | 3 | 4 | 5;

export function getPERRatingLevel(rating: number): PERRatingLevel {
    if (rating >= 5) return 5;
    if (rating >= 4) return 4;
    if (rating >= 3) return 3;
    if (rating >= 2) return 2;
    return 1;
}

// NOTE: Same shades as `perRatingColorMap` in the app, so a rating has one colour across GO
export const PER_RATING_LEVEL_COLORS: Record<PERRatingLevel, string> = {
    5: 'var(--go-ui-color-dark-blue-40)',
    4: 'var(--go-ui-color-dark-blue-30)',
    3: 'var(--go-ui-color-dark-blue-20)',
    2: 'var(--go-ui-color-dark-blue-10)',
    1: 'var(--go-ui-color-gray-40)',
};

// NOTE: White text on the three lighter shades is below the 4.5:1 contrast for small text
export const PER_RATING_LEVEL_TEXT_COLORS: Record<PERRatingLevel, string> = {
    5: 'var(--go-ui-color-white)',
    4: 'var(--go-ui-color-white)',
    3: 'var(--go-ui-color-black)',
    2: 'var(--go-ui-color-black)',
    1: 'var(--go-ui-color-black)',
};
