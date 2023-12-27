import { useOutletContext } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { sumSafe } from '#utils/common';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function NationalSocietyIndicators() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        pending: indicatorPending,
        response: indicatorResponse,
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: {
            id: isDefined(countryId) ? Number(countryId) : undefined,
        },
    });

    const staffValue = sumSafe([
        indicatorResponse?.female_staff_total,
        indicatorResponse?.male_staff_total,
    ]);

    const volunteersValue = sumSafe([
        indicatorResponse?.male_volunteer_total,
        indicatorResponse?.female_volunteer_total,
    ]);

    return (
        <Container
            className={styles.nsIndicators}
            childrenContainerClassName={styles.indicatorContent}
            heading={strings.nationalSocietyIndicatorsTitle}
            headingLevel={4}
            withHeaderBorder
        >
            {indicatorPending && <BlockLoading className={styles.loading} />}
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
                    value={volunteersValue}
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
                    label={strings.nationalSocietyBranchesLabel}
                    value={indicatorResponse?.branches}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyStaffLabel}
                    value={staffValue}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.nationalSocietyTrainedInFirstAidLabel}
                    value={indicatorResponse?.trained_in_first_aid}
                    valueType="number"
                    strongValue
                />
            </div>
        </Container>
    );
}

export default NationalSocietyIndicators;
