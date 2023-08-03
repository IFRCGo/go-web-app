import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import KeyFigure from '#components/KeyFigure';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function EarlyWarningNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                description={strings.earlyPotentiallyAffectedRCLabel}
                value={value?.num_potentially_affected}
            />
            <KeyFigure
                description={strings.earlyPeopleAtHighestRiskGovernmentLabel}
                value={value?.gov_num_highest_risk}
            />
            <KeyFigure
                description={strings.earlyAffectedPopCentresRCLabel}
                value={Number(value?.affected_pop_centres)}
            />
            <KeyFigure
                description={strings.earlyAssistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.earlyPotentiallyAffectedGovernmentLabel}
                value={value?.gov_num_potentially_affected}
            />
            <KeyFigure
                description={strings.earlyPeopleAtHighestRiskOtherLabel}
                value={value?.other_num_highest_risk}
            />
            <KeyFigure
                description={strings.earlyAffectedGovernmentLabel}
                value={Number(value?.gov_affected_pop_centres)}
            />
            <KeyFigure
                description={strings.earlyAssistedRCGovernmentLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.earlyPotentiallyAffectedOtherLabel}
                value={value?.other_num_potentially_affected}
            />
            <KeyFigure
                description={strings.earlyPeopleAtHighestRiskRcLabel}
                value={value?.num_highest_risk}
            />
            <KeyFigure
                description={strings.earlyAffectedPopCentersOtherLabel}
                value={Number(value?.other_affected_pop_centres)}
            />
            <KeyFigure
                description={strings.earlyAssistedOtherLabel}
                value={value?.other_num_assisted}
            />
        </>
    );
}

export default EarlyWarningNumericDetails;
