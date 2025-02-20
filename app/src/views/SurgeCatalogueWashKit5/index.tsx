import {
    Image,
    TextOutput,
} from '@ifrc-go/ui';
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
            heading={strings.washKit5Title}
            goBackFallbackLink="surgeCatalogueWash"
        >
            <Image
                src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-kit5_01.jpg"
                caption={strings.washKit5}
            />
            <SurgeContentContainer
                heading={strings.washKit5Capacity}
            >
                <div>{strings.washKit5CapacityText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.washKit5EmergencyServices}
            >
                <div>{strings.washKit5EmergencyServicesSectionOne}</div>
                <div>{strings.washKit5EmergencyServicesSectionTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.washKit5Specification}
            >
                <TextOutput
                    value={strings.washKit5SpecificationWeightValue}
                    label={strings.washKit5SpecificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.washKit5SpecificationVolumeValue}
                    label={strings.washKit5SpecificationVolumeLabel}
                    strongLabel
                />
                <div>
                    {strings.washKit5SpecificationDetail}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueWashKit5';
