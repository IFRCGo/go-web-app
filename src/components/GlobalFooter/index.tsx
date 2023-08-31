import { resolve } from 'url';
import { _cs } from '@togglecorp/fujs';
import {
    SocialMediumIcon,
    SocialFacebookIcon,
    SocialTwitterIcon,
    SocialYoutubeIcon,
} from '@ifrc-go/icons';

import Heading from '#components/Heading';
import Link from '#components/Link';
import PageContainer from '#components/PageContainer';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import { adminUrl, appVersion, appCommitHash } from '#config';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function GlobalFooter(props: Props) {
    const {
        className,
    } = props;

    const date = new Date();
    const year = date.getFullYear();
    const strings = useTranslation(i18n);
    const copyrightText = resolveToComponent(
        strings.footerIFRC,
        {
            year,
            appVersion: (
                <span title={appCommitHash}>
                    {appVersion}
                </span>
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
                    Find out more
                </Heading>
                <div className={styles.subSection}>
                    <Link
                        to="https://ifrc.org"
                        external
                    >
                        ifrc.org
                    </Link>
                    <Link
                        to="https://rcrcsims.org"
                        external
                    >
                        rcrcsims.org
                    </Link>
                    <Link
                        to="https://data.ifrc.org"
                        external
                    >
                        data.ifrc.org
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    Helpful links
                </Heading>
                <div className={styles.subSection}>
                    <Link
                        to="https://github.com/ifrcgo/go-frontend"
                        external
                    >
                        {strings.footerOpenSourceCode}
                    </Link>
                    <Link
                        to={resolve(adminUrl, 'docs')}
                        external
                    >
                        {strings.footerApiDocumentation}
                    </Link>
                    <Link
                        to="resources"
                    >
                        {strings.footerOtherResources}
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    {strings.footerContactUs}
                </Heading>
                <Link
                    to="mailto:im@ifrc.org"
                    variant="primary"
                    external
                >
                    im@ifrc.org
                </Link>
                <div className={styles.socialIcons}>
                    <Link
                        className={styles.socialIcon}
                        to="https://ifrcgoproject.medium.com"
                        external
                    >
                        <SocialMediumIcon />
                    </Link>
                    <Link
                        className={styles.socialIcon}
                        to="https://www.facebook.com/IFRC"
                        external
                    >
                        <SocialFacebookIcon />
                    </Link>
                    <Link
                        className={styles.socialIcon}
                        to="https://twitter.com/ifrcgo"
                        external
                    >
                        <SocialTwitterIcon />
                    </Link>
                    <Link
                        className={styles.socialIcon}
                        to="https://www.youtube.com/watch?v=dwPsQzla9A4"
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
