import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueInformationTechnology');
    }, [goBack]);

    return (
        <Container
            className={styles.informationTechnologyServices}
            heading={strings.surgeOperationsServiceTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.surgeOperationsServiceGoBack}
                    variant="tertiary"
                    title={strings.surgeOperationsServiceGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.surgeOperationsCapacityTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.surgeOperationsCapacityTextOne}</div>
                <div>{strings.surgeOperationsCapacityTextTwo}</div>
            </Container>
            <Container
                heading={strings.surgeOperationsEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.surgeOperationsEmergencyServicesText}</div>
            </Container>
            <Container
                heading={strings.surgeOperationsDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <div>{strings.surgeOperationsDesignedForItemOne}</div>
                    </li>
                    <li>
                        <div>{strings.surgeOperationsDesignedForItemTwo}</div>
                    </li>
                    <li>
                        <div>{strings.surgeOperationsDesignedForItemThree}</div>
                    </li>
                    <li>
                        <div>{strings.surgeOperationsDesignedForItemFour}</div>
                    </li>
                    <li>
                        <div>{strings.surgeOperationsDesignedForItemFive}</div>
                    </li>
                    <li>
                        <div>{strings.surgeOperationsDesignedForItemSix}</div>
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.surgeOperationsPersonnelTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.surgeOperationsPersonnelText}</div>
            </Container>
            <Container
                heading={strings.surgeOperationsStandardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.surgeOperationsStandardComponentsText}</div>
            </Container>
            <Container
                heading={strings.surgeOperationsSpecifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.surgeOperationsCostValue}
                    label={strings.surgeOperationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.surgeOperationsNSValue}
                    label={strings.surgeOperationsNSLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.surgeOperationsVariations}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.surgeOperationsVariationsText}</div>
            </Container>
            <Container
                heading={strings.surgeOperationsAdditionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {resolveToComponent(
                            strings.surgeOperationsHeOpsOne,
                            {
                                link: (
                                    <Link
                                        to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/disasters/disaster-and-crisis-mangement/disaster-response/surge-capacity/heops/"
                                        external
                                    >
                                        {strings.surgeOperationsFedNet}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.surgeOperationsHeOpsTwo,
                            {
                                link: (
                                    <Link
                                        to="https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FHeOps%20bios%20%2D%202020%2002%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1"
                                        external
                                    >
                                        {strings.surgeOperationsShort}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                </ul>
            </Container>
        </Container>
    );
}

Component.displayName = 'EmergencyOperations';
