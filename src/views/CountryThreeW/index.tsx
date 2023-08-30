import {
    Outlet,
    useParams,
    useOutletContext,
} from 'react-router-dom';

import type { CountryOutletContext } from '#utils/outletContext';
import { resolveToString } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import Container from '#components/Container';
import Button from '#components/Button';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();

    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryResponse } = outletContext;

    const strings = useTranslation(i18n);

    return (
        <Container
            className={styles.countryThreeW}
            actions={(
                <Button
                    name={undefined}
                    variant="primary"
                    disabled
                >
                    {strings.addThreeWProject}
                </Button>
            )}
        >
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="countryThreeWProjects"
                    urlParams={{ countryId }}
                >
                    {resolveToString(
                        strings.countryThreeWProjectsTab,
                        { countryName: countryResponse?.name ?? '-' },
                    )}
                </NavigationTab>
                <NavigationTab
                    to="countryThreeWNationalSocietyProjects"
                    urlParams={{ countryId }}
                >
                    {resolveToString(
                        strings.countryThreeWNationalSocietyProjectsTab,
                        { countryName: countryResponse?.name ?? '-' },
                    )}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={outletContext} />
        </Container>
    );
}

Component.displayName = 'CountryThreeW';
