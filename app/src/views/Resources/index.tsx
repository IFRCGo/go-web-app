import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import arcLogo from '#assets/icons/arc_logo.png';
import aurcLogo from '#assets/icons/aurc_logo.svg';
import brcLogo from '#assets/icons/brc_logo.png';
import crcLogo from '#assets/icons/crc_logo.png';
import dnkLogo from '#assets/icons/dnk_logo.png';
import ericLogo from '#assets/icons/ericsson_logo.png';
import esprcLogo from '#assets/icons/esp_logo.svg';
import frcLogo from '#assets/icons/frc_logo.png';
import jrcLogo from '#assets/icons/jrc_logo.png';
import nlrcLogo from '#assets/icons/nlrc_logo.jpg';
import pdcLogo from '#assets/icons/pdc_logo.svg';
import swissLogo from '#assets/icons/swiss.svg';
import usAidLogo from '#assets/icons/us_aid.svg';
import Link from '#components/Link';
import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';

import VideoList from './VideoList';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { response: contactsResponse } = useRequest({
        url: '/api/v2/main_contact/',
    });

    const contactDescription = resolveToComponent(
        strings.aboutFurtherInfo,
        {
            contactLink: (
                <Link
                    href="mailto:im@ifrc.org"
                    external
                >
                    im@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <Page
            className={styles.resources}
            title={strings.aboutResourcesTitle}
            heading={strings.aboutResources}
            description={strings.resourcesDescription}
            infoContainerClassName={styles.iframeEmbed}
            info={(
                <iframe
                    className={styles.iframe}
                    title="go-overview"
                    src="https://www.youtube.com/embed/dwPsQzla9A4"
                    allow=""
                    allowFullScreen
                />
            )}
            mainSectionClassName={styles.mainContent}
        >
            <Container
                headingLevel={2}
                heading={strings.goUserGuidance}
                childrenContainerClassName={styles.userCards}
            >
                <Container
                    className={styles.guideCard}
                    heading={strings.goReferenceMaterial}
                    headerDescription={strings.goUserReferenceMaterial}
                    childrenContainerClassName={styles.guideList}
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        href="https://go-wiki.ifrc.org"
                        external
                        withLinkIcon
                    >
                        {strings.visitGoWiki}
                    </Link>
                    <Link
                        href="https://ifrcgoproject.medium.com/"
                        external
                        withLinkIcon
                    >
                        {strings.goBlog}
                    </Link>
                    <Link
                        href="https://app.powerbi.com/view?r=eyJrIjoiY2RlOTRkOGQtMDU5Yy00OWIwLWE2NmYtNTQ5NTQ3YjEwY2ZmIiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9&pageName=ReportSectione263ecb5066f3105a8fa"
                        external
                        withLinkIcon
                    >
                        {strings.goUserAnalytics}
                    </Link>
                    <Link
                        href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQraprcbhQdGgH1L8tSQXFAByvRgyoBRfW46HTMh71Nzlw?e=dMQIr8"
                        external
                        withLinkIcon
                    >
                        {strings.goWorkplan}
                    </Link>
                    <Link
                        href="https://ifrcgoproject.medium.com/information-saves-lives-scaling-data-analytics-in-the-ifrc-network-fd3686718f9c"
                        external
                        withLinkIcon
                    >
                        {strings.ifrcStrategicDirection}
                    </Link>
                </Container>
                <div />
            </Container>
            <Container
                headingLevel={2}
                heading={strings.referenceVideos}
            >
                <VideoList />
            </Container>
            <Container
                headingLevel={2}
                heading={strings.ifrcResources}
                childrenContainerClassName={styles.ifrcResourceList}
            >
                <Container
                    className={styles.resourceCard}
                    heading={strings.aboutSurgeLinks}
                    childrenContainerClassName={styles.resourceContent}
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        href="https://docs.google.com/spreadsheets/d/1F-78qDc8vdh5hli5FLFeyTvlFQgw19OqZXMR50TQ1C0/edit?usp=sharing"
                        external
                        withLinkIcon
                    >
                        {strings.aboutSurgeEvents}
                    </Link>
                    <Link
                        href="https://rcrcsims.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutSIMS}
                    </Link>
                    <Link
                        href="https://www.cbsrc.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutCommunitySurveillance}
                    </Link>
                    <Link
                        href="https://go.ifrc.org/surge/catalogue/overview"
                        external
                        withLinkIcon
                    >
                        {strings.aboutCoS}
                    </Link>
                    <Link
                        href="https://surgelearning.ifrc.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutSurgeLearning}
                    </Link>
                </Container>
                <Container
                    className={styles.resourceCard}
                    heading={strings.aboutGuidanceMaterial}
                    childrenContainerClassName={styles.resourceContent}
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        href="https://www.cash-hub.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutCashHub}
                    </Link>
                    <Link
                        href="https://www.communityengagementhub.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutCommunityHub}
                    </Link>
                    <Link
                        href="https://preparecenter.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutDisasterPreparednessCenter}
                    </Link>
                    <Link
                        href="https://preparecenter.org/toolkit/data-playbook-toolkit-v1/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutDataPlaybook}
                    </Link>
                </Container>
                <Container
                    className={styles.resourceCard}
                    heading={strings.aboutOtherResources}
                    childrenContainerClassName={styles.resourceContent}
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        href="https://www.ifrc.org/reference-centres/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutReferenceCenters}
                    </Link>

                    <Link
                        href="https://www.missingmaps.org/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutMissingMaps}
                    </Link>
                    <Link
                        href="https://data.ifrc.org/fdrs/"
                        external
                        withLinkIcon
                    >
                        {strings.aboutReportingSystem}
                    </Link>
                    <Link
                        href="https://ifrc.csod.com/client/ifrc/default.aspx"
                        external
                        withLinkIcon
                    >
                        {strings.aboutLearningPlatform}
                    </Link>
                </Container>
            </Container>
            <Container
                heading={strings.aboutContacts}
                headingLevel={2}
                headerDescription={contactDescription}
                childrenContainerClassName={styles.contactsList}
            >
                {contactsResponse?.results?.map((contact) => (
                    <div
                        className={styles.contact}
                        key={contact.extent}
                    >
                        <div className={styles.extent}>
                            {contact.extent}
                        </div>
                        <div>
                            <div>
                                {contact.name}
                            </div>
                            <Link
                                href={`mailto:${contact.email}`}
                                external
                                className={styles.contactEmail}
                                withLinkIcon
                            >
                                {contact.email}
                            </Link>
                        </div>
                    </div>
                ))}
            </Container>
            <Container
                heading={strings.aboutGoFundingTitle}
                headerDescription={strings.aboutGoFundingDescription}
                headingLevel={2}
                childrenContainerClassName={styles.supportSection}
            >
                <Link
                    href="https://www.redcross.org/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={arcLogo}
                        alt={strings.redCrossImageAmericanAlt}
                    />
                </Link>
                <Link
                    href="https://www.redcross.org.au/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={aurcLogo}
                        alt={strings.redCrossImageAustralianAlt}
                    />
                </Link>
                <Link
                    href="https://www.redcross.org.uk/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={brcLogo}
                        alt={strings.redCrossImageBritishAlt}
                    />
                </Link>
                <Link
                    href="https://www.redcross.ca/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={crcLogo}
                        alt={strings.redCrossImageCanadaAlt}
                        width="120"
                    />
                </Link>
                <Link
                    href="https://en.rodekors.dk/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={dnkLogo}
                        alt={strings.redCrossImageDanishAlt}
                    />
                </Link>
                <Link
                    href="https://www.redcross.fi/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={frcLogo}
                        alt={strings.redCrossImageFinnishAlt}
                    />
                </Link>
                <Link
                    href="https://www.jrc.or.jp/english/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={jrcLogo}
                        alt={strings.redCrossImageJapaneseAlt}
                    />
                </Link>
                <Link
                    href="https://www.rodekruis.nl/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={nlrcLogo}
                        alt={strings.redCrossImageNetherlandAlt}
                    />
                </Link>
                <Link
                    href="https://www2.cruzroja.es/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={esprcLogo}
                        alt={strings.redCrossImageSpanishAlt}
                    />
                </Link>
                <Link
                    href="https://www.ericsson.com/en"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={ericLogo}
                        alt={strings.ericImageAlt}
                    />
                </Link>
                <Link
                    href="https://www.admin.ch/gov/de/start.html"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={swissLogo}
                        alt={strings.visitSwissImageAlt}
                    />
                </Link>
                <Link
                    href="https://www.usaid.gov/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={usAidLogo}
                        alt={strings.visitUSAidImageAlt}
                    />
                </Link>
                <Link
                    href="https://www.pdc.org/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={pdcLogo}
                        alt={strings.vistPDCImageAlt}
                    />
                </Link>
            </Container>
        </Page>
    );
}

Component.displayName = 'Resources';
