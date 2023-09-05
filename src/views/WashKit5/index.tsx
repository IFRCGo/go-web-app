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
            className={styles.washKit}
            heading={strings.washKit5Title}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.washKit5GoBack}
                    variant="tertiary"
                    title={strings.washKit5GoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Image
                src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-kit5_01.jpg"
                caption={strings.washKit5}
                imageClassName={styles.imageList}
            />
            <Container
                heading={strings.washKit5Capacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.washKit5CapacityText}</div>
            </Container>
            <Container
                heading={strings.washKit5EmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.washKit5EmergencyServicesSectionOne}</div>
                <div>{strings.washKit5EmergencyServicesSectionTwo}</div>
            </Container>
            <Container
                heading={strings.washKit5Specification}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.washKit5SpecificationWeightValue}
                    label={strings.washKit5SpecificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.washKit5SpecificationVolumeValue}
                    label={strings.washKit5SpecificationVolumeLabel}
                    strongLabel
                />
                <div className={styles.specification}>
                    {strings.washKit5SpecificationDetail}
                </div>
            </Container>
        </Container>
    );
}

Component.displayName = 'WashKit5';
