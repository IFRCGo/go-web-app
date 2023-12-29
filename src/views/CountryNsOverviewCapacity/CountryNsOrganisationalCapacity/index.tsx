import { useOutletContext } from 'react-router-dom';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

function CountryNsOrganisationalCapacity() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const leaderCapacity = countryResponse?.organizational_capacity.map(
        (capacity) => capacity.leadership_capacity,
    );

    const youthCapacity = countryResponse?.organizational_capacity.map(
        (capacity) => capacity.youth_capacity,
    );

    const volunteerCapacity = countryResponse?.organizational_capacity.map(
        (capacity) => capacity.volunteer_capacity,
    );

    const financialCapacity = countryResponse?.organizational_capacity.map(
        (capacity) => capacity.financial_capacity,
    );

    return (
        <Container
            className={styles.organisationalCapacity}
            heading={strings.countryNsOrganisationalCapacityHeading}
            contentViewType="grid"
            numPreferredGridContentColumns={2}
            withHeaderBorder
        >
            <Container
                className={styles.capacityCard}
                childrenContainerClassName={styles.figures}
                headingLevel={5}
                withHeaderBorder
                heading={strings.countryNsLeadershipCapacityLabel}
            >
                {leaderCapacity}
            </Container>
            <Container
                className={styles.capacityCard}
                childrenContainerClassName={styles.figures}
                headingLevel={5}
                withHeaderBorder
                heading={strings.countryNsYouthCapacityLabel}
            >
                {youthCapacity}
            </Container>
            <Container
                className={styles.capacityCard}
                childrenContainerClassName={styles.figures}
                headingLevel={5}
                withHeaderBorder
                heading={strings.countryNsVolunteerCapacityLabel}
            >
                {volunteerCapacity}
            </Container>
            <Container
                className={styles.capacityCard}
                childrenContainerClassName={styles.figures}
                headingLevel={5}
                withHeaderBorder
                heading={strings.countryNsFinancialCapacityLabel}
            >
                {financialCapacity}
            </Container>
        </Container>
    );
}

export default CountryNsOrganisationalCapacity;
