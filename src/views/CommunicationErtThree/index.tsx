import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
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
        catalogueCommunication: catalogueCommunicationRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueCommunicationRoute.absolutePath));
    }, [goBack, catalogueCommunicationRoute.absolutePath]);

    return (
        <Container
            className={styles.communicationErtThree}
            heading={strings.communicationErtThreeTitle}
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
                    caption={strings.communicationErtThreeImageOne}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_02.jpg"
                    caption={strings.communicationErtThreeImageThree}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_03.jpg"
                    caption={strings.communicationErtThreeImageThree}
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
                <ul>
                    <li>
                        {strings.certThreeServiceListItemOne}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemTwo}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemThree}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemFour}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemFive}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemSix}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemSeven}
                    </li>
                    <li>
                        {strings.certThreeServiceListItemEight}
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
                        {strings.certThreeEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemSix}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemSeven}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemEight}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemNine}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemTen}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemEleven}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemTwelve}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemThirteen}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemFourteen}
                    </li>
                    <li>
                        {strings.certThreeEmergencyListItemFifteen}
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
                    {strings.certThreeDesignedForListItemOne}
                </li>
                <li>
                    {strings.certThreeDesignedForListItemTwo}
                </li>
                <li>
                    {strings.certThreeDesignedForListItemThree}
                </li>
                <li>
                    {strings.certThreeDesignedForListItemFour}
                </li>
                <li>
                    {strings.certThreeDesignedForListItemFive}
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

Component.displayName = 'CommunicationErtThree';
