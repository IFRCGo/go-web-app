import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import useAlert from '#hooks/useAlert';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    country: number;
    disasterType: number;
    event?: number;
    isCovidReport?: boolean;
    startDate?: string;
    title: string;
    id?: number;
}

function TitlePreview(props: Props) {
    const {
        country,
        disasterType,
        event,
        isCovidReport,
        startDate,
        title,
        id,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const variables = useMemo(() => ({
        countries: [country],
        is_covid_report: isCovidReport,
        start_date: startDate,
        dtype: disasterType,
        event,
        title,
        id,
    }), [country, isCovidReport, startDate, disasterType, event, title, id]);

    const debouncedVariables = useDebouncedValue(variables);

    const {
        response: generateTitleResponse,
    } = useRequest({
        url: '/api/v2/field-report/generate-title/',
        method: 'POST',
        useCurrentLanguageForMutation: true,
        body: debouncedVariables,
        preserveResponse: true,
        onFailure: () => {
            alert.show(
                strings.failedToGenerateTitle,
                {
                    variant: 'danger',
                },
            );
        },
    });

    return (
        <TextOutput
            value={generateTitleResponse?.title}
            label={strings.titlePreview}
            strongLabel
        />
    );
}

export default TitlePreview;
