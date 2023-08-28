import { isTruthyString } from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import TextOutput from '#components/TextOutput';
import HtmlOutput from '#components/HtmlOutput';

import { type GoApiResponse, type ListResponseItem } from '#utils/restRequest';

type FieldReportItem = ListResponseItem<GoApiResponse<'/api/v2/field-report/'>>;

export interface Props {
    data: FieldReportItem;
}

function FieldReportListItem(props: Props) {
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

export default FieldReportListItem;
