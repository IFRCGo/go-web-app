import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';

import CatalogueInfoCard, { type LinkData } from '#components/CatalogueInfoCard';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const rapidResponseRoleProfiles: LinkData[] = useMemo(() => ([
        {
            title: strings.assessmentCoordinator,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQ9QFbNL6cxNnLmDUT166lYBFZ-nDf5Pn6Z79NnrAJAuSw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.informationAnalysisOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWavntSyEd9CsehUObMQOJ0B9R8xDouAJOgTAgPvzcLOpw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.primaryDataCollectionOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETQ2bJvxaQNGoXzEjf2IjNcB16FwnTxS-Jct1yf539FZ3A',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.mappingAndVisualizationOfficer,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfRPUaQzIH1Emzi0mrJq5S8BzQZs4vvXQjKq3gfAzqMrJg',
            external: true,
            withLinkIcon: true,
        },
    ]), [
        strings.assessmentCoordinator,
        strings.informationAnalysisOfficer,
        strings.primaryDataCollectionOfficer,
        strings.mappingAndVisualizationOfficer,
    ]);

    const technicalCompetencyFrameworkInfo: LinkData[] = useMemo(() => ([
        {
            title: strings.technicalCompetencyFrameworkAssessment,
            href: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbmgwMFvUHtFkkc26GZhAo0BIuwI2UWSkrFyehAq7ZfT6g',
            external: true,
            withLinkIcon: true,
        },
    ]), [
        strings.technicalCompetencyFrameworkAssessment,
    ]);

    const assessmentCellInfo: LinkData[] = useMemo(() => ([
        {
            title: strings.assessmentCell,
            to: 'surgeCatalogueEmergencyNeedsAssessmentCell',
            withLinkIcon: true,
        },
    ]), [
        strings.assessmentCell,
    ]);

    const assessmentAndPlanningInfo: LinkData[] = useMemo(() => ([
        {
            title: strings.fedNet,
            href: 'https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/disasters/disaster-and-crisis-mangement/assessment--planning/',
            external: true,
            withLinkIcon: true,
        },
    ]), [
        strings.fedNet,
    ]);

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueEmergencyTitle}
            description={strings.emergencyNeedsDetails}
        >
            <SurgeCardContainer
                heading={strings.rapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.rapidResponseRoleProfiles}
                    data={rapidResponseRoleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalCompetencyFramework}
                    data={technicalCompetencyFrameworkInfo}
                    description={strings.technicalCompetencyFrameworkDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.servicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.assessmentCell}
                    data={assessmentCellInfo}
                    description={strings.assessmentCellDetails}
                />
                <div />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.additionalResourcesTitle}
            >
                <CatalogueInfoCard
                    title={strings.assessmentAndPlanning}
                    data={assessmentAndPlanningInfo}
                    description={strings.assessmentAndPlanningDetails}
                />
                <div />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueEmergencyNeedsAssessment';
