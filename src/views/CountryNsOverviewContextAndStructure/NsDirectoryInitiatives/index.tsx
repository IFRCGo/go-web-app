import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

import Container from '#components/Container';
import Grid from '#components/Grid';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';

import InitiativeListItem from './InitiativeCard';
import i18n from './i18n.json';

interface Props {
    className?: string;
}

type CountryListItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['initiatives']>[number];

const keySelector = (country: CountryListItem) => country.id;

function NationalSocietyDirectoryInitiatives(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const rendererParams = useCallback(
        (_: number, data: CountryListItem) => ({
            id: data.id,
            allocation: data?.allocation,
            categories: data?.categories,
            fund_type: data?.fund_type,
            funding_period: data?.funding_period,
            title: data?.title,
            year: data?.year,
        }),
        [],
    );

    return (
        <Container
            heading={strings.countryNSDirectoryInitiativesTitle}
            // TODO: Add Contacts link in description
            headerDescription={strings.countryNSDirectoryInitiativesDescription}
            withHeaderBorder
            withInternalPadding
        >
            <Grid
                className={className}
                data={countryResponse?.initiatives}
                pending={false}
                errored={false}
                filtered={false}
                keySelector={keySelector}
                renderer={InitiativeListItem}
                rendererParams={rendererParams}
                numPreferredColumns={3}
            />
        </Container>
    );
}

export default NationalSocietyDirectoryInitiatives;
