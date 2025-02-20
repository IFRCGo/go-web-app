import {
    useRef,
    useState,
} from 'react';
import {
    Container,
    Tab,
    TabList,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    resolveToString,
} from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import Page from '#components/Page';

import i18n from './i18n.json';
import styles from './styles.module.css';

type TitlesOptionKey = 'disclaimer' | 'use-of-our-information' | 'our-privacy-policy';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTitlesOption, setActiveTitleOption] = useState<TitlesOptionKey>('disclaimer');

    const disclaimerRef = useRef<HTMLDivElement>(null);
    const useOfOurInformationRef = useRef<HTMLDivElement>(null);
    const ourPrivacyPolicyRef = useRef<HTMLDivElement>(null);

    const handleTabChange = (newTab: TitlesOptionKey) => {
        setActiveTitleOption(newTab);

        const tabRefs = {
            disclaimer: disclaimerRef,
            'use-of-our-information': useOfOurInformationRef,
            'our-privacy-policy': ourPrivacyPolicyRef,
        };
        tabRefs[newTab]?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Page
            heading={strings.cookiePolicyTitle}
        >
            <div className={styles.cookiePage}>
                <Tabs
                    value={activeTitlesOption}
                    onChange={handleTabChange}
                    variant="vertical"
                >
                    <TabList className={styles.sideTitles}>
                        <Tab name="disclaimer">
                            {strings.disclaimerTitle}
                        </Tab>
                        <Tab name="use-of-our-information">
                            {strings.useOfOurInformationTitle}
                        </Tab>
                        <Tab name="our-privacy-policy">
                            {strings.ourPrivacyPolicyHeading}
                        </Tab>
                    </TabList>
                </Tabs>
                <div className={styles.mainContent}>
                    <Container
                        heading={strings.disclaimerTitle}
                        footerIcons={strings.disclaimerDescription}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={disclaimerRef}
                    />
                    <Container
                        heading={strings.useOfOurInformationTitle}
                        containerRef={useOfOurInformationRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <div>{strings.useOfOurInformationDescription1}</div>
                                <div>
                                    { resolveToComponent(
                                        strings.useOfOurInformationDescription2,
                                        {
                                            termsLink: (
                                                <Link
                                                    href="mailto:av@ifrc.org"
                                                    withUnderline
                                                    external
                                                >
                                                    {strings.useOfOurInformationAudiovisualLink}
                                                </Link>
                                            ),
                                        },
                                    )}
                                </div>
                                <div>{strings.useOfOurInformationDescription3}</div>
                                <div>
                                    <Link
                                        href="https://www.ifrc.org/fraudulent-emails-and-websites"
                                        withUnderline
                                        external
                                    >
                                        {strings.useOfOurInformationDescriptionLink}
                                    </Link>
                                </div>
                            </>
                        )}
                        withHeaderBorder
                        withInternalPadding
                    />
                    <Container
                        heading={strings.ourPrivacyPolicyHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={ourPrivacyPolicyRef}
                        childrenContainerClassName={styles.firstLevelContent}
                    >
                        <div>
                            {resolveToString(strings.ourPrivacyPolicyContent, {
                                publishedDay: 'November',
                                publishedDate: 29,
                                publishedYear: 2021,
                            })}
                        </div>
                        <Container
                            heading={strings.dataCollectedByAccessingHeading}
                            childrenContainerClassName={styles.secondLevelContent}
                            headingLevel={4}
                        >
                            <Container
                                heading={strings.informationProvideHeading}
                                headingLevel={5}
                                footerContentClassName={styles.headerDescription}
                                footerContent={(
                                    <>
                                        <div>{strings.informationProvideDescription1}</div>
                                        <div>{strings.informationProvideDescription2}</div>
                                    </>
                                )}
                            />
                            <Container
                                heading={strings.automaticallyCollectedHeading}
                                headingLevel={5}
                                footerContentClassName={styles.headerDescription}
                                footerContent={(
                                    <>
                                        <div>{strings.automaticallyCollectedDescription}</div>
                                        <ul>
                                            <li>{strings.automaticallyCollectedList1}</li>
                                            <li>{strings.automaticallyCollectedList2}</li>
                                            <li>{strings.automaticallyCollectedList3}</li>
                                            <li>{strings.automaticallyCollectedList4}</li>
                                            <li>{strings.automaticallyCollectedList5}</li>
                                        </ul>
                                    </>
                                )}
                            />
                            <Container
                                heading={strings.ifrcLimitedCookiesAnalyticHeading}
                                headingLevel={5}
                                footerContentClassName={styles.headerDescription}
                                footerContent={(
                                    <>
                                        <div>{strings.ifrcLimitedCookiesAnalyticDescription}</div>
                                        <ul>
                                            <li>{strings.ifrcLimitedCookiesAnalyticList1}</li>
                                            <li>{strings.ifrcLimitedCookiesAnalyticList2}</li>
                                            <li>{strings.ifrcLimitedCookiesAnalyticList3}</li>
                                            <li>{strings.ifrcLimitedCookiesAnalyticList4}</li>
                                        </ul>
                                        <div>{strings.ifrcLimitedCookiesAnalyticDescription2}</div>
                                        <div>{strings.ifrcLimitedCookiesAnalyticDescription3}</div>
                                    </>
                                )}
                            />
                        </Container>
                        <Container
                            heading={strings.howInformationUsedHeading}
                            headingLevel={4}
                            childrenContainerClassName={styles.secondLevelContent}
                            footerContentClassName={styles.headerDescription}
                            footerContent={(
                                <>
                                    <div>{strings.howInformationUsedDescription}</div>
                                    <ul>
                                        <li>{strings.howInformationUsedDescriptionList1}</li>
                                        <li>{strings.howInformationUsedDescriptionList2}</li>
                                        <li>{strings.howInformationUsedDescriptionList3}</li>
                                        <li>{strings.howInformationUsedDescriptionList4}</li>
                                        <li>{strings.howInformationUsedDescriptionList5}</li>
                                        <li>{strings.howInformationUsedDescriptionList6}</li>
                                    </ul>
                                </>
                            )}
                        />
                        <Container
                            heading={strings.dataAccessSharingHeading}
                            headingLevel={4}
                            footerContentClassName={styles.headerDescription}
                            childrenContainerClassName={styles.secondLevelContent}
                            footerContent={(
                                <>
                                    <div>{strings.dataAccessSharingDescription1}</div>
                                    <div>{strings.dataAccessSharingDescription2}</div>
                                    <div>{strings.dataAccessSharingDescription3}</div>
                                </>
                            )}
                        />
                        <Container
                            heading={strings.storageSecurityQuestionsAboutDataHeading}
                            headingLevel={4}
                            footerContentClassName={styles.headerDescription}
                            childrenContainerClassName={styles.secondLevelContent}
                            footerContent={(
                                <>
                                    <div>{strings.storageSecurityQuestionsDataDescription1}</div>
                                    <div>{strings.storageSecurityQuestionsDataDescription2}</div>
                                    <div>
                                        { resolveToComponent(
                                            strings.storageSecurityQuestionsAboutDataDescription3,
                                            {
                                                termsLink: (
                                                    <Link
                                                        href="https://www.ifrc.org/document/IFRC-Data-Protection-Policy"
                                                        withUnderline
                                                        external
                                                    >
                                                        {strings.policyProtectionOfPersonalDataLink}
                                                    </Link>
                                                ),
                                            },
                                        )}
                                    </div>
                                    <div>
                                        {resolveToComponent(
                                            strings.storageSecurityQuestionsAboutDataDescription4,
                                            {
                                                termsLink: (
                                                    <Link
                                                        href="https://www.ifrc.org/data-protection"
                                                        withUnderline
                                                        external
                                                    >
                                                        {strings.dataProtectionPageLink}
                                                    </Link>
                                                ),
                                            },
                                        )}
                                    </div>
                                    <div>{strings.storageSecurityQuestionsDataDescription5}</div>
                                    <div>
                                        <strong>
                                            { resolveToComponent(
                                                strings.storageSecurityQuestionsDataGoEnquires,
                                                {
                                                    termsLink: (
                                                        <Link
                                                            href="mailto:im@ifrc.org"
                                                            withUnderline
                                                            external
                                                        >
                                                            im@ifrc.org
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <strong>
                                            { resolveToComponent(
                                                strings.storageSecurityQuestionsDataDonations,
                                                {
                                                    termsLink: (
                                                        <Link
                                                            href="mailto:prd@ifrc.org"
                                                            withUnderline
                                                            external
                                                        >
                                                            prd@ifrc.org
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <strong>
                                            {resolveToComponent(
                                                strings.storageSecurityQuestionsDataRecruitment,
                                                {
                                                    termsLink: (
                                                        <Link
                                                            href="mailto:ask.hr@ifrc.org"
                                                            withUnderline
                                                            external
                                                        >
                                                            ask.hr@ifrc.org
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <strong>
                                            { resolveToComponent(
                                                strings.securityQuestionsWebpageCollection,
                                                {
                                                    termsLink: (
                                                        <Link
                                                            href="mailto:webteam@ifrc.org"
                                                            withUnderline
                                                            external
                                                        >
                                                            webteam@ifrc.org
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <strong>
                                            { resolveToComponent(
                                                strings.storageSecurityQuestionsDataEnquires,
                                                {
                                                    termsLink: (
                                                        <Link
                                                            href="mailto:dataprotection@ifrc.org"
                                                            withUnderline
                                                            external
                                                        >
                                                            dataprotection@ifrc.org
                                                        </Link>
                                                    ),
                                                },
                                            )}
                                        </strong>
                                    </div>
                                </>
                            )}
                        />
                        <Container
                            heading={strings.privilegesAndImmunitiesHeading}
                            headingLevel={4}
                            childrenContainerClassName={styles.secondLevelContent}
                            footerContent={(
                                <div>
                                    {strings.privilegesAndImmunitiesDescription}
                                </div>
                            )}
                        />
                        <Container
                            heading={strings.noteOnLinksToExternalWebsitesHeading}
                            headingLevel={4}
                            footerContentClassName={styles.headerDescription}
                            childrenContainerClassName={styles.secondLevelContent}
                            footerContent={(
                                <>
                                    <div>{strings.noteOnLinksToExternalWebsitesDescription1}</div>
                                    <div>{strings.noteOnLinksToExternalWebsitesDescription2}</div>
                                </>
                            )}
                        />
                    </Container>
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'CookiePolicy';
