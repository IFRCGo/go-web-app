import { useMemo } from 'react';

import Container from '#components/Container';
import Table from '#components/Table';
import { DownloadFillIcon } from '@ifrc-go/icons';
import { GoApiResponse } from '#utils/restRequest';
import {
    createLinkColumn,
    createStringColumn,
    createDateColumn,
} from '#components/Table/ColumnShortcuts';

import styles from './styles.module.css';

type GetKeyDocumentResponse = GoApiResponse<'/api/v2/country-document/'>;
type KeyDocumentItem = NonNullable<GetKeyDocumentResponse['results']>[number];

interface Props {
    label: string;
    documents: KeyDocumentItem[];
}

function documentKeySelector(document: KeyDocumentItem) {
    return document.id;
}

function DocumentListCard(props: Props) {
    const {
        label,
        documents,
    } = props;

    const columns = useMemo(
        () => ([
            createStringColumn<KeyDocumentItem, number>(
                'name',
                '',
                (item) => item.name,
            ),
            createDateColumn<KeyDocumentItem, number>(
                'date',
                '',
                (item) => item.year,
                {
                    columnClassName: styles.date,
                },
            ),
            createLinkColumn<KeyDocumentItem, number>(
                'url',
                '',
                () => <DownloadFillIcon />,
                (item) => ({
                    external: true,
                    href: item.url,
                }),
            ),
        ]),
        [
        ],
    );

    return (
        <Container
            className={styles.documentListCard}
            heading={label}
            headingLevel={4}
            withHeaderBorder
            withInternalPadding
        >
            <Table
                data={documents}
                pending={false}
                filtered={false}
                columns={columns}
                keySelector={documentKeySelector}
                headersHidden
            />
        </Container>
    );
}

export default DocumentListCard;
