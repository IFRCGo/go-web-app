import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Container
            childrenContainerClassName={styles.eapFormLinks}
        >
            {/* FIXME: Add eap registration link */}
            <Link
                to="home"
                variant="secondary"
            >
                {strings.eapRegistrationLink}
            </Link>
            <Link
                to="eapFullForm"
                variant="secondary"
            >
                {strings.eapFormLink}
            </Link>
            <Link
                to="simplifiedEapForm"
                variant="secondary"
            >
                {strings.simplifiedEapLink}
            </Link>
        </Container>
    );
}
