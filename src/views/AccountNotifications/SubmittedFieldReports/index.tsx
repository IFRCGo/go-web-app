import { useCallback, useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import List from '#components/List';
import Pager from '#components/Pager';
import useUserMe from '#hooks/domain/useUserMe';
import { GoApiResponse, ListResponseItem, useRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import useTranslation from '#hooks/useTranslation';

import FieldReportListItem, { type Props as FieldReportListItemProps } from './FieldReportListItem';

import i18n from './i18n.json';

type FieldReportItem = ListResponseItem<GoApiResponse<'/api/v2/field-report/'>>;
const ITEM_PER_PAGE = 10;

function SubmittedFieldReports() {
    const userMe = useUserMe();
    const [page, setPage] = useState(1);
    const strings = useTranslation(i18n);

    const {
        response: fieldReportResponse,
        pending: fieldReportResponsePending,
    } = useRequest({
        skip: isNotDefined(userMe?.id),
        url: '/api/v2/field-report/',
        query: {
            user: userMe?.id,
            offset: ITEM_PER_PAGE * (page - 1),
            limit: ITEM_PER_PAGE,
        },
        preserveResponse: true,
    });

    const fieldReportPreviewRendererParams = useCallback(
        (_: number, fieldReport: FieldReportItem): FieldReportListItemProps => ({
            data: fieldReport,
        }),
        [],
    );

    return (
        <Container
            heading={strings.fieldReportsByUserHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={fieldReportResponse?.count ?? 0}
                    maxItemsPerPage={ITEM_PER_PAGE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <List
                errored={false}
                pending={fieldReportResponsePending}
                filtered={false}
                data={fieldReportResponse?.results}
                keySelector={numericIdSelector}
                renderer={FieldReportListItem}
                rendererParams={fieldReportPreviewRendererParams}
            />
        </Container>
    );
}

export default SubmittedFieldReports;
