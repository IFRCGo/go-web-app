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
            heading={strings.washKitTitle}
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
            <Image
                src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-kit2_01.jpg"
                caption={strings.washKitWashKit2}
                imageClassName={styles.imageList}
            />
            <Container
                heading={strings.washKitCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.washKitCapacityText}</div>
            </Container>
            <Container
                heading={strings.washKitEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.washKitEmergencyServicesSectionOne}</div>
                <div>{strings.washKitEmergencyServicesSectionTwo}</div>
            </Container>
            <Container
                heading={strings.washKit2Specification}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.washKit2SpecificationWeightValue}
                    label={strings.washKit2SpecificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.washKit2SpecificationVolumeValue}
                    label={strings.washKit2SpecificationVolumeLabel}
                    strongLabel
                />
                <div className={styles.specification}>
                    {strings.washKit2SpecificationDetail}
                </div>
            </Container>
        </Container>
    );
}

Component.displayName = 'WashKit2';
