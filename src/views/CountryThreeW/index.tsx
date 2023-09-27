import {
    Outlet,
    useParams,
    useOutletContext,
} from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import useUserMe from '#hooks/domain/useUserMe';
import { resolveToString } from '#utils/translation';
import type { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();

    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryResponse } = outletContext;

    const strings = useTranslation(i18n);
    const userMe = useUserMe();

    return (
        <Container
            className={styles.countryThreeW}
            actions={(
                isDefined(userMe?.id) && (
                    <div className={styles.countryThreeWActions}>
                        {/* {strings.wikiJsLink?.length > 0 && (
                            <WikiLink
                                href=''
                            />
                        )} */}
                        <Link
                            variant="primary"
                            to="newThreeWProject"
                            state={{ reportingNsId: countryId }}
                        >
                            {strings.addThreeWProject}
                        </Link>
                    </div>
                )
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
