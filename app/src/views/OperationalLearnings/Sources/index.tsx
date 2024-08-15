import { CopyLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    type ContainerProps,
    List,
    Pager,
} from '@ifrc-go/ui';
import { useBooleanState } from '@ifrc-go/ui/hooks';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import AllExtractsModal from '../Summary/AllExtractsModal';

import styles from './styles.module.css';

type OpsLearningResponse = GoApiResponse<'/api/v2/ops-learning-extracts/'>;
type OpsLearning = NonNullable<OpsLearningResponse['results']>[number];

type Props = {
    summaryType: 'sector' | 'component' | 'insight';
    summaryId: number;
}
function Sources(props: Props) {
    const {
        summaryId,
        summaryType,
    } = props;

    const [showExtractsModal, {
        setTrue: setShowExtractsModalTrue,
        setFalse: setShowExtractsModalFalse,
    }] = useBooleanState(false);

    const {
        page: opsLearningActivePage,
        setPage: setOpsLearningActivePage,
        limit: opsLearningLimit,
        offset: opsLearningOffset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 20,
    });

    const {
        pending: opsLearningPending,
        response: opsLearningResponse,
        error: opsLearningError,
    } = useRequest({
        url: '/api/v2/ops-learning-extracts/',
        query: {
            insight_component_id: summaryType === 'component' ? summaryId : undefined,
            insight_sector_id: summaryType === 'sector' ? summaryId : undefined,
            insight_id: summaryType === 'insight' ? summaryId : undefined,
            limit: opsLearningLimit,
            offset: opsLearningOffset,
        },
        preserveResponse: true,
    });

    const appealsRendererParams = (_: number, learning: OpsLearning): ContainerProps => ({
        childrenContainerClassName: styles.childrenContainer,
        children: (
            <>
                <Link
                    to="emergencyDetails"
                    urlParams={{ emergencyId: learning.appeal?.atype }} // TODO: fix type in server
                    withUnderline
                >
                    {learning.appeal?.event_details?.name}
                </Link>
                {isDefined(learning?.document_url) && (
                    <Link
                        href={learning?.document_url}
                        withLinkIcon
                        external
                    >
                        {learning?.document_name}
                    </Link>
                )}
            </>
        ),
    });

    return (
        <Container
            footerContent={(
                <Pager
                    activePage={opsLearningActivePage}
                    onActivePageChange={setOpsLearningActivePage}
                    itemsCount={opsLearningResponse?.count ?? 0}
                    maxItemsPerPage={opsLearningLimit}
                />
            )}
            errored={isDefined(opsLearningError)}
            pending={opsLearningPending}
        >
            <List
                data={opsLearningResponse?.results}
                renderer={Container}
                keySelector={numericIdSelector}
                rendererParams={appealsRendererParams}
                emptyMessage="No appeals"
                errored={isDefined(opsLearningError)}
                pending={false}
                filtered={false}
                compact
            />
            <Button
                name="viewAll"
                variant="secondary"
                icons={<CopyLineIcon />}
                onClick={setShowExtractsModalTrue}
            >
                View All Extracts
            </Button>
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
