import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import useTranslation from '#hooks/useTranslation';
import { createStringColumn, createLinkColumn } from '#components/Table/ColumnShortcuts';
import { numericIdSelector } from '#utils/selectors';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ContactListItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['contacts']>[number];

interface Props {
    className?: string;
}

function SupportingPartnersContacts(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const columns = useMemo(
        () => ([
            createStringColumn<ContactListItem, number>(
                'name',
                '',
                (item) => item.name,
                {
                    cellRendererClassName: styles.name,
                },
            ),
            createStringColumn<ContactListItem, number>(
                'title',
                '',
                (item) => item.title,
            ),
            createLinkColumn<ContactListItem, number>(
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
            className={_cs(className, styles.contactsTable)}
            childrenContainerClassName={styles.content}
            heading={strings.supportingPartnersContactsTitle}
            withHeaderBorder
        >
            <Table
                className={styles.table}
                columns={columns}
                data={countryResponse?.contacts}
                headersHidden
                filtered={false}
                keySelector={numericIdSelector}
                pending={false}
            />
        </Container>
    );
}

export default SupportingPartnersContacts;
