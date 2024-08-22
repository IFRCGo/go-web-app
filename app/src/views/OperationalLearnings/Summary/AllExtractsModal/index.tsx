import {
    Container,
    type ContainerProps,
    List,
    Modal,
    Pager,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import useCountry from '#hooks/domain/useCountry';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type OpsLearningResponse = GoApiResponse<'/api/v2/ops-learning/'>;
type OpsLearning = NonNullable<OpsLearningResponse['results']>[number];

interface Props {
    summaryType: 'sector' | 'component' | 'insight';
    summaryId: number;
    onCancel: () => void;
}

function AllExtractsModal(props: Props) {
    const {
        summaryType,
        summaryId,
        onCancel,
    } = props;

    const countries = useCountry();

    const strings = useTranslation(i18n);

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
        url: '/api/v2/ops-learning/',
        query: {
            insight_component_id: summaryType === 'component' ? summaryId : undefined,
            insight_sector_id: summaryType === 'sector' ? summaryId : undefined,
            insight_id: summaryType === 'insight' ? summaryId : undefined,
            limit: opsLearningLimit,
            offset: opsLearningOffset,
        },
        preserveResponse: true,
    });

    const extractsRendererParams = (_: number, learning: OpsLearning): ContainerProps => ({
        heading: countries.find((country) => country.id === learning.appeal?.country)?.name,
        headingDescription: learning.appeal?.event_details?.name,
        actions: (isDefined(learning?.document_url) && (
            <Link
                variant="primary"
                href={learning?.document_url}
                withLinkIcon
                external
            >
                {strings.source}
            </Link>
        )),
        children: learning.learning_validated,
        footerContent: (
            <TextOutput
                label={strings.dateOfLearning}
                value={learning?.appeal?.event_details.start_date}
                valueType="date"
            />
        ),
    });

    return (
        <Modal
            heading={strings.heading}
            onClose={onCancel}
            pending={opsLearningPending}
            size="auto"
            headerDescription={resolveToString(
                strings.extractsCount,
                { count: opsLearningResponse?.count },
            )}
            footerContent={(
                <Pager
                    activePage={opsLearningActivePage}
                    onActivePageChange={setOpsLearningActivePage}
                    itemsCount={opsLearningResponse?.count ?? 0}
                    maxItemsPerPage={opsLearningLimit}
                />
            )}
        >
            <List
                data={opsLearningResponse?.results}
                renderer={Container}
                keySelector={numericIdSelector}
                rendererParams={extractsRendererParams}
                emptyMessage="No extracts"
                errored={isDefined(opsLearningError)}
                pending={false}
                filtered={false}
            />
        </Modal>
    );
}

export default AllExtractsModal;
