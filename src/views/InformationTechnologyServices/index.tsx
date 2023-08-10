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
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        catalogueInformationTechnology: catalogueInformationTechnologyRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueInformationTechnologyRoute.absolutePath));
    }, [goBack, catalogueInformationTechnologyRoute.absolutePath]);

    return (
        <Container
            className={styles.informationTechnologyServices}
            heading={strings.surgeITServiceTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.surgeITServiceGoBack}
                    variant="tertiary"
                    title={strings.surgeITServiceGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.surgeITCapacityTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.surgeITCapacityDetail}</div>
            </Container>
            <Container
                heading={strings.surgeITEmergencyServicesTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.surgeITEmergencyServicesDetailTextOne}</div>
                <div>
                    {resolveToComponent(
                        strings.surgeITEmergencyServicesDetailTextTwo,
                        {
                            link: (
                                <Link
                                    to="https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt%2FITT%20Service%20Catalogue%20January%202023%20Final%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt&p=true&ga=1"
                                >
                                    {strings.surgeITEmergencyServicesDetailTextTwoLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </Container>
            <Container
                heading={strings.surgeITEmergencyDesignedForTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.surgeITEmergencyDesignForDetail}</div>
            </Container>
            <Container
                heading={strings.surgeITPersonnelTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.surgeITPersonnelTotalValue}
                    label={strings.surgeITPersonnelTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.surgeITPersonnelCompositionValue}
                    label={strings.surgeITPersonnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.surgeITStandardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.surgeITStandardComponentsListOne}
                    </li>
                    <li>
                        {strings.surgeITStandardComponentsListTwo}
                    </li>
                    <li>
                        {strings.surgeITStandardComponentsListThree}
                    </li>
                    <li>
                        {strings.surgeITStandardComponentsListFour}
                    </li>
                    <li>
                        {strings.surgeITStandardComponentsListFive}
                    </li>
                    <li>
                        {strings.surgeITStandardComponentsListSix}
                    </li>
                    <li>
                        {strings.surgeITStandardComponentsListSeven}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.surgeITSpecificationsTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.surgeITSpecificationsCostValue}
                    label={strings.surgeITSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.surgeITSpecificationsNSValue}
                    label={strings.surgeITSpecificationsNSLabel}
                    strongLabel
                />
            </Container>
            {/*
            <Container
                heading={strings.healthPSSAdditionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <Link
                    to="http://pscentre.org/"
                    variant="tertiary"
                    withExternalLinkIcon
                >
                    {strings.healthPSSAdditionalResourcesLink}
                </Link>
            </Container> */}
        </Container>
    );
}

Component.displayName = 'InformationTechnologyServices';
