import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    type RowOptions,
    TableData,
    TableRow,
} from '@ifrc-go/ui';
import {
    Modal,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createExpandColumn,
    createNumberColumn,
    createStringColumn,
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import SelectOutput, { type Props as SelectOutputProps } from '#components/SelectOutput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import LocalUnitImportSummary from '../LocalUnitImportSummary';

import i18n from './i18n.json';
import styles from './styles.module.css';

const PAGE_SIZE = 5;
type UploadHistory = NonNullable<GoApiResponse<'/api/v2/bulk-upload-local-unit/'>['results']>[number];
type BulkUploadEnumsResponse = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['local_units_bulk_upload_status']>[number];

const statusKeySelector = (item: BulkUploadEnumsResponse) => item.key;
const statusValueSelector = (item: BulkUploadEnumsResponse) => item.value;

interface Props {
    onClose: () => void;
    country: string;
    countryId: number;
}

function LocalUnitImportHistoryModal(props: Props) {
    const { onClose, country, countryId } = props;

    const strings = useTranslation(i18n);

    const { local_units_bulk_upload_status: bulkUploadStatus } = useGlobalEnums();

    const {
        limit,
        offset,
        page,
        setPage,
    } = useFilterState<object>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const [expandedRow, setExpandedRow] = useState<UploadHistory | undefined>();

    const handleExpandRowClick = useCallback(
        (row: UploadHistory) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const {
        response: uploadHistoryResponse,
        pending: uploadHistoryPending,
    } = useRequest({
        url: '/api/v2/bulk-upload-local-unit/',
        query: {
            country__id: countryId,
            limit,
            offset,
        },
    });

    const columns = useMemo(() => ([
        createDateColumn<UploadHistory, number>(
            'uploadedDate',
            strings.tableUploadedDateLabel,
            (item) => item.triggered_at,
        ),
        createNumberColumn<UploadHistory, number>(
            'size',
            strings.tableSizeLabel,
            (item) => item.file_size / 1024,
        ),
        createStringColumn<UploadHistory, number>(
            'uploadedBy',
            strings.tableUploadedByLabel,
            (item) => item.triggered_by_details.first_name,
        ),
        createElementColumn<
            UploadHistory,
            number,
            SelectOutputProps<number, BulkUploadEnumsResponse>
        >(
            'status',
            strings.tableStatusLabel,
            SelectOutput,
            (_, item) => ({
                name: 'status',
                value: item.status,
                options: bulkUploadStatus,
                keySelector: statusKeySelector,
                labelSelector: statusValueSelector,
            }),
        ),
        createExpandColumn<UploadHistory, number>(
            'expand',
            '',
            (row) => ({
                onClick: handleExpandRowClick,
                expanded: row.id === expandedRow?.id,
            }),
        ),
    ]), [
        bulkUploadStatus,
        expandedRow,
        handleExpandRowClick,
        strings.tableSizeLabel,
        strings.tableStatusLabel,
        strings.tableUploadedByLabel,
        strings.tableUploadedDateLabel,
    ]);

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<UploadHistory, number>) => {
            if (expandedRow?.id !== datum.id) {
                return row;
            }

            return (
                <>
                    {row}
                    <TableRow>
                        <TableData
                            colSpan={columns.length}
                            className={styles.expandedCell}
                        >
                            <LocalUnitImportSummary
                                value={expandedRow}
                            />
                        </TableData>
                    </TableRow>
                </>
            );
        },
        [expandedRow, columns.length],
    );

    const getRowClassName = useCallback((key: number) => (
        key === expandedRow?.id ? styles.expandedRow : styles.row
    ), [expandedRow]);

    return (
        <Modal
            className={styles.bulkUploadHistoryModal}
            heading={resolveToString(
                strings.modalHeading,
                { countryName: country },
            )}
            footerActions={isDefined(uploadHistoryResponse)
                && isDefined(uploadHistoryResponse.count)
                && uploadHistoryResponse.count > limit ? (
                    <Pager
                        activePage={page}
                        itemsCount={uploadHistoryResponse.count}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                ) : undefined}
            size="md"
            onClose={onClose}
            withHeaderBorder
        >
            <Table
                pending={uploadHistoryPending}
                filtered={false}
                columns={columns}
                keySelector={numericIdSelector}
                data={uploadHistoryResponse?.results}
                rowModifier={rowModifier}
                rowClassName={getRowClassName}
            />
        </Modal>
    );
}

export default LocalUnitImportHistoryModal;
