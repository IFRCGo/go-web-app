import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
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
            className={styles.shelterTechnical}
            heading={strings.shelterTechnical}
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_01.jpg"
                    caption={strings.shelterImageOneCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_06.jpg"
                    caption={strings.shelterImageOneCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_07.jpg"
                    caption={strings.shelterImageThreeCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_08.jpg"
                    caption={strings.shelterImageFourCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_12.jpg"
                    caption={strings.shelterImageFiveCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_14.jpg"
                    caption={strings.shelterImageSixCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_16.jpg"
                    caption={strings.shelterImageSevenCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_17.jpg"
                    caption={strings.shelterImageEightCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_23.jpg"
                    caption={strings.shelterImageNineCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_24.jpg"
                    caption={strings.shelterImageTenCaption}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.shelterTechnicalCapacity}
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
                        <div>{strings.designedForItemOneLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemTwoLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemThreeLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemFourLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemFiveLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemSixLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemSevenLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemEightLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemNineLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemTenLabel}</div>
                    </li>
                    <li>
                        <div>{strings.designedForItemElevenLabel}</div>
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
                                strings.additionalResourcesIFRC,
                                {
                                    link: (
                                        <Link
                                            to="https://www.ifrc.org/our-work/disasters-climate-and-crises/shelter-and-settlements"
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
                                strings.additionalResourcesUndefined,
                                {
                                    link: (
                                        <Link
                                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/disasters/shelter/"
                                            external
                                        >
                                            {strings.additionalResourcesFednet}
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
                                            to="https://itemscatalogue.redcross.int/relief--4/shelter-and-construction-materials--23.aspx"
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
                                            to="https://www.ifrc.org/media/48901"
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
                                            to="https://ifrc.csod.com/client/ifrc/default.aspx?ReturnUrl=https%3a%2f%2fifrc.csod.com%2fui%2flms-learning-details%2fapp%2fcourse%2f6bcddb4f-0e33-471c-93fb-281764be8092"
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

Component.displayName = 'ShelterTechnical';
