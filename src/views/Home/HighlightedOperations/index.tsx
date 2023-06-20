import { useCallback, useContext } from 'react';
import { ChevronRightLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import Container from '#components/Container';
import Link from '#components/Link';
import List from '#components/List';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import RouteContext from '#contexts/route';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { Emergency } from '#types/emergency';


import OperationCard from './OperationCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface UserResponse {
    subscription: {
        stype: number | null;
        rtype: number | null;
        country: number | null;
        region: number | null;
        event: number | null;
        lookup_id: string;
    }[];
}

const keySelector = (emergency: Emergency) => emergency.id;
interface Props {
    className?: string;
}

function HighlightedOperations(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);
    const { userDetails } = useContext(UserContext);
    const { allAppeals: allAppealsRoute } = useContext(RouteContext);

    const {
        error: featuredEmergencyResponseError,
        pending: featuredEmergencyPending,
        response: featuredEmergencyResponse,
    } = useRequest<ListResponse<Emergency>>({
        url: 'api/v2/event/',
        query: {
            is_featured: 1,
        },
    });

    const {
        pending: mePending,
        response: meResponse,
        retrigger: retriggerUserDetails,
    } = useRequest<UserResponse>({
        skip: !userDetails,
        url: 'api/v2/user/me/',
    });

    const subscriptionMap = listToMap(
        meResponse?.subscription?.filter(
            (sub) => isDefined(sub.event),
        ) ?? [],
        (sub) => sub.event ?? 'unknown',
        () => true,
    );

    const rendererParams = useCallback(
        (_: Emergency['id'], emergency: Emergency) => ({
            data: emergency,
            className: styles.operation,
            subscriptionMap,
            pending: mePending,
            retriggerSubscription: retriggerUserDetails,
        }),
        [mePending, subscriptionMap, retriggerUserDetails],
    );

    const featuredEmergencies = featuredEmergencyResponse?.results;

    return (
        <Container
            className={_cs(styles.highlightedOperations, className)}
            withHeaderBorder
            heading={strings.highlightedOperationsTitle}
            actions={(
                <Link
                    to={allAppealsRoute.absolutePath}
                    actions={<ChevronRightLineIcon />}
                    withUnderline
                >
                    {strings.highlightedOperationsViewAll}
                </Link>
            )}
            childrenContainerClassName={styles.emergencyList}
        >
            <List
                data={featuredEmergencies}
                pending={featuredEmergencyPending}
                errored={!!featuredEmergencyResponseError}
                filtered={false}
                keySelector={keySelector}
                renderer={OperationCard}
                rendererParams={rendererParams}
            />
        </Container>
    );
}

export default HighlightedOperations;
