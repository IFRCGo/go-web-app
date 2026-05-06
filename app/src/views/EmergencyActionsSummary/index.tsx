import { useOutletContext } from 'react-router-dom';
import {
    ButtonLayout,
    Container,
    Description,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import { type OrganizationType } from '#utils/constants';
import { getLatestFieldReport } from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        emergencyResponse,
        emergencyResponsePending,
    } = useOutletContext<EmergencyOutletContext>();

    const strings = useTranslation(i18n);

    const latestFieldReportId = getLatestFieldReport(emergencyResponse?.field_reports)?.id;

    const {
        pending: latestFieldReportPending,
        response: latestFieldReport,
    } = useRequest({
        skip: isNotDefined(latestFieldReportId),
        url: '/api/v2/field-report/{id}/',
        pathVariables: isDefined(latestFieldReportId) ? ({
            id: latestFieldReportId,
        }) : undefined,
    });

    const titleByOrganizationMap: Record<OrganizationType, string> = {
        NTLS: strings.nationalSocietyTitle,
        FDRN: strings.ifrcTitle,
        PNS: strings.otherRCRCActorsTitle,
        GOV: strings.govTitle,
    };

    return (
        <TabPage pending={latestFieldReportPending || emergencyResponsePending}>
            <Container
                heading={strings.actionsTakenSectionTitle}
                withHeaderBorder
                empty={isNotDefined(latestFieldReport)
                    || isNotDefined(latestFieldReport.actions_taken)
                    || latestFieldReport.actions_taken.length === 0}
            >
                <ListView layout="block">
                    {latestFieldReport?.actions_taken?.map((actionTaken) => (
                        <Container
                            key={actionTaken.id}
                            heading={titleByOrganizationMap[actionTaken.organization]}
                            headingLevel={5}
                            withContentWell
                        >
                            <ListView
                                layout="block"
                                spacing="sm"
                            >
                                <ListView
                                    spacing="sm"
                                    withWrap
                                >
                                    {actionTaken.actions_details?.map((action) => (
                                        <ButtonLayout
                                            // FIXME: use appropriate component
                                            key={action.id}
                                            spacingOffset={-3}
                                            withAdditionalInlinePadding
                                        >
                                            {action.name}
                                        </ButtonLayout>
                                    ))}
                                </ListView>
                                <Description>
                                    {actionTaken.summary}
                                </Description>
                            </ListView>
                        </Container>
                    ))}
                </ListView>
            </Container>
        </TabPage>
    );
}

Component.displayName = 'EmergencyActions Summary';
