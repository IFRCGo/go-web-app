import { TextOutput } from '@ifrc-go/ui';
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
            heading={strings.infectionPreventionAndControlTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.healthIPCCapacity}
            >
                <div>{strings.healthIPCDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthIPCEmergencyServicesTitle}
            >
                <div>{strings.healthIPCEmergencyServicesDetail1}</div>
                <div>
                    <ul>
                        <li>{strings.healthIPCEmergencyServicesDetail2}</li>
                        <li>{strings.healthIPCEmergencyServicesDetail3}</li>
                        <li>{strings.healthIPCEmergencyServicesDetail4}</li>
                        <li>{strings.healthIPCEmergencyServicesDetail5}</li>
                        <li>{strings.healthIPCEmergencyServicesDetail6}</li>
                    </ul>
                </div>
                <div>{strings.healthIPCEmergencyServicesDetail7}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthIPCDesignedFor}
            >
                <div>{strings.healthIPCDesignedForDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthIPCPersonnel}
            >
                <TextOutput
                    value={strings.healthIPCTotalValue}
                    label={strings.healthIPCTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthIPCCompositionValue}
                    label={strings.healthIPCCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthIPCStandardComponentsLabel}
            >
                <ul>
                    <li>{strings.healthIPCStandardComponentsListItemOne}</li>
                    <li>{strings.healthIPCStandardComponentsListItemTwo}</li>
                    <li>{strings.healthIPCStandardComponentsListItemThree}</li>
                    <li>{strings.healthIPCStandardComponentsListItemFour}</li>
                    <li>{strings.healthIPCStandardComponentsListItemFive}</li>
                    <li>{strings.healthIPCStandardComponentsListItemSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthIPCSpecificationsLabel}
            >
                <TextOutput
                    value={strings.healthIPCSpecificationsWeightValue}
                    label={strings.healthIPCSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthIPCSpecificationsVolumeValue}
                    label={strings.healthIPCSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthIPCSpecificationsCostValue}
                    label={strings.healthIPCSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthIPCSpecificationsNsValue}
                    label={strings.healthIPCSpecificationsNsLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthIPCVariationLabel}
            >
                <div>{strings.healthIPCVariationDescription}</div>
            </SurgeContentContainer>

        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthInfectionPreventionAndControl';
