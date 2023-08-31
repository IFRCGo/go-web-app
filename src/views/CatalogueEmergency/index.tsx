import { useMemo } from 'react';

import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
        <Container
            headingLevel={2}
            heading={strings.catalogueEmergencyTitle}
            className={styles.catalogueEmergency}
            childrenContainerClassName={styles.content}
        >
            <div>
                {strings.emergencyNeedsDetails}
            </div>
            <Container
                heading={strings.rapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.servicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.assessmentCell}
                    data={assessmentCellInfo}
                    description={strings.assessmentCellDetails}
                />
                <div />
            </Container>
            <Container
                heading={strings.additionalResourcesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.assessmentAndPlanning}
                    data={assessmentAndPlanningInfo}
                    description={strings.assessmentAndPlanningDetails}
                />
                <div />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueEmergency';
