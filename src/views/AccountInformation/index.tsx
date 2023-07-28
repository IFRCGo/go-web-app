import { useState, useCallback, useContext } from 'react';
import Container from '#components/Container';
import {
    listToMap,
    isDefined,
    isTruthyString,
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
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import UserContext from '#contexts/user';

import OperationInfoCard, { Props as OperationInfoCardProps } from './OperationInfoCard';
import ChangePasswordModal from './ChangePassword';
import EditAccountInfo from './EditAccountInfo';
import i18n from './i18n.json';
import styles from './styles.module.css';

type OperationsResponse = GoApiResponse<'/api/v2/event/'>;

const ITEM_PER_PAGE = 5;

const keySelector = (emergency: NonNullable<OperationsResponse['results']>[number]) => emergency.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userAuth } = useContext(UserContext);

    const [page, setPage] = useState(0);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const {
        error: operationResponseError,
        response: operationsRes,
        pending: operationsPending,
    } = useRequest({
        url: '/api/v2/event/',
        query: {
            is_featured: 1,
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (page - 1),
            // FIXME: typings should be fixed in server
        } as never,
        preserveResponse: true,
    });

    const {
        pending: mePending,
        response: meResponse,
        retrigger: retriggerUserDetails,
    } = useRequest({
        skip: !userAuth,
        url: '/api/v2/user/me/',
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

    return (
        <div className={styles.accountInformation}>
            <Container
                className={styles.operationsFollowing}
                heading={strings.operationFollowingHeading}
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
            >
                <List
                    className={styles.operationsList}
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
                heading={strings.accountInformationHeading}
                withHeaderBorder
                headingLevel={2}
                footerActions={(
                    <Button
                        name
                        className={styles.changePasswordButton}
                        onClick={setShowChangePasswordModal}
                        variant="secondary"
                    >
                        {strings.changePasswordButtonLabel}
                    </Button>
                )}
                actions={(
                    <Button
                        name
                        icons={(<PencilFillIcon />)}
                        onClick={setShowEditProfileModal}
                        variant="secondary"
                        disabled={!meResponse}
                    >
                        {strings.editProfileButtonLabel}
                    </Button>
                )}
                childrenContainerClassName={styles.content}
            >
                {mePending ? (
                    <BlockLoading />
                ) : (
                    <>
                        <TextOutput
                            label={strings.usernameLabel}
                            value={meResponse?.username}
                        />
                        <TextOutput
                            label={strings.fullNameLabel}
                            value={
                                [meResponse?.first_name, meResponse?.last_name]
                                    .filter(isTruthyString).join(' ')
                            }
                        />
                        <TextOutput
                            label={strings.locationLabel}
                            value={meResponse?.profile?.city}
                        />
                        <TextOutput
                            label={strings.emailLabel}
                            value={meResponse?.email}
                        />
                        <TextOutput
                            label={strings.phoneNumberLabel}
                            value={meResponse?.profile?.phone_number}
                        />
                        <TextOutput
                            label={strings.organizationLabel}
                            value={meResponse?.profile?.org}
                        />
                        <TextOutput
                            label={strings.organizationTypeLabel}
                            value={meResponse?.profile?.org_type}
                        />
                        <TextOutput
                            label={strings.departmentLabel}
                            value={meResponse?.profile?.department}
                        />
                        <TextOutput
                            label={strings.positionLabel}
                            value={meResponse?.profile?.position}
                        />
                    </>
                )}
            </Container>
            {showEditProfileModal && (
                <EditAccountInfo
                    userDetails={meResponse}
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
