import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import Link from '#components/Link';

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
            className={styles.operationSupport}
            heading={strings.iMOperationSupportTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.iMOperationSupportGoBack}
                    variant="tertiary"
                    title={strings.iMOperationSupportGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div>{strings.iMOperationSupportDetail}</div>
            <ul>
                <li>{strings.iMOperationSupportDetailItemOne}</li>
                <li>{strings.iMOperationSupportDetailItemTwo}</li>
                <li>{strings.iMOperationSupportDetailItemThree}</li>
            </ul>
            <div>
                {resolveToComponent(
                    strings.iMOperationSupportDescription,
                    {
                        link: (
                            <Link
                                to="https://ifrcgoproject.medium.com/information-saves-lives-scaling-data-analytics-in-the-ifrc-network-fd3686718f9c"
                            >
                                {strings.iMOperationSupportDescriptionLink}
                            </Link>
                        ),
                    },
                )}
            </div>
        </Container>
    );
}

Component.displayName = 'InformationManagementOperationsSupport';
