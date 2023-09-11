import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.civilMilitaryHeading}
            goBackFallbackLink="surgeCatalogueOther"
        >
            <SurgeContentContainer
                heading={strings.civilMilitaryOverview}
            >
                <div>{strings.civilMilitaryOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.civilRapidResponse}
            >
                <div>
                    {resolveToComponent(
                        strings.civilRapidResponseDetail,
                        {
                            link: (
                                <Link
                                    to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EViKjU_w21dBpQtGEr9CtgQBvljB_2I52J51BhljrUg8Ow"
                                    external
                                    withExternalLinkIcon
                                >
                                    {strings.civilLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherCivilMilitaryRelations';
