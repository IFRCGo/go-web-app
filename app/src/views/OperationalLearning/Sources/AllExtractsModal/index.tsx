import {
    Chip,
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

    const extractsRendererParams = (_: number, learning: OpsLearning): ContainerProps => ({
        headingContainerClassName: styles.extractHeadingContainer,
        heading: countries.find((country) => country.id === learning.appeal?.country)?.name,
        headingDescription: (
            <Link
                to="emergencyDetails"
                urlParams={{
                    emergencyId: learning.appeal?.event_details.id,
                }}
                withUnderline
            >
                {learning.appeal?.event_details.name}
            </Link>
        ),
        actions: ((
            <Link
                variant="primary"
                href={learning?.document_url}
                withLinkIcon
                external
            >
                {strings.source}
            </Link>
        )),
        className: styles.extract,
        children: learning.learning_validated,
        withInternalPadding: true,
        footerContent: (
            <TextOutput
                label={strings.dateOfLearning}
                value={learning?.appeal?.event_details.start_date}
                strongValue
                valueType="date"
            />
        ),
    });

    return (
        <Modal
            className={styles.modal}
            heading={strings.heading}
            onClose={onCancel}
            pending={opsLearningPending}
            size="xl"
            headerDescriptionContainerClassName={styles.headerDescription}
            headerDescription={(
                <Chip
                    name="extractsCount"
                    label={((opsLearningResponse?.count ?? 0) > 1) ? (
                        resolveToString(
                            strings.extractsCount,
                            { count: opsLearningResponse?.count },
                        )
                    ) : (
                        resolveToString(
                            strings.extractCount,
                            { count: opsLearningResponse?.count },
                        )
                    )}
                    variant="tertiary"
                />
            )}
            footerContent={(
                <Pager
                    activePage={opsLearningActivePage}
                    onActivePageChange={setOpsLearningActivePage}
                    itemsCount={opsLearningResponse?.count ?? 0}
                    maxItemsPerPage={opsLearningLimit}
                />
            )}
            childrenContainerClassName={styles.extractListContainer}
        >
            <List
                className={styles.extractList}
                data={opsLearningResponse?.results}
                renderer={Container}
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
