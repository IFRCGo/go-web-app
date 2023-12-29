import { KeyFigure } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/{id}/'>;

interface Props {
    value: FieldReportResponse | undefined;
}

function EventNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                label={strings.eventInjuredRCLabel}
                value={value?.num_injured}
            />
            <KeyFigure
                label={strings.eventInjuredGovernmentLabel}
                value={value?.gov_num_injured}
            />
            <KeyFigure
                label={strings.eventInjuredOtherLabel}
                value={value?.other_num_injured}
            />
            <KeyFigure
                label={strings.eventMissingRCLabel}
                value={value?.num_missing}
            />
            <KeyFigure
                label={strings.eventMissingGovernmentLabel}
                value={value?.gov_num_missing}
            />
            <KeyFigure
                label={strings.eventMissingOtherLabel}
                value={value?.other_num_missing}
            />
            <KeyFigure
                label={strings.eventDeadRCLabel}
                value={value?.num_dead}
            />
            <KeyFigure
                label={strings.eventDeadGovernmentLabel}
                value={value?.gov_num_dead}
            />
            <KeyFigure
                label={strings.eventDeadOtherLabel}
                value={value?.other_num_dead}
            />
            <KeyFigure
                label={strings.eventDisplacedRCLabel}
                value={value?.num_displaced}
            />
            <KeyFigure
                label={strings.eventDisplacedGovernmentLabel}
                value={value?.gov_num_displaced}
            />
            <KeyFigure
                label={strings.eventDisplacedOtherLabel}
                value={value?.other_num_displaced}
            />
            <KeyFigure
                label={strings.eventAffectedRCLabel}
                value={value?.num_affected}
            />
            <KeyFigure
                label={strings.eventAffectedGovernmentLabel}
                value={value?.gov_num_affected}
            />
            <KeyFigure
                label={strings.eventAffectedOtherLabel}
                value={value?.other_num_affected}
            />
            <KeyFigure
                label={strings.eventAssistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                label={strings.eventAssistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            <KeyFigure
                label={strings.eventLocalStaffLabel}
                value={value?.num_localstaff}
            />
            <KeyFigure
                label={strings.eventVolunteersLabel}
                value={value?.num_volunteers}
            />
            <KeyFigure
                label={strings.eventIfrcStaffLabel}
                value={value?.num_ifrc_staff}
            />
            <KeyFigure
                label={strings.eventDelegatedLabel}
                value={value?.num_expats_delegates}
            />
        </>
    );
}

export default EventNumericDetails;
