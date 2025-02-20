import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.iMRolesTitle}
            goBackFallbackLink="surgeCatalogueInformationManagement"
            description={strings.iMRolesDetail}
        >
            <SurgeContentContainer
                heading={strings.iMRolesSituationalTitle}
            >
                <ul>
                    <li>{strings.iMRolesSituationalItemOne}</li>
                    <li>{strings.iMRolesSituationalItemTwo}</li>
                    <li>{strings.iMRolesSituationalItemThree}</li>
                    <li>{strings.iMRolesSituationalItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.iMRolesDataCollectionTitle}
            >
                <ul>
                    <li>{strings.iMRolesDataCollectionItemOne}</li>
                    <li>{strings.iMRolesDataCollectionItemTwo}</li>
                    <li>{strings.iMRolesDataCollectionItemThree}</li>
                    <li>{strings.iMRolesDataCollectionItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.iMResponsibleDataTitle}
            >
                <ul>
                    <li>{strings.iMResponsibleDataItemOne}</li>
                    <li>{strings.iMResponsibleDataItemTwo}</li>
                    <li>{strings.iMResponsibleDataItemThree}</li>
                    <li>{strings.iMResponsibleDataItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.iMCoordinationTitle}
            >
                <ul>
                    <li>{strings.iMCoordinationItemOne}</li>
                    <li>{strings.iMCoordinationItemTwo}</li>
                    <li>{strings.iMCoordinationItemThree}</li>
                    <li>{strings.iMCoordinationItemFour}</li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationManagementRolesResponsibility';
