import { useOutletContext } from 'react-router-dom';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

function CountryNsOrganisationalCapacity() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const organizationalCapacity = countryResponse?.organizational_capacity;

    return (
        <Container
            className={styles.organisationalCapacity}
            heading={strings.countryNsOrganisationalCapacityHeading}
            childrenContainerClassName={styles.content}
            contentViewType="grid"
            numPreferredGridContentColumns={2}
            withHeaderBorder
        >
            {isDefined(organizationalCapacity?.leadership_capacity) && (
                <Container
                    className={styles.capacityCard}
                    headingLevel={5}
                    withHeaderBorder
                    heading={strings.countryNsLeadershipCapacityLabel}
                >
                    {organizationalCapacity?.leadership_capacity}
                </Container>
            )}
            {isDefined(organizationalCapacity?.youth_capacity) && (
                <Container
                    className={styles.capacityCard}
                    headingLevel={5}
                    withHeaderBorder
                    heading={strings.countryNsYouthCapacityLabel}
                >
                    {organizationalCapacity?.youth_capacity}
                </Container>
            )}
            {isDefined(organizationalCapacity?.volunteer_capacity) && (
                <Container
                    className={styles.capacityCard}
                    headingLevel={5}
                    withHeaderBorder
                    heading={strings.countryNsVolunteerCapacityLabel}
                >
                    {organizationalCapacity?.volunteer_capacity}
                </Container>
            )}
            {isDefined(organizationalCapacity?.financial_capacity) && (
                <Container
                    className={styles.capacityCard}
                    headingLevel={5}
                    withHeaderBorder
                    heading={strings.countryNsFinancialCapacityLabel}
                >
                    {organizationalCapacity?.financial_capacity}
                </Container>
            )}
        </Container>
    );
}

export default CountryNsOrganisationalCapacity;
