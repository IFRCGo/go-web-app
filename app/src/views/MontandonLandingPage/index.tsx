import {
    DrefTwoIcon,
    MailIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    DataDisplay,
    Description,
    DisplayLabel,
    Heading,
    Iframe,
    ListView,
    Menu,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import Page from '#components/Page';

import i18n from './i18n.json';

// NOTE: These are links and email bodies and don't need to be translated
const emailSubject = encodeURIComponent('Explore Montandon Data');
const linkToMontandonStacBrowser = 'https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/';
const emailBody = encodeURIComponent(`Sharing with you a link to Montandon API: ${linkToMontandonStacBrowser}`);
const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
const linkToMontandonNotebooks = 'https://ifrcgo.org/montandon-notebooks/';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.montandonPageTitle}
            heading={strings.montandonHeading}
            description={strings.montandonHeadingDescription}
            actions={(
                <>
                    <Menu
                        label={strings.sourcePopupTitle}
                        labelBefore={<DrefTwoIcon />}
                        preferredPopupWidth={30}
                        persistent
                    >
                        <Container
                            heading={strings.sourcePopupTitle}
                            withHeaderBorder
                            headingLevel={5}
                            withPadding
                        >
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                                spacing="sm"
                            >
                                <DataDisplay
                                    strongLabel
                                    label={strings.stacIdLabel}
                                    value={strings.stacIdValue}
                                />
                                <DataDisplay
                                    strongLabel
                                    label={strings.stacVersionLabel}
                                    value={strings.stacVersionValue}
                                />
                                <DataDisplay
                                    strongLabel
                                    label={strings.validLabel}
                                    value={strings.validValue}
                                />
                                <DisplayLabel>
                                    {strings.stacLocationText}
                                </DisplayLabel>
                                <Link
                                    external
                                    href="https://montandon-eoapi-stage.ifrc.org/stac/"
                                    withLinkIcon
                                    withFullWidth
                                    styleVariant="translucent"
                                >
                                    https://montandon-eoapi-stage.ifrc.org/stac/
                                </Link>
                            </ListView>
                        </Container>
                    </Menu>
                    <Menu
                        label={strings.sharePopupTitle}
                        labelBefore={<ShareLineIcon />}
                        preferredPopupWidth={30}
                        persistent
                    >
                        <Container
                            heading={strings.sharePopupTitle}
                            withHeaderBorder
                            withFooterBorder
                            withPadding
                            headingLevel={5}
                            footerActions={(
                                <Link
                                    href={mailtoLink}
                                    before={<MailIcon />}
                                    colorVariant="primary"
                                    styleVariant="outline"
                                    external
                                    spacing="sm"
                                >
                                    {strings.emailLabel}
                                </Link>
                            )}
                        >
                            <DisplayLabel>
                                {strings.shareUrlLabel}
                            </DisplayLabel>
                            <Link
                                href="https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/"
                                external
                                withEllipsizedContent
                                withLinkIcon
                            >
                                https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/
                            </Link>
                        </Container>
                    </Menu>
                </>
            )}
            info={(
                <Iframe
                    src="https://www.youtube.com/embed/BEWxqYfrQek"
                    title={strings.videoTitle}
                    allowFullScreen
                />
            )}
        >
            <Container
                footerActions={(
                    <ListView
                        withWrap
                        spacing="sm"
                    >
                        <Link
                            href={linkToMontandonStacBrowser}
                            colorVariant="primary"
                            styleVariant="outline"
                            external
                            withLinkIcon
                        >
                            {strings.exploreRadiantEarthLabel}
                        </Link>
                    </ListView>
                )}
                spacing="xl"
            >
                <ListView layout="block">
                    <Container
                        heading={strings.gettingStartedGuide}
                        withHeaderBorder
                        withPadding
                        backgroundColor="foreground"
                        boxShadow="md"
                    >
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            <Heading level={5}>
                                {strings.guideGetYourToken}
                            </Heading>
                            <ol type="a">
                                <li>
                                    {resolveToComponent(
                                        strings.guideVisitAccountPage,
                                        {
                                            goAccountPageLink: (
                                                <Link
                                                    to="accountDetails"
                                                    withUnderline
                                                >
                                                    {strings.goAccountPageLinkButtonTitle}
                                                </Link>
                                            ),
                                        },
                                    )}
                                </li>
                                <li>{strings.guideGenerateNewToken}</li>
                                <li>{strings.guideSaveToken}</li>
                            </ol>
                            <Heading level={5}>
                                {strings.guideExploreData}
                            </Heading>
                            <ol type="a">
                                <li>
                                    {resolveToComponent(
                                        strings.guideMontandonNotebooks,
                                        {
                                            montandonNotebookLink: (
                                                <Link
                                                    href={linkToMontandonNotebooks}
                                                    withUnderline
                                                    withLinkIcon
                                                    external
                                                >
                                                    {strings.montandonNotebooksLinkButtonTitle}
                                                </Link>
                                            ),
                                        },
                                    )}
                                </li>
                                <li>
                                    {resolveToComponent(
                                        strings.guideStacBrowser,
                                        {
                                            montandonStacBrowserLink: (
                                                <Link
                                                    href={linkToMontandonStacBrowser}
                                                    withUnderline
                                                    withLinkIcon
                                                    external
                                                >
                                                    {

                                                        strings.montandonStacBrowserLinkButtonTitle
                                                    }
                                                </Link>
                                            ),
                                        },
                                    )}
                                </li>
                            </ol>
                        </ListView>
                    </Container>
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                        minGridColumnSize="30rem"
                    >
                        <Container
                            heading={strings.blogPosts}
                            withPadding
                            backgroundColor="foreground"
                            boxShadow="md"
                            withHeaderBorder
                        >
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                            >
                                <Link
                                    href="https://ifrcgoproject.medium.com/toward-a-more-comprehensive-understanding-of-disasters-fc422d65377"
                                    external
                                    withLinkIcon
                                >
                                    {strings.leveragingDataBlogPostTitle}
                                </Link>
                                <Link
                                    href="https://ifrcgoproject.medium.com/scaled-up-ambitions-require-scaled-up-systems-4a92456fab59"
                                    external
                                    withLinkIcon
                                >
                                    {strings.scaledUpSystemsBlogPostTitle}
                                </Link>
                            </ListView>
                        </Container>
                        <Container
                            heading={strings.contact}
                            withPadding
                            backgroundColor="foreground"
                            boxShadow="md"
                            withHeaderBorder
                        >
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                            >
                                <Link
                                    href="mailto:im@ifrc.org"
                                    colorVariant="primary"
                                    styleVariant="filled"
                                    external
                                    spacing="sm"
                                >
                                    im@ifrc.org
                                </Link>
                                <Description>
                                    {strings.contactText}
                                </Description>
                            </ListView>
                        </Container>
                    </ListView>
                </ListView>
            </Container>
        </Page>
    );
}

Component.displayName = 'montandonLandingPage';
