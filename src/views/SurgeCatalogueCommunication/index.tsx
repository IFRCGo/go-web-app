import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const certOne: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueCommunicationErtOne',
            withLinkIcon: true,
        },
    ];

    const certTwo: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueCommunicationErtTwo',
            withLinkIcon: true,
        },
    ];

    const certThree: LinkData[] = [
        {
            title: strings.learnMore,
            to: 'surgeCatalogueCommunicationErtThree',
            withLinkIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.communicationCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbAlam4vsydNjvuNJmy3EPkBuCeRgBZz7vnk_nipfrHFsw',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communicationTeamLeader,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ef561fqNVm9Bh1w9i7LLBfcBk7WIkZA4YwHBXehXSoyE3g',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communicationOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZiWRknC3m5GmDsFMB1u-QwBz2A7qBFMCD6mvn6m4rStUA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communicationAudioVisualOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWNylwoAPp1Hm48-MqA3_YEBmlfuxMgBf7NRSGVSMd51lA',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communicationPhotographer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVtNMghwDthPi7juFr_s-dQBqouRL8aZ8PyHY8bvN09oWQ',
            external: true,
            withLinkIcon: true,
        },
        {
            title: strings.communicationVideographer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ee33uW7nBMFFrME7ECn5rDcBhaztPNu92KAV2jL_asDjkg',
            external: true,
            withLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalCompetencyFrameworkItemTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EeWVVZqp8-9Evr8GxSrsrBgBeU_aXT-B9hX8O-nS3fIL1g',
            external: true,
            withLinkIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueCommunicationTitle}
            description={strings.communicationDetails}
        >
            <SurgeCardContainer
                heading={strings.communicationRapidResponsePersonnelTitle}
            >
                <CatalogueInfoCard
                    title={strings.communicationRoleProfiles}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    title={strings.technicalCompetencyFramework}
                    data={frameworkData}
                    description={strings.technicalCompetencyFrameworkDetails}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.communicationServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.communicationServicesErtTitle}
                    data={certOne}
                    description={strings.certOneDetails}
                />
                <CatalogueInfoCard
                    title={strings.communicationServicesErtTitle}
                    data={certTwo}
                    description={strings.certTwoDetails}
                />
                <CatalogueInfoCard
                    title={strings.communicationServicesErtTitle}
                    data={certThree}
                    description={strings.certThreeDetails}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueCommunication';
