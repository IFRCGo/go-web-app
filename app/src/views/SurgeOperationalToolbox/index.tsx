import {
    Container,
    Description,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import OperationalTimeline from '#components/domain/OperationalTimeline';
import Link from '#components/Link';
import TabPage from '#components/TabPage';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const feedbackDescription = resolveToComponent(
        strings.overviewFeedback,
        {
            emailOne: (
                <Link
                    href="mailto:antoine.belair@ifrc.org"
                    external
                    withUnderline
                >
                    antoine.belair@ifrc.org
                </Link>
            ),
            emailTwo: (
                <Link
                    href="mailto:marshal.mukuvare@ifrc.org"
                    external
                    withUnderline
                >
                    marshal.mukuvare@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <TabPage>
            <Container
                heading={strings.operationalToolboxHeading}
                headerDescription={strings.operationalToolboxSubHeading}
                withCenteredHeading
                withCenteredHeaderDescription
            >
                {null}
            </Container>
            <Container
                heading={strings.overviewHeading}
                withHeaderBorder
                spacing="sm"
            >
                <Description>
                    {strings.overviewIntroOne}
                </Description>
                <Description>
                    {strings.overviewIntroTwo}
                </Description>
                <Description>
                    {feedbackDescription}
                </Description>
            </Container>
            <OperationalTimeline />
        </TabPage>
    );
}

Component.displayName = 'SurgeOperationalToolbox';
