import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import { createLinkColumn } from '#utils/domain/tableHelpers';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

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
        pending: supportingPartnerPending,
        response: supportingPartnerResponse,
    } = useRequest({
        url: '/api/v2/country-supporting-partner/',
        skip: isNotDefined(countryId),
        query: {
            country: isDefined(countryId) ? [Number(countryId)] : undefined,
        },
    });

    const partnersGroupedByType = (
        listToGroupList(
            supportingPartnerResponse?.results,
            (item) => item.supporting_type_display,
            (item) => item,
        )
    );

    const groupedPartnersList = mapToList(
        partnersGroupedByType,
        (contacts, contactType) => ({ label: contactType, value: contacts }),
    );

    const columns = useMemo(
        () => ([
            createStringColumn<ContactListItem, number>(
                'name',
                '',
                (item) => {
                    if (isDefined(item.first_name) && isDefined(item.last_name)) {
                        return `${item.first_name} ${item.last_name}`;
                    }
                    if (isDefined(item.first_name)) {
                        return `${item.first_name}`;
                    }
                    if (isDefined(item.last_name)) {
                        return `${item.last_name}`;
                    }
                    return null;
                },
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
                    href: isDefined(item.email) ? `mailto:${item.email}` : undefined,
                    external: true,
                }),
            ),
        ]),
        [],
    );

    return (
        <Container
            className={_cs(className, styles.supportingPartnersContacts)}
            heading={strings.supportingPartnersContactsTitle}
            withHeaderBorder
            pending={supportingPartnerPending}
            empty={isNotDefined(groupedPartnersList) || groupedPartnersList.length === 0}
            contentViewType="vertical"
            spacing="comfortable"
        >
            {groupedPartnersList?.map((groupedPartner) => (
                <Table
                    key={groupedPartner.label}
                    className={styles.table}
                    caption={groupedPartner.label}
                    captionClassName={styles.caption}
                    columns={columns}
                    data={groupedPartner.value}
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
