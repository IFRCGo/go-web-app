import {
    Container,
    ExpandableContainer,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Container
            headerActions={(
                <Link
                    to="newEapDevelopmentRegistration"
                    styleVariant="filled"
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
            >
                {/* TODO: Add real content and replace with strings */}
                EAP content sub heading description two
            </ExpandableContainer>
            <ExpandableContainer
                heading={strings.eapContentSubHeadingThree}
            >
                {/* TODO: Add real content and replace with strings */}
                EAP content sub heading description three
            </ExpandableContainer>
        </Container>
    );
}

Component.displayName = 'EarlyActionProtocols';
