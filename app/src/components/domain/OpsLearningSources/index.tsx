import { CopyLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    ListView,
    Pager,
    RawList,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import AllExtractsModal from './AllExtractsModal';
import Emergency from './Emergency';

import i18n from './i18n.json';

type AppealDocumentResponse = GoApiResponse<'/api/v2/appeal_document/'>;
type AppealDocument = NonNullable<AppealDocumentResponse['results']>[number];

const PAGE_SIZE = 10;

interface Props {
    className?: string;
    summaryType: 'sector' | 'component' | 'insight';
    summaryId: number;
}

function OpsLearningSources(props: Props) {
    const {
        summaryId,
        summaryType,
        className,
    } = props;

    const strings = useTranslation(i18n);

    const [showExtractsModal, {
        setTrue: setShowExtractsModalTrue,
        setFalse: setShowExtractsModalFalse,
    }] = useBooleanState(false);

    const {
        page: appealDocumentActivePage,
        setPage: setAppealDocumentActivePage,
        limit: appealDocumentLimit,
        offset: appealDocumentOffset,
    } = useFilterState<object>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const {
        pending: appealDocumentPending,
        response: appealDocumentResponse,
        error: appealDocumentError,
    } = useRequest({
        url: '/api/v2/appeal_document/',
        query: {
            insight_component_id: summaryType === 'component' ? summaryId : undefined,
            insight_sector_id: summaryType === 'sector' ? summaryId : undefined,
            insight_id: summaryType === 'insight' ? summaryId : undefined,
            limit: appealDocumentLimit,
            offset: appealDocumentOffset,
        },
        preserveResponse: true,
    });

    const appealRendererParams = (_: number, appealDocument: AppealDocument) => ({
        emergencyId: appealDocument.appeal.event?.id,
        emergencyName: appealDocument.appeal.event?.name,
        appealDocumentURL: appealDocument.document_url,
        appealDocumentName: appealDocument.name,
    });

    const pager = (
        <Pager
            activePage={appealDocumentActivePage}
            onActivePageChange={setAppealDocumentActivePage}
            itemsCount={appealDocumentResponse?.count ?? 0}
            maxItemsPerPage={appealDocumentLimit}
        />
    );

    return (
        <>
            <Container
                className={className}
                footerActions={pager}
                footer={(
                    <Button
                        name="viewAll"
                        before={<CopyLineIcon />}
                        onClick={setShowExtractsModalTrue}
                    >
                        {strings.viewAllExtracts}
                    </Button>
                )}
                empty={isNotDefined(appealDocumentResponse?.results)
                    || appealDocumentResponse.results.length === 0}
                emptyMessage={strings.noSources}
                errored={isDefined(appealDocumentError)}
                pending={appealDocumentPending}
                overlayPending
            >
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                    spacing="sm"
                >
                    <RawList
                        data={appealDocumentResponse?.results}
                        renderer={Emergency}
                        keySelector={numericIdSelector}
                        rendererParams={appealRendererParams}
                    />
                </ListView>
            </Container>
            {showExtractsModal && (
                <AllExtractsModal
                    summaryType={summaryType}
                    summaryId={summaryId}
                    onCancel={setShowExtractsModalFalse}
                />
            )}
        </>
    );
}

export default OpsLearningSources;
