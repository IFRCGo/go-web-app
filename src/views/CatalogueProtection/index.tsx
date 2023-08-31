import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        protectionGender: protectionGenderRoute,
    } = useContext(RouteContext);

    const roleProfiles: LinkData[] = [
        {
            title: strings.cataloguePGICoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi%2FRapid%20Response%20Profile%20Protection%2C%20Gender%20and%20Inclusion%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi&p=true&ga=1',
            withExternalLinkIcon: true,
        },
        {
            title: strings.cataloguePGIOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi%2FRapid%20Response%20Profile%20Protection%2C%20Gender%20and%20Inclusion%20Officer%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fpgi&p=true&ga=1',
            withExternalLinkIcon: true,
        },
    ];

    const technicalProfiles: LinkData[] = [
        {
            title: strings.catalogueProtectionGender,
            to: generatePath(protectionGenderRoute.absolutePath),
            withForwardIcon: true,
        },
    ];

    const standardData: LinkData[] = [
        {
            title: strings.catalogueProtectionLearnMore,
            to: 'https://www.ifrc.org/document/minimum-standards-pgi-emergencies',
            withForwardIcon: true,
        },
    ];

    const roofData: LinkData[] = [
        {
            title: strings.catalogueProtectionLearnMore,
            to: 'https://www.ifrc.org/media/48958',
            withForwardIcon: true,
        },
    ];

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueProtection}
            className={styles.protection}
            childrenContainerClassName={styles.content}
        >
            <Container
                heading={strings.catalogueRapidResponsePersonnel}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueProtectionRoleTitle}
                    data={roleProfiles}
                />
                <CatalogueInfoCard
                    description={strings.catalogueTechnicalDescription}
                    title={strings.catalogueTechnical}
                    data={technicalProfiles}
                />
            </Container>
            <Container
                heading={strings.catalogueProtectionServicesHeading}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueProtectionRapidResponse}
                    data={technicalProfiles}
                />
            </Container>
            <Container
                heading={strings.catalogueAdditionalResources}
                withHeaderBorder
                childrenContainerClassName={styles.cards}
            >
                <CatalogueInfoCard
                    title={strings.catalogueStandard}
                    data={standardData}
                    description={strings.catalogueStandardDescription}
                />
                <CatalogueInfoCard
                    title={strings.catalogueAllUnderOneRoof}
                    data={roofData}
                    description={strings.catalogueAllUnderOneRoofDescription}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueProtection';
