import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeCardContainer from '#components/domain/SurgeCardContainer';
import CatalogueInfoCard, { LinkData } from '#components/CatalogueInfoCard';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const roleProfiles: LinkData[] = [
        {
            title: strings.catalogueOperationHead,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FHead%20of%20Emergency%20Operations%20Role%20Profile%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueOperationsManager,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FRapid%20Response%20Profile%20Operations%20Manager%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueDeputyOperationsManager,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FRapid%20Response%20Profile%20Deputy%20Operations%20Manager%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueFieldCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FRapid%20Response%20Profile%20Field%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueCoordinatorOfficer,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FMovement%20Coordination%20Officer%20Role%20Profile%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
        {
            title: strings.catalogueRecoveryCoordinator,
            to: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FRapid%20Response%20Profile%20Recovery%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1',
            external: true,
            withExternalLinkIcon: true,
        },
    ];

    const servicesData: LinkData[] = [
        {
            title: strings.catalogueOperationLearnMore,
            to: 'emergencyOperations',
            withForwardIcon: true,
        },
    ];

    return (
        <SurgeCatalogueContainer
            heading={strings.catalogueOperationTitle}
        >
            <SurgeCardContainer
                heading={strings.catalogueOperationRoleHeading}
            >
                <CatalogueInfoCard
                    title={strings.catalogueOperationRoleTitle}
                    data={roleProfiles}
                />
            </SurgeCardContainer>
            <SurgeCardContainer
                heading={strings.catalogueServicesTitle}
            >
                <CatalogueInfoCard
                    title={strings.catalogueRapidResponse}
                    data={servicesData}
                />
            </SurgeCardContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOperationsManagement';
