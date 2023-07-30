import KeyFigure from '#components/KeyFigure';
import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function EpidemicNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                description={strings.cumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                description={strings.suspectedCasesLabel}
                value={value?.epi_suspected_cases}
            />
            {/* TODO: add remaining fields */}
        </>
    );
}

export default EpidemicNumericDetails;
