import Page from '#components/Page';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import threeWStrings from '#strings/threeW';
import { resolveToComponent } from '#utils/translation';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('threeW', threeWStrings);

    const headerDescriptionP2 = resolveToComponent(
        strings.globalThreeWPageDescriptionP2,
        {
            contactLink: (
                <Link
                    to="mailto:im@ifrc.org"
                    className={styles.imLink}
                >
                    IM@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <Page
            className={styles.globalThreeW}
            title={strings.globalThreeWPageTitle}
            heading={strings.globalThreeWPageHeading}
            descriptionContainerClassName={styles.description}
            description={(
                <>
                    <div>
                        {strings.globalThreeWPageDescriptionP1}
                    </div>
                    <div>
                        {headerDescriptionP2}
                    </div>
                </>
            )}
        >
            Page
        </Page>
    );
}

Component.displayName = 'GlobalThreeW';
