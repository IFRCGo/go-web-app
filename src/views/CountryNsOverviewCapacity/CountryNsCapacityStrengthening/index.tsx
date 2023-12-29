import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

import Container from '#components/Container';
import List from '#components/List';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';

import CapacityListItem from './CapacityListItem';
import i18n from './i18n.json';
import styles from './styles.module.css';

type CapacityItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['capacity']>[number];

function capacityKeySelector(option: CapacityItem) {
    return option.id;
}

function CountryNsCapacityStrengthening() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const rendererParams = useCallback(
        (_: number, capacity: CapacityItem) => ({
            capacity,
        }),
        [],
    );

    return (
        <Container
            className={styles.countryNsCapacityStrengthening}
            heading={strings.countryNsCapacityStrengtheningHeading}
            headerDescription={strings.countryNsCapacityStrengtheningDescription}
            withHeaderBorder
        >
            <List
                className={styles.capacityListContainer}
                errored={false}
                pending={false}
                filtered={false}
                data={countryResponse?.capacity}
                keySelector={capacityKeySelector}
                renderer={CapacityListItem}
                rendererParams={rendererParams}
                compact
            />
        </Container>
    );
}

export default CountryNsCapacityStrengthening;
