import {
    Chip,
    List,
    Modal,
    Pager,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useCountry from '#hooks/domain/useCountry';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import Extract from './Extract';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OpsLearningResponse = GoApiResponse<'/api/v2/ops-learning/'>;
type OpsLearning = NonNullable<OpsLearningResponse['results']>[number];

interface Props {
    summaryType: 'sector' | 'component' | 'insight';
    summaryId: number;
    onCancel: () => void;
}

const PAGE_SIZE = 25;

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
        pageSize: PAGE_SIZE,
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

    const extractsRendererParams = (_: number, learning: OpsLearning) => ({
        countryName: countries.find((country) => country.id === learning.appeal?.country)?.name,
        emergencyId: learning.appeal?.event_details?.id,
        emergencyName: learning.appeal?.event_details?.name,
        appealDocumentURL: learning?.document_url,
        extract: learning.learning_validated,
        operationStartDate: learning.appeal?.start_date,
    });

    const opsLearningCount = opsLearningResponse?.count ?? 0;

    return (
        <Modal
            className={styles.modal}
            heading={strings.allExtractsModalHeading}
            onClose={onCancel}
            pending={opsLearningPending}
            size="xl"
            headerDescriptionContainerClassName={styles.headerDescription}
            headerDescription={(
                <Chip
                    name="extractsCount"
                    label={(opsLearningCount > 1) ? (
                        resolveToString(
                            strings.allExtractsModalExtractsCount,
                            { count: opsLearningCount },
                        )
                    ) : (
                        resolveToString(
                            strings.allExtractsModalExtractCount,
                            { count: opsLearningCount },
                        )
                    )}
                    variant="tertiary"
                />
            )}
            footerContent={(
                <Pager
                    activePage={opsLearningActivePage}
                    onActivePageChange={setOpsLearningActivePage}
                    itemsCount={opsLearningCount}
                    maxItemsPerPage={opsLearningLimit}
                />
            )}
            childrenContainerClassName={styles.extractListContainer}
        >
            <List
                className={styles.extractList}
                data={opsLearningResponse?.results}
                renderer={Extract}
                keySelector={numericIdSelector}
                rendererParams={extractsRendererParams}
                emptyMessage="No extracts"
                errored={isDefined(opsLearningError)}
                pending={false}
                filtered={false}
                compact
            />
        </Modal>
    );
}

export default AllExtractsModal;
