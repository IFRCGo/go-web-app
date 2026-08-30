import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container,
    ListView,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isFalsyString } from '@togglecorp/fujs';

import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';

import i18n from './i18n.json';

const sectionUrlHash = {
    disclaimer: 'disclaimer',
    useOfOurInformation: 'use-of-our-information',
    ourPrivacyPolicy: 'our-privacy-policy',
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { hash: locationHash } = useLocation();

    useEffect(() => {
        if (isFalsyString(locationHash)) {
            return;
        }

        const element = document.getElementById(locationHash.substring(1));
        if (element) {
            element.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
        }
    }, [locationHash]);

    return (
        <Page heading={strings.cookiePolicyTitle}>
            <ListView
                layout="grid"
                withSidebar
                sidebarPosition="start"
            >
                <NavigationTabList styleVariant="vertical">
                    <NavigationTab
                        to="cookiePolicy"
                        urlHash={sectionUrlHash.disclaimer}
                    >
                        {strings.disclaimerTitle}
                    </NavigationTab>
                    <NavigationTab
                        to="cookiePolicy"
                        urlHash={sectionUrlHash.useOfOurInformation}
                    >
                        {strings.useOfOurInformationTitle}
                    </NavigationTab>
                    <NavigationTab
                        to="cookiePolicy"
                        urlHash={sectionUrlHash.ourPrivacyPolicy}
                    >
                        {strings.ourPrivacyPolicyHeading}
                    </NavigationTab>
                </NavigationTabList>
                <ListView
                    layout="block"
                    spacing="2xl"
                >
                    <Container
                        id={sectionUrlHash.disclaimer}
                        heading={strings.disclaimerTitle}
                        withHeaderBorder
                    >
                        {strings.disclaimerDescription}
                    </Container>
                    <Container
                        id={sectionUrlHash.useOfOurInformation}
                        heading={strings.useOfOurInformationTitle}
                        withHeaderBorder
                    >
                        <ListView layout="block">
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
                        </ListView>
                    </Container>
                    <Container
                        id={sectionUrlHash.ourPrivacyPolicy}
                        heading={strings.ourPrivacyPolicyHeading}
                        withHeaderBorder
                    >
                        <ListView
                            layout="block"
                            spacing="xl"
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
                                headingLevel={4}
                            >
                                <ListView
                                    layout="block"
                                    spacing="lg"
                                    withPadding
                                    withSpacingOpticalCorrection
                                >
                                    <Container
                                        heading={strings.informationProvideHeading}
                                        headingLevel={5}
                                    >
                                        <ListView layout="block">
                                            <div>{strings.informationProvideDescription1}</div>
                                            <div>{strings.informationProvideDescription2}</div>
                                        </ListView>
                                    </Container>
                                    <Container
                                        heading={strings.automaticallyCollectedHeading}
                                        headingLevel={5}
                                    >
                                        <ListView layout="block">
                                            <div>{strings.automaticallyCollectedDescription}</div>
                                            <ul>
                                                <li>{strings.automaticallyCollectedList1}</li>
                                                <li>{strings.automaticallyCollectedList2}</li>
                                                <li>{strings.automaticallyCollectedList3}</li>
                                                <li>{strings.automaticallyCollectedList4}</li>
                                                <li>{strings.automaticallyCollectedList5}</li>
                                            </ul>
                                        </ListView>
                                    </Container>
                                    <Container
                                        heading={strings.ifrcLimitedCookiesAnalyticHeading}
                                        headingLevel={5}
                                    >
                                        <ListView layout="block">
                                            <div>
                                                {strings.ifrcLimitedCookiesAnalyticDescription}
                                            </div>
                                            <ul>
                                                <li>{strings.ifrcLimitedCookiesAnalyticList1}</li>
                                                <li>{strings.ifrcLimitedCookiesAnalyticList2}</li>
                                                <li>{strings.ifrcLimitedCookiesAnalyticList3}</li>
                                                <li>{strings.ifrcLimitedCookiesAnalyticList4}</li>
                                            </ul>
                                            <div>
                                                {strings.ifrcLimitedCookiesAnalyticDescription2}
                                            </div>
                                            <div>
                                                {strings.ifrcLimitedCookiesAnalyticDescription3}
                                            </div>
                                        </ListView>
                                    </Container>
                                </ListView>
                            </Container>
                            <Container
                                heading={strings.howInformationUsedHeading}
                                headingLevel={4}
                            >
                                <ListView layout="block">
                                    <div>{strings.howInformationUsedDescription}</div>
                                    <ul>
                                        <li>{strings.howInformationUsedDescriptionList1}</li>
                                        <li>{strings.howInformationUsedDescriptionList2}</li>
                                        <li>{strings.howInformationUsedDescriptionList3}</li>
                                        <li>{strings.howInformationUsedDescriptionList4}</li>
                                        <li>{strings.howInformationUsedDescriptionList5}</li>
                                        <li>{strings.howInformationUsedDescriptionList6}</li>
                                    </ul>
                                </ListView>
                            </Container>
                            <Container
                                heading={strings.dataAccessSharingHeading}
                                headingLevel={4}
                            >
                                <ListView layout="block">
                                    <div>{strings.dataAccessSharingDescription1}</div>
                                    <div>{strings.dataAccessSharingDescription2}</div>
                                    <div>{strings.dataAccessSharingDescription3}</div>
                                </ListView>
                            </Container>
                            <Container
                                heading={strings.storageSecurityQuestionsAboutDataHeading}
                                headingLevel={4}
                            >
                                <ListView layout="block">
                                    <div>{strings.storageSecurityQuestionsDataDescription1}</div>
                                    <div>{strings.storageSecurityQuestionsDataDescription2}</div>
                                    <div>
                                        {resolveToComponent(
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
                                    <ListView
                                        layout="block"
                                        withSpacingOpticalCorrection
                                        // FIXME: use text outputs on following
                                    >
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
                                    </ListView>
                                </ListView>
                            </Container>
                            <Container
                                heading={strings.privilegesAndImmunitiesHeading}
                                headingLevel={4}
                            >
                                <div>
                                    {strings.privilegesAndImmunitiesDescription}
                                </div>
                            </Container>
                            <Container
                                heading={strings.noteOnLinksToExternalWebsitesHeading}
                                headingLevel={4}
                            >
                                <ListView layout="block">
                                    <div>{strings.noteOnLinksToExternalWebsitesDescription1}</div>
                                    <div>{strings.noteOnLinksToExternalWebsitesDescription2}</div>
                                </ListView>
                            </Container>
                        </ListView>
                    </Container>
                </ListView>
            </ListView>
        </Page>
    );
}

Component.displayName = 'CookiePolicy';
