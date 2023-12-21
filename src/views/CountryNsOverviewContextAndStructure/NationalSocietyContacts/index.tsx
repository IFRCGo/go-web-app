import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import { createStringColumn, createLinkColumn } from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}
function NationalSocietyContacts(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    type CountryListItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['contacts']>[number];

    const contacts = countryResponse?.contacts;

    const columns = useMemo(
        () => ([
            createStringColumn<CountryListItem, number>(
                'name',
                '',
                (item) => item.name,
                {
                    cellContainerClassName: styles.name,
                    cellRendererClassName: styles.name,
                },
            ),
            createStringColumn<CountryListItem, number>(
                'title',
                '',
                (item) => item.title,
            ),
            createLinkColumn<CountryListItem, number>(
                'email',
                '',
                (item) => item.email,
                (item) => ({
                    href: `mailto:${item.email}`,
                    external: true,
                }),
            ),
        ]),
        [],
    );

    return (
        <Container
            className={_cs(className, styles.nationalSocietyContactsTable)}
            heading={strings.nSContactsTitle}
            withHeaderBorder
        >
            <Table
                className={styles.table}
                columns={columns}
                data={contacts}
                filtered={false}
                headersHidden
                keySelector={numericIdSelector}
                pending={false}
            />
        </Container>
    );
}

export default NationalSocietyContacts;
