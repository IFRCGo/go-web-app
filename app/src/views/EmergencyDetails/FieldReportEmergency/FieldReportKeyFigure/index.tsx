import {
    Container,
    KeyFigure,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

interface Props {
    fieldReportResponse: FieldReportListItem | undefined;
}

function FieldReportKeyFigure(props: Props) {
    const { fieldReportResponse } = props;
    const strings = useTranslation(i18n);

    return (
        <Container
            heading={strings.keyFiguresHeading}
            withHeaderBorder
        >
            <Container
                withShadow
                withBackground
            >
                <ListView
                    layout="inline"
                    withSpaceBetweenContents
                    spacing="xl"
                    withBackground
                    withPadding
                >
                    <KeyFigure
                        label={strings.injuredLabel}
                        value={fieldReportResponse?.other_num_injured}
                        valueType="number"
                    />
                    <KeyFigure
                        label={strings.deadLabel}
                        value={fieldReportResponse?.num_dead}
                        valueType="number"
                    />
                    <KeyFigure
                        label={strings.missingLabel}
                        value={fieldReportResponse?.num_missing}
                        valueType="number"
                    />
                    <KeyFigure
                        label={strings.affectedLabel}
                        value={fieldReportResponse?.num_affected}
                        valueType="number"
                    />
                    <KeyFigure
                        label={strings.displacedLabel}
                        value={fieldReportResponse?.num_displaced}
                        valueType="number"
                    />
                </ListView>
            </Container>
        </Container>
    );
}

export default FieldReportKeyFigure;
