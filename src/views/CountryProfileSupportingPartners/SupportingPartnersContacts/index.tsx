import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import Table from '#components/Table';
import { createStringColumn, createLinkColumn } from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import { numericIdSelector } from '#utils/selectors';
import { GoApiResponse, useRequest } from '#utils/restRequest';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetPartnerResponse = GoApiResponse<'/api/v2/country-supporting-partner/'>;
type ContactListItem = NonNullable<GetPartnerResponse['results']>[number];

interface Props {
    className?: string;
}

function SupportingPartnersContacts(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        pending: contactPending,
        response: contactResponse,
    } = useRequest({
        url: '/api/v2/country-supporting-partner/',
        skip: isNotDefined(countryId),
        query: {
            country: isDefined(countryId) ? [Number(countryId)] : undefined,
        },
    });

    const groupedBySupportingType = (
        listToGroupList(
            contactResponse?.results,
            (item) => item.supporting_type_display,
            (item) => item,
        ) ?? {}
    );

    const groupedSupportingList = mapToList(
        groupedBySupportingType,
        (d, k) => ({ label: k, value: d }),
    );

    const columns = useMemo(
        () => ([
            createStringColumn<ContactListItem, number>(
                'first_name',
                '',
                (item) => (`${item.first_name} ${item.last_name}`),
                {
                    cellRendererClassName: styles.name,
                },
            ),
            createStringColumn<ContactListItem, number>(
                'position',
                '',
                (item) => item.position,
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
            {contactPending && <BlockLoading className={styles.loading} />}
            {groupedSupportingList?.map((support) => (
                <Table
                    className={styles.table}
                    caption={support.label.toUpperCase()}
                    captionClassName={styles.caption}
                    columns={columns}
                    data={support.value}
                    headersHidden
                    filtered={false}
                    keySelector={numericIdSelector}
                    pending={false}
                />
            ))}
        </Container>
    );
}

export default SupportingPartnersContacts;
