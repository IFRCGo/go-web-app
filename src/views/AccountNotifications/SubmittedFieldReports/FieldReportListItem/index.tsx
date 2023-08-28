import { isTruthyString } from '@togglecorp/fujs';

import ExpandableContainer from '#components/ExpandableContainer';
import TextOutput from '#components/TextOutput';
import HtmlOutput from '#components/HtmlOutput';
import useTranslation from '#hooks/useTranslation';

import { type GoApiResponse, type ListResponseItem } from '#utils/restRequest';
import i18n from './i18n.json';

type FieldReportItem = ListResponseItem<GoApiResponse<'/api/v2/field-report/'>>;

export interface Props {
    data: FieldReportItem;
}

function FieldReportListItem(props: Props) {
    const { data } = props;
    const strings = useTranslation(i18n);

    return (
        <ExpandableContainer
            heading={data.summary}
            headingLevel={4}
            headingDescription={(
                <TextOutput
                    label={strings.fieldReportLastUpdatedLabel}
                    value={data.updated_at ?? data.created_at}
                    valueType="date"
                />
            )}
        >
            {isTruthyString(data.description) ? (
                <HtmlOutput
                    value={data.description}
                />
            ) : strings.fieldReportNoDescriptionLabel}
        </ExpandableContainer>
    );
}

export default FieldReportListItem;
