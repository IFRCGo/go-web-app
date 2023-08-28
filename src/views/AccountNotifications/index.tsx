import { isNotDefined, isTruthyString } from '@togglecorp/fujs';

import Container from '#components/Container';
import List from '#components/List';
import useUserMe from '#hooks/domain/useUserMe';
import { GoApiResponse, ListResponseItem, useRequest } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { useCallback } from 'react';
import ExpandableContainer from '#components/ExpandableContainer';
import TextOutput from '#components/TextOutput';
import HtmlOutput from '#components/HtmlOutput';

import styles from './styles.module.css';

type FieldReportItem = ListResponseItem<GoApiResponse<'/api/v2/field-report/'>>;

interface FieldReportPreviewProps {
    data: FieldReportItem;
}

function FieldReportPreview(props: FieldReportPreviewProps) {
    const { data } = props;

    return (
        <ExpandableContainer
            heading={data.summary}
            headingLevel={4}
            headingDescription={(
                <TextOutput
                    label="Last Updated"
                    value={data.updated_at ?? data.created_at}
                    valueType="date"
                />
            )}
        >
            {isTruthyString(data.description) ? (
                <HtmlOutput
                    value={data.description}
                />
            ) : 'Description not available!'}
        </ExpandableContainer>
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const userMe = useUserMe();

    const {
        response: fieldReportResponse,
        pending: fieldReportResponsePending,
    } = useRequest({
        skip: isNotDefined(userMe?.id),
        url: '/api/v2/field-report/',
        query: {
            user: userMe?.id,
            limit: 10,
        },
    });

    const fieldReportPreviewRendererParams = useCallback(
        (_: number, fieldReport: FieldReportItem): FieldReportPreviewProps => ({
            data: fieldReport,
        }),
        [],
    );

    return (
        <div className={styles.accountNotifications}>
            <Container
                heading="Submitted Field Reports"
                withHeaderBorder
            >
                <List
                    errored={false}
                    pending={fieldReportResponsePending}
                    filtered={false}
                    data={fieldReportResponse?.results}
                    keySelector={numericIdSelector}
                    renderer={FieldReportPreview}
                    rendererParams={fieldReportPreviewRendererParams}
                />
            </Container>
        </div>
    );
}

Component.displayName = 'AccountNotifications';
