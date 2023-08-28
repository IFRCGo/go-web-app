import {
    useContext,
    useMemo,
    useCallback,
    useState,
    useRef,
    type ElementRef,
} from 'react';
import {
    listToMap,
    randomString,
    isDefined,
    isFalsyString,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';
import {
    useParams,
    generatePath,
    useNavigate,
} from 'react-router-dom';

import useAlert from '#hooks/useAlert';
import RouteContext from '#contexts/route';
import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import Button from '#components/Button';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';
import {
    type DistrictItem,
} from '#components/domain/DistrictSearchMultiSelectInput';
import { injectClientId } from '#utils/common';

import i18n from './i18n.json';
import schema, {
    type FormType,
    type FlashUpdateBody,
} from './schema';
import ActionsTab from './ActionsTab';
import ContextTab from './ContextTab';
import FocalPointsTab from './FocalPointsTab';
import styles from './styles.module.css';

type TabKeys = 'context' | 'actions' | 'focal';

function getNextStep(current: TabKeys, direction: 1 | -1) {
    if (direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'actions',
            actions: 'focal',
        };
        return mapping[current];
    }
    const mapping: { [key in TabKeys]?: TabKeys } = {
        focal: 'actions',
        actions: 'context',
    };
    return mapping[current];
}

const fieldsInContext: { [key in keyof FormType]?: true } = {
    country_district: true,
    references: true,
    hazard_type: true,
    title: true,
    situational_overview: true,
    graphics_files: true,
    map_files: true,
};

const fieldsInActions: { [key in keyof FormType]?: true } = {
    actions_taken: true,
};

const fieldsInFocalPoints: { [key in keyof FormType]?: true } = {
    originator_name: true,
    originator_title: true,
    originator_email: true,
    originator_phone: true,
    ifrc_name: true,
    ifrc_title: true,
    ifrc_email: true,
    ifrc_phone: true,
};

type ActionWithoutSummary = Omit<NonNullable<FormType['actions_taken']>[number], 'summary'>;
const defaultActionsTaken: ActionWithoutSummary[] = [
    { client_id: randomString(), organization: 'NTLS', actions: [] },
    { client_id: randomString(), organization: 'PNS', actions: [] },
    { client_id: randomString(), organization: 'FDRN', actions: [] },
    { client_id: randomString(), organization: 'GOV', actions: [] },
];

