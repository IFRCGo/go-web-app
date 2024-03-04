import { KeyFigure } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/{id}/'>;

interface Props {
    value: FieldReportResponse | undefined;
}

function EarlyWarningNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                label={strings.earlyPotentiallyAffectedRCLabel}
                value={value?.num_potentially_affected}
            />
            <KeyFigure
                label={strings.earlyPeopleAtHighestRiskGovernmentLabel}
                value={value?.gov_num_highest_risk}
            />
            <KeyFigure
                label={strings.earlyAffectedPopCentresRCLabel}
                value={Number(value?.affected_pop_centres)}
            />
            <KeyFigure
                label={strings.earlyAssistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                label={strings.earlyPotentiallyAffectedGovernmentLabel}
                value={value?.gov_num_potentially_affected}
            />
            <KeyFigure
                label={strings.earlyPeopleAtHighestRiskOtherLabel}
                value={value?.other_num_highest_risk}
            />
            <KeyFigure
                label={strings.earlyAffectedGovernmentLabel}
                value={Number(value?.gov_affected_pop_centres)}
            />
            <KeyFigure
                label={strings.earlyAssistedRCGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            <KeyFigure
                label={strings.earlyPotentiallyAffectedOtherLabel}
                value={value?.other_num_potentially_affected}
            />
            <KeyFigure
                label={strings.earlyPeopleAtHighestRiskRcLabel}
                value={value?.num_highest_risk}
            />
            <KeyFigure
                label={strings.earlyAffectedPopCentersOtherLabel}
                value={Number(value?.other_affected_pop_centres)}
            />
        </>
    );
}

export default EarlyWarningNumericDetails;
