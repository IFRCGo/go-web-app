import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    DataDisplay,
    ListView,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';

import InitiativeCard from './InitiativeCard';

import i18n from './i18n.json';

type CountryInitiative = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['initiatives']>[number];

const keySelector = (initiative: CountryInitiative) => initiative.id;

function NationalSocietyDirectoryInitiatives() {
    const strings = useTranslation(i18n);

    const {
        countryResponse,
        countryResponsePending,
    } = useOutletContext<CountryOutletContext>();

    const rendererParams = useCallback(
        (_: number, data: CountryInitiative) => ({
            initiative: data,
        }),
        [],
    );

    return (
        <Container
            heading={strings.nSDirectoryInitiativesTitle}
            // TODO: Add Contacts link in description
            headerDescription={strings.nSDirectoryInitiativesDescription}
            withHeaderBorder
            pending={countryResponsePending}
            errored={false}
            filtered={false}
            footerActions={isDefined(countryResponse)
                && isDefined(countryResponse.initiatives)
                && countryResponse.initiatives.length > 0 && (
                <DataDisplay
                    label={strings.source}
                    value={(
                        <Link
                            styleVariant="action"
                            href="https://www.ifrc.org/our-work/national-society-development/funds-national-society-development"
                            external
                            withUnderline
                            withLinkIcon
                        >
                            {strings.ifrcNSDFunds}
                        </Link>
                    )}
                />
            )}
            empty={isNotDefined(countryResponse)
                || isNotDefined(countryResponse.initiatives)
                || countryResponse.initiatives.length === 0}
            spacing="lg"
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={3}
                minGridColumnSize="20rem"
            >
                <RawList
                    data={countryResponse?.initiatives}
                    keySelector={keySelector}
                    renderer={InitiativeCard}
                    rendererParams={rendererParams}
                />
            </ListView>
        </Container>
    );
}

export default NationalSocietyDirectoryInitiatives;
