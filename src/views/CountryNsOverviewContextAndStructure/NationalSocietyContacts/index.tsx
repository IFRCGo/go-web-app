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
                strings.nSContactName,
                (item) => item.name,
            ),
            createStringColumn<CountryListItem, number>(
                'title',
                strings.nSContactTitle,
                (item) => item.title,
            ),
            createStringColumn<CountryListItem, number>(
                'email',
                strings.nSContactEmail,
                (item) => item.email,
            ),
        ]),
        [
            strings.nSContactName,
            strings.nSContactTitle,
            strings.nSContactEmail,
        ],
    );

    return (
        <Container
            className={_cs(className, styles.nationalSocietyContactTable)}
            childrenContainerClassName={styles.content}
            heading={strings.nSContactsTitle}
            withHeaderBorder
        >
            <Table
                className={styles.table}
                filtered={false}
                data={contacts}
                columns={columns}
                keySelector={numericIdSelector}
                pending={false}
            />
        </Container>
    );
}

export default NationalSocietyContacts;
