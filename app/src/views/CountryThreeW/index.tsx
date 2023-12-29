import {
    Outlet,
    useOutletContext,
    useParams,
} from 'react-router-dom';
import {
    Container,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import useUserMe from '#hooks/domain/useUserMe';
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
                    to="countryNsOverviewActivities"
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
