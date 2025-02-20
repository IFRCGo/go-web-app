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
            heading={strings.rteHeading}
            goBackFallbackLink="surgeCataloguePmer"
        >
            <SurgeContentContainer
                heading={strings.capacityTitle}
            >
                <div>{strings.capacityDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyTitle}
            >
                <div>{strings.emergencyDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedForTitle}
            >
                <div>{strings.designedForDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnelTitle}
            >
                <div>{strings.personnelDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specificationsTitle}
            >
                <TextOutput
                    label={strings.specificationsCostTitle}
                    strongLabel
                    value={strings.specificationsCostDetails}
                />
                <TextOutput
                    label={strings.specificationsNSTitle}
                    strongLabel
                    value={strings.specificationsNSDetails}
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.additionalTitle}
            >
                <div>{strings.additionalDetails}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCataloguePmerRealTimeEvaluation';
