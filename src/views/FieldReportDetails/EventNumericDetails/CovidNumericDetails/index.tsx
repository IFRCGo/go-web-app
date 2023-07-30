import KeyFigure from '#components/KeyFigure';
import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function CovidNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                description={strings.covidCumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                description={strings.covidCumulativeDeadLabel}
                value={value?.epi_num_dead}
            />
            {/* TODO: add remaining fields */}
        </>
    );
}

export default CovidNumericDetails;
