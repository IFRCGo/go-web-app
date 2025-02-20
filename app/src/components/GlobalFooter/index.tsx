import {
    SocialFacebookIcon,
    SocialMediumIcon,
    SocialYoutubeIcon,
} from '@ifrc-go/icons';
import {
    Heading,
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
                >
                    {appVersion}
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
            <div className={styles.section}>
                <Heading>
                    {strings.footerAboutGo}
                </Heading>
                <div className={styles.description}>
                    {strings.footerAboutGoDesc}
                </div>
                <div className={styles.copyright}>
                    {copyrightText}
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    {strings.globalFindOut}
                </Heading>
                <div className={styles.subSection}>
                    <Link
                        href="https://ifrc.org"
                        external
                    >
                        ifrc.org
                    </Link>
                    <Link
                        href="https://rcrcsims.org"
                        external
                    >
                        rcrcsims.org
                    </Link>
                    <Link
                        href="https://data.ifrc.org"
                        external
                    >
                        data.ifrc.org
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    {strings.policies}
                </Heading>
                <div className={styles.subSection}>
                    <Link
                        to="cookiePolicy"
                    >
                        {strings.cookiePolicy}
                    </Link>
                    <Link
                        to="termsAndConditions"
                    >
                        {strings.termsAndConditions}
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    {strings.globalHelpfulLinks}
                </Heading>
                <div className={styles.subSection}>
                    <Link
                        href="https://github.com/ifrcgo/go-web-app"
                        external
                    >
                        {strings.footerOpenSourceCode}
                    </Link>
                    <Link
                        href={resolveUrl(api, 'docs')}
                        external
                    >
                        {strings.footerApiDocumentation}
                    </Link>
                    <Link
                        to="resources"
                    >
                        {strings.footerOtherResources}
                    </Link>
                    <Link
                        href="https://go-wiki.ifrc.org"
                        external
                    >
                        {strings.footerGoWiki}
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    {strings.footerContactUs}
                </Heading>
                <Link
                    href="mailto:im@ifrc.org"
                    variant="primary"
                    external
                >
                    im@ifrc.org
                </Link>
                <div className={styles.socialIcons}>
                    <Link
                        className={styles.socialIcon}
                        href="https://ifrcgoproject.medium.com"
                        external
                    >
                        <SocialMediumIcon />
                    </Link>
                    <Link
                        className={styles.socialIcon}
                        href="https://www.facebook.com/IFRC"
                        external
                    >
                        <SocialFacebookIcon />
                    </Link>
                    <Link
                        className={styles.socialIcon}
                        href="https://www.youtube.com/watch?v=dwPsQzla9A4"
                        external
                    >
                        <SocialYoutubeIcon />
                    </Link>
                </div>
            </div>
        </PageContainer>
    );
}

export default GlobalFooter;
