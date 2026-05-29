import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import { type RiskEventDetailProps } from '#components/domain/RiskImminentEventMap';

import { ARC_IMPACT_THRESHOLD } from '../../malawi/constants';
import { type ArcEvent } from '../index';

type Props = RiskEventDetailProps<ArcEvent, number | undefined>;

function EventDetails(props: Props) {
    const {
        data,
        pending,
        children,
    } = props;

    return (
        <Container pending={pending}>
            <ListView layout="block" spacing="xs">
                <TextOutput
                    // FIXME: use strings
                    label="Observation date"
                    value={data.observationDate}
                    valueType="date"
                    strongValue
                    withLightBackground
                />
                {isDefined(data.rainfall) && (
                    <TextOutput
                        // FIXME: use strings
                        label="Rainfall (mm)"
                        value={data.rainfall}
                        valueType="number"
                        maximumFractionDigits={2}
                        strongValue
                        withLightBackground
                    />
                )}
                {isDefined(data.rainfallRaw) && (
                    <TextOutput
                        label="Rainfall raw (mm)"
                        value={data.rainfallRaw}
                        valueType="number"
                        maximumFractionDigits={2}
                        strongValue
                        withLightBackground
                    />
                )}
                <TextOutput
                    label="Impact"
                    value={data.impact}
                    valueType="number"
                    maximumFractionDigits={3}
                    strongValue
                    withLightBackground
                />
                {isDefined(data.eventRp) && (
                    <TextOutput
                        // FIXME: use strings
                        label="Return period (years)"
                        value={data.eventRp}
                        valueType="number"
                        strongValue
                        withLightBackground
                    />
                )}
                <TextOutput
                    // FIXME: use strings
                    label="Cell trigger"
                    value={data.cellTrigger ? 'Active' : 'Below trigger'}
                    strongValue
                    withLightBackground
                />
                <TextOutput
                    // FIXME: use strings — placeholder threshold value
                    label="Applied threshold"
                    value={ARC_IMPACT_THRESHOLD}
                    valueType="number"
                    maximumFractionDigits={3}
                    strongValue
                    withLightBackground
                />
                {children && <div />}
                {children}
            </ListView>
        </Container>
    );
}

export default EventDetails;
