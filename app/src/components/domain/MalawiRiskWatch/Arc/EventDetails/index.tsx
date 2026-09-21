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
import { type ArcDistrictEvent } from '../utils';

import i18n from './i18n.json';

type Props = RiskEventDetailProps<ArcDistrictEvent, undefined>;

function EventDetails(props: Props) {
    const {
        data,
        children,
    } = props;

    const strings = useTranslation(i18n);

    const { observation, adminArea } = data;
    const { impact } = observation;

    return (
        <Container>
            <ListView
                layout="block"
                spacing="sm"
            >
                <TextOutput
                    label={strings.arcEventDetailsObservationDate}
                    value={observation.observationDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                <TextOutput
                    label={strings.arcEventDetailsTrigger}
                    value={observation.cellTrigger
                        ? strings.arcEventDetailsTriggered
                        : strings.arcEventDetailsNotTriggered}
                    strongValue
                    withLightBackground
                />
                <Container
                    heading={strings.arcEventDetailsPopulationImpacted}
                    headingLevel={5}
                    headerActions={(
                        <InfoPopup
                            title={strings.arcEventDetailsPopulationImpacted}
                            description={strings.arcEventDetailsPopulationImpactedInfo}
                        />
                    )}
                >
                    <KeyFigure
                        value={impact}
                        valueType="number"
                        valueOptions={{ maximumFractionDigits: 0 }}
                    />
                </Container>
                <CreateReportLink
                    adminArea={adminArea}
                    impact={impact}
                    startDate={observation.observationDate}
                    title={resolveToString(
                        strings.arcEventDetailsReportTitle,
                        { district: data.name },
                    )}
                    description={resolveToString(
                        strings.arcEventDetailsReportDescription,
                        {
                            date: formatDate(observation.observationDate) ?? '',
                            impact: formatNumber(Math.round(impact ?? 0)) ?? '',
                            district: data.name,
                        },
                    )}
                />
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
