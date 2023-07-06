import { useState, useCallback, useContext } from 'react';
import Container from '#components/Container';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    PencilFillIcon,
} from '@ifrc-go/icons';

import List from '#components/List';
import Button from '#components/Button';
import Pager from '#components/Pager';
import TextOutput from '#components/TextOutput';
import BlockLoading from '#components/BlockLoading';

import useTranslation from '#hooks/useTranslation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import UserContext from '#contexts/user';
import { Emergency } from '#types/emergency';
import { User } from '#types/user';
import type { GET } from '#types/serverResponse';

import OperationInfoCard from './OperationInfoCard';
import ChangePasswordModal from './ChangePassword';
import EditAccountInfo from './EditAccountInfo';
import i18n from './i18n.json';
import styles from './styles.module.css';

type UserResponse = GET['api/v2/user/me/'];

const ITEM_PER_PAGE = 4;

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

    const [page, setPage] = useState(0);
    const [editProfile, setEditProfile] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);

    const {
        error: operationResponseError,
        response: operationsRes,
        pending: operationsPending,
    } = useRequest<ListResponse<Emergency>>({
        url: 'api/v2/event/',
        query: {
            is_featured: 1,
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (page - 1),
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

    const onEditProfileCancel = useCallback(() => {
        setEditProfile(false);
    }, []);

    const onCancelPasswordChange = useCallback(() => {
        setChangePasswordMode(false);
    }, []);

    const eventList = operationsRes?.results;
    const userInformation = userDetailsResponse?.results[0];
    const userInformationPending = userDetailsPending || userDetailsError || !userDetailsResponse;

    return (
        <div className={styles.accountInfo}>
            <Container
                className={_cs(styles.infoBox, className)}
                heading={strings.operationFollowing}
                withHeaderBorder
                headingLevel={2}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={operationsRes?.count ?? 3}
                        maxItemsPerPage={5}
                        onActivePageChange={setPage}
                    />
                )}
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
                withHeaderBorder
                headingLevel={2}
                actions={!!userDetailsResponse && (
                    <div className={styles.userEdit}>
                        <Button
                            name
                            icons={(<PencilFillIcon />)}
                            onClick={setEditProfile}
                            variant="secondary"
                        >
                            Edit Profile
                        </Button>
                    </div>
                )}
            >
                {userInformationPending ? (
                    <BlockLoading
                        message={strings.noUserDetails}
                    />
                ) : (
                    <div className={styles.userDetailSection}>
                        <TextOutput
                            className={styles.userInfoRow}
                            label="UserName"
                            description={((userInformation?.username) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="FullName"
                            description={((userInformation?.username) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Location"
                            description={((userInformation?.profile?.city) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Email"
                            description={((userInformation?.email) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Phone Number"
                            description={((userInformation?.profile?.phone_number) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Organization"
                            description={((userInformation?.profile?.org) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Organization Type"
                            description={((userInformation?.profile?.org_type) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Department"
                            description={((userInformation?.profile?.department) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label="Position"
                            description={((userInformation?.profile?.position) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <Button
                            name
                            className={styles.changePasswordButton}
                            onClick={setChangePasswordMode}
                            variant="tertiary"
                        >
                            Change Password
                        </Button>
                    </div>
                )}
            </Container>
            {editProfile && (
                <EditAccountInfo
                    handleCancelButton={onEditProfileCancel}
                />
            )}
            {changePasswordMode && (
                <ChangePasswordModal
                    handleCancelButton={onCancelPasswordChange}
                />
            )}
        </div>
    );
}

export default AccountInfo;
