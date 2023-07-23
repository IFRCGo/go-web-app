import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        communicationErtOne: communicationErtOneRoute,
        communicationErtTwo: communicationErtTwoRoute,
        communicationErtThree: communicationErtThreeRoute,
    } = useContext(RouteContext);

    const certOne: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(communicationErtOneRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const certTwo: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(communicationErtTwoRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const certThree: LinkData[] = [
        {
            title: strings.learnMore,
            to: generatePath(communicationErtThreeRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const roleProfiles: LinkData[] = [
        {
            title: strings.communicationCoordinator,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbAlam4vsydNjvuNJmy3EPkBuCeRgBZz7vnk_nipfrHFsw',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communicationTeamLeader,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ef561fqNVm9Bh1w9i7LLBfcBk7WIkZA4YwHBXehXSoyE3g',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communicationOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWNylwoAPp1Hm48-MqA3_YEBmlfuxMgBf7NRSGVSMd51lA',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communicationAudioVisualOfficer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVtNMghwDthPi7juFr_s-dQBqouRL8aZ8PyHY8bvN09oWQ',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communicationPhotographer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ee33uW7nBMFFrME7ECn5rDcBhaztPNu92KAV2jL_asDjkg',
            withExternalLinkIcon: true,
        },
        {
            title: strings.communicationVideographer,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZiWRknC3m5GmDsFMB1u-QwBz2A7qBFMCD6mvn6m4rStUA',
            withExternalLinkIcon: true,
        },
    ];

    const frameworkData: LinkData[] = [
        {
            title: strings.technicalCompetencyFrameworkItemTitle,
            to: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EeWVVZqp8-9Evr8GxSrsrBgBeU_aXT-B9hX8O-nS3fIL1g',
            withExternalLinkIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueCommunicationTitle}
            className={styles.catalogueCommunication}
            childrenContainerClassName={styles.content}
        >
            <div>
                {strings.communicationDetails}
            </div>
            <Container
                heading={strings.communicationRapidResponsePersonnelTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
            <Container
                heading={strings.communicationServicesTitle}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
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
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueCommunicationIndex';
