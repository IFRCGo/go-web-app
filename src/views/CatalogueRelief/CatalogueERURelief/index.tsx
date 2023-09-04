import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import useRouting from '#hooks/useRouting';
import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';
import Image from '#components/Image';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueRelief');
    }, [goBack]);

    return (
        <Container
            heading={strings.eruReliefTitle}
            headingLevel={2}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    variant="tertiary"
                    ariaLabel={strings.goBack}
                    title={strings.goBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>
            )}
            className={styles.catalogueEru}
            childrenContainerClassName={styles.content}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_01.jpg"
                    caption={strings.eruReliefImageCaptionOne}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_02.jpg"
                    caption={strings.eruReliefImageCaptionTwo}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_03.jpg"
                    caption={strings.eruReliefImageCaptionThree}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_04.jpg"
                    caption={strings.eruReliefImageCaptionFour}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_05.jpg"
                    caption={strings.eruReliefImageCaptionFive}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_06.jpg"
                    caption={strings.eruReliefImageCaptionSix}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_07.jpg"
                    caption={strings.eruReliefImageCaptionSeven}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_08.jpg"
                    caption={strings.eruReliefImageCaptionEight}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_09.jpg"
                    caption={strings.eruReliefImageCaptionNine}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_10.jpg"
                    caption={strings.eruReliefImageCaptionTen}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.capacityTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.capacityDetails}</div>
            </Container>
            <Container
                heading={strings.emergencyTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.emergencyContentOne}</div>
                <ul>
                    <li>{strings.emergencyDetailsOne}</li>
                    <li>{strings.emergencyDetailsTwo}</li>
                    <li>{strings.emergencyDetailsThree}</li>
                    <li>{strings.emergencyDetailsFour}</li>
                </ul>
                <div>{strings.emergencyContentTwo}</div>
            </Container>
            <Container
                heading={strings.designedForTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.designedForDetails}</div>
                <ul>
                    <li>{strings.designedForOne}</li>
                    <li>{strings.designedForTwo}</li>
                </ul>
            </Container>
            <Container
                heading={strings.personnelTitle}
                headingLevel={3}
                withHeaderBorder
                className={styles.specification}
                childrenContainerClassName={styles.specificationContent}
            >
                <TextOutput
                    label={strings.personnelTotal}
                    strongLabel
                    value={strings.personnelTotalDetail}
                />
                <TextOutput
                    label={strings.personnelComposition}
                    strongLabel
                    value={strings.personnelCompositionDetail}
                />
                <div>{strings.personnelContent}</div>
            </Container>
            <Container
                heading={strings.standardComponents}
                headingLevel={3}
                withHeaderBorder
            >
                <ul>
                    <li>{strings.standardComponentsDetailsOne}</li>
                    <li>{strings.standardComponentsDetailsTwo}</li>
                </ul>
            </Container>
            <Container
                heading={strings.specificationsTitle}
                headingLevel={3}
                withHeaderBorder
                className={styles.specification}
                childrenContainerClassName={styles.specificationContent}
            >
                <TextOutput
                    label={strings.specificationsWeightTitle}
                    strongLabel
                    value={strings.specificationsWeightDetails}
                />
                <TextOutput
                    label={strings.specificationsVolumeTitle}
                    strongLabel
                    value={strings.specificationsVolumeDetails}
                />
                <TextOutput
                    label={strings.specificationsNSTitle}
                    strongLabel
                    value={strings.specificationsNSDetails}
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'catalogueERURelief';
