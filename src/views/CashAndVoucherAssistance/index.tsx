import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const navigate = useNavigate();

    const handleBackButtonClick = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <Container
            className={styles.cashAndVoucherAssistance}
            heading={strings.cashAndVoucherAssistanceTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel="go-back"
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
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_01.jpg"
                    caption={strings.cashAndVoucherAssistanceImageOne}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_02.jpg"
                    caption={strings.cashAndVoucherAssistanceImageTwo}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_03.jpg"
                    caption={strings.cashAndVoucherAssistanceImageThree}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_04.jpg"
                    caption={strings.cashAndVoucherAssistanceImageFour}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cash-cva_05.jpg"
                    caption={strings.cashAndVoucherAssistanceImageFour}
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
                <div>{strings.capacityDetailsSectionTwo}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.cvaEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.cvaEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.cvaEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.cvaEmergencyListItemFour}
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
                <TextOutput
                    value={strings.designedForAssessmentValue}
                    label={strings.designedForAssessmentValueLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.designedForResponseAnalysisValue}
                    label={strings.designedForResponseAnalysisValueLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.designedForSetUpValue}
                    label={strings.designedForSetUpValueLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.designedForMonitoringValue}
                    label={strings.designedForMonitoringValueLabel}
                    strongLabel
                />
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
                    value={(
                        <ul>
                            <li>{strings.personnelCompositionValueOne}</li>
                            <li>{strings.personnelCompositionValueTwo}</li>
                            <li>{strings.personnelCompositionValueThree}</li>
                        </ul>
                    )}
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
        </Container>
    );
}

Component.displayName = 'CashAndVoucherAssistance';
