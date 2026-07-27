import { useMemo } from 'react';
import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_01.jpg',
                caption: strings.cashAndVoucherAssistanceImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_02.jpg',
                caption: strings.cashAndVoucherAssistanceImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_03.jpg',
                caption: strings.cashAndVoucherAssistanceImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_04.jpg',
                caption: strings.cashAndVoucherAssistanceImageFour,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_05.jpg',
                caption: strings.cashAndVoucherAssistanceImageFive,
            },
        ]),
        [
            strings.cashAndVoucherAssistanceImageOne,
            strings.cashAndVoucherAssistanceImageTwo,
            strings.cashAndVoucherAssistanceImageThree,
            strings.cashAndVoucherAssistanceImageFour,
            strings.cashAndVoucherAssistanceImageFive,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.cashAndVoucherAssistanceTitle}
            goBackFallbackLink="surgeCatalogueCash"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
                <div>{strings.capacityDetailsSectionTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <ul>
                    <li>{strings.cvaEmergencyListItemOne}</li>
                    <li>{strings.cvaEmergencyListItemTwo}</li>
                    <li>{strings.cvaEmergencyListItemThree}</li>
                    <li>{strings.cvaEmergencyListItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForDetailsSectionOne}</div>
                <DataDisplay
                    value={strings.designedForAssessmentValue}
                    label={strings.designedForAssessmentValueLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.designedForResponseAnalysisValue}
                    label={strings.designedForResponseAnalysisValueLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.designedForSetUpValue}
                    label={strings.designedForSetUpValueLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.designedForMonitoringValue}
                    label={strings.designedForMonitoringValueLabel}
                    strongLabel
                />
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
                    value={(
                        <ul>
                            <li>{strings.personnelCompositionValueOne}</li>
                            <li>{strings.personnelCompositionValueTwo}</li>
                            <li>{strings.personnelCompositionValueThree}</li>
                        </ul>
                    )}
                    label={strings.personnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponents}
            >
                {strings.standardComponentsDetails}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specifications}
            >
                <DataDisplay
                    value={strings.specificationsCostValue}
                    label={strings.specificationsCostLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationsNationalSocietyValue}
                    label={strings.specificationsNationalSocietyLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueCashRapidResponse';
