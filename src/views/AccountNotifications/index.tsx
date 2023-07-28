import { useState, useCallback, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import Container from '#components/Container';
import List from '#components/List';
import Pager from '#components/Pager';
import CheckList from '#components/Checklist';

import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import UserContext from '#contexts/user';

import SubmittedReportCard from './SubmittedReportCard';
import i18n from './i18n.json';
import styles from './styles.module.css';
import { isNotDefined } from '@togglecorp/fujs';

interface checklistOptionType {
    key: number;
    label: string;
    description: string;
}

const notificationTypeOptions = [
    {
        key: 12,
        label: 'Weekly Digest',
        description: 'Select to get a weekly compilation of emergency events based on your preferences.',
    },
    {
        key: 20,
        label: 'New Emergencies',
        description: 'Select to get a weekly compilation of emergency events based on your preferences.'
    },
    {
        key: 22,
        label: 'New Operations',
        description: 'Select to receive notifications of new supported emergency operations.'
    },
    {
        key: 24,
        label: 'General Announcements',
        description: ''
    }
];

const regionalNotificationOptions = [
    {
        key: 12,
        label: 'Africa',
        description: '',
    },
    {
        key: 20,
        label: 'Asia Pacific',
        description: '',
    },
    {
        key: 22,
        label: 'MENA',
        description: '',
    },
    {
        key: 24,
        label: 'Europe',
        description: '',
    },
    {
        key: 69,
        label: 'Americas',
        description: '',
    }
];

const disasterOptions = [
    {
        key: 12,
        label: 'Biological Emergency',
        description: '',
    },
    {
        key: 20,
        label: 'Complex Emergency',
        description: '',
    },
    {
        key: 22,
        label: 'Epidemic',
        description: '',
    },
    {
        key: 24,
        label: 'Heat Wave',
        description: '',
    },
    {
        key: 69,
        label: 'Chemical Emergency',
        description: '',
    },
    {
        key: 69,
        label: 'Cyclone',
        description: '',
    },
    {
        key: 69,
        label: 'Fire',
        description: '',
    }
];

const ITEM_PER_PAGE = 5;

const keySelector = (item: any) => item.id;
const notificationKeySelector = (item: checklistOptionType) => item.key;
const notificationLabelSelector = (item: checklistOptionType) => item.label;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userAuth } = useContext(UserContext);

    const [page, setPage] = useState(0);
    const [notificationTypes, setNotificationTypes] = useState<Array<checklistOptionType['key'] | undefined>>();

    const {
        response: meResponse,
    } = useRequest({
        skip: !userAuth,
        url: '/api/v2/user/me/',
    });

    const {
        error: fieldReportError,
        response: fieldReportResponse,
        pending: fieldReportPending,
    } = useRequest({
        url: '/api/v2/field_report/{id}/',
        pathVariables: meResponse?.id ? { id: meResponse.id } : undefined,
        skip: isNotDefined(meResponse?.id),
        preserveResponse: true,
    });

    console.log('Check fieldReport::>>>', fieldReportResponse);

    const rendererParams = useCallback(
        (_: number, notification: any) => ({
            notificationData: notification,
        }),
        [],
    );

    const handleNotificationChecklist = useCallback(
        (values: checklistOptionType['key'] | undefined) => {
            if (isDefined(values)) {
                setNotificationTypes(undefined);
            } else {
                setNotificationTypes(undefined);
            }
            setPage(1);
        }, [setNotificationTypes]);

    return (
        <div className={styles.accountNotification}>
            <Container
                className={styles.reportCollection}
                heading={strings.accountSubmittedReports}
                withHeaderBorder
                headingLevel={3}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={0}
                        maxItemsPerPage={ITEM_PER_PAGE}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <List
                    className={styles.reportCards}
                    data={fieldReportResponse?.countries}
                    pending={fieldReportPending}
                    errored={!!fieldReportError}
                    filtered={false}
                    keySelector={keySelector}
                    renderer={SubmittedReportCard}
                    rendererParams={rendererParams}
                />
            </Container>
            <Container
                className={styles.preferences}
                heading={strings.subscriptionPreferences}
                withHeaderBorder
                headingLevel={3}
            >
                <Container
                    className={styles.preferenceTypes}
                    heading={strings.notificationTypes}
                    headerDescription={strings.notificationTypeDescription}
                    headerDescriptionClassName={styles.checkListDescription}
                    headingLevel={5}
                >
                    <CheckList
                        listContainerClassName={styles.checkBoxCollection}
                        direction="horizontal"
                        name="notificationType"
                        options={notificationTypeOptions}
                        value={undefined}
                        keySelector={notificationKeySelector}
                        labelSelector={notificationLabelSelector}
                        onChange={handleNotificationChecklist}
                    />
                </Container>
                <Container
                    className={styles.preferenceTypes}
                    heading={strings.regionalNotifications}
                    headerDescription={strings.regionalNotificationTypeDescription}
                    headerDescriptionClassName={styles.checkListDescription}
                    headingLevel={5}
                >
                    <CheckList
                        listContainerClassName={styles.checkBoxCollection}
                        direction="horizontal"
                        name="regionalNotificationType"
                        options={regionalNotificationOptions}
                        value={undefined}
                        keySelector={notificationKeySelector}
                        labelSelector={notificationLabelSelector}
                        onChange={handleNotificationChecklist}
                    />
                </Container>
                <Container
                    className={styles.preferenceTypes}
                    heading={strings.disasterNotifications}
                    headerDescription={strings.disasterNotificationTypeDescription}
                    headerDescriptionClassName={styles.checkListDescription}
                    headingLevel={5}
                >
                    <CheckList
                        listContainerClassName={styles.checkBoxCollection}
                        direction="horizontal"
                        name="regionalNotificationType"
                        options={disasterOptions}
                        value={undefined}
                        keySelector={notificationKeySelector}
                        labelSelector={notificationLabelSelector}
                        onChange={handleNotificationChecklist}
                    />
                </Container>
            </Container>
        </div>
    );
}

Component.displayName = 'AccountNotifications';
