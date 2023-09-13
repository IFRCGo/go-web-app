import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.preparednessHeading}
            goBackFallbackLink="surgeCatalogueOther"
        >
            <SurgeContentContainer
                heading={strings.otherOverview}
            >
                <div>{strings.otherOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                <div>{strings.rapidResponseDetail}</div>
                <ul>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EXZPVgHffW9Dludcn9HZlaABn4Ppg37CGuoGgeGjOxKkVw"
                            external
                        >
                            {strings.otherLinkOne}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVOb9psRxttGmVi3i3u89IABALc8e0x1Lm7_eU8UkvLgLw"
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

Component.displayName = 'SurgeCatalogueOtherPreparednessEffectiveResponse';
