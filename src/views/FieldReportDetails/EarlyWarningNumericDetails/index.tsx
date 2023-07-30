import KeyFigure from '#components/KeyFigure';
import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';

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
            {/* TODO: add remaining fields */}
        </>
    );
}

export default EarlyWarningNumericDetails;
