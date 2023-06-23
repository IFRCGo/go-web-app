import { useCallback, useContext } from 'react';
import Container from '#components/Container';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';

import List from '#components/List';
import Button from '#components/Button';
import useTranslation from '#hooks/useTranslation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import UserContext from '#contexts/user';
import { Emergency } from '#types/emergency';
import { User } from '#types/user';

import OperationInfoCard from './OperationInfoCard';
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

interface Props {
    className?: string;
}

const keySelector = (emergency: Emergency) => emergency.id;

// eslint-disable-next-line import/prefer-default-export
function AccountInfo(props: Props) {
    const { className } = props;

    const strings = useTranslation(i18n);
    const { userDetails } = useContext(UserContext);

    const userNameForDetail = userDetails?.username;

    const {
        error: operationResponseError,
        response: operationsRes,
        pending: operationsPending,
    } = useRequest<ListResponse<Emergency>>({
        url: 'api/v2/event/',
        query: {
            is_featured: 1,
        },
    });

    const {
        error: userDetailsError,
        pending: userDetailsPending,
        response: userDetailsResponse,
    } = useRequest<ListResponse<User>>({
        skip: !userDetails,
        url: `api/v2/user/?username=${userNameForDetail}`,
    });
    console.log('Check user details::>>', userDetailsResponse);

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
            subscriptionMap,
            pending: mePending,
            retriggerSubscription: retriggerUserDetails,
        }),
        [
            mePending,
            subscriptionMap,
            retriggerUserDetails,
        ],
    );

    const handleChangePassword = useCallback(() => {
        console.log('Clicked change password:::');
    }, []);

    const handleEditProfile = useCallback(() => {
        console.log('Clicked Edit Profile:::');
    }, []);

    const eventList = operationsRes?.results;
    const userInformation = userDetailsResponse?.results[0];
    const userInformationPending = userDetailsPending || userDetailsError || !userDetailsResponse;

    return (
        <div className={styles.accountInfo}>
            <Container
                className={_cs(styles.infoBox, className)}
                heading={strings.operationFollowing}
                headingLevel={2}
                headerDescription={strings.currentlyFollowing}
            >
                <div className={styles.operationsList}>
                    <List
                        data={eventList}
                        pending={operationsPending}
                        errored={!!operationResponseError}
                        filtered={false}
                        keySelector={keySelector}
                        renderer={OperationInfoCard}
                        rendererParams={rendererParams}
                    />
                </div>
            </Container>
            <Container
                className={_cs(styles.infoBox, className)}
                heading={strings.accountInformationTitle}
                headerDescription={userInformationPending && 'Sorry could not get the user details right now'}
                headingLevel={2}
                actions={!!userDetailsResponse && (
                    <div className={styles.userEdit}>
                        <Button
                            name={undefined}
                            onClick={handleEditProfile}
                            variant="secondary"
                        >
                            Edit Profile
                        </Button>
                        <Button
                            name={undefined}
                            onClick={handleChangePassword}
                            variant="secondary"
                        >
                            Change Password
                        </Button>
                    </div>
                )}
            >
                {!!userDetailsResponse && (
                    <div className={styles.userDetailSection}>
                        <span className={styles.userInfoRow}>USER-NAME: {(userInformation?.username) ?? '--'}</span>
                        <span className={styles.userInfoRow}>FIRST-NAME: {(userInformation?.first_name) ?? '--'}</span>
                        <span className={styles.userInfoRow}>LAST-NAME: {(userInformation?.last_name) ?? '--'}</span>
                        <span className={styles.userInfoRow}>EMAIL: {(userInformation?.email) ?? '--'}</span>
                        <span className={styles.userInfoRow}>PHONE-NUMBER: {(userInformation?.profile?.phone_number) ?? '--'}</span>
                        <span className={styles.userInfoRow}>CITY: {(userInformation?.profile?.city) ?? '--'}</span>
                        <span className={styles.userInfoRow}>ORGANIZATION: {(userInformation?.profile?.org) ?? '--'}</span>
                        <span className={styles.userInfoRow}>ORGANIZATION-TYPE: {(userInformation?.profile?.org_type) ?? '--'}</span>
                        <span className={styles.userInfoRow}>DEPARTMENT: {(userInformation?.profile?.department) ?? '--'}</span>
                        <span className={styles.userInfoRow}>POSITION: {(userInformation?.profile?.position) ?? '--'}</span>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default AccountInfo;
