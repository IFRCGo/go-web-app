import Page from '#components/Page';
import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import arcLogo from '#assets/icons/content/arc_logo.png';
import aurcLogo from '#assets/icons/content/aurc_logo.svg';
import brcLogo from '#assets/icons/content/brc_logo.png';
import crcLogo from '#assets/icons/content/crc_logo.png';
import dnkLogo from '#assets/icons/content/dnk_logo.png';
import frcLogo from '#assets/icons/content/frc_logo.png';
import jrcLogo from '#assets/icons/content/jrc_logo.png';
import nlrcLogo from '#assets/icons/content/nlrc_logo.jpg';
import esprcLogo from '#assets/icons/content/esp_logo.svg';
import ericLogo from '#assets/icons/content/ericsson_logo.png';
import swissLogo from '#assets/icons/content/swiss.svg';
import usAidLogo from '#assets/icons/content/us_aid.svg';
import pdcLogo from '#assets/icons/content/pdc_logo.svg';

import VideoList from './VideoList';
import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

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
            extent: 'Asis Pacific Region',
        },
    ];

    const contactDescription = resolveToComponent(
        strings.aboutFurtherInfo,
        {
            contactLink: (
                <Link to="mailto:im@ifrc.org">
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
                    childrenContainerClassName={styles.guideList}
                >
                    <Link
                        to="https://github.com/IFRCGo/go-frontend/files/4415370/GoUserGuide_MediumRes.pdf"
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
                        icons={(
                            <span className={styles.iconCircle}>
                                EN
                            </span>
                        )}
                        withForwardIcon
                    >
                        Administrative Guides
                    </Link>
                    <Link
                        // FIXME: add link
                        to="/"
                        icons={(
                            <span className={styles.iconCircle}>
                                FR
                            </span>
                        )}
                        withForwardIcon
                    >
                        Guides d&quot;Utilisation
                    </Link>
                    <Link
                        // FIXME: add link
                        to="/"
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
                        icons={(
                            <span className={styles.iconCircle}>
                                ES
                            </span>
                        )}
                        withForwardIcon
                    >
                        Guías de Usuario
                    </Link>
                    <Link
                        // FIXME: add link
                        to="/"
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
                        icons={(
                            <span className={styles.iconCircle}>
                                AR
                            </span>
                        )}
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
                >
                    <Link
                        to="https://go-user-library.ifrc.org/"
                        withForwardIcon
                    >
                        {strings.aboutGoUserLibrary}
                    </Link>

                    <Link
                        to="https://ifrcgoproject.medium.com/"
                        withForwardIcon
                    >
                        {strings.goBlog}
                    </Link>
                    <Link
                        to="https://app.powerbi.com/view?r=eyJrIjoiY2RlOTRkOGQtMDU5Yy00OWIwLWE2NmYtNTQ5NTQ3YjEwY2ZmIiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9&pageName=ReportSectione263ecb5066f3105a8fa"
                        withForwardIcon
                    >
                        {strings.goUserAnalytics}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ESX7S_-kp-FAuPP_yXIcLQkB6zE6t2hVhKxGgWbSXZXOFg?e=RsWNSa"
                        withForwardIcon
                    >
                        {strings.goInfoArchitecture}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ea0TfruyRiZGhyGT3XCEnPMBxZSYqlwLLgEHx1VqeBT9Tg?e=nrpLmz"
                        withForwardIcon
                    >
                        {strings.goWorkplan}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUqbJHWGW8xLjFJgwG-x4GABfUD5UCS3DS6uwW74tufs9Q?e=HwsqbI"
                        withForwardIcon
                    >
                        {strings.goSystemAnalysis}
                    </Link>
                    <Link
                        to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EUV7xJOyEZtDmecIH6uS9SIBwl3gv1cbxVjwS6m79gx7TQ?e=b2AgU3"
                        withForwardIcon
                    >
                        {strings.goUserStudies}
                    </Link>

                    <Link
                        to="https://ifrcgoproject.medium.com/information-saves-lives-scaling-data-analytics-in-the-ifrc-network-fd3686718f9c"
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
                >
                    <Link
                        to="https://docs.google.com/spreadsheets/d/1F-78qDc8vdh5hli5FLFeyTvlFQgw19OqZXMR50TQ1C0/edit?usp=sharing"
                        withForwardIcon
                    >
                        {strings.aboutSurgeEvents}
                    </Link>
                    <Link
                        to="https://rcrcsims.org/"
                        withForwardIcon
                    >
                        {strings.aboutSurgeNetwork}
                    </Link>
                    <Link
                        to="https://www.cbsrc.org/"
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
                >
                    <Link
                        to="https://www.cash-hub.org/"
                        withForwardIcon
                    >
                        {strings.aboutCashHub}
                    </Link>
                    <Link
                        to="https://www.communityengagementhub.org/"
                        withForwardIcon
                    >
                        {strings.aboutCommunityHub}
                    </Link>
                    <Link
                        to="https://preparecenter.org/"
                        withForwardIcon
                    >
                        {strings.aboutDisasterPreparednessCenter}
                    </Link>
                    <Link
                        to="https://preparecenter.org/toolkit/data-playbook-toolkit/"
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
                >
                    <Link
                        to="https://www.ifrc.org/reference-centres/"
                        withForwardIcon
                    >
                        {strings.aboutReferenceCenters}
                    </Link>

                    <Link
                        to="https://www.missingmaps.org/"
                        withForwardIcon
                    >
                        {strings.aboutMissingMaps}
                    </Link>
                    <Link
                        to="https://data.ifrc.org/fdrs/"
                        withForwardIcon
                    >
                        {strings.aboutReportingSystem}
                    </Link>
                    <Link
                        to="https://ifrc.csod.com/client/ifrc/default.aspx"
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
                    <div className={styles.contactRow}>
                        <div className={styles.extent}>
                            {contact.extent}
                        </div>
                        <div className={styles.contactName}>
                            {contact.name}
                        </div>
                        <Link
                            to={`mailto:${contact.email}`}
                            className={styles.contactEmail}
                        >
                            {contact.email}
                        </Link>
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
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={arcLogo}
                        alt="Visit American Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.org.au/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={aurcLogo}
                        alt="Visit Australian Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.org.uk/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={brcLogo}
                        alt="Visit British Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.ca/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={crcLogo}
                        alt="Visit Canadian Red Cross Page"
                        width="120"
                    />
                </Link>
                <Link
                    to="https://en.rodekors.dk/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={dnkLogo}
                        alt="Visit Danish Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.redcross.fi/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={frcLogo}
                        alt="Visit Finnish Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.jrc.or.jp/english/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={jrcLogo}
                        alt="Visit Japanese Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.rodekruis.nl/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={nlrcLogo}
                        alt="Visit Netherlands Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www2.cruzroja.es/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={esprcLogo}
                        alt="Visit Spanish Red Cross Page"
                    />
                </Link>
                <Link
                    to="https://www.ericsson.com/en"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={ericLogo}
                        alt="Visit Ericsson Page"
                    />
                </Link>
                <Link
                    to="https://www.admin.ch/gov/de/start.html"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={swissLogo}
                        alt="Visit Swiss Confederation"
                    />
                </Link>
                <Link
                    to="https://www.usaid.gov/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={usAidLogo}
                        alt="Visit US Aid"
                    />
                </Link>
                <Link
                    to="https://www.pdc.org/"
                    className={styles.link}
                >
                    <img
                        className={styles.logo}
                        src={pdcLogo}
                        alt="Visit PDC"
                    />
                </Link>
            </Container>
        </Page>
    );
}

Component.displayName = 'Resources';
