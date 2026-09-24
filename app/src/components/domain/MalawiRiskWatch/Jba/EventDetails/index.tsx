import {
    Container,
    InfoPopup,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    formatNumber,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';
import { FIELD_REPORT_STATUS_EARLY_WARNING } from '#utils/constants';

import ActivationChecklist from '../../ActivationChecklist';
import { JBA_IMPACT_THRESHOLD } from '../../constants';
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
                spacing="xs"
            >
                <TextOutput
                    label={strings.jbaEventDetailsTargetDate}
                    value={activeRow.forecastTargetDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                <TextOutput
                    label={strings.jbaEventDetailsPopulationImpacted}
                    value={impact}
                    valueType="number"
                    maximumFractionDigits={0}
                    strongValue
                    withLightBackground
                />
                {data.rows.length > 1 && (
                    <Container
                        heading={strings.jbaEventDetailsTrajectoryHeading}
                        headingLevel={5}
                        withBackground
                        withPadding
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
                <ActivationChecklist
                    source="JBA"
                    pcode={data.id}
                    recordDate={activeRow.forecastIssueDate}
                    steps={[
                        {
                            key: 'issued',
                            label: strings.jbaActivationForecastIssued,
                            completed: true,
                        },
                        {
                            key: 'threshold',
                            label: strings.jbaActivationThresholdExceeded,
                            completed: isDefined(impact) && impact >= JBA_IMPACT_THRESHOLD,
                        },
                    ]}
                    reportCreatedLabel={strings.jbaActivationReportCreated}
                    withDrefStep
                />
                <CreateReportLink
                    source="JBA"
                    status={FIELD_REPORT_STATUS_EARLY_WARNING}
                    label={strings.jbaEventDetailsCreateReport}
                    pcode={data.id}
                    recordDate={activeRow.forecastIssueDate}
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
