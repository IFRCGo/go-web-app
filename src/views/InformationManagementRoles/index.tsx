import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import RouteContext from '#contexts/route';
import Header from '#components/Header';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        catalogueInformationManagement: catalogueInformationManagementRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueInformationManagementRoute.absolutePath));
    }, [goBack, catalogueInformationManagementRoute.absolutePath]);
    return (
        <Container
            className={styles.rolesResponsibility}
            heading={strings.iMRolesTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.iMRolesGoBack}
                    variant="tertiary"
                    title={strings.iMRolesGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div>{strings.iMRolesDetail}</div>
            <Header
                heading={strings.iMRolesSituationalTitle}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMRolesSituationalItemOne}</li>
                    <li>{strings.iMRolesSituationalItemTwo}</li>
                    <li>{strings.iMRolesSituationalItemThree}</li>
                    <li>{strings.iMRolesSituationalItemFour}</li>
                </ul>
            </Header>
            <Header
                heading={strings.iMRolesDataCollectionTitle}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMRolesDataCollectionItemOne}</li>
                    <li>{strings.iMRolesDataCollectionItemTwo}</li>
                    <li>{strings.iMRolesDataCollectionItemThree}</li>
                    <li>{strings.iMRolesDataCollectionItemFour}</li>
                </ul>
            </Header>
            <Header
                heading={strings.iMResponsibleDataTitle}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMResponsibleDataItemOne}</li>
                    <li>{strings.iMResponsibleDataItemTwo}</li>
                    <li>{strings.iMResponsibleDataItemThree}</li>
                    <li>{strings.iMResponsibleDataItemFour}</li>
                </ul>
            </Header>
            <Header
                heading={strings.iMCoordinationTitle}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMCoordinationItemOne}</li>
                    <li>{strings.iMCoordinationItemTwo}</li>
                    <li>{strings.iMCoordinationItemThree}</li>
                    <li>{strings.iMCoordinationItemFour}</li>
                </ul>
            </Header>
        </Container>
    );
}

Component.displayName = 'InformationManagementRoles';
