import { Container } from '@ifrc-go/ui';

import OngoingERUDeployments from '#views/Surge/OngoingERUDeployments';

import EmergencyResponseUnitReadiness from './EmergencyResponseUnitReadiness';
/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <Container
            contentViewType="vertical"
            spacing="loose"
        >
            <EmergencyResponseUnitReadiness />
            <OngoingERUDeployments />
        </Container>
    );
}

Component.displayName = 'EmergencyResponseUnit';
