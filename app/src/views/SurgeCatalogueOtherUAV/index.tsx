import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

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
            goBackFallbackLink="surgeCatalogueOther"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetails}</div>
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
                <div>{strings.otherUAVPersonnelDetails}</div>
            </SurgeContentContainer>

            <SurgeContentContainer
                heading={strings.otherUAVstandardComponents}
            >
                <ul>
                    <li>
                        {strings.otherUAVstandardComponentsListItemOne}
                    </li>
                    <li>
                        {strings.otherUAVstandardComponentsListItemTwo}
                    </li>
                </ul>
            </SurgeContentContainer>

            <SurgeContentContainer
                heading={strings.otherUAVspecifications}
            >
                <div>
                    <strong>{strings.otherUAVcostHeader}</strong>
                    <br />
                    {strings.otherUAVcost}
                </div>
                <div>
                    <strong>{strings.otherUAVproviderHeader}</strong>
                    <br />
                    {strings.otherUAVprovider}
                </div>
            </SurgeContentContainer>

            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                <div>
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
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherUAV';
