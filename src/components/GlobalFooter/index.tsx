import { resolve } from 'url';
import { _cs } from '@togglecorp/fujs';
import {
    ThumbUpLineIcon,
    LockLineIcon,
    HeartLineIcon,
    CheckboxCircleLineIcon,
} from '@ifrc-go/icons';

import Heading from '#components/Heading';
import ButtonLikeLink from '#components/ButtonLikeLink';
import Link from '#components/Link';
import PageContainer from '#components/PageContainer';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import { adminUrl } from '#config';
import routes from '#routes';

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
                <span title={import.meta.env.APP_COMMIT_HASH}>
                    {import.meta.env.APP_VERSION}
                </span>
            ),
        },
    );

    return (
        <PageContainer
            className={_cs(styles.footer, className)}
            contentClassName={styles.content}
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
                    <Link to="https://ifrc.org">
                        ifrc.org
                    </Link>
                    <Link to="https://rcrcsims.org">
                        rcrcsims.org
                    </Link>
                    <Link to="https://data.ifrc.org">
                        data.ifrc.org
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    Helpful links
                </Heading>
                <div className={styles.subSection}>
                    <Link to="https://github.com/ifrcgo/go-frontend">
                        {strings.footerOpenSourceCode}
                    </Link>
                    <Link to={resolve(adminUrl, 'docs')}>
                        {strings.footerApiDocumentation}
                    </Link>
                    <Link
                        to={routes.resources.absolutePath}
                    >
                        {strings.footerOtherResources}
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    {strings.footerContactUs}
                </Heading>
                <ButtonLikeLink
                    to="mailto:im@ifrc.org"
                >
                    im@ifrc.org
                </ButtonLikeLink>
                <div className={styles.socialIcons}>
                    <Link to="https://ifrcgoproject.medium.com">
                        <ThumbUpLineIcon />
                    </Link>
                    <Link to="https://www.facebook.com/IFRC">
                        <LockLineIcon />
                    </Link>
                    <Link to="https://twitter.com/ifrcgo">
                        <CheckboxCircleLineIcon />
                    </Link>
                    <Link to="https://www.youtube.com/watch?v=dwPsQzla9A4">
                        <HeartLineIcon />
                    </Link>
                </div>
            </div>
        </PageContainer>
    );
}

export default GlobalFooter;
