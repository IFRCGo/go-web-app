import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.healthPSSTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.healthPSSCapacityTitle}
            >
                <div>{strings.healthPSSCapacityDetail}</div>
                <ul>
                    <li>{strings.healthPSSCapacityListOne}</li>
                    <li>{strings.healthPSSCapacityListTwo}</li>
                    <li>{strings.healthPSSCapacityListThree}</li>
                    <li>{strings.healthPSSCapacityListFour}</li>
                    <li>{strings.healthPSSCapacityListFive}</li>
                    <li>{strings.healthPSSCapacityListSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSDesignedForTitle}
            >
                <div>{strings.healthPSSDesignedForDetail}</div>
                <div>{strings.healthPSSDesignedForDescription}</div>
                <ul>
                    <li>{strings.healthPSSDesignedForListItemOne}</li>
                    <li>{strings.healthPSSDesignedForListItemTwo}</li>
                    <li>{strings.healthPSSDesignedForListItemThree}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSPersonnel}
            >
                <TextOutput
                    value={strings.healthPSSPersonnelTotalValue}
                    label={strings.healthPSSPersonnelTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthPSSPersonnelCompositionValue}
                    label={strings.healthPSSPersonnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSStandardComponentsLabel}
            >
                <div>{strings.healthPSSStandardComponentsDetail}</div>
                <TextOutput
                    value={strings.healthPSSStandardComponentsItemOneValue}
                    label={strings.healthPSSStandardComponentsItemOneLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSSpecificationsTitle}
            >
                <TextOutput
                    value={strings.healthPSSSpecificationsNsValue}
                    label={strings.healthPSSSpecificationsNsLabel}
                    strongLabel
                />
            </SurgeContentContainer>

            <SurgeContentContainer
                heading={strings.healthPSSAdditionalResources}
            >
                <Link
                    to="http://pscentre.org/"
                    external
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.healthPSSAdditionalResourcesLink}
                </Link>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEruPsychosocialSupport';
