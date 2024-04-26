import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    RawList,
    TextOutput,
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

    const { countryResponse } = useOutletContext<CountryOutletContext>();

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
            footerActions={isDefined(countryResponse)
                && isDefined(countryResponse.initiatives)
                && countryResponse.initiatives.length > 0 && (
                <TextOutput
                    label={strings.source}
                    value={(
                        <Link
                            variant="tertiary"
                            href="https://www.ifrc.org/our-work/national-society-development/funds-national-society-development"
                            external
                            withUnderline
                        >
                            {strings.ifrcNSDFunds}
                        </Link>
                    )}
                />
            )}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            empty={isNotDefined(countryResponse)
                || isNotDefined(countryResponse.initiatives)
                || countryResponse.initiatives.length === 0}
        >
            <RawList
                data={countryResponse?.initiatives}
                keySelector={keySelector}
                renderer={InitiativeCard}
                rendererParams={rendererParams}
            />
        </Container>
    );
}

export default NationalSocietyDirectoryInitiatives;
