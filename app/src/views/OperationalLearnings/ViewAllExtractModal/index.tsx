import { useCallback } from 'react';
import {
    Button,
    Container,
    Modal,
    Pager,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import ExportButton from '#components/domain/ExportButton';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';

import { FilterValue } from '../Filters';

import i18n from './i18n.json';

interface Props {
    onClose: (requestDone?: boolean) => void;
}

function ViewAllExtractModal(props: Props) {
    const strings = useTranslation(i18n);

    const {
        onClose,
    } = props;
    const {
        page,
        setPage,
    } = useFilterState<FilterValue>({
        filter: {},
        pageSize: 6,
    });
    const {
        response: insightsResponse,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        preserveResponse: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handleExportClick = useCallback(() => {
    });

    return (
        <Modal
            heading={strings.operationalLearningsExtracts}
            onClose={onClose}
            size="full"
            withHeaderBorder
            headingLevel={2}
        >
            <Container
                spacing="relaxed"
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={0}
                        totalCount={0}
                        pendingExport={false}
                    />
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={5}
                        maxItemsPerPage={insightsResponse?.count ?? 0}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <Container
                    heading="component-1"
                    headerDescription="URxlUCLBPnBOjFtsPsJaXsaHnYusFLNMsNEVDQqKkfQFarmEDT"
                    actions={(
                        <Button
                            name={undefined}
                        >
                            Source
                        </Button>
                    )}
                    footerContent={(
                        <div>
                            DATE OF LEARNING : 2020/33/03
                        </div>
                    )}
                />
            </Container>
        </Modal>
    );
}

export default ViewAllExtractModal;