const defaultFormValues: FormType = {
    country_district: [{
        client_id: randomString(),
    }],
    actions_taken: defaultActionsTaken,
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<TabKeys>('context');
    const { flashUpdateId } = useParams<{ flashUpdateId: string }>();

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const {
        flashUpdateFormDetails: flashUpdateDetailRoute,
    } = useContext(RouteContext);

    const alert = useAlert();
    const navigate = useNavigate();

    const {
        value,
        error,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValues });

    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const formContentRef = useRef<ElementRef<'div'>>(null);

    const {
        pending: pendingFlashUpdateDetails,
    } = useRequest({
        skip: isFalsyString(flashUpdateId),
        url: '/api/v2/flash-update/{id}/',
        pathVariables: isTruthyString(flashUpdateId) ? {
            id: Number(flashUpdateId),
        } : undefined,
        onSuccess: (response) => {
            const sanitizedResponse = removeNull(response);
            setValue({
                ...removeNull(sanitizedResponse),
                graphics_files: sanitizedResponse.graphics_files?.map(injectClientId),
                references: sanitizedResponse.references?.map(injectClientId),
                country_district: sanitizedResponse.country_district?.map(injectClientId),
                map_files: sanitizedResponse.map_files?.map(injectClientId),
                actions_taken: sanitizedResponse.actions_taken?.map((item) => ({
                    ...injectClientId(item),
                    action_details: undefined,
                })),
            });

            // NOTE: Setting files and its urls
            const files = [
                ...(response.map_files ?? []).map((item) => ({
                    id: item.id,
                    file: item.file,
                })),
                ...(response.graphics_files ?? []).map((item) => ({
                    id: item.id,
                    file: item.file,
                })),
                ...(response.references ?? []).map((item) => (
                    item.document ? ({
                        id: item.document,
                        file: item.document_details?.file,
                    }) : undefined
                )).filter(isDefined),
            ];
            setFileIdToUrlMap(
                listToMap(
                    files,
                    (item) => item.id,
                    (item) => item.file ?? '',
                ),
            );

            setDistrictOptions(
                response?.country_district?.map((country) => ([
                    ...(country?.district_details ?? []),
                ])).flat(),
            );
        },
    });

    const {
        pending: createSubmitPending,
        trigger: submitRequest,
    } = useLazyRequest({
        url: '/api/v2/flash-update/',
        method: 'POST',
        body: (ctx: FlashUpdateBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.flashUpdateFormRedirectMessage,
                { variant: 'success' },
            );
            navigate(
                generatePath(
                    flashUpdateDetailRoute.absolutePath,
                    { flashUpdateId: response.id },
                ),
            );
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            alert.show(
                strings.flashUpdateFormSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const {
        pending: updateSubmitPending,
        trigger: updateSubmitRequest,
    } = useLazyRequest({
        url: '/api/v2/flash-update/{id}/',
        method: 'PUT',
        pathVariables: {
            id: Number(flashUpdateId),
        },
        body: (ctx: FlashUpdateBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.flashUpdateFormRedirectMessage,
                { variant: 'success' },
            );
            navigate(
                generatePath(
                    flashUpdateDetailRoute.absolutePath,
                    { flashUpdateId: response.id },
                ),
            );
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            alert.show(
                strings.flashUpdateFormSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });
    const handleSubmit = useCallback((data: FormType) => {
        formContentRef.current?.scrollIntoView();
        if (!flashUpdateId) {
            submitRequest(data as FlashUpdateBody);
        } else {
            updateSubmitRequest(data as FlashUpdateBody);
        }
    }, [
        updateSubmitRequest,
        flashUpdateId,
        submitRequest,
    ]);

    const submitPending = createSubmitPending || updateSubmitPending;

    const pending = submitPending || pendingFlashUpdateDetails;

    const disabled = pending;

    const errorInContext = useMemo(() => (
        !!error && Object.keys(error).some(
            (fieldName) => fieldsInContext[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInActions = useMemo(() => (
        !!error && Object.keys(error).some(
            (fieldName) => fieldsInActions[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInFocalPoints = useMemo(() => (
        !!error && Object.keys(error).some(
            (fieldName) => fieldsInFocalPoints[fieldName as keyof typeof error],
        )
    ), [error]);

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    return (
        <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="step"
        >
            <Page
                elementRef={formContentRef}
                className={styles.flashUpdateForm}
                title={strings.flashUpdateFormPageTitle}
                heading={strings.flashUpdateFormPageHeading}
                description={strings.flashUpdateFormPageDescription}
                mainSectionClassName={styles.content}
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="context"
                            step={1}
                            errored={errorInContext}
                        >
                            {strings.flashUpdateTabContextLabel}
                        </Tab>
                        <Tab
                            name="actions"
                            step={2}
                            errored={errorInActions}
                        >
                            {strings.flashUpdateTabActionLabel}
                        </Tab>
                        <Tab
                            name="focal"
                            step={3}
                            errored={errorInFocalPoints}
                        >
                            {strings.flashUpdateTabFocalLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
            >
                <TabPanel name="context">
                    <ContextTab
                        error={error}
                        onValueChange={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        value={value}
                        disabled={disabled}
                        districtOptions={districtOptions}
                        setDistrictOptions={setDistrictOptions}
                    />
                </TabPanel>
                <TabPanel name="actions">
                    <ActionsTab
                        error={error}
                        onValueChange={setFieldValue}
                        value={value}
                        disabled={disabled}
                    />
                </TabPanel>
                <TabPanel name="focal">
                    <FocalPointsTab
                        error={error}
                        onValueChange={setFieldValue}
                        value={value}
                        disabled={disabled}
                    />
                </TabPanel>
                <div className={styles.pageActions}>
                    <Button
                        name={getNextStep(activeTab, -1) ?? activeTab}
                        onClick={handleTabChange}
                        disabled={!getNextStep(activeTab, -1)}
                        variant="secondary"
                    >
                        {strings.flashUpdateBackButtonLabel}
                    </Button>
                    {!!getNextStep(activeTab, -1) && (
                        <Button
                            name={getNextStep(activeTab, 1) ?? activeTab}
                            onClick={handleTabChange}
                            disabled={!getNextStep(activeTab, 1)}
                            variant="secondary"
                        >
                            {strings.flashUpdateContinueButtonLabel}
                        </Button>
                    )}
                    {!getNextStep(activeTab, -1) && (
                        <Button
                            name={undefined}
                            onClick={createSubmitHandler(
                                validate,
                                setError,
                                handleSubmit,
                            )}
                            disabled={submitPending}
                            variant="secondary"
                        >
                            {/* FIXME: Use translations */}
                            Submit
                        </Button>
                    )}
                </div>
            </Page>
        </Tabs>
    );
}

Component.displayName = 'FlashUpdateForm';
