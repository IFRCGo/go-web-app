import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

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
            heading={strings.greenResponseHeading}
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
                <div>
                    {resolveToComponent(
                        strings.rapidResponseDetail,
                        {
                            link: (
                                <Link
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EU67oavNUyVKocifjDl__VUBnh16k2SxzF_AiPUWJJGF_g"
                                    external
                                >
                                    {strings.otherLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherGreenResponse';
