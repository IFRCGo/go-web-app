import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueBasecamp');
    }, [goBack]);

    return (
        <Container
            className={styles.basecampEruMedium}
            heading={strings.basecampEruMediumTitle}
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
                    caption={strings.basecampEruMediumImageOne}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_02.jpg"
                    caption={strings.basecampEruMediumImageTwo}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_03.jpg"
                    caption={strings.basecampEruMediumImageThree}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_04.jpg"
                    caption={strings.basecampEruMediumImageFour}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_05.jpg"
                    caption={strings.basecampEruMediumImageFive}
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
                    <li>
                        {strings.basecampEruEmergencyListItemSeven}
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
                    <li>{strings.designedForDetailsSectionFive}</li>
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
                    descriptionClassName={styles.description}
                    value={strings.compositionValue}
                    label={strings.compositionLabel}
                    strongLabel
                />
                <div>{strings.compositionDescription}</div>
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
                    <li>
                        {strings.basecampEruComponentListItemNine}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemTen}
                    </li>
                    <li>
                        {strings.basecampEruComponentListItemEleven}
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

Component.displayName = 'BasecampEruMedium';
