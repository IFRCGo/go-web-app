import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import { createStringColumn } from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}
function SupportingPartnersContacts(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    type ContactListItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['contacts']>[number];

    const columns = useMemo(
        () => ([
            createStringColumn<ContactListItem, number>(
                'name',
                '',
                (item) => item.name,
            ),
            createStringColumn<ContactListItem, number>(
                'title',
                '',
                (item) => item.title,
            ),
            createStringColumn<ContactListItem, number>(
                'email',
                '',
                (item) => item.email,
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
