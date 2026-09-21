import {
    Container,
    InfoPopup,
    KeyFigure,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';

import CreateReportLink from '../../CreateReportLink';
import {
    impactSelector,
    type JbaDistrictEvent,
} from '../utils';
import BaselineExposure from './BaselineExposure';
import TrajectoryChart from './TrajectoryChart';

import i18n from './i18n.json';

type Props = RiskEventDetailProps<JbaDistrictEvent, undefined>;

function EventDetails(props: Props) {
    const {
        data,
        children,
    } = props;

    const strings = useTranslation(i18n);

    const { activeRow, adminArea } = data;
    const impact = impactSelector(activeRow);

    return (
        <Container>
            <ListView
                layout="block"
                spacing="sm"
            >
                <TextOutput
                    label={strings.jbaEventDetailsTargetDate}
                    value={activeRow.forecastTargetDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                <Container
                    heading={strings.jbaEventDetailsPopulationImpacted}
                    headingLevel={5}
                    headerActions={(
                        <InfoPopup
                            title={strings.jbaEventDetailsPopulationImpacted}
                            description={strings.jbaEventDetailsPopulationImpactedInfo}
                        />
                    )}
                >
                    <KeyFigure
                        value={impact}
                        valueType="number"
                        valueOptions={{ maximumFractionDigits: 0 }}
                    />
                </Container>
                {data.rows.length > 1 && (
                    <Container
                        heading={strings.jbaEventDetailsTrajectoryHeading}
                        headingLevel={5}
                        headerActions={(
                            <InfoPopup
                                title={strings.jbaEventDetailsTrajectoryHeading}
                                description={strings.jbaEventDetailsTrajectoryInfo}
                            />
                        )}
                    >
                        <TrajectoryChart
                            rows={data.rows}
                            activeLeadTimeDays={activeRow.leadTimeDays}
                        />
                    </Container>
                )}
                <BaselineExposure pcode={data.id} />
                <CreateReportLink
                    adminArea={adminArea}
                    impact={impact}
                    startDate={activeRow.forecastTargetDate}
                    title={resolveToString(
                        strings.jbaEventDetailsReportTitle,
                        { district: data.name },
                    )}
                    description={resolveToString(
                        strings.jbaEventDetailsReportDescription,
                        {
                            issueDate: formatDate(activeRow.forecastIssueDate) ?? '',
                            impact: formatNumber(Math.round(impact ?? 0)) ?? '',
                            district: data.name,
                            leadTime: activeRow.leadTimeDays,
                            targetDate: formatDate(activeRow.forecastTargetDate) ?? '',
                        },
                    )}
                />
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
