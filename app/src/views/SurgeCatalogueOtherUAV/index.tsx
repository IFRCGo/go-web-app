import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            { src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/uav1.jpg' },
            { src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/uav2.jpg' },
            { src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/uav3.jpg' },
            { src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/uav4.jpg' },
        ]),
        [],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.uavHeading}
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                {strings.capacityDetails}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesDetails}</div>
                <ul>
                    <li>
                        <strong>{strings.otherUAVEmergencyListItemOneBullet}</strong>
                        {strings.otherUAVEmergencyListItemOne}
                    </li>
                    <li>
                        <strong>{strings.otherUAVEmergencyListItemTwoBullet}</strong>
                        {strings.otherUAVEmergencyListItemTwo}
                    </li>
                    <li>
                        <strong>{strings.otherUAVEmergencyListItemThreeBullet}</strong>
                        {strings.otherUAVEmergencyListItemThree}
                    </li>
                    <li>
                        <strong>{strings.otherUAVEmergencyListItemFourBullet}</strong>
                        {strings.otherUAVEmergencyListItemFour}
                    </li>
                </ul>
                <div>{strings.mustAllow}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.otherUAVPersonnel}
            >
                {strings.otherUAVPersonnelDetails}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.otherUAVStandardComponents}
            >
                <ul>
                    <li>
                        {strings.otherUAVStandardComponentsListItemOne}
                    </li>
                    <li>
                        {strings.otherUAVStandardComponentsListItemTwo}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.otherUAVSpecifications}
            >
                <div>
                    <strong>{strings.otherUAVCostHeader}</strong>
                    <div>
                        {strings.otherUAVCost}
                    </div>
                </div>
                <div>
                    <strong>{strings.otherUAVProviderHeader}</strong>
                    <ul>
                        <li>
                            {strings.otherUAVProviderAmericalRedCross}
                        </li>
                        <li>
                            {strings.otherUAVProviderItalianRedCross}
                        </li>
                    </ul>
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                {resolveToComponent(
                    strings.rapidResponseDetail,
                    {
                        link: (
                            <Link
                                href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVJrxE_3BpxOliHeThEBk_oB3nAcku47-5BxA-sXV2s8YQ"
                                external
                            >
                                {strings.otherLink}
                            </Link>
                        ),
                    },
                )}
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherUAV';
