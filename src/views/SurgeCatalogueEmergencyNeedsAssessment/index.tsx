import { useMemo } from 'react';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const rapidResponseRoleProfiles: LinkData[] = useMemo(() => ([
        {
            title: strings.assessmentCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQ9QFbNL6cxNnLmDUT166lYBFZ-nDf5Pn6Z79NnrAJAuSw',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.informationAnalysisOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWavntSyEd9CsehUObMQOJ0B9R8xDouAJOgTAgPvzcLOpw',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.primaryDataCollectionOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETQ2bJvxaQNGoXzEjf2IjNcB16FwnTxS-Jct1yf539FZ3A',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.mappingAndVisualizationOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EfRPUaQzIH1Emzi0mrJq5S8BzQZs4vvXQjKq3gfAzqMrJg',
            external: true,
            withExternalLinkIcon: true,
        },
    ]), [strings]);

    const technicalCompetencyFrameworkInfo: LinkData[] = useMemo(() => ([
        {
            title: strings.technicalCompetencyFrameworkAssesment,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbmgwMFvUHtFkkc26GZhAo0BIuwI2UWSkrFyehAq7ZfT6g',
            external: true,
            withExternalLinkIcon: true,
        },
    ]), [strings]);

    const assessmentCellInfo: LinkData[] = useMemo(() => ([
        {
            title: strings.assessmentCell,
            to: 'assessmentCell',
            withForwardIcon: true,
        },
    ]), [strings]);

    const assessmentAndPlanningInfo: LinkData[] = useMemo(() => ([
        {
            title: strings.fedNet,
            to: 'https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/disasters/disaster-and-crisis-mangement/assessment--planning/',
            external: true,
            withExternalLinkIcon: true,
        },
    ]), [strings]);

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
