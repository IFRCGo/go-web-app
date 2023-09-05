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
        goBack('catalogueWater');
    }, [goBack]);

    return (
        <Container
            className={styles.wash}
            heading={strings.washM15}
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_01.jpg"
                    caption={strings.washImageOneCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_02.jpg"
                    caption={strings.washImageTwoCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_03.jpg"
                    caption={strings.washImageThreeCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_04.jpg"
                    caption={strings.washImageFourCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_05.jpg"
                    caption={strings.washImageFiveCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_06.jpg"
                    caption={strings.washImageSixCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m15_07.jpg"
                    caption={strings.washImageSevenCaption}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.washCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.capacityOne}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <div>{strings.emergencyServicesSectionOne}</div>
                    </li>
                    <li>
                        <div>{strings.emergencyServicesSectionTwo}</div>
                    </li>
                    <li>
                        <div>{strings.emergencyServicesSectionThree}</div>
                    </li>
                    <li>
                        <div>{strings.emergencyServicesSectionFour}</div>
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
                    value={strings.specificationWeightValue}
                    label={strings.specificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationVolumeValue}
                    label={strings.specificationVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationCostValue}
                    label={strings.specificationCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationNSValue}
                    label={strings.specificationNSLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.variation}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.variationTextOne}</div>
                <div>{strings.variationTextTwo}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'WashM15';
