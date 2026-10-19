import useTranslation from '#hooks/useTranslation';

import { type PERRatingLevel } from './ratingScale';

import i18n from './i18n.json';

function usePERRatingLevelLabels(): Record<PERRatingLevel, string> {
    const strings = useTranslation(i18n);

    return {
        1: strings.ratingLevelDoesNotExist,
        2: strings.ratingLevelPartiallyExists,
        3: strings.ratingLevelNeedsImprovement,
        4: strings.ratingLevelCouldBeStrengthened,
        5: strings.ratingLevelHighPerformance,
    };
}

export default usePERRatingLevelLabels;
