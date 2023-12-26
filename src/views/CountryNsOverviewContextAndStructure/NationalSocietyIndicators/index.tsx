import { useOutletContext } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function NationalSocietyIndicators() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        response: indicatorResponse,
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: {
            id: Number(countryId),
        },
    });

    return (
        <Container
            className={styles.nsIndicators}
            childrenContainerClassName={styles.indicatorContent}
            heading={strings.nationalSocietyIndicatorsTitle}
            headingLevel={4}
            withHeaderBorder
        >
            <div className={styles.indicatorDetails}>
                <TextOutput
                    label={strings.nationalSocietyFoundedDateLabel}
                    value={indicatorResponse?.founded_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyTrainedInFirstAidLabel}
                    value={indicatorResponse?.trained_in_first_aid}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyIncomeLabel}
                    value={indicatorResponse?.income}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyVolunteersLabel}
                    value={indicatorResponse?.volunteers}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyExpendituresLabel}
                    value={indicatorResponse?.expenditures}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyYouthYearLabel}
                    value={indicatorResponse?.people_age_6_12}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyBranchesLabel}
                    value={indicatorResponse?.branches}
                    valueType="number"
                    strongValue
                />
            </div>
        </Container>
    );
}

export default NationalSocietyIndicators;
