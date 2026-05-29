import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';

import { JBA_IMPACT_THRESHOLD } from '../../malawi/constants';
import { type JbaEvent } from '../index';
import LeadTimeChart from './LeadTimeChart';

type Props = RiskEventDetailProps<JbaEvent, JbaEvent[] | undefined>;

function EventDetails(props: Props) {
    const {
        data,
        exposure,
        pending,
        children,
    } = props;

    const activeLeadTimeDays = data.leadTimeDays ?? 0;

    return (
        <Container pending={pending}>
            <ListView layout="block" spacing="xs">
                {exposure && exposure.length > 1 && (
                    <Container
                        // FIXME: use strings
                        heading="Forecast trajectory"
                        headingLevel={5}
                        spacing="xs"
                    >
                        <LeadTimeChart
                            timeline={exposure}
                            activeLeadTimeDays={activeLeadTimeDays}
                        />
                    </Container>
                )}
                <TextOutput
                    // FIXME: use strings
                    label="Forecast issue date"
                    value={data.forecastIssueDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                <TextOutput
                    // FIXME: use strings
                    label="Forecast target date"
                    value={data.forecastTargetDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                {isDefined(data.leadTimeDays) && (
                    <TextOutput
                        // FIXME: use strings
                        label="Lead time (days)"
                        value={data.leadTimeDays}
                        valueType="number"
                        strongValue
                        withLightBackground
                    />
                )}
                <Container
                    // FIXME: use strings
                    heading="Impact"
                    headingLevel={5}
                    spacing="xs"
                >
                    <ListView layout="block" spacing="xs">
                        <TextOutput
                            // FIXME: use strings
                            label="Mean"
                            value={data.band5Mean}
                            valueType="number"
                            maximumFractionDigits={3}
                            strongValue
                            withLightBackground
                        />
                        {isDefined(data.band5Median) && (
                            <TextOutput
                                label="Median"
                                value={data.band5Median}
                                valueType="number"
                                maximumFractionDigits={3}
                                strongValue
                                withLightBackground
                            />
                        )}
                        {isDefined(data.band5P75) && (
                            <TextOutput
                                label="P75"
                                value={data.band5P75}
                                valueType="number"
                                maximumFractionDigits={3}
                                strongValue
                                withLightBackground
                            />
                        )}
                        {isDefined(data.band5P90) && (
                            <TextOutput
                                label="P90"
                                value={data.band5P90}
                                valueType="number"
                                maximumFractionDigits={3}
                                strongValue
                                withLightBackground
                            />
                        )}
                        {isDefined(data.band5Max) && (
                            <TextOutput
                                label="Max"
                                value={data.band5Max}
                                valueType="number"
                                maximumFractionDigits={3}
                                strongValue
                                withLightBackground
                            />
                        )}
                        {isDefined(data.ensemblesNonzeroCount) && (
                            <TextOutput
                                // FIXME: use strings
                                label="Ensembles with non-zero impact"
                                value={`${data.ensemblesNonzeroCount} of 51`}
                                strongValue
                                withLightBackground
                            />
                        )}
                        <TextOutput
                            // FIXME: use strings — placeholder threshold value
                            label="Applied threshold"
                            value={JBA_IMPACT_THRESHOLD}
                            valueType="number"
                            maximumFractionDigits={3}
                            strongValue
                            withLightBackground
                        />
                    </ListView>
                </Container>
                {children && <div />}
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
