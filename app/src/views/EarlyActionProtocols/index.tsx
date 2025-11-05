import {
    Container,
    ExpandableContainer,
} from '@ifrc-go/ui';
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
            className={styles.eapDetail}
            contentViewType="vertical"
            childrenContainerClassName={styles.content}
            actions={(
                <Link
                    to="eapDevelopmentRegistration"
                    variant="secondary"
                >
                    {strings.eapRegistrationLink}
                </Link>
            )}
        >
            <ExpandableContainer
                heading={strings.eapContent}
            >
                <p>
                    {strings.eapContentHeading}
                </p>
                <p>
                    {strings.eapContentSubHeadingOne}
                    <ul>
                        <li>
                            {strings.eapDescriptionOne}
                        </li>
                        <li>
                            {strings.eapDescriptionTwo}
                        </li>
                        <li>
                            {strings.eapDescriptionThree}
                        </li>
                    </ul>
                </p>
            </ExpandableContainer>
            {/* TODO: Add remaining content */}
            <ExpandableContainer
                heading={strings.eapContentSubHeadingTwo}
            />
            <ExpandableContainer
                heading={strings.eapContentSubHeadingThree}
            />
        </Container>
    );
}

Component.displayName = 'EarlyActionProtocols';
