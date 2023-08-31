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
        goBack('catalogueProtection');
    }, [goBack]);

    return (
        <Container
            className={styles.protectionGender}
            heading={strings.protectionGenderTitle}
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_01.jpg"
                    caption={strings.protectionImageOneCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_02.jpg"
                    caption={strings.protectionImageTwoCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_05.jpg"
                    caption={strings.protectionImageThreeCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_04.jpg"
                    caption={strings.protectionImageFourCaption}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.protectionCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.protectionCapacityText}</div>
            </Container>
            <Container
                heading={strings.protectionEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.protectionEmergencyServicesTextOne}</div>
                <div>{strings.protectionEmergencyServicesTextTwo}</div>
                <ul>
                    <li>
                        {strings.protectionEmergencyServicesItemOne}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemTwo}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemThree}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemFour}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemFive}
                    </li>
                </ul>
                <div>{strings.protectionStandalone}</div>
                <ul>
                    <li>
                        {strings.protectionStandaloneTextOne}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextTwo}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextThree}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextFour}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextFive}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextSix}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.protectionDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.protectionDesignedForText}</div>
                <ul>
                    <li>
                        {strings.protectionDesignedForTextItemOne}
                    </li>
                    <li>
                        {strings.protectionDesignedForTextItemTwo}
                    </li>
                    <li>
                        {strings.protectionDesignedForTextItemThree}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.protectionPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.protectionTotalValue}
                    label={strings.protectionTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.protectionCompositionValue}
                    label={strings.protectionCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.protectionStandardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.protectionStandardComponentsText}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'ProtectionGender';
