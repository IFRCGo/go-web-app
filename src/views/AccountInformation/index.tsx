import { useState, useCallback } from 'react';
import {
    listToMap,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    PencilFillIcon,
} from '@ifrc-go/icons';

import useUserMe from '#hooks/domain/useUserMe';
import Container from '#components/Container';
import List from '#components/List';
import Button from '#components/Button';
import Pager from '#components/Pager';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';

import OperationInfoCard, { type Props as OperationInfoCardProps } from './OperationInfoCard';
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

    const meResponse = useUserMe();

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
        }),
        [
            subscriptionMap,
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
                className={styles.userInformation}
                heading={strings.accountInformationHeading}
                withHeaderBorder
                actions={(
                    <>
                        <Button
                            name
                            className={styles.changePasswordButton}
                            onClick={setShowChangePasswordModal}
                            variant="tertiary"
                        >
                            {strings.changePasswordButtonLabel}
                        </Button>
                        <Button
                            name
                            icons={(<PencilFillIcon />)}
                            onClick={setShowEditProfileModal}
                            variant="secondary"
                            disabled={isNotDefined(meResponse)}
                        >
                            {strings.editProfileButtonLabel}
                        </Button>
                    </>
                )}
                childrenContainerClassName={styles.content}
            >
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
            </Container>
            <Container
                className={styles.operationsFollowing}
                heading={strings.operationFollowingHeading}
                withHeaderBorder
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
                    errored={isDefined(operationResponseError)}
                    filtered={false}
                    keySelector={keySelector}
                    renderer={OperationInfoCard}
                    rendererParams={rendererParams}
                />
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
