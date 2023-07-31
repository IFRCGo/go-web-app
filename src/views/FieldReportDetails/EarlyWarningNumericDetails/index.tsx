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
                description={strings.potentiallyAffectedRCLabel}
                value={value?.num_potentially_affected}
            />
            <KeyFigure
                description={strings.potentiallyAffectedGovernmentLabel}
                value={value?.gov_num_potentially_affected}
            />
            <KeyFigure
                description={strings.potentiallyAffectedOtherLabel}
                value={value?.other_num_potentially_affected}
            />
            <KeyFigure
                description={strings.peopleAtHighestRiskRcLabel}
                value={value?.num_highest_risk}
            />
            <KeyFigure
                description={strings.peopleAtHighestRiskGovernmentLabel}
                value={value?.gov_num_highest_risk}
            />
            <KeyFigure
                description={strings.peopleAtHighestRiskOtherLabel}
                value={value?.other_num_highest_risk}
            />
            <KeyFigure
                description={strings.affectedPopCentresRCLabel}
                value={Number(value?.affected_pop_centres)}
            />
            <KeyFigure
                description={strings.affectedGovernmentLabel}
                value={Number(value?.gov_affected_pop_centres)}
            />
            <KeyFigure
                description={strings.affectedPopCentersOtherLabel}
                value={Number(value?.other_affected_pop_centres)}
            />
            <KeyFigure
                description={strings.assistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.assistedRCGovernmentLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.assistedOtherLabel}
                value={value?.other_num_assisted}
            />
        </>
    );
}

export default EarlyWarningNumericDetails;
