import { _cs } from '@togglecorp/fujs';
import Heading from '#components/Heading';
import ButtonLikeLink from '#components/ButtonLikeLink';
import Link from '#components/Link';
import PageContainer from '#components/PageContainer';
import useTranslation from '#hooks/useTranslation';
import commonStrings from '#strings/common';
import { resolveToComponent } from '#utils/translation';

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
    const strings = useTranslation('common', commonStrings);
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
                    <Link to="data.ifrc.org">
                        data.ifrc.org
                    </Link>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    Helpful links
                </Heading>
                <div className={styles.subSection}>
                    <div>
                        Open Source Code
                    </div>
                    <div>
                        API Documentation
                    </div>
                    <div>
                        Other Resources
                    </div>
                </div>
            </div>
            <div className={styles.section}>
                <Heading>
                    Contact Us
                </Heading>
                <ButtonLikeLink
                    to="mailto:im@ifrc.org"
                >
                    im@ifrc.org
                </ButtonLikeLink>
            </div>
        </PageContainer>
    );
}

export default GlobalFooter;
