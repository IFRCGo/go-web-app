import {
    SocialFacebookIcon,
    SocialMediumIcon,
    SocialYoutubeIcon,
} from '@ifrc-go/icons';
import {
    Container,
    ListView,
    PageContainer,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import Link from '#components/Link';
import {
    api,
    appCommitHash,
    appPackageName,
    appRepositoryUrl,
    appVersion,
} from '#config';
import { resolveUrl } from '#utils/resolveUrl';

import i18n from './i18n.json';
import styles from './styles.module.css';

const date = new Date();
const year = date.getFullYear();

interface Props {
    className?: string;
}

function GlobalFooter(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);
    const versionTag = `${appPackageName}@${appVersion}`;
    const versionUrl = `${appRepositoryUrl}/releases/tag/${versionTag}`;
    const copyrightText = resolveToComponent(
        strings.footerIFRC,
        {
            year,
            appVersion: (
                <Link
                    href={versionUrl}
                    title={appCommitHash}
                    external
                    colorVariant="text-on-dark"
                    withLinkIcon
                >
                    {`v${appVersion}`}
                </Link>
            ),
        },
    );

    return (
        <PageContainer
            className={_cs(styles.footer, className)}
            contentClassName={styles.content}
            containerAs="footer"
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={5}
                spacing="xl"
                minGridColumnSize="14rem"
            >
                <Container
                    heading={strings.footerAboutGo}
                    spacing="lg"
                >
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                    >
                        <div className={styles.description}>
                            {strings.footerAboutGoDesc}
                        </div>
                        <div className={styles.copyright}>
                            {copyrightText}
                        </div>
                    </ListView>
                </Container>
                <Container
                    heading={strings.globalFindOut}
                    spacing="lg"
                >
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                    >
                        <Link
                            href="https://ifrc.org"
                            external
                            colorVariant="text-on-dark"
                        >
                            ifrc.org
                        </Link>
                        <Link
                            href="https://rcrcsims.org"
                            external
                            colorVariant="text-on-dark"
                        >
                            rcrcsims.org
                        </Link>
                        <Link
                            href="https://data.ifrc.org"
                            external
                            colorVariant="text-on-dark"
                        >
                            data.ifrc.org
                        </Link>
                    </ListView>
                </Container>
                <Container
                    heading={strings.policies}
                    spacing="lg"
                >
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                    >
                        <Link
                            colorVariant="text-on-dark"
                            to="cookiePolicy"
                        >
                            {strings.cookiePolicy}
                        </Link>
                        <Link
                            colorVariant="text-on-dark"
                            to="termsAndConditions"
                        >
                            {strings.termsAndConditions}
                        </Link>
                    </ListView>
                </Container>
                <Container
                    heading={strings.globalHelpfulLinks}
                    spacing="lg"
                >
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                    >
                        <Link
                            href="https://github.com/ifrcgo/go-web-app"
                            external
                            colorVariant="text-on-dark"
                        >
                            {strings.footerOpenSourceCode}
                        </Link>
                        <Link
                            href={resolveUrl(api, 'docs')}
                            external
                            colorVariant="text-on-dark"
                        >
                            {strings.footerApiDocumentation}
                        </Link>
                        <Link
                            to="resources"
                            colorVariant="text-on-dark"
                        >
                            {strings.footerOtherResources}
                        </Link>
                        <Link
                            href="https://go-wiki.ifrc.org"
                            external
                            colorVariant="text-on-dark"
                        >
                            {strings.footerGoWiki}
                        </Link>
                    </ListView>
                </Container>
                <Container
                    heading={strings.footerContactUs}
                    spacing="lg"
                >
                    <ListView
                        layout="block"
                        withSpacingOpticalCorrection
                    >
                        <Link
                            href="mailto:im@ifrc.org"
                            colorVariant="primary"
                            styleVariant="filled"
                            external
                            withLinkIcon
                        >
                            im@ifrc.org
                        </Link>
                        <ListView spacing="sm">
                            <Link
                                className={styles.socialIcon}
                                href="https://ifrcgoproject.medium.com"
                                external
                                colorVariant="text-on-dark"
                            >
                                <SocialMediumIcon />
                            </Link>
                            <Link
                                className={styles.socialIcon}
                                href="https://www.facebook.com/IFRC"
                                external
                                colorVariant="text-on-dark"
                            >
                                <SocialFacebookIcon />
                            </Link>
                            <Link
                                className={styles.socialIcon}
                                href="https://www.youtube.com/watch?v=dwPsQzla9A4"
                                external
                                colorVariant="text-on-dark"
                            >
                                <SocialYoutubeIcon />
                            </Link>
                        </ListView>
                    </ListView>
                </Container>
            </ListView>
        </PageContainer>
    );
}

export default GlobalFooter;
