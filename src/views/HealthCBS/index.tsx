import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';

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
            heading={strings.communityBasedTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.communityBasedGoBack}
                    variant="tertiary"
                    title={strings.communityBasedGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.communityBasedCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.communityBasedDetail}</div>
            </Container>
            <Container
                heading={strings.communityBasedEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.communityBasedEmergencyDetail}</div>
            </Container>
            <Container
                heading={strings.communityBasedDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.communityBasedDesignedForDetail}</div>
            </Container>
            <Container
                heading={strings.communityBasedPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.communityBasedPersonnelValue}
                    label={strings.communityBasedPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={(
                        <ul>
                            <li>
                                {strings.communityBasedPersonnelCompositionListItemOne}
                            </li>
                            <li>
                                {strings.communityBasedPersonnelCompositionListItemTwo}
                            </li>
                        </ul>
                    )}
                    label={strings.communityBasedPersonnelCompositionLabel}
                    strongLabel
                />
                <div className={styles.communityDescription}>
                    {strings.communityBasedPersonnelCompositionDescription}
                </div>
            </Container>
            <Container
                heading={strings.communityBasedStandardComponentsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.communityBasedStandardComponentsListItemOne}
                    </li>
                    <li>
                        {strings.communityBasedStandardComponentsListItemTwo}
                    </li>
                    <li>
                        {strings.communityBasedStandardComponentsListItemThree}
                    </li>
                    <li>
                        {strings.communityBasedStandardComponentsListItemFour}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.communityBasedSpecificationsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.communityBasedSpecificationsWeightValue}
                    label={strings.communityBasedSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityBasedSpecificationsVolumeValue}
                    label={strings.communityBasedSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityBasedSpecificationsCostValue}
                    label={strings.communityBasedSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityBasedSpecificationsNationValue}
                    label={strings.communityBasedSpecificationsNationLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.communityBasedStandardComponentsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.communityBasedStandardComponentsListItemOne}
                    </li>
                    <li>
                        {strings.communityBasedStandardComponentsListItemTwo}
                    </li>
                    <li>
                        {strings.communityBasedStandardComponentsListItemThree}
                    </li>
                    <li>
                        {strings.communityBasedStandardComponentsListItemFour}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.communityBasedAdditionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <Link
                    to="https://www.cbsrc.org/"
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.communityBasedAdditionalResourcesListItemOne}
                </Link>
                <Link
                    to="https://rodekors.service-now.com/drm?id=hb_catalog&handbook=09f973a8db15f4103408d7b2f39619ee"
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.communityBasedAdditionalResourcesListItemTwo}
                </Link>
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthCBS';
