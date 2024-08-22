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
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import Page from '#components/Page';

import ConditionsModal from './ConditionsModal';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [showHereConditionModal, {
        setTrue: setShowHereModalTrue,
        setFalse: setShowHereModalFalse,
    }] = useBooleanState(false);
    type TitlesOptionKey = 'data-provenance' | 'user-registration' | 'unauthorised-users'| 'compliance-of-user-owner' | 'liability-of-ifrc' | 'protection-personal-data' | 'privileges-and-immunities' | 'final-provisions';
    const [activeTitlesOption, setActiveTitleOption] = useState<TitlesOptionKey>('data-provenance');

    const dataProvenanceRef = useRef<HTMLDivElement>(null);
    const userRegistrationRef = useRef<HTMLDivElement>(null);
    const unauthorisedUsersRef = useRef<HTMLDivElement>(null);
    const complianceOfUserOwnerRef = useRef<HTMLDivElement>(null);
    const liabilityOfIFRCRef = useRef<HTMLDivElement>(null);
    const protectionPersonalDataRef = useRef<HTMLDivElement>(null);
    const privilegesAndImmunitiesRef = useRef<HTMLDivElement>(null);
    const finalProvisionsRef = useRef<HTMLDivElement>(null);

    const handleTabChange = (newTab: TitlesOptionKey) => {
        setActiveTitleOption(newTab);

        const tabRefs = {
            'data-provenance': dataProvenanceRef,
            'user-registration': userRegistrationRef,
            'unauthorised-users': unauthorisedUsersRef,
            'compliance-of-user-owner': complianceOfUserOwnerRef,
            'liability-of-ifrc': liabilityOfIFRCRef,
            'protection-personal-data': protectionPersonalDataRef,
            'privileges-and-immunities': privilegesAndImmunitiesRef,
            'final-provisions': finalProvisionsRef,
        };
        tabRefs[newTab]?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Page
            heading={strings.termsAndConditionTitle}
        >
            <div className={styles.termsWrapper}>
                <Tabs
                    value={activeTitlesOption}
                    onChange={handleTabChange}
                    variant="vertical"
                >
                    <TabList className={styles.sideTitles}>
                        <Tab name="data-provenance">
                            {strings.dataProvenanceHeading}
                        </Tab>
                        <Tab name="user-registration">
                            {strings.userRegistrationHeading}
                        </Tab>
                        <Tab name="unauthorised-users">
                            {strings.unAuthorisedUsesHeading }
                        </Tab>
                        <Tab name="compliance-of-user-owner">
                            {strings.complianceDateOwnerHeading}
                        </Tab>
                        <Tab name="liability-of-ifrc">
                            {strings.liabilityOfIFRCHeading }
                        </Tab>
                        <Tab name="protection-personal-data">
                            {strings.protectionUsersPersonalDataHeading}
                        </Tab>
                        <Tab name="privileges-and-immunities">
                            {strings.privilegesAndImmunitiesHeading}
                        </Tab>
                        <Tab name="final-provisions">
                            {strings.finalProvisionsHeading}
                        </Tab>
                    </TabList>
                </Tabs>
                <Container
                    className={styles.content}
                    headingDescriptionContainerClassName={styles.headerDescription}
                    headingDescription={(
                        <>
                            <div>{strings.termsAndConditionsDescription1}</div>
                            <div>{strings.termsAndConditionsDescription2}</div>
                            <div>{strings.termsAndConditionsDescription3}</div>
                        </>
                    )}
                >
                    <Container
                        heading={strings.dataProvenanceHeading}
                        withHeaderBorder
                        withInternalPadding
                        footerContent={
                            <div>{strings.dataProvenanceDescription}</div>
                        }
                        containerRef={dataProvenanceRef}
                    />
                    <Container
                        heading={strings.userRegistrationHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={userRegistrationRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <div>{strings.userRegistrationDescription}</div>
                                <div>
                                    {resolveToComponent(
                                        strings.userRegistrationDescriptionToLink,
                                        {
                                            termsLink: (
                                                <Link
                                                    href="https://go.ifrc.org/register"
                                                    withUnderline
                                                    external
                                                >
                                                    {strings.userRegistrationDescriptionLink}
                                                </Link>
                                            ),
                                        },
                                    )}
                                </div>
                                <div>
                                    {strings.userRegistrationAuthorizedUser}

                                </div>
                                <div>{strings.userRegistrationDescriptionByRegistering}</div>
                                <ul>
                                    <li>
                                        {strings.userRegistrationDescriptionList1}
                                    </li>
                                    <li>
                                        {strings.userRegistrationDescriptionList2}
                                        <ul>
                                            <li>
                                                {strings.userRegistrationDescriptionList}
                                                <p>
                                                    { resolveToComponent(
                                                        strings.userRegistrationByLink,
                                                        {
                                                            termsLink: (
                                                                <Link
                                                                    href="http://montandon.westeurope.cloudapp.azure.com:8000/__docs__/"
                                                                    withUnderline
                                                                    external
                                                                >
                                                                    http://montandon.westeurope.cloudapp.azure.com:8000/__docs__/
                                                                </Link>
                                                            ),
                                                        },
                                                    )}
                                                </p>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>{strings.userRegistrationDescriptionList3}</li>
                                    <li>{strings.userRegistrationDescriptionList4}</li>
                                </ul>
                                <div>{strings.userRegistrationDescription5}</div>
                            </>
                        )}
                    />
                    <Container
                        heading={strings.unAuthorisedUsesHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={unauthorisedUsersRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <p>{strings.unAuthorisedUsesDescription}</p>
                                <ul>
                                    <li>{strings.unAuthorisedUsesDescriptionList1}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList2}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList3}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList4}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList5}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList6}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList7}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList8}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList9}</li>
                                    <li>{strings.unAuthorisedUsesDescriptionList10}</li>
                                </ul>
                                <p>{strings.unAuthorisedUsesDescription2}</p>
                                <p>{strings.unAuthorisedUsesDescription3}</p>
                            </>
                        )}
                    />
                    <Container
                        heading={strings.complianceDateOwnerHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={complianceOfUserOwnerRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <p>{strings.complianceDateOwnerDescription1}</p>
                                <p>
                                    {resolveToComponent(
                                        strings.complianceDateOwnerDescription2,
                                        {
                                            termsLink: (
                                                <Link
                                                    to="termsAndConditions"
                                                    withUnderline
                                                    onClick={setShowHereModalTrue}
                                                >
                                                    {strings.complianceDateOwnerDescription2Link}
                                                </Link>
                                            ),
                                        },
                                    )}
                                    {showHereConditionModal && (
                                        <ConditionsModal onCancel={setShowHereModalFalse} />
                                    )}
                                </p>
                                <p>
                                    {resolveToComponent(
                                        strings.complianceDateOwnerDescription3,
                                        {
                                            termsLink: (
                                                <Link
                                                    href="mailto:IM@ifrc.org"
                                                    withUnderline
                                                    external
                                                >
                                                    IM@ifrc.org
                                                </Link>
                                            ),
                                        },
                                    )}
                                </p>
                                <p>{strings.complianceDateOwnerDescription4}</p>
                                <p>{strings.complianceDateOwnerDescription5}</p>
                            </>
                        )}
                    />
                    <Container
                        heading={strings.liabilityOfIFRCHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={liabilityOfIFRCRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <p>{strings.liabilityOfIFRCDescription}</p>
                                <ul>
                                    <li>{strings.liabilityOfIFRCDescriptionList1}</li>
                                    <li>{strings.liabilityOfIFRCDescriptionList2}</li>
                                    <li>
                                        { resolveToComponent(
                                            strings.liabilityOfIFRCDescriptionList3,
                                            {
                                                termsLink: (
                                                    <Link
                                                        external
                                                        href="https://www.go-fair.org/fair-principles/"
                                                    >
                                                        {strings.liabilityOfIFRCDescription3Link}

                                                    </Link>
                                                ),
                                            },
                                        )}
                                    </li>
                                    <li>{strings.liabilityOfIFRCDescriptionList4}</li>
                                    <li>{strings.liabilityOfIFRCDescriptionList5}</li>
                                </ul>
                                <p>{strings.liabilityOfIFRCDescription2}</p>
                                <p>{strings.liabilityOfIFRCDescription3}</p>
                                <p>{strings.liabilityOfIFRCDescription4}</p>
                                <p>{strings.liabilityOfIFRCDescription5}</p>
                            </>
                        )}
                    />
                    <Container
                        heading={strings.protectionUsersPersonalDataHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={protectionPersonalDataRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <p>{strings.protectionUsersPersonalDataDescription}</p>
                                <ul>
                                    <li>{strings.protectionUsersPersonalDataDescriptionList1}</li>
                                    <li>{strings.protectionUsersPersonalDataDescriptionList2}</li>
                                    <li>{strings.protectionUsersPersonalDataDescriptionList3}</li>
                                    <li>{strings.protectionUsersPersonalDataDescriptionList4}</li>
                                </ul>
                                <p>
                                    {resolveToComponent(
                                        strings.protectionUsersPersonalDataDescription2,
                                        {
                                            termsLink: (
                                                <Link
                                                    href="mailto:IM@ifrc.org"
                                                    external
                                                    withUnderline

                                                >
                                                    IM@ifrc.org
                                                </Link>
                                            ),
                                        },
                                    )}
                                </p>
                                <p>
                                    {resolveToComponent(
                                        strings.protectionUsersPersonalDataDescription3,
                                        {
                                            termsLink: (
                                                <Link
                                                    external
                                                    href="https://www.ifrc.org/document/IFRC-Data-Protection-Policy"
                                                >
                                                    {strings.protectionUsersPersonalDataLink3}

                                                </Link>
                                            ),
                                        },
                                    )}
                                </p>

                                <p>{strings.protectionUsersPersonalDataDescription4}</p>
                                <p>
                                    {resolveToComponent(
                                        strings.protectionUsersPersonalDataDescription5,
                                        {
                                            termsLink: (
                                                <Link
                                                    href="mailto:IM@ifrc.org"
                                                    external
                                                    withUnderline

                                                >
                                                    IM@ifrc.org
                                                </Link>
                                            ),
                                        },
                                    )}
                                </p>
                            </>
                        )}
                    />
                    <Container
                        heading={strings.privilegesAndImmunitiesHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={privilegesAndImmunitiesRef}
                        footerContent={(
                            <div>
                                {strings.privilegesAndImmunitiesDescription}
                            </div>
                        )}
                    />
                    <Container
                        heading={strings.finalProvisionsHeading}
                        withHeaderBorder
                        withInternalPadding
                        containerRef={finalProvisionsRef}
                        footerContentClassName={styles.headerDescription}
                        footerContent={(
                            <>
                                <p>{strings.finalProvisionsDescription1}</p>
                                <p>{strings.finalProvisionsDescription2}</p>
                                <p>
                                    {resolveToComponent(
                                        strings.finalProvisionsDescription3,
                                        {
                                            termsLink: (
                                                <Link
                                                    external
                                                    href="mailto:IM@ifrc.org"
                                                    withUnderline
                                                >
                                                    IM@ifrc.org
                                                </Link>
                                            ),
                                        },
                                    )}
                                </p>
                                <p>{strings.finalProvisionsDescription4}</p>
                            </>
                        )}
                    />
                </Container>
            </div>
        </Page>
    );
}
Component.displayName = 'TermsAndConditions';
