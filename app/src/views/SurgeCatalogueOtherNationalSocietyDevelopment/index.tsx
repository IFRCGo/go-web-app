import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.nsDevelopmentHeading}
        >
            <SurgeContentContainer
                heading={strings.otherOverview}
            >
                <div>{strings.otherOverviewDetailOne}</div>
                <div>{strings.otherOverviewDetailTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                <div>{strings.rapidResponseDetail}</div>
                <ul>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EWKlMwewWThHg7IHiTsuUYcBt5CfR_5KvaWLaDGUbETEvw"
                            external
                        >
                            {strings.otherLinkOne}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ef5VINFI_29Mkjh9ccWS-_wBrenVKw4wYi5ZgJea7GQ2Vg"
                            external
                        >
                            {strings.otherLinkTwo}
                        </Link>
                    </li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherNationalSocietyDevelopment';
