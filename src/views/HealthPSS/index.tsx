import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';

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
            className={styles.healthPss}
            heading={strings.healthPSSTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.healthPSSGoBack}
                    variant="tertiary"
                    title={strings.healthPSSGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.healthPSSCapacityTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.healthPSSCapacityDetail}</div>
                <ul>
                    <li>
                        {strings.healthPSSCapacityListOne}
                    </li>
                    <li>
                        {strings.healthPSSCapacityListTwo}
                    </li>
                    <li>
                        {strings.healthPSSCapacityListThree}
                    </li>
                    <li>
                        {strings.healthPSSCapacityListFour}
                    </li>
                    <li>
                        {strings.healthPSSCapacityListFive}
                    </li>
                    <li>
                        {strings.healthPSSCapacityListSix}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.healthPSSDesignedForTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.healthPSSDesignedForDetail}</div>
                <div>{strings.healthPSSDesignedForDescription}</div>
                <ul>
                    <li>
                        {strings.healthPSSDesignedForListItemOne}
                    </li>
                    <li>
                        {strings.healthPSSDesignedForListItemTwo}
                    </li>
                    <li>
                        {strings.healthPSSDesignedForListItemThree}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.healthPSSPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.healthPSSPersonnelTotalValue}
                    label={strings.healthPSSPersonnelTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthPSSPersonnelCompositionValue}
                    label={strings.healthPSSPersonnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.healthPSSStandardComponentsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.healthPSSStandardComponentsDetail}</div>
                <ul>
                    <li>
                        <TextOutput
                            value={strings.healthPSSStandardComponentsItemOneValue}
                            label={strings.healthPSSStandardComponentsItemOneLabel}
                            strongLabel
                        />
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.healthPSSSpecificationsTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.healthPSSSpecificationsNsValue}
                    label={strings.healthPSSSpecificationsNsLabel}
                    strongLabel
                />
            </Container>

            <Container
                heading={strings.healthPSSAdditionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <Link
                    to="http://pscentre.org/"
                    external
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.healthPSSAdditionalResourcesLink}
                </Link>
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthPSS';
