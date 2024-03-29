import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Container,
    DateInput,
    Grid,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import { CountryOutletContext } from '#utils/outletContext';
import {
    GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import DocumentListCard from './DocumentListCard';

import i18n from './i18n.json';

type GetKeyDocumentResponse = GoApiResponse<'/api/v2/country-document/'>;
type KeyDocumentItem = NonNullable<GetKeyDocumentResponse['results']>[number];

interface GroupedDocuments {
    label: string;
    documents: KeyDocumentItem[];
}

function groupedDocumentsListKeySelector(groupedDocuments: GroupedDocuments) {
    return groupedDocuments.label;
}

function NationalSocietyKeyDocuments() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();
    const {
        filter,
        rawFilter,
        filtered,
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
        pending: documentResponsePending,
        error: documentResponseError,
    } = useRequest({
        url: '/api/v2/country-document/',
        skip: isNotDefined(countryId),
        query: {
            country: isDefined(countryId) ? Number(countryId) : undefined,
            search: filter.searchText,
            year__gte: filter.startDateAfter,
            year__lte: filter.startDateBefore,
        },
        preserveResponse: true,
    });

    const groupedDocumentsByType = (
        listToGroupList(
            documentResponse?.results,
            (item) => item.document_type,
            (item) => item,
        )
    );

    const groupedDocumentsList = mapToList(
        groupedDocumentsByType,
        (documents, documentType) => ({ label: documentType, documents }),
    );

    const rendererParams = useCallback((label: string, groupedDocuments: GroupedDocuments) => ({
        label,
        documents: groupedDocuments.documents,
    }), []);

    return (
        <Container
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
                data={groupedDocumentsList}
                pending={documentResponsePending}
                errored={isDefined(documentResponseError)}
                filtered={filtered}
                keySelector={groupedDocumentsListKeySelector}
                renderer={DocumentListCard}
                rendererParams={rendererParams}
                numPreferredColumns={3}
            />
        </Container>
    );
}

export default NationalSocietyKeyDocuments;
