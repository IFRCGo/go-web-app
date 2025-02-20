import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_01.jpg',
                caption: strings.assessmentCellImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_02.jpg',
                caption: strings.assessmentCellImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_03.jpg',
                caption: strings.assessmentCellImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_04.jpg',
                caption: strings.assessmentCellImageFour,
            },
        ]),
        [
            strings.assessmentCellImageOne,
            strings.assessmentCellImageTwo,
            strings.assessmentCellImageThree,
            strings.assessmentCellImageFour,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.assessmentCellTitle}
            goBackFallbackLink="surgeCatalogueEmergencyNeedsAssessment"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
                <div>{strings.capacityDetailsSectionTwo}</div>
                <div>{strings.capacityDetailsSectionThree}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                {strings.supportTo}
                <ul>
                    <li>{strings.assessmentEmergencyListItemOne}</li>
                    <li>{strings.assessmentEmergencyListItemTwo}</li>
                    <li>{strings.assessmentEmergencyListItemThree}</li>
                    <li>{strings.assessmentEmergencyListItemFour}</li>
                    <li>{strings.assessmentEmergencyListItemFive}</li>
                    <li>{strings.assessmentEmergencyListItemSix}</li>
                    <li>{strings.assessmentEmergencyListItemSeven}</li>
                    <li>{strings.assessmentEmergencyListItemEight}</li>
                    <li>{strings.assessmentEmergencyListItemNine}</li>
                    <li>{strings.assessmentEmergencyListItemTen}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForDetailsSectionOne}</div>
                <div>{strings.designedForDetailsSectionTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnel}
            >
                <TextOutput
                    value={strings.totalPersonnelValue}
                    label={strings.totalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.compositionValue}
                    label={strings.compositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.variationOnConfiguration}
            >
                {strings.variationOnConfigurationDetails}
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueEmergencyNeedsAssessmentCell';
