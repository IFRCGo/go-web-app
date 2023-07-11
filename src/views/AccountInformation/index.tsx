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
} from '#utils/restRequest';
import UserContext from '#contexts/user';
import type { paths } from '#generated/types';

import OperationInfoCard, { Props as OperationInfoCardProps } from './OperationInfoCard';
import ChangePasswordModal from './ChangePassword';
import EditAccountInfo from './EditAccountInfo';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetUserMeResponse = paths['/api/v2/user/me/']['get'];
type UserMeResponse = GetUserMeResponse['responses']['200']['content']['application/json'];

type GetUser = paths['/api/v2/user/']['get'];
type UserResponse = GetUser['responses']['200']['content']['application/json'];

type GetOperations = paths['/api/v2/event/']['get'];
type OperationsResponse = GetOperations['responses']['200']['content']['application/json'];

const ITEM_PER_PAGE = 5;

const keySelector = (emergency: NonNullable<OperationsResponse['results']>[number]) => emergency.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userAuth: userDetails } = useContext(UserContext);

    const [page, setPage] = useState(0);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const {
        error: operationResponseError,
        response: operationsRes,
        pending: operationsPending,
    } = useRequest<OperationsResponse>({
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
    } = useRequest<UserResponse>({
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
    } = useRequest<UserMeResponse>({
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
        (_: number, operation: NonNullable<OperationsResponse['results']>[number]): OperationInfoCardProps => ({
            operationsData: operation,
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
    const userInformation = userDetailsResponse?.results?.[0];
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
                    handleModalCloseButton={onEditProfileCancel}
                />
            )}
            {showChangePasswordModal && (
                <ChangePasswordModal
                    handleModalCloseButton={onCancelPasswordChange}
                />
            )}
        </div>
    );
}

Component.displayName = 'AccountInformation';
