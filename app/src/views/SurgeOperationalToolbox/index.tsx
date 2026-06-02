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

    const fundingCoverageDescription = resolveToComponent(
        strings.weAreLookingFor,
        {
            here: (
                <Link
                    href="https://ifrcorg.sharepoint.com/:x:/s/IFRCSharing/EZrYT-ysYfFFn9skPZxClN8B2sQPuY-GVvi3ddwdc5ZPHw"
                    external
                >
                    {strings.here}
                </Link>
            ),
            emailOne: (
                <Link
                    href="mailto:antoine.belair@ifrc.org"
                    external
                >
                    antoine.belair@ifrc.org
                </Link>
            ),
            emailTwo: (
                <Link
                    href="mailto:marshal.mukuvare@ifrc.org"
                    external
                >
                    marshal.mukuvare@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <TabPage>
            <Container
                // FIXME: use strings
                heading="Operational Toolbox"
                headerDescription={strings.surgeOperationalToolboxHeadingDescription}
                withCenteredHeading
                headingLevel={2}
                withCenteredHeaderDescription
            >
                {null}
            </Container>
            <OperationalTimeline />
            <Container
                withDarkBackground
                withPadding
            >
                <Description>
                    {fundingCoverageDescription}
                </Description>
            </Container>
        </TabPage>
    );
}

Component.displayName = 'SurgeOperationalToolbox';
