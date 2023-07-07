import { useState, useCallback, useContext } from 'react';
import Container from '#components/Container';
import {
    listToMap,
    isDefined,
    isFalsyString,
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

const ITEM_PER_PAGE = 5;

const keySelector = (emergency: Emergency) => emergency.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userDetails } = useContext(UserContext);

    const [page, setPage] = useState(0);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

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
        preserveResponse: true,
    });

    const {
        error: userDetailsError,
        pending: userDetailsPending,
        response: userDetailsResponse,
    } = useRequest<ListResponse<User>>({
        skip: isFalsyString(userDetails?.username),
        url: 'api/v2/user/',
        query: {
            username: userDetails?.username,
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
        setShowEditProfileModal(false);
    }, []);

    const onCancelPasswordChange = useCallback(() => {
        setShowChangePasswordModal(false);
    }, []);

    const eventList = operationsRes?.results;
    const userInformation = userDetailsResponse?.results[0];
    const userInformationPending = userDetailsPending || userDetailsError || !userDetailsResponse;

    return (
        <div className={styles.accountInformation}>
            <Container
                className={styles.operationsFollowing}
                heading={strings.operationFollowing}
                withHeaderBorder
                headingLevel={2}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={operationsRes?.count ?? 0}
                        maxItemsPerPage={ITEM_PER_PAGE}
                        onActivePageChange={setPage}
                    />
                )}
                childrenContainerClassName={styles.operationsList}
            >
                <List
                    data={eventList}
                    pending={operationsPending}
                    errored={!!operationResponseError}
                    filtered={false}
                    keySelector={keySelector}
                    renderer={OperationInfoCard}
                    rendererParams={rendererParams}
                    withMessageOverContent
                />
            </Container>
            <Container
                className={styles.userInformation}
                heading={strings.accountInformationTitle}
                withHeaderBorder
                headingLevel={2}
                footerActions={(
                    <Button
                        name
                        className={styles.changePasswordButton}
                        onClick={setShowChangePasswordModal}
                        variant="tertiary"
                    >
                        {strings.changePassword}
                    </Button>
                )}
                actions={!!userDetailsResponse && (
                    <Button
                        name
                        icons={(<PencilFillIcon />)}
                        onClick={setShowEditProfileModal}
                        variant="secondary"
                    >
                        {strings.editProfile}
                    </Button>
                )}
                childrenContainerClassName={styles.content}
            >
                {userInformationPending ? (
                    <BlockLoading
                        message={strings.noUserDetails}
                    />
                ) : (
                    <>
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.userName}
                            description={((userInformation?.username) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.fullName}
                            description={((`${userInformation?.first_name} ${userInformation?.last_name}`) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.location}
                            description={((userInformation?.profile?.city) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.email}
                            description={((userInformation?.email) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.phoneNumber}
                            description={((userInformation?.profile?.phone_number) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.organization}
                            description={((userInformation?.profile?.org) || '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.organizationType}
                            description={((userInformation?.profile?.org_type) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.department}
                            description={((userInformation?.profile?.department) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                        <TextOutput
                            className={styles.userInfoRow}
                            label={strings.position}
                            description={((userInformation?.profile?.position) ?? '--')}
                            descriptionClassName={styles.userInfo}
                        />
                    </>
                )}
            </Container>
            {showEditProfileModal && (
                <EditAccountInfo
                    handleCancelButton={onEditProfileCancel}
                />
            )}
            {showChangePasswordModal && (
                <ChangePasswordModal
                    handleCancelButton={onCancelPasswordChange}
                />
            )}
        </div>
    );
}

Component.displayName = 'AccountInformation';
