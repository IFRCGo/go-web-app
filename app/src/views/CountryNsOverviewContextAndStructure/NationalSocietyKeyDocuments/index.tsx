import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SearchLineIcon } from '@ifrc-go/icons';
import {
    Container,
    DateInput,
    RawList,
    TextInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
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

    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
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
            ordering: '-year',
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
            footerActions={isDefined(groupedDocumentsList)
                && groupedDocumentsList.length > 0
                && isDefined(countryResponse?.fdrs) && (
                <TextOutput
                    label={strings.source}
                    value={(
                        <Link
                            variant="tertiary"
                            href={`https://data.ifrc.org/fdrs/national-society/${countryResponse.fdrs}`}
                            external
                            withUnderline
                        >
                            {resolveToString(
                                strings.sourceFDRS,
                                { nationalSociety: countryResponse.society_name },
                            )}
                        </Link>
                    )}
                />
            )}
            pending={documentResponsePending}
            errored={isDefined(documentResponseError)}
            filtered={filtered}
            contentViewType="grid"
            numPreferredGridContentColumns={3}
        >
            <RawList
                data={groupedDocumentsList}
                keySelector={groupedDocumentsListKeySelector}
                renderer={DocumentListCard}
                rendererParams={rendererParams}
            />
        </Container>
    );
}

export default NationalSocietyKeyDocuments;
