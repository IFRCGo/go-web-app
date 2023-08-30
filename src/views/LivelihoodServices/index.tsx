import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import RouteContext from '#contexts/route';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        livelihoodServices: livelihoodServicesRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(livelihoodServicesRoute.absolutePath));
    }, [goBack, livelihoodServicesRoute.absolutePath]);

    return (
        <Container
            className={styles.livelihoodServices}
            heading={strings.livelihoodServicesTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.livelihoodGoBack}
                    variant="tertiary"
                    title={strings.livelihoodGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_01.jpg"
                    caption={strings.livelihoodImageOneCaption}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_02.jpg"
                    caption={strings.livelihoodImageTwoCaption}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_03.jpg"
                    caption={strings.livelihoodImageThreeCaption}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_04.jpg"
                    caption={strings.livelihoodImageFourCaption}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_05.jpg"
                    caption={strings.livelihoodImageFiveCaption}
                    height="16rem"
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.livelihoodCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.livelihoodCapacityTextOne}</div>
                <div>
                    {resolveToComponent(
                        strings.livelihoodCapacityTextTwo,
                        {
                            link: (
                                <Link
                                    to="https://www.livelihoodscentre.org/"
                                >
                                    {strings.livelihoodLink}
                                </Link>
                            ),
                            livelihoodLink: (
                                <Link
                                    to="https://www.livelihoodscentre.org/-/inundaciones-en-la-region-sur-de-paragu-1"
                                >
                                    {strings.livelihoodWhatLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
                <div>{strings.livelihoodCapacityTextThree}</div>
                <div>
                    {resolveToComponent(
                        strings.livelihoodCapacityTextFour,
                        {
                            link: (
                                <Link
                                    to="mailto: livelihoods@cruzroja.es"
                                >
                                    {strings.livelihoodEmailLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </Container>
            <Container
                heading={strings.livelihoodEmergencyServicesTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.livelihoodEmergencyServicesTextOne}</div>
                <div>{strings.livelihoodEmergencyServicesTextTwo}</div>
                <div>{strings.livelihoodEmergencyServicesTextThree}</div>
                <div>{strings.livelihoodEmergencyServicesTextFour}</div>
                <div>{strings.livelihoodEmergencyServicesTextFive}</div>
            </Container>
            <Container
                heading={strings.livelihoodDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.livelihoodDesignedForTextOne}</div>
                <ul>
                    <li>
                        {strings.livelihoodDesignedForTextOneItemOne}
                    </li>
                    <li>
                        {strings.livelihoodDesignedForTextOneItemTwo}
                    </li>
                    <li>
                        {strings.livelihoodDesignedForTextOneItemThree}
                    </li>
                    <li>
                        {strings.livelihoodDesignedForTextOneItemFour}
                    </li>
                </ul>
                <div>{strings.livelihoodDesignedForTextTwo}</div>
                <div>{strings.livelihoodDesignedForTextThree}</div>
                <div>{strings.livelihoodDesignedForTextFour}</div>
            </Container>
            <Container
                heading={strings.livelihoodPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.livelihoodPersonnelTextOne}</div>
                <ul>
                    <li>
                        {strings.livelihoodPersonnelTextOneListOne}
                    </li>
                    <li>
                        {strings.livelihoodPersonnelTextOneListTwo}
                    </li>
                </ul>
                <div>{strings.livelihoodPersonnelTextTwo}</div>
                <div>{strings.livelihoodPersonnelTextThree}</div>
                <div>{strings.livelihoodPersonnelTextFour}</div>
                <ul>
                    <li>
                        {strings.livelihoodPersonnelTextFourItemOne}
                    </li>
                    <li>
                        {strings.livelihoodPersonnelTextFourItemTwo}
                    </li>
                    <li>
                        {strings.livelihoodPersonnelTextFourItemThree}
                    </li>
                    <li>
                        {strings.livelihoodPersonnelTextFourItemFour}
                    </li>
                    <li>
                        {strings.livelihoodPersonnelTextFourItemFive}
                    </li>
                    <li>
                        {strings.livelihoodPersonnelTextFourItemSix}
                    </li>
                </ul>
                <div>{strings.livelihoodPersonnelTextFive}</div>
            </Container>
            <Container
                heading={strings.livelihoodSpecificationTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.livelihoodSpecificationValue}
                    label={strings.livelihoodSpecificationLabel}
                    strongLabel
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'LivelihoodServices';
