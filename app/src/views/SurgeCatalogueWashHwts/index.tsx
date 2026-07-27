import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.waterTreatment}
            goBackFallbackLink="surgeCatalogueWash"
        >
            <SurgeContentContainer
                heading={strings.washCapacity}
            >
                <div>{strings.washCapacityTextOne}</div>
                <div>{strings.washCapacityTextTwo}</div>
                <div>{strings.washCapacityTextThree}</div>
                <div>{strings.washCapacityTextFour}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesDetail}</div>
                <ul>
                    <li>{strings.emergencyServicesSectionOne}</li>
                    <li>{strings.emergencyServicesSectionTwo}</li>
                    <li>{strings.emergencyServicesSectionThree}</li>
                    <li>{strings.emergencyServicesSectionFour}</li>
                    <li>{strings.emergencyServicesSectionFive}</li>
                    <li>{strings.emergencyServicesSectionSix}</li>
                </ul>
                <div>{strings.emergencyServicesDescription}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForItemOne}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnel}
            >
                <DataDisplay
                    value={strings.totalPersonnelValue}
                    label={strings.totalPersonnelLabel}
                    strongLabel
                />
                <DataDisplay
                    label={strings.personnelCompositionLabel}
                    value={(
                        <ul>
                            <li>{strings.personnelCompositionValueOneItem}</li>
                            <li>{strings.personnelCompositionValueTwoItem}</li>
                            <li>{strings.personnelCompositionValueThreeItem}</li>
                            <li>{strings.personnelCompositionValueFourItem}</li>
                            <li>{strings.personnelCompositionValueFiveItem}</li>
                            <li>{strings.personnelCompositionValueSixItem}</li>
                        </ul>
                    )}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponent}
            >
                <ul>
                    <li>{strings.standardComponentItemOne}</li>
                    <li>{strings.standardComponentItemTwo}</li>
                    <li>{strings.standardComponentItemThree}</li>
                    <li>{strings.standardComponentItemFour}</li>
                    <li>{strings.standardComponentItemFive}</li>
                    <li>{strings.standardComponentItemSix}</li>
                    <li>{strings.standardComponentItemSeven}</li>
                    <li>{strings.standardComponentItemEight}</li>
                    <li>{strings.standardComponentItemNine}</li>
                    <li>{strings.standardComponentItemTen}</li>
                    <li>{strings.standardComponentItemEleven}</li>
                    <li>{strings.standardComponentItemTwelve}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specification}
            >
                <DataDisplay
                    value={strings.specificationWeightValue}
                    label={strings.specificationWeightLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationVolumeValue}
                    label={strings.specificationVolumeLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationCostValue}
                    label={strings.specificationCostLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationNSValue}
                    label={strings.specificationNSLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.additionalResources}
            >
                <div>{strings.additionalResourcesNorCross}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueWashHwts';
