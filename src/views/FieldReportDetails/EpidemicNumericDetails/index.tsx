import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/{id}/'>;

interface Props {
    value: FieldReportResponse | undefined;
}

function EpidemicNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    /* epi_deaths_since_last_fr */

    // FIXME: Show conditional labels

    return (
        <>
            <KeyFigure
                description={strings.epidemicCumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                description={strings.epidemicSuspectedCasesLabel}
                value={value?.epi_suspected_cases}
            />
            <KeyFigure
                description={strings.epidemicProbableCasesLabel}
                value={value?.epi_probable_cases}
            />
            <KeyFigure
                description={strings.epidemicConfirmedCasesLabel}
                value={value?.epi_confirmed_cases}
            />
            <KeyFigure
                description={strings.epidemicDeadLabel}
                value={value?.epi_num_dead}
            />
            <KeyFigure
                description={strings.epidemicAssistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.epidemicAssistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            {/* FIXME: This is not in the form */}
            <KeyFigure
                description={strings.epidemicAssistedOtherLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.epidemicVolunteersLabel}
                value={value?.num_localstaff}
            />
            <KeyFigure
                description={strings.epidemicVolunteersLabel}
                value={value?.num_volunteers}
            />
            <KeyFigure
                description={strings.epidemicDelegatesLabel}
                value={value?.num_expats_delegates}
            />
        </>
    );
}

export default EpidemicNumericDetails;
