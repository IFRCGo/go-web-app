import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import { resolveToComponent } from '#utils/translation';
import Link from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueInformationManagement');
    }, [goBack]);

    return (
        <Container
            className={styles.satelliteImagery}
            heading={strings.satelliteImageryTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.satelliteImageryGoBack}
                    variant="tertiary"
                    title={strings.satelliteImageryGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div>{strings.satelliteImageryTextOne}</div>
            <div>{strings.satelliteImageryTextTwo}</div>
            <Link
                to="https://americanredcross.github.io/images-from-above/index.html"
                external
            >
                {strings.satelliteImageryTextThree}
            </Link>
            <div>
                {resolveToComponent(
                    strings.satelliteImageryTextFour,
                    {
                        link: (
                            <Link
                                to="https://surgelearning.ifrc.org/resources/minimum-training-required-surge-personnel"
                                external
                            >
                                {strings.thisSpreadsheetLink}
                            </Link>
                        ),
                    },
                )}
            </div>
            <Container
                heading={strings.satelliteImageryDefining}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>
                    {resolveToComponent(
                        strings.satelliteImageryDefiningText,
                        {
                            link: (
                                <Link
                                    to="https://americanredcross.github.io/images-from-above/index.html"
                                    external
                                >
                                    {strings.imagesFromAboveLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
                <ol>
                    <li>{strings.satelliteImageryDefiningListItemOne}</li>
                    <li>{strings.satelliteImageryDefiningListItemTwo}</li>
                    <li>{strings.satelliteImageryDefiningListItemThree}</li>
                    <li>{strings.satelliteImageryDefiningListItemFour}</li>
                </ol>
            </Container>
            <Container
                heading={strings.satelliteImageryAnalysis}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.satelliteImageryAnalysisTextOne}</div>
                <div>{strings.satelliteImageryAnalysisTextTwo}</div>
            </Container>
            <Container
                heading={strings.satelliteImageryUNOSATTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <Link
                    to="https://www.unitar.org/maps"
                    external
                >
                    {strings.satelliteImageryUnitarLink}
                </Link>
                <div>{strings.satelliteUNOSATTextOne}</div>
                <div>{strings.satelliteUNOSATTextTwo}</div>
                <div>{strings.satelliteUNOSATTextThree}</div>
                <ol>
                    <li>{strings.satelliteUNOSATTItemOne}</li>
                    <ol type="a">
                        <li>
                            {resolveToComponent(
                                strings.satelliteUNOSATTItemOneListOne,
                                {
                                    link: (
                                        <Link
                                            to="https://www.unitar.org/maps"
                                            external
                                        >
                                            {strings.satelliteTheirWebsiteLink}
                                        </Link>
                                    ),
                                },
                            )}
                        </li>
                        <li>
                            {resolveToComponent(
                                strings.satelliteUNOSATTItemOneListTwo,
                                {
                                    link: (
                                        <Link
                                            to="https://smcs.unosat.org/home"
                                            external
                                        >
                                            {strings.satelliteMappingCoordinationLink}
                                        </Link>
                                    ),
                                },
                            )}
                        </li>
                    </ol>
                    <li>
                        {resolveToComponent(

                            strings.satelliteUNOSATTItemTwo,
                            {
                                link: (
                                    <Link
                                        to="mailto:im@ifrc.org"
                                        external
                                    >
                                        {strings.imageryImEmailLink}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <ol type="a">
                        <li>{strings.satelliteUNOSATTItemTwoListOne}</li>
                        <li>{strings.satelliteUNOSATTItemTwoListTwo}</li>
                        <li>{strings.satelliteUNOSATTItemTwoListThree}</li>
                        <li>{strings.satelliteUNOSATTItemTwoListFour}</li>
                        <li>{strings.satelliteUNOSATTItemTwoListFive}</li>
                        <li>{strings.satelliteUNOSATTItemTwoListSix}</li>
                    </ol>
                    <li>{strings.satelliteUNOSATTItemThree}</li>
                    <li>{strings.satelliteUNOSATTItemFour}</li>
                </ol>
            </Container>
            <Container
                heading={strings.satelliteImageryAnalysis}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <Link
                    to="https://mapswipe.org"
                    external
                >
                    {strings.satelliteMapSwipeLink}
                </Link>
                <div>{strings.satelliteMapSwipeTextOne}</div>
                <ul>
                    <li>{strings.satelliteMapSwipeTextOneListOne}</li>
                    <li>{strings.satelliteMapSwipeTextOneListTwo}</li>
                </ul>
                <div>
                    {resolveToComponent(
                        strings.satelliteMapSwipeDescription,
                        {
                            emailLink: (
                                <Link
                                    to="mailto:info@mapswipe.org"
                                    external
                                >
                                    {strings.satelliteMapSwipeDescriptionEmailLink}
                                </Link>
                            ),
                            link: (
                                <Link
                                    to="https://mapswipe.org/en/index.html"
                                    external
                                >
                                    {strings.satelliteMapSwipeDescriptionOnTheWebsite}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </Container>
            <Container
                heading={strings.imagerySourcesTitle}
                headingLevel={2}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.imagerySourcesDescription}</div>
            </Container>
            <Container
                heading={strings.imagerySourcesSubTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div className={styles.imagerySources}>
                    <div>
                        {strings.imagerySourcesSubTitle}
                    </div>
                    <div>
                        {strings.imagerySourcesSubTitleDescription}
                    </div>
                </div>
                <ul>
                    <li>
                        <div className={styles.imagerySourcesList}>
                            {strings.imagerySourcesSubTitleItemOne}
                            <Link
                                to="https://www.maxar.com/open-data"
                                external
                            >
                                {strings.imagerySourcesSubTitleItemLink}
                            </Link>
                        </div>
                    </li>
                    <li>
                        <div className={styles.imagerySourcesList}>
                            {strings.imagerySourcesSubTitleItemTwo}
                            <Link
                                to="https://www.planet.com/disasterdata"
                                external
                            >
                                {strings.imagerySourcesSubTitleItemTwoLink}
                            </Link>
                        </div>
                    </li>
                </ul>
                <div>
                    {resolveToComponent(
                        strings.imagerySourcesSubTitleDetail,
                        {
                            link: (
                                <Link
                                    to="https://openaerialmap.org/"
                                    external
                                >
                                    {strings.imagerySourcesSubTitleDetailLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </Container>
            <Container
                heading={strings.imagerySourcesIFRCPartnerships}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.imagerySourcesIFRCPartnershipsDetail}</div>
            </Container>
            <Container
                heading={strings.imagerySourcesInternationalSpaceTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <Link
                    to="https://disasterscharter.org/web/guest/home"
                    external
                >
                    {strings.imagerySourcesDisastersCharterHomeLink}
                </Link>
                <div>{strings.imagerySourcesInternationalSpaceTextOne}</div>
                <div>{strings.imagerySourcesInternationalSpaceTextTwo}</div>
                <div>{strings.imagerySourcesInternationalSpaceTextThree}</div>
                <Link
                    to="https://disasterscharter.org/web/guest/charter-activations"
                    external
                >
                    {strings.imagerySourcesDisastersCharterLink}
                </Link>
                <div>{strings.imagerySourcesInternationalSpaceTextFour}</div>
            </Container>
            <Container
                heading={strings.imageryAirbusFoundation}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <Link
                    to="https://www.intelligence-airbusds.com/airbus-foundation/"
                    external
                >
                    {strings.imageryAirbusFoundationLink}
                </Link>
                <div>{strings.imageryAirbusFoundationTextOne}</div>
                <div>
                    {resolveToComponent(
                        strings.imageryAirbusFoundationTextTwo,
                        {
                            link: (
                                <Link
                                    to="mailto:im@ifrc.org"
                                    external
                                >
                                    {strings.imageryImEmailLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
                <div>{strings.imageryAirbusFoundationToCheck}</div>
                <ul className={styles.airbusList}>
                    <li>
                        {resolveToComponent(
                            strings.imageryAirbusFoundationListOne,
                            {
                                link: (
                                    <Link
                                        to="https://www.intelligence-airbusds.com/airbus-foundation/"
                                        external
                                    >
                                        {strings.imageryAirbusFoundationListOneLink}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {strings.imageryAirbusFoundationListTwo}
                    </li>
                    <ul className={styles.airbusList}>
                        <li>
                            {strings.imageryAirbusFoundationListTwoItemOne}
                        </li>
                    </ul>
                    <li>
                        {strings.imageryAirbusFoundationListThree}
                    </li>
                    <ul className={styles.airbusList}>
                        <li>
                            {strings.imageryAirbusFoundationListThreeItemOne}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListThreeItemTwo}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListThreeItemThree}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListThreeItemFour}
                        </li>
                    </ul>
                    <li>
                        {strings.imageryAirbusFoundationListFour}
                    </li>
                    <li>
                        {strings.imageryAirbusFoundationListFive}
                    </li>
                    <ul className={styles.airbusList}>
                        <li>
                            {strings.imageryAirbusFoundationListFiveItemOne}
                        </li>
                    </ul>
                    <li>
                        <div>
                            {resolveToComponent(
                                strings.imageryAirbusFoundationListSix,
                                {
                                    link: (
                                        <Link
                                            to="mailto:im@ifrc.org"
                                            external
                                        >
                                            {strings.imageryImEmailLink}
                                        </Link>
                                    ),
                                },
                            )}
                        </div>
                    </li>
                    <ul className={styles.airbusList}>
                        <li>
                            {strings.imageryAirbusFoundationListSixItemOne}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListSixItemTwo}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListSixItemThree}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListSixItemFour}
                        </li>
                        <li>
                            {strings.imageryAirbusFoundationListSixItemFive}
                        </li>
                    </ul>
                </ul>
                <div>{strings.imageryAirbusFoundationTextThree}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'InformationManagementSatelliteImagery';
