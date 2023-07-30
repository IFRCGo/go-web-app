import KeyFigure from '#components/KeyFigure';
import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import { DISASTER_TYPE_EPIDEMIC } from '#utils/constants';
import CovidNumericDetails from './CovidNumericDetails';
import EpidemicNumericDetails from './EpidemicNumericDetails';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function EventNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    if (value?.dtype.id === DISASTER_TYPE_EPIDEMIC) {
        if (value?.is_covid_report) {
            return (
                <CovidNumericDetails
                    value={value}
                />
            );
        }

        return (
            <EpidemicNumericDetails
                value={value}
            />
        );
    }

    return (
        <>
            <KeyFigure
                description={strings.injuredRCLabel}
                value={value?.num_injured}
            />
            <KeyFigure
                description={strings.missingRCLabel}
                value={value?.num_missing}
            />
            <KeyFigure
                description={strings.deadRCLabel}
                value={value?.num_dead}
            />
            <KeyFigure
                description={strings.displacedRCLabel}
                value={value?.num_displaced}
            />
            <KeyFigure
                description={strings.affectedRCLabel}
                value={value?.num_affected}
            />
            <KeyFigure
                description={strings.assistedRCLabel}
                value={value?.num_assisted}
            />

            <KeyFigure
                description={strings.injuredGovernmentLabel}
                value={value?.gov_num_injured}
            />
            <KeyFigure
                description={strings.missingGovernmentLabel}
                value={value?.gov_num_missing}
            />
            <KeyFigure
                description={strings.deadGovernmentLabel}
                value={value?.gov_num_dead}
            />
            <KeyFigure
                description={strings.displacedGovernmentLabel}
                value={value?.gov_num_displaced}
            />
            <KeyFigure
                description={strings.affectedGovernmentLabel}
                value={value?.gov_num_affected}
            />
            <KeyFigure
                description={strings.assistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />

            <KeyFigure
                description={strings.injuredOtherLabel}
                value={value?.other_num_injured}
            />

            <KeyFigure
                description={strings.missingOtherLabel}
                value={value?.other_num_missing}
            />

            <KeyFigure
                description={strings.deadOtherLabel}
                value={value?.other_num_dead}
            />

            <KeyFigure
                description={strings.displacedOtherLabel}
                value={value?.other_num_displaced}
            />

            <KeyFigure
                description={strings.affectedOtherLabel}
                value={value?.other_num_affected}
            />

            <KeyFigure
                description={strings.assistedOtherLabel}
                value={value?.other_num_assisted}
            />

            <KeyFigure
                description={strings.localStaffLabel}
                value={value?.num_localstaff}
            />
            <KeyFigure
                description={strings.volunteersLabel}
                value={value?.num_volunteers}
            />
            <KeyFigure
                description={strings.ifrcStaffLabel}
                value={value?.ifrc_staff}
            />
            <KeyFigure
                description={strings.delegatedLabel}
                value={value?.num_expats_delegates}
            />
        </>
    );
}

export default EventNumericDetails;
