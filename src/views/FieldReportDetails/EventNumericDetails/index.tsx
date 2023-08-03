import type { paths } from '#generated/types';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field-report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function EventNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                description={strings.eventInjuredRCLabel}
                value={value?.num_injured}
            />
            <KeyFigure
                description={strings.eventInjuredGovernmentLabel}
                value={value?.gov_num_injured}
            />
            <KeyFigure
                description={strings.eventInjuredOtherLabel}
                value={value?.other_num_injured}
            />
            <KeyFigure
                description={strings.eventMissingRCLabel}
                value={value?.num_missing}
            />
            <KeyFigure
                description={strings.eventMissingGovernmentLabel}
                value={value?.gov_num_missing}
            />
            <KeyFigure
                description={strings.eventMissingOtherLabel}
                value={value?.other_num_missing}
            />
            <KeyFigure
                description={strings.eventDeadRCLabel}
                value={value?.num_dead}
            />
            <KeyFigure
                description={strings.eventDeadGovernmentLabel}
                value={value?.gov_num_dead}
            />
            <KeyFigure
                description={strings.eventDeadOtherLabel}
                value={value?.other_num_dead}
            />
            <KeyFigure
                description={strings.eventDisplacedRCLabel}
                value={value?.num_displaced}
            />
            <KeyFigure
                description={strings.eventDisplacedGovernmentLabel}
                value={value?.gov_num_displaced}
            />
            <KeyFigure
                description={strings.eventDisplacedOtherLabel}
                value={value?.other_num_displaced}
            />
            <KeyFigure
                description={strings.eventAffectedRCLabel}
                value={value?.num_affected}
            />
            <KeyFigure
                description={strings.eventAffectedGovernmentLabel}
                value={value?.gov_num_affected}
            />
            <KeyFigure
                description={strings.eventAffectedOtherLabel}
                value={value?.other_num_affected}
            />
            <KeyFigure
                description={strings.eventAssistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.eventAssistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            {/* FIXME: This is not in the form  duplicated */}
            <KeyFigure
                description={strings.eventAssistedOtherLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.eventLocalStaffLabel}
                value={value?.num_localstaff}
            />
            <KeyFigure
                description={strings.eventVolunteersLabel}
                value={value?.num_volunteers}
            />
            <KeyFigure
                description={strings.eventIfrcStaffLabel}
                value={value?.num_ifrc_staff}
            />
            <KeyFigure
                description={strings.eventDelegatedLabel}
                value={value?.num_expats_delegates}
            />
        </>
    );
}

export default EventNumericDetails;
