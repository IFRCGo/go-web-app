import { useMemo } from 'react';
import { DownloadFillIcon } from '@ifrc-go/icons';
import {
    Container,
    Table,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import { createLinkColumn } from '#utils/domain/tableHelpers';
import { type GoApiResponse } from '#utils/restRequest';

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
            childrenContainerClassName={styles.content}
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
