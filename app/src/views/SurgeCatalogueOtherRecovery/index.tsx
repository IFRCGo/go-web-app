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
            heading={strings.recoveryHeading}
        >
            <SurgeContentContainer
                heading={strings.otherOverview}
            >
                <div>{strings.otherOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.technicalHeading}
            >
                <div>
                    {resolveToComponent(
                        strings.technicalDetail,
                        {
                            link: (
                                <Link
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EVGjsDkuPN1AjuiHEIPBAtIBeylQYJbOGqrUKoYZGBBsRg"
                                    external
                                >
                                    {strings.technicalLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                <div>{strings.rapidResponseDetail}</div>
                <ul>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUbjt_mT-4tIr9UcmCRhLs4B71WUl7dazEtiTGccC-3rsQ"
                            external
                        >
                            {strings.otherLinkOne}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ebi1UtwPTMtKhNoPY0fh9QYBuzsLVRy_nGLss1E0NCSkSA"
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

Component.displayName = 'surgeCatalogueOtherRecovery';
