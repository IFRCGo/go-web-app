import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import surge from '#assets/images/IFRC_Surge_02.jpg';

import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import RouteContext from '#contexts/route';

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
            className={styles.composition}
            heading={strings.iMCompositionTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.iMCompositionGoBack}
                    variant="tertiary"
                    title={strings.iMCompositionGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div>{strings.iMCompositionDetail}</div>
            <ul>
                <li>{strings.iMCompositionItemOne}</li>
                <li>{strings.iMCompositionItemTwo}</li>
                <li>{strings.iMCompositionItemThree}</li>
                <li>{strings.iMCompositionItemFour}</li>
                <li>{strings.iMCompositionItemFive}</li>
                <li>{strings.iMCompositionItemSix}</li>
            </ul>
            <div>{strings.iMCompositionDescription}</div>
            <img
                className={styles.image}
                src={surge}
                // FIXME: use translation
                alt="Composition of IM Resources"
                width="120"
            />
        </Container>
    );
}
Component.displayName = 'InformationManagementComposition';
