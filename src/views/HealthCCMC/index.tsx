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
        goBack('catalogueHealth');
    }, [goBack]);

    return (
        <Container
            className={styles.healthEmergencyClinic}
            heading={strings.communityCaseTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.communityCaseGoBack}
                    variant="tertiary"
                    title={strings.communityCaseGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-ccmc_01.jpg"
                    caption={strings.communityCaseImageCaption}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.communityCaseCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.communityCaseCapacityDetail}</div>
            </Container>
            <Container
                heading={strings.communityCaseEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.communityCaseEmergencyServicesDetail}</div>
            </Container>
            <Container
                heading={strings.communityCaseDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.communityCaseDesignedForDetail}</div>
            </Container>
            <Container
                heading={strings.communityCasePersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    label={strings.communityCasePersonnelLabel}
                    value={strings.communityCasePersonnelValue}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityCasePersonnelCompositionValue}
                    label={strings.communityCasePersonnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.communityCaseStandardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.communityCaseStandardListItemOne}
                    </li>
                    <li>
                        {strings.communityCaseStandardListItemTwo}
                    </li>
                    <li>
                        {strings.communityCaseStandardListItemThree}
                    </li>
                    <li>
                        {strings.communityCaseStandardListItemFour}
                    </li>
                    <li>
                        {strings.communityCaseStandardListItemFive}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.communityCaseSpecifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.communityCaseSpecificationsWeightValue}
                    label={strings.communityCaseSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityCaseSpecificationsVolumeValue}
                    label={strings.communityCaseSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityCaseSpecificationNationalSocietiesValue}
                    label={strings.communityCaseSpecificationNationalSocietiesLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.communityCaseVariationOnConfiguration}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.communityCaseVariationOnConfigurationDetail}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthCCMC';
