import { useOutletContext } from 'react-router-dom';
import { DownloadFillIcon, SearchLineIcon } from '@ifrc-go/icons';
import { listToGroupList, mapToList } from '@togglecorp/fujs';

import Container from '#components/Container';
import DateInput from '#components/DateInput';
import TextInput from '#components/TextInput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { GoApiResponse, useRequest } from '#utils/restRequest';
import { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetKeyDocumentResponse = GoApiResponse<'/api/v2/country-document/'>;
export type KeyDocumentItem = NonNullable<GetKeyDocumentResponse['results']>[number];

function NationalSocietyKeyDocuments() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();
    const {
        filter,
        rawFilter,
        setFilterField,
    } = useFilterState<{
        searchText?: string,
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
    });
    const {
        response: documentResponse,
    } = useRequest({
        url: '/api/v2/country-document/',
        query: {
            country: Number(countryId),
            search: filter.searchText,
            year__lte: filter.startDateAfter,
            year__gte: filter.startDateBefore,
        },
        preserveResponse: true,
    });

    const documents = documentResponse?.results ?? [];

    const groupedDocumentsByType = (
        listToGroupList(
            documents,
            (item) => item.document_type,
            (item) => item,
        ) ?? {}
    );
    const documentsMapList = mapToList(
        groupedDocumentsByType,
        (d, k) => ({ label: k, value: d }),
    );

    return (
        <Container
            className={styles.nationalSocietyDocuments}
            childrenContainerClassName={styles.nsKey}
            heading={strings.nSSocietyKeyDocumentsTitle}
            withHeaderBorder
            withGridViewInFilter
            filters={(
                <>
                    <TextInput
                        name="searchText"
                        label="Search"
                        placeholder="Search"
                        value={rawFilter.searchText}
                        onChange={setFilterField}
                        icons={<SearchLineIcon />}
                    />
                    <DateInput
                        name="startDateAfter"
                        label="Start"
                        onChange={setFilterField}
                        value={rawFilter.startDateAfter}
                    />
                    <DateInput
                        name="startDateBefore"
                        label="End"
                        onChange={setFilterField}
                        value={rawFilter.startDateBefore}
                    />
                </>
            )}
        >
            {documentsMapList.map((document) => (
                <Container
                    className={styles.nsKeyDocuments}
                    childrenContainerClassName={styles.nsDocuments}
                    key={document.label}
                    heading={document.label}
                    withHeaderBorder
                >
                    {document.value.map((doc) => (
                        <div className={styles.document}>
                            <div>{doc?.name}</div>
                            <div>{doc?.year}</div>
                            <Link
                                className={styles.downloadLink}
                                href={doc?.url}
                                external
                                variant="tertiary"
                            >
                                <DownloadFillIcon className={styles.icon} />
                            </Link>
                        </div>
                    ))}
                </Container>
            ))}
        </Container>
    );
}

export default NationalSocietyKeyDocuments;
