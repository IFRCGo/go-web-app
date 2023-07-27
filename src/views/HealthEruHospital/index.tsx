import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import Container from '#components/Container';
import Link from '#components/Link';
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
        catalogueHealth: catalogueHealthRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueHealthRoute.absolutePath));
    }, [goBack, catalogueHealthRoute.absolutePath]);

    return (
        <Container
            className={styles.healthEruHospital}
            heading={strings.healthEruHospitalTitle}
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_01.jpg"
                    caption={strings.healthEruHospitalImageOne}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_02.jpg"
                    caption={strings.healthEruHospitalImageTwo}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_03.jpg"
                    caption={strings.healthEruHospitalImageThree}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_04.jpg"
                    caption={strings.healthEruHospitalImageFour}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_05.jpg"
                    caption={strings.healthEruHospitalImageFive}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_06.jpg"
                    caption={strings.healthEruHospitalImageSix}
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
                <div>{strings.emergencyServicesDetails}</div>
                <ul>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemSix}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemSeven}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemEight}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemNine}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.designedForDetailsSectionOne}</div>
                <ul>
                    <li>
                        {strings.designedForListItemOne}
                    </li>
                    <li>
                        {strings.designedForListItemTwo}
                    </li>
                    <li>
                        {strings.designedForListItemThree}
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
                heading={strings.standardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.standardComponentsDetails}</div>
                <TextOutput
                    value={strings.moduleOneValue}
                    label={strings.moduleOneLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleTwoValue}
                    label={strings.moduleTwoLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleThreeValue}
                    label={strings.moduleThreeLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleFourValue}
                    label={strings.moduleFourLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleFiveValue}
                    label={strings.moduleFiveLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleSixValue}
                    label={strings.moduleSixLabel}
                    withoutLabelColon
                    strongLabel
                />
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
            <Container
                heading={strings.variation}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.healthEruHospitalVariationListItemOne}
                    </li>
                    <li>
                        {strings.healthEruHospitalVariationListItemTwo}
                    </li>
                    <li>
                        {strings.healthEruHospitalVariationListItemThree}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.additionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <Link
                    to="https://rodekors.service-now.com/drm?id=hb_catalog&handbook=e3cabf24db361810d40e16f35b9619c7"
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.additionalResourcesListItemOne}
                </Link>
                <Link
                    to="https://www.youtube.com/watch?v=TIW6nf-MPb0"
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.additionalResourcesListItemTwo}
                </Link>
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthEruHospital';
