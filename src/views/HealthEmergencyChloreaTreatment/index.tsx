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
            className={styles.choleraTreatmentHealth}
            heading={strings.choleraTreatmentHeading}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.choleraGoBack}
                    variant="tertiary"
                    title={strings.choleraGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.choleraCapacityTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.choleraDescription}</div>
            </Container>
            <Container
                heading={strings.choleraEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.choleraEmergencyServicesDescription}</div>
            </Container>
            <Container
                heading={strings.choleraDesignedForTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.choleraDesignedForDescription}</div>
                <ul>
                    <li>
                        {strings.choleraDesignedForListItemOne}
                    </li>
                    <li>
                        {strings.choleraDesignedForListItemTwo}
                    </li>
                    <li>
                        {strings.choleraDesignedForListItemThree}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.choleraDesignedPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.choleraTotalPersonnelValue}
                    label={strings.choleraTotalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraTotalPersonnelCompositionValue}
                    label={strings.choleraTotalPersonnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.choleraStandardComponentsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.choleraStandardComponentsDescription}</div>
                <ul>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleOneValue}
                            label={strings.choleraStandardModuleOneLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleTwoValue}
                            label={strings.choleraStandardModuleTwoLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleThreeValue}
                            label={strings.choleraStandardModuleThreeLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleFourValue}
                            label={strings.choleraStandardModuleFourLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleFiveValue}
                            label={strings.choleraStandardModuleFiveLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleSixValue}
                            label={strings.choleraStandardModuleSixLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleSevenValue}
                            label={strings.choleraStandardModuleSevenLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleEightValue}
                            label={strings.choleraStandardModuleEightLabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleNineValue}
                            label={strings.choleraStandardModuleNineLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleTenValue}
                            label={strings.choleraStandardModuleTenLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleElevenValue}
                            label={strings.choleraStandardModuleElevenLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.choleraStandardModuleTwelveValue}
                            label={strings.choleraStandardModuleTwelveLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.choleraSpecifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.choleraSpecificationsValue}
                    label={strings.choleraSpecificationsLabel}
                    strongLabel
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthEmergencyCholeraTreatment';
