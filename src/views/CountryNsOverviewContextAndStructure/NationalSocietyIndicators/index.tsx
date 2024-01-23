import { useOutletContext } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { sumSafe } from '#utils/common';
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
        pathVariables: isDefined(countryId) ? {
            id: Number(countryId),
        } : undefined,
    });

    const youthValue = sumSafe([
        indicatorResponse?.volunteer_age_6_12,
        indicatorResponse?.volunteer_age_13_17,
        indicatorResponse?.volunteer_age_18_29,
        indicatorResponse?.staff_age_18_29,
    ]);

    return (
        <Container
            className={styles.nsIndicators}
            childrenContainerClassName={styles.indicatorContent}
            heading={strings.nationalSocietyIndicatorsTitle}
            actions={(
                <Link
                    href="https://data.ifrc.org/FDRS/"
                    external
                    withLinkIcon
                    variant="primary"
                >
                    {strings.goToFDRS}
                </Link>
            )}
            headingLevel={4}
            withHeaderBorder
        >
            {indicatorPending && <BlockLoading className={styles.loading} />}
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
                value={indicatorResponse?.volunteer_total}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyYouthLabel}
                value={youthValue}
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
                value={indicatorResponse?.staff_total}
                valueType="number"
                strongValue
            />
        </Container>
    );
}

export default NationalSocietyIndicators;
