import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import surge from '#assets/images/IFRC_Surge_02.jpg';

import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import IconButton from '#components/IconButton';

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
