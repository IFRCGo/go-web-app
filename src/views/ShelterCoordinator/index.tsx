import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueShelter');
    }, [goBack]);

    return (
        <Container
            className={styles.shelterCoordinator}
            heading={strings.shelterCoordinator}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.goBack}
                    variant="tertiary"
                    title={strings.goBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_01.jpg"
                    caption={strings.shelterImageOneCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_02.jpg"
                    caption={strings.shelterImageTwoCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_03.jpg"
                    caption={strings.shelterImageThreeCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_04.jpg"
                    caption={strings.shelterImageFourCaption}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.shelterCoordinatorCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.shelterCapacityTextOne}</div>
                <div>{strings.shelterCapacityTextTwo}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyServicesSectionOne}</div>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <TextOutput
                            label={strings.designedForItemOneLabel}
                            value={strings.designedForItemOneValue}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.designedForItemTwoLabel}
                            value={strings.designedForItemTwoValue}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.designedForItemThreeLabel}
                            value={strings.designedForItemThreeValue}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.designedForItemFourLabel}
                            value={strings.designedForItemFourValue}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.designedForItemFiveLabel}
                            value={strings.designedForItemFiveValue}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.designedForItemSixLabel}
                            value={strings.designedForItemSixValue}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.designedForItemSevenLabel}
                            value={strings.designedForItemSevenValue}
                            strongLabel
                        />
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.personnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.totalPersonnelValue}
                    label={strings.totalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.personnelCompositionValue}
                    label={strings.personnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.specification}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.specificationValue}
                    label={strings.specificationLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.additionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <div>
                            {resolveToComponent(
                                strings.additionalResourcesUndefined,
                                {
                                    link: (
                                        <Link
                                            to="https://sheltercluster.org/"
                                            external
                                        >
                                            {strings.additionalResourcesGlobal}
                                        </Link>
                                    ),
                                },
                            )}
                        </div>
                    </li>
                    <li>
                        <div>
                            {resolveToComponent(
                                strings.additionalResourcesShelter,
                                {
                                    link: (
                                        <Link
                                            to="https://sheltercluster.org/about-us/pages/shelter-coordination-team"
                                            external
                                        >
                                            {strings.additionalResourcesTeam}
                                        </Link>
                                    ),
                                },
                            )}
                        </div>
                    </li>
                    <li>
                        <div>
                            {resolveToComponent(
                                strings.additionalResourcesMaster,
                                {
                                    link: (
                                        <Link
                                            to="https://sheltercluster.org/global-shelter-cluster/pages/humanitarian-shelter-coordination-master-level-short-course"
                                            external
                                        >
                                            {strings.additionalResourcesHumanitarian}
                                        </Link>
                                    ),
                                },
                            )}
                        </div>
                    </li>
                    <li>
                        <div>
                            {resolveToComponent(
                                strings.additionalResourcesSelf,
                                {
                                    link: (
                                        <Link
                                            to="https://sheltercluster.org/resources/pages/more-just-roof"
                                            external
                                        >
                                            {strings.additionalResourcesProgramming}
                                        </Link>
                                    ),
                                },
                            )}
                        </div>
                    </li>
                    <li>
                        <div>
                            {resolveToComponent(
                                strings.additionalResourcesCoordination,
                                {
                                    link: (
                                        <Link
                                            to="https://buildingabetterresponse.org/"
                                            external
                                        >
                                            {strings.additionalResourcesCoordinationLink}
                                        </Link>
                                    ),
                                },
                            )}
                        </div>
                    </li>
                </ul>
            </Container>
        </Container>
    );
}

Component.displayName = 'ShelterCoordinator';
