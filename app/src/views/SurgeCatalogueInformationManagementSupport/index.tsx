import { Image } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import responsibleOperationImage from '#assets/images/surge-im-support-responsible-operation.jpg';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.iMSupportTitle}
            goBackFallbackLink="surgeCatalogueInformationManagement"
        >
            <div>{strings.iMSupportDetail}</div>
            <SurgeContentContainer
                heading={strings.iMSituational}
            >
                <ul>
                    <li>{strings.iMSituationalItemOne}</li>
                    <li>{strings.iMSituationalItemTwo}</li>
                    <li>{strings.iMSituationalItemThree}</li>
                    <li>{strings.iMSituationalItemFour}</li>
                    <li>{strings.iMSituationalItemFive}</li>
                    <li>{strings.iMSituationalItemSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.iMCoordination}
            >
                <ul>
                    <li>{strings.iMCoordinationItemOne}</li>
                    <li>{strings.iMCoordinationItemTwo}</li>
                    <li>{strings.iMCoordinationItemThree}</li>
                    <li>{strings.iMCoordinationItemFour}</li>
                    <li>{strings.iMCoordinationItemFive}</li>
                    <li>{strings.iMCoordinationItemSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.iMResponsible}
            >
                <ul>
                    <li>{strings.iMResponsibleItemOne}</li>
                    <li>{strings.iMResponsibleItemTwo}</li>
                    <li>{strings.iMResponsibleItemThree}</li>
                </ul>
                <Image
                    src={responsibleOperationImage}
                    alt={strings.iMResponsibleImageAlt}
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationManagementSupport';
