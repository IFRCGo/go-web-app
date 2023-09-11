import Page from '#components/Page';
import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import arcLogo from '#assets/icons/arc_logo.png';
import aurcLogo from '#assets/icons/aurc_logo.svg';
import brcLogo from '#assets/icons/brc_logo.png';
import crcLogo from '#assets/icons/crc_logo.png';
import dnkLogo from '#assets/icons/dnk_logo.png';
import frcLogo from '#assets/icons/frc_logo.png';
import jrcLogo from '#assets/icons/jrc_logo.png';
import nlrcLogo from '#assets/icons/nlrc_logo.jpg';
import esprcLogo from '#assets/icons/esp_logo.svg';
import ericLogo from '#assets/icons/ericsson_logo.png';
import swissLogo from '#assets/icons/swiss.svg';
import usAidLogo from '#assets/icons/us_aid.svg';
import pdcLogo from '#assets/icons/pdc_logo.svg';

import VideoList from './VideoList';
import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: region names can be used from the enum context
const contacts = [
    {
        email: 'Elly.MULAHA@ifrc.org',
        name: 'Elly NANDASABA MULAHA',
        extent: 'Africa Region',
    },
    {
        email: 'luis.fanovich@ifrc.org',
        name: 'Luis FANOVICH',
        extent: 'America Region',
    },
    {
        email: 'dedi.jundai@ifrc.org',
        name: 'Dedi JUNADI',
        extent: 'Asia Pacific Region',
    },
    {
        email: 'anssi.anonen@ifrc.org',
        name: 'Anssi ANONEN',
        extent: 'Europe Region',
    },
    {
        email: 'ahmad.aljamal@ifrc.org',
        name: 'Ahmad AL JAMAL',
        extent: 'MENA Region',
    },
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const contactDescription = resolveToComponent(
        strings.aboutFurtherInfo,
        {
            contactLink: (
                <Link
                    to="mailto:im@ifrc.org"
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
                    heading={strings.goUserAdminGuide}
                    headerDescription={strings.goUserAdministrativeGuide}
                    withHeaderBorder
                    withInternalPadding
                    childrenContainerClassName={styles.guideList}
                >
                    {/* NOTE: We do not need to translate these links */}
                    <Link
                        to="https://github.com/IFRCGo/go-frontend/files/4415370/GoUserGuide_MediumRes.pdf"
                        external
                        icons={(
                            <span className={styles.iconCircle}>
                                EN
                            </span>
                        )}
                        withForwardIcon
                    >
                        GO user guide
                    </Link>
                    <Link
                        to="https://github.com/IFRCGo/go-frontend/files/4415371/GoAdminGuide_MediumRes.pdf"
                        external
                        icons={(
                            <span className={styles.iconCircle}>
                                EN
                            </span>
                        )}
                        withForwardIcon
                    >
                        Administrative Guides
                    </Link>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link
                        to={undefined}
                        icons={(
                            <span className={styles.iconCircle}>
                                FR
                            </span>
                        )}
                        withForwardIcon
                    >
                        Guides d&quot;Utilisation
                    </Link>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link
                        // FIXME: add link
                        to={null}
                        icons={(
                            <span className={styles.iconCircle}>
                                FR
                            </span>
                        )}
                        withForwardIcon
                    >
                        Guides Administratifs
                    </Link>
                    <Link
                        to="https://drive.google.com/file/d/1FnmBm_8K52eTKWa8xWK52eebhgOz60SO/view"
                        external
                        icons={(
                            <span className={styles.iconCircle}>
                                ES
                            </span>
                        )}
                        withForwardIcon
                    >
                        Guías de Usuario
                    </Link>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link
                        // FIXME: add link
                        to={null}
                        external
                        icons={(
                            <span className={styles.iconCircle}>
                                ES
                            </span>
                        )}
                        withForwardIcon
                    >
                        Guías Administrativas
                    </Link>
                    <Link
                        to="https://github.com/IFRCGo/go-frontend/files/4818646/GoUserGuide_MediumRes_AR.pdf.pdf"
                        external
                        icons={(
                            <span className={styles.iconCircle}>
                                AR
                            </span>
                        )}
                        withForwardIcon
                    >
                        أدلة المستخدم
                    </Link>
                    <Link
                        to="https://github.com/IFRCGo/go-frontend/files/4818648/GoAdminGuide_MediumRes_AR.pdf.pdf"
                        external
                        icons={(
                            <span className={styles.iconCircle}>
                                AR
                            </span>
                        )}
                        withForwardIcon
                    >
                        أدلة إدارية
                    </Link>
                </Container>
                <Container
                    className={styles.guideCard}
                    heading={strings.goReferenceMaterial}
                    headerDescription={strings.goUserReferenceMaterial}
                    childrenContainerClassName={styles.guideList}
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        to="https://go-user-library.ifrc.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutGoUserLibrary}
                    </Link>

                    <Link
                        to="https://ifrcgoproject.medium.com/"
                        external
                        withForwardIcon
                    >
                        {strings.goBlog}
                    </Link>
                    <Link
                        to="https://app.powerbi.com/view?r=eyJrIjoiY2RlOTRkOGQtMDU5Yy00OWIwLWE2NmYtNTQ5NTQ3YjEwY2ZmIiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9&pageName=ReportSectione263ecb5066f3105a8fa"
                        external
                        withForwardIcon
                    >
                        {strings.goUserAnalytics}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ESX7S_-kp-FAuPP_yXIcLQkB6zE6t2hVhKxGgWbSXZXOFg?e=RsWNSa"
                        external
                        withForwardIcon
                    >
                        {strings.goInfoArchitecture}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ea0TfruyRiZGhyGT3XCEnPMBxZSYqlwLLgEHx1VqeBT9Tg?e=nrpLmz"
                        external
                        withForwardIcon
                    >
                        {strings.goWorkplan}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUqbJHWGW8xLjFJgwG-x4GABfUD5UCS3DS6uwW74tufs9Q?e=HwsqbI"
                        external
                        withForwardIcon
                    >
                        {strings.goSystemAnalysis}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUV7xJOyEZtDmecIH6uS9SIBwl3gv1cbxVjwS6m79gx7TQ?e=b2AgU3"
                        external
                        withForwardIcon
                    >
                        {strings.goUserStudies}
                    </Link>

                    <Link
                        to="https://ifrcgoproject.medium.com/information-saves-lives-scaling-data-analytics-in-the-ifrc-network-fd3686718f9c"
                        external
                        withForwardIcon
                    >
                        {strings.ifrcStrategicDirection}
                    </Link>
                </Container>
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
                    heading={strings.aboutSurgeServices}
                    childrenContainerClassName={styles.resourceContent}
                    withHeaderBorder
                    withInternalPadding
                >
                    <Link
                        to="https://docs.google.com/spreadsheets/d/1F-78qDc8vdh5hli5FLFeyTvlFQgw19OqZXMR50TQ1C0/edit?usp=sharing"
                        external
                        withForwardIcon
                    >
                        {strings.aboutSurgeEvents}
                    </Link>
                    <Link
                        to="https://rcrcsims.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutSurgeNetwork}
                    </Link>
                    <Link
                        to="https://www.cbsrc.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutCommunitySurveillance}
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
                        to="https://www.cash-hub.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutCashHub}
                    </Link>
                    <Link
                        to="https://www.communityengagementhub.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutCommunityHub}
                    </Link>
                    <Link
                        to="https://preparecenter.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutDisasterPreparednessCenter}
                    </Link>
                    <Link
                        to="https://preparecenter.org/toolkit/data-playbook-toolkit/"
                        external
                        withForwardIcon
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
                        to="https://www.ifrc.org/reference-centres/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutReferenceCenters}
                    </Link>

                    <Link
                        to="https://www.missingmaps.org/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutMissingMaps}
                    </Link>
                    <Link
                        to="https://data.ifrc.org/fdrs/"
                        external
                        withForwardIcon
                    >
                        {strings.aboutReportingSystem}
                    </Link>
                    <Link
                        to="https://ifrc.csod.com/client/ifrc/default.aspx"
                        external
                        withForwardIcon
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
                {contacts.map((contact) => (
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
                                to={`mailto:${contact.email}`}
                                external
                                className={styles.contactEmail}
                                withExternalLinkIcon
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
                    to="https://www.redcross.org/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={arcLogo}
                        // FIXME: use translations
                        alt="Visit American Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.org.au/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={aurcLogo}
                        // FIXME: use translations
                        alt="Visit Australian Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.org.uk/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={brcLogo}
                        // FIXME: use translations
                        alt="Visit British Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.ca/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={crcLogo}
                        // FIXME: use translations
                        alt="Visit Canadian Red Cross Page"
                        width="120"
                    />
                </Link>
                <Link
                    to="https://en.rodekors.dk/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={dnkLogo}
                        // FIXME: use translations
                        alt="Visit Danish Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.fi/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={frcLogo}
                        // FIXME: use translations
                        alt="Visit Finnish Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.jrc.or.jp/english/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={jrcLogo}
                        // FIXME: use translations
                        alt="Visit Japanese Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.rodekruis.nl/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={nlrcLogo}
                        // FIXME: use translations
                        alt="Visit Netherlands Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www2.cruzroja.es/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={esprcLogo}
                        // FIXME: use translations
                        alt="Visit Spanish Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.ericsson.com/en"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={ericLogo}
                        // FIXME: use translations
                        alt="Visit Ericsson Page"
                    />
                </Link>
                <Link
                    to="https://www.admin.ch/gov/de/start.html"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={swissLogo}
                        // FIXME: use translations
                        alt="Visit Swiss Confederation"
                    />
                </Link>
                <Link
                    to="https://www.usaid.gov/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={usAidLogo}
                        // FIXME: use translations
                        alt="Visit US Aid"
                    />
                </Link>
                <Link
                    to="https://www.pdc.org/"
                    external
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={pdcLogo}
                        // FIXME: use translations
                        alt="Visit PDC"
                    />
                </Link>
            </Container>
        </Page>
    );
}

Component.displayName = 'Resources';
