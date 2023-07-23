import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import RouteContext from '#contexts/route';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';

import i18n from './i18n.json';
import styles from './styles.module.css';
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        catalogueBasecamp: catalogueBasecampRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueBasecampRoute.absolutePath));
    }, [goBack, catalogueBasecampRoute.absolutePath]);

    return (
        <Container
            className={styles.basecampEruSmall}
            heading={strings.basecampEruSmallTitle}
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_01.jpg"
                    caption={strings.basecampEruSmallImageOne}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_02.jpg"
                    caption={strings.basecampEruSmallImageTwo}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_03.jpg"
                    caption={strings.basecampEruSmallImageThree}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_04.jpg"
                    caption={strings.basecampEruSmallImageFour}
                    height="16rem"
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.capacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.basecampEruEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.basecampEruEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.basecampEruEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.basecampEruEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.basecampEruEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.basecampEruEmergencyListItemSix}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>{strings.designedForDetailsSectionOne}</li>
                    <li>{strings.designedForDetailsSectionTwo}</li>
                    <li>{strings.designedForDetailsSectionThree}</li>
                    <li>{strings.designedForDetailsSectionFour}</li>
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
            </Container>
            <Container
                heading={strings.standardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.basecampEruComponentListItemOne}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemTwo}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemThree}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemFour}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemFive}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemSix}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemSeven}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemEight}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.specifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.specificationsWeightValue}
                    label={strings.specificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsVolumeValue}
                    label={strings.specificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsCostValue}
                    label={strings.specificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsNationalSocietyValue}
                    label={strings.specificationsNationalSocietyLabel}
                    strongLabel
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'BasecampEruSmall';
