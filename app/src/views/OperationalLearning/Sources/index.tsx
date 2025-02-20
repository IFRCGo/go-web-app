import ReactDOMServer from 'react-dom/server';
import { CopyLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Pager,
    RawList,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import AllExtractsModal from './AllExtractsModal';
import Emergency from './Emergency';

import i18n from './i18n.json';

// FIXME: move this to utils
// NOTE: this may be slower on the long run
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isChildNull(children: any) {
    return !ReactDOMServer.renderToStaticMarkup(children);
}

type AppealDocumentResponse = GoApiResponse<'/api/v2/appeal_document/'>;
type AppealDocument = NonNullable<AppealDocumentResponse['results']>[number];

const PAGE_SIZE = 10;

interface Props {
    className?: string;
    summaryType: 'sector' | 'component' | 'insight';
    summaryId: number;
}

function Sources(props: Props) {
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
        <Container
            className={className}
            footerContent={isChildNull(pager) ? undefined : pager}
            contentViewType="vertical"
            footerIcons={(
                <Button
                    name="viewAll"
                    variant="secondary"
                    icons={<CopyLineIcon />}
                    onClick={setShowExtractsModalTrue}
                >
                    {strings.viewAllExtracts}
                </Button>
            )}
            emptyMessage={strings.noSources}
            errored={isDefined(appealDocumentError)}
            pending={appealDocumentPending}
            filtered={false}
            compactMessage
        >
            <RawList
                data={appealDocumentResponse?.results}
                renderer={Emergency}
                keySelector={numericIdSelector}
                rendererParams={appealRendererParams}
            />
            {showExtractsModal && (
                <AllExtractsModal
                    summaryType={summaryType}
                    summaryId={summaryId}
                    onCancel={setShowExtractsModalFalse}
                />
            )}
        </Container>
    );
}

export default Sources;
