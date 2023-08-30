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
        goBack('catalogueCommunication');
    }, [goBack]);

    return (
        <Container
            className={styles.communicationErtOne}
            heading={strings.communicationErtOneTitle}
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_01.jpg"
                    caption={strings.communicationErtOneImageOne}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_02.jpg"
                    caption={strings.communicationErtOneImageTwo}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_03.jpg"
                    caption={strings.communicationErtOneImageThree}
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
                <ul>
                    <li>
                        {strings.certOneServiceListItemOne}
                    </li>
                    <li>
                        {strings.certOneServiceListItemTwo}
                    </li>
                    <li>
                        {strings.certOneServiceListItemThree}
                    </li>
                    <li>
                        {strings.certOneServiceListItemFour}
                    </li>
                    <li>
                        {strings.certOneServiceListItemFive}
                    </li>
                    <li>
                        {strings.certOneServiceListItemSix}
                    </li>
                    <li>
                        {strings.certOneServiceListItemSeven}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyDetailsSectionOne}</div>
                <div>{strings.emergencyDetailsSectionTwo}</div>
                <ul>
                    <li>
                        {strings.certOneEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.certOneEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.certOneEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.certOneEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.certOneEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.certOneEmergencyListItemSix}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <li>
                    {strings.certOneDesignedForListItemOne}
                </li>
                <li>
                    {strings.certOneDesignedForListItemTwo}
                </li>
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
                heading={strings.standardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                {strings.standardComponentsDetails}
            </Container>
            <Container
                heading={strings.specifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
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

Component.displayName = 'CommunicationErtOne';
