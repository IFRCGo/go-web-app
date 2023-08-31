import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import surge from '#assets/images/IFRC_Surge_01.jpg';

import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Header from '#components/Header';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueInformationManagement');
    }, [goBack]);
    return (
        <Container
            className={styles.support}
            heading={strings.iMSupportTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.iMSupportGoBack}
                    variant="tertiary"
                    title={strings.iMSupportGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div>{strings.iMSupportDetail}</div>
            <Header
                heading={strings.iMSituational}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMSituationalItemOne}</li>
                    <li>{strings.iMSituationalItemTwo}</li>
                    <li>{strings.iMSituationalItemThree}</li>
                    <li>{strings.iMSituationalItemFour}</li>
                    <li>{strings.iMSituationalItemFive}</li>
                    <li>{strings.iMSituationalItemSix}</li>
                </ul>
            </Header>
            <Header
                heading={strings.iMCoordination}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMCoordinationItemOne}</li>
                    <li>{strings.iMCoordinationItemTwo}</li>
                    <li>{strings.iMCoordinationItemThree}</li>
                    <li>{strings.iMCoordinationItemFour}</li>
                    <li>{strings.iMCoordinationItemFive}</li>
                    <li>{strings.iMCoordinationItemSix}</li>
                </ul>
            </Header>
            <Header
                heading={strings.iMResponsible}
                headingLevel={5}
            >
                <ul>
                    <li>{strings.iMResponsibleItemOne}</li>
                    <li>{strings.iMResponsibleItemTwo}</li>
                    <li>{strings.iMResponsibleItemThree}</li>
                </ul>
            </Header>
            <img
                className={styles.image}
                src={surge}
                alt={strings.iMResponsibleImageAlt}
                width="120"
            />
        </Container>
    );
}

Component.displayName = 'InformationManagementSupport';
