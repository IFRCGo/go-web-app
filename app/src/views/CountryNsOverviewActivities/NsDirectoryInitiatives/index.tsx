import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Grid,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';

import InitiativeCard from './InitiativeCard';

import i18n from './i18n.json';

interface Props {
    className?: string;
}

type CountryInitiative = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['initiatives']>[number];

const keySelector = (initiative: CountryInitiative) => initiative.id;

function NationalSocietyDirectoryInitiatives(props: Props) {
    const { className } = props;
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
            footerActions={(
                <TextOutput
                    label={strings.source}
                    value={(
                        <Link
                            variant="tertiary"
                            href="https://www.ifrc.org/"
                            external
                            withUnderline
                        >
                            {strings.ifrc}
                        </Link>
                    )}
                />
            )}
        >
            <Grid
                className={className}
                data={countryResponse?.initiatives}
                pending={false}
                errored={false}
                filtered={false}
                keySelector={keySelector}
                renderer={InitiativeCard}
                rendererParams={rendererParams}
                numPreferredColumns={3}
            />
        </Container>
    );
}

export default NationalSocietyDirectoryInitiatives;
