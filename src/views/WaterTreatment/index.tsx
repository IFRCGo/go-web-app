import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import IconButton from '#components/IconButton';
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
            className={styles.waterTreatment}
            heading={strings.waterTreatment}
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
            <Container
                heading={strings.washCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.washCapacityTextOne}</div>
                <div>{strings.washCapacityTextTwo}</div>
                <div>{strings.washCapacityTextThree}</div>
                <div>{strings.washCapacityTextFour}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyServicesDetail}</div>
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
                    <li>
                        <div>{strings.emergencyServicesSectionFive}</div>
                    </li>
                    <li>
                        <div>{strings.emergencyServicesSectionSix}</div>
                    </li>
                </ul>
                <div>{strings.emergencyServicesDescription}</div>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.designedForItemOne}</div>
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
                    label={strings.personnelCompositionLabel}
                    value={(
                        <ul>
                            <li>
                                <div>{strings.personnelCompositionValueOneItem}</div>
                            </li>
                            <li>
                                <div>{strings.personnelCompositionValueTwoItem}</div>
                            </li>
                            <li>
                                <div>{strings.personnelCompositionValueThreeItem}</div>
                            </li>
                            <li>
                                <div>{strings.personnelCompositionValueFourItem}</div>
                            </li>
                            <li>
                                <div>{strings.personnelCompositionValueFiveItem}</div>
                            </li>
                            <li>
                                <div>{strings.personnelCompositionValueSixItem}</div>
                            </li>
                        </ul>
                    )}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.standardComponent}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <div>{strings.standardComponentItemOne}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemTwo}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemThree}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemFour}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemFive}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemSix}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemSeven}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemEight}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemNine}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemTen}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemEleven}</div>
                    </li>
                    <li>
                        <div>{strings.standardComponentItemTwelve}</div>
                    </li>
                </ul>
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
                heading={strings.additionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.additionalResourcesNorCross}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'WaterTreatment';
