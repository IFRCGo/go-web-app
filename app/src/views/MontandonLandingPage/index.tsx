import {
    DrefTwoIcon,
    MailIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    Description,
    DropdownMenu,
    Label,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';
import Page from '#components/Page';

import i18n from './i18n.json';
import styles from './styles.module.css';

// TODO: Does this need translation?
const emailSubject = encodeURIComponent('Explore Montandon Data');
const linkToMontandon = 'https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/';
const emailBody = encodeURIComponent(`Sharing with you a link to Montandon API: ${linkToMontandon}`);
const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.montandonPageTitle}
            heading={strings.montandonHeading}
            description={strings.montandonHeadingDescription}
            mainSectionClassName={styles.content}
            actions={(
                <>
                    <DropdownMenu
                        label={strings.sourcePopupTitle}
                        labelBefore={<DrefTwoIcon />}
                        labelColorVariant="primary"
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
                                <TextOutput
                                    strongLabel
                                    label={strings.stacIdLabel}
                                    value={strings.stacIdValue}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.stacVersionLabel}
                                    value={strings.stacVersionValue}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.validLabel}
                                    value={strings.validValue}
                                />
                                <div className={styles.separator} />
                                <Label>
                                    {strings.stacLocationText}
                                </Label>
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
                    </DropdownMenu>
                    <DropdownMenu
                        label={strings.sharePopupTitle}
                        labelBefore={<ShareLineIcon className={styles.icon} />}
                        labelColorVariant="primary"
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
                                    before={<MailIcon className={styles.icon} />}
                                    colorVariant="primary"
                                    styleVariant="outline"
                                    external
                                    spacing="sm"
                                >
                                    {strings.emailLabel}
                                </Link>
                            )}
                        >
                            <Label>
                                {strings.shareUrlLabel}
                            </Label>
                            <Link
                                href="https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/"
                                external
                                withEllipsizedContent
                                withLinkIcon
                            >
                                https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/
                            </Link>
                        </Container>
                    </DropdownMenu>
                </>
            )}
            info={(
                <iframe
                    className={styles.iframe}
                    src="https://www.youtube.com/embed/BEWxqYfrQek"
                    title={strings.videoTitle}
                    allow=""
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
                            href="https://montandon-eoapi-stage.ifrc.org/stac/api.html"
                            colorVariant="primary"
                            styleVariant="outline"
                            external
                            withLinkIcon
                        >
                            {strings.accessAPILabel}
                        </Link>
                        <Link
                            href="https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/"
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
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    minGridColumnSize="20rem"
                >
                    <Container
                        className={styles.guideCard}
                        heading={strings.resources}
                        withHeaderBorder
                        withPadding
                        withBackground
                        withShadow
                    >
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            <Link
                                href="https://github.com/IFRCGo/monty-stac-extension/blob/main/README.md"
                                external
                                withLinkIcon
                            >
                                {strings.visitGithub}
                            </Link>
                            <Link
                                href="https://go-wiki.ifrc.org/en/home"
                                external
                                withLinkIcon
                            >
                                {strings.goWiki}
                            </Link>
                            <Link
                                href="https://montandon-eoapi-stage.ifrc.org/stac/api"
                                external
                                withLinkIcon
                            >
                                {strings.apiDescription}
                            </Link>
                            <Link
                                href="https://montandon-eoapi-stage.ifrc.org/stac/api.html"
                                external
                                withLinkIcon
                            >
                                {strings.apiDocumentation}
                            </Link>
                        </ListView>
                    </Container>
                    <Container
                        heading={strings.blogPosts}
                        withPadding
                        withBackground
                        withShadow
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
                        withBackground
                        withShadow
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
            </Container>
        </Page>
    );
}

Component.displayName = 'montandonLandingPage';
