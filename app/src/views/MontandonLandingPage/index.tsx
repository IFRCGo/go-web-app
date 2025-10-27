import {
    DrefTwoIcon,
    MailIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    DropdownMenu,
    TextInput,
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

const noOp = () => {};

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            className={styles.montandonLandingPage}
            title={strings.montandonPageTitle}
            heading={strings.montandonHeading}
            description={strings.montandonHeadingDescription}
            mainSectionClassName={styles.content}
            actions={(
                <>
                    <DropdownMenu
                        label={strings.sourcePopupTitle}
                        icons={<DrefTwoIcon className={styles.icon} />}
                        preferredPopupWidth={30}
                        withoutDropdownIcon
                        persistent
                    >
                        <Container
                            heading={strings.sourcePopupTitle}
                            withHeaderBorder
                            withInternalPadding
                            contentViewType="vertical"
                        >
                            <div className={styles.stacDescription}>
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
                                {strings.stacLocationText}
                                <TextInput
                                    name="link"
                                    value="https://montandon-eoapi-stage.ifrc.org/stac/"
                                    onChange={noOp}
                                    readOnly
                                />
                            </div>
                        </Container>
                    </DropdownMenu>
                    <DropdownMenu
                        icons={<ShareLineIcon className={styles.icon} />}
                        label={strings.sharePopupTitle}
                        withoutDropdownIcon
                        preferredPopupWidth={30}
                        persistent
                    >
                        <Container
                            heading={strings.sharePopupTitle}
                            withHeaderBorder
                            withInternalPadding
                            withFooterBorder
                            contentViewType="vertical"
                            footerContent={(
                                <Link
                                    href={mailtoLink}
                                    icons={<MailIcon className={styles.icon} />}
                                    variant="secondary"
                                    external
                                >
                                    {strings.emailLabel}
                                </Link>
                            )}
                        >
                            {strings.shareUrlLabel}
                            <Link
                                href="https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/"
                                variant="tertiary"
                                external
                            >
                                https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/
                            </Link>
                        </Container>
                    </DropdownMenu>
                </>
            )}
            infoContainerClassName={styles.iframeEmbed}
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
                className={styles.resources}
                contentViewType="grid"
                numPreferredGridContentColumns={3}
                spacing="comfortable"
                footerActions={(
                    <>
                        <Link
                            href="https://montandon-eoapi-stage.ifrc.org/stac/api.html"
                            variant="secondary"
                            external
                            withLinkIcon
                        >
                            {strings.accessAPILabel}
                        </Link>
                        <Link
                            href="https://radiantearth.github.io/stac-browser/#/external/montandon-eoapi-stage.ifrc.org/stac/"
                            variant="secondary"
                            external
                            withLinkIcon
                        >
                            {strings.exploreRadiantEarthLabel}
                        </Link>
                    </>
                )}
            >
                <Container
                    className={styles.guideCard}
                    heading={strings.resources}
                    contentViewType="vertical"
                    withHeaderBorder
                    withInternalPadding
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
                </Container>

                <Container
                    className={styles.guideCard}
                    heading={strings.blogPosts}
                    contentViewType="vertical"
                    withHeaderBorder
                    withInternalPadding
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
                </Container>

                <Container
                    className={styles.guideCard}
                    heading={strings.contact}
                    contentViewType="vertical"
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        href="mailto:im@ifrc.org"
                        variant="primary"
                        external
                    >
                        im@ifrc.org
                    </Link>
                    <div>
                        {strings.contactText}
                    </div>
                </Container>

            </Container>
        </Page>
    );
}

Component.displayName = 'montandonLandingPage';
