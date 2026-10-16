import useTranslation from '#hooks/useTranslation';

import { type PERAssessmentTypeKey } from '../PERAssessmentPalette';

import i18n from './i18n.json';

/**
 * Translated labels of the PER assessment types. The assessment types are
 * identified by `PERAssessmentTypeKey`, use this only to display them.
 */
function usePERAssessmentTypeLabels(): Record<PERAssessmentTypeKey, string> {
    const strings = useTranslation(i18n);

    return {
        SelfAssessment: strings?.considerationSelfAssessmentLabel ?? 'Self assessment',
        Simulation: strings?.considerationSimulationLabel ?? 'Simulation',
        Operational: strings?.considerationOperationalLabel ?? 'Operational',
        PostOperational: strings?.considerationPostOperationalLabel ?? 'Post operational',
    };
}

export default usePERAssessmentTypeLabels;
