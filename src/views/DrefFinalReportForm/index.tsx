import {
    useState,
    useCallback,
    useRef,
    type ElementRef,
    useMemo,
} from 'react';
import {
    useParams,
} from 'react-router-dom';
import {
    useForm,
    removeNull,
} from '@togglecorp/toggle-form';
import {
    isFalsyString,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';

import Page from '#components/Page';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import Message from '#components/Message';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import DrefShareModal from '#components/domain/DrefShareModal';
import DrefExportModal from '#components/domain/DrefExportModal';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import {
    useRequest,
    useLazyRequest,
    type GoApiResponse,
} from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import useBooleanState from '#hooks/useBooleanState';
import { injectClientId } from '#utils/common';
import {
    transformObjectError,
    matchArray,
    NUM,
} from '#utils/restRequest/error';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useInputState from '#hooks/useInputState';

import finalReportSchema, {
    type FinalReportRequestBody,
} from './schema';
import {
    checkTabErrors,
} from './common';
import Overview from './Overview';
import EventDetail from './EventDetail';
import Actions from './Actions';
import Operation from './Operation';
import Submission from './Submission';
import ObsoletePayloadModal from './ObsoletePayloadModal';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetFinalReportResponse = GoApiResponse<'/api/v2/dref-final-report/{id}/'>;

export type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';

function getNextStep(current: TabKeys, direction: 1 | -1) {
    if (direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            overview: 'eventDetail',
            eventDetail: 'actions',
            actions: 'operation',
            operation: 'submission',
        };
        return mapping[current];
    }
    if (direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            submission: 'operation',
            operation: 'actions',
            actions: 'eventDetail',
            eventDetail: 'overview',
        };
        return mapping[current];
    }
    return undefined;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { finalReportId } = useParams<{ finalReportId: string }>();

    const alert = useAlert();
    const strings = useTranslation(i18n);

    const formContentRef = useRef<ElementRef<'div'>>(null);

    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const [userOptions, setUserOptions] = useInputState<User[] | undefined | null>([]);
    const [users, setUsers] = useInputState<number[]>([]);
    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);
    const [
        showObsoletePayloadModal,
        setShowObsoletePayloadModal,
    ] = useState(false);
    const currentLanguage = useCurrentLanguage();
    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);
    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);
    const lastModifiedAtRef = useRef<string | undefined>();

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(
        finalReportSchema,
        {
            value: {
                planned_interventions: [],
                national_society_actions: [],
                needs_identified: [],
                images_file: [],
                has_national_society_conducted: false,
            },
        },
    );

    const handleFinalReportLoad = useCallback(
        (response: GetFinalReportResponse) => {
            lastModifiedAtRef.current = response?.modified_at;

            setFileIdToUrlMap((prevMap) => {
                const newMap = {
                    ...prevMap,
                };
                if (
                    response.assessment_report_details
                    && response.assessment_report_details.file
                ) {
                    newMap[
                        response.assessment_report_details.id
                    ] = response.assessment_report_details.file;
                }
                if (
                    response.event_map_file
                    && response.event_map_file.file
                ) {
                    newMap[response.event_map_file.id] = response.event_map_file.file;
                }
                if (
                    response.cover_image_file
                    && response.cover_image_file.file
                ) {
                    newMap[response.cover_image_file.id] = response.cover_image_file.file;
                }

                if (
                    response.financial_report_details
                    && response.financial_report_details.file
                ) {
                    // eslint-disable-next-line max-len
                    newMap[response.financial_report_details.id] = response.financial_report_details.file;
                }
                /*
                if ((response.photos_file?.length ?? 0) > 0) {
                    response.photos_file?.forEach((img) => {
                        if (isDefined(img.file)) {
                            newMap[img.id] = img.file;
                        }
                    });
                }
                */
                if ((response.images_file?.length ?? 0) > 0) {
                    response.images_file?.forEach((img) => {
                        if (isDefined(img.file)) {
                            newMap[img.id] = img.file;
                        }
                    });
                }
                return newMap;
            });
        },
        [],
    );

    const {
        pending: fetchingFinalReport,
        response: finalReportResponse,
        error: finalReportResponseError,
    } = useRequest({
        skip: isFalsyString(finalReportId),
        url: '/api/v2/dref-final-report/{id}/',
        pathVariables: isDefined(finalReportId) ? {
            id: finalReportId,
        } : undefined,
        onSuccess: (response) => {
            handleFinalReportLoad(response);

            const {
                planned_interventions,
                needs_identified,
                national_society_actions,
                risk_security,
                event_map_file,
                cover_image_file,
                images_file,
                photos_file,
                ...otherValues
            } = removeNull(response);

            setValue({
                ...otherValues,
                planned_interventions: planned_interventions?.map(
                    (intervention) => ({
                        ...injectClientId(intervention),
                        indicators: intervention.indicators?.map(injectClientId),
                    }),
                ),
                needs_identified: needs_identified?.map(injectClientId),
                national_society_actions: national_society_actions?.map(injectClientId),
                risk_security: risk_security?.map(injectClientId),
                // FIXME: We might need to remove photos_file
                photos_file: photos_file?.map(injectClientId),
                event_map_file: isDefined(event_map_file)
                    ? injectClientId(event_map_file)
                    : undefined,
                cover_image_file: isDefined(cover_image_file)
                    ? injectClientId(cover_image_file)
                    : undefined,
                images_file: images_file?.map(injectClientId),
            });

            setDistrictOptions(response.district_details);
        },
    });

    const drefId = finalReportResponse?.dref;

    const {
        pending: updateFinalReportPending,
        trigger: updateFinalReport,
    } = useLazyRequest({
        url: '/api/v2/dref-final-report/{id}/',
        method: 'PATCH',
        pathVariables: isDefined(finalReportId) ? { id: finalReportId } : undefined,
        body: (formFields: FinalReportRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.formSaveRequestSuccessMessage,
                { variant: 'success' },
            );
            handleFinalReportLoad(response);
        },
        onFailure: ({
            value: { formErrors, messageForNotification },
            debugMessage,
        }) => {
            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['images_file', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.images_file?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['needs_identified', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.needs_identified?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['risk_security', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.risk_security?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['planned_interventions', NUM, 'indicators', NUM]);
                    if (isDefined(match)) {
                        const [planned_intervention_index, index] = match;
                        // eslint-disable-next-line max-len
                        return value?.planned_interventions?.[planned_intervention_index]?.indicators?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['planned_interventions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.planned_interventions?.[index]?.client_id;
                    }
                    return undefined;
                },
            ));

            const modifiedAtError = formErrors.modified_at;
            if (
                (typeof modifiedAtError === 'string' && modifiedAtError === 'OBSOLETE_PAYLOAD')
                || (Array.isArray(modifiedAtError) && modifiedAtError.includes('OBSOLETE_PAYLOAD'))
            ) {
                setShowObsoletePayloadModal(true);
            }

            alert.show(
                strings.formSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const {
        retrigger: getDrefUsers,
    } = useRequest({
        url: '/api/v2/dref-share-user/{id}/',
        pathVariables: { id: Number(drefId) },
        onSuccess: (response) => {
            if (isDefined(response.users)) {
                setUsers(response.users);
            }

            setUserOptions(response.users_details);
        },
    });

    const handleFormSubmit = useCallback(
        (modifiedAt?: string) => {
            formContentRef.current?.scrollIntoView();

            // FIXME: use createSubmitHandler
            const result = validate();
            if (result.errored) {
                setError(result.error);
                return;
            }

            updateFinalReport({
                ...result.value,
                modified_at: modifiedAt ?? lastModifiedAtRef.current,
            } as FinalReportRequestBody);
        },
        [validate, setError, updateFinalReport],
    );

    const handleObsoletePayloadOverwiteButtonClick = useCallback(
        (newModifiedAt: string | undefined) => {
            setShowObsoletePayloadModal(false);
            // FIXME: Why not just set lastModifiedAtRef.current,
            handleFormSubmit(newModifiedAt);
        },
        [handleFormSubmit],
    );

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    const handleUserShareSuccess = useCallback(() => {
        setShowShareModalFalse();
        getDrefUsers();
    }, [
        getDrefUsers,
        setShowShareModalFalse,
    ]);

    const selectedUsers = useMemo(() => (
        userOptions?.filter((user) => users.includes(user.id))
    ), [userOptions, users]);

    const nextStep = getNextStep(activeTab, 1);
    const prevStep = getNextStep(activeTab, -1);
    const saveFinalReportPending = updateFinalReportPending;
    const disabled = fetchingFinalReport || saveFinalReportPending;

    const languageMismatch = isDefined(finalReportId)
        && isDefined(finalReportResponse)
        && currentLanguage !== finalReportResponse?.translation_module_original_language;
    const shouldHideForm = languageMismatch
        || fetchingFinalReport
        || isDefined(finalReportResponseError);

    return (
        <Tabs
            value={activeTab}
            // NOTE: not using handleTabChange here
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                elementRef={formContentRef}
                className={styles.drefFinalReportForm}
                title={strings.formPageTitle}
                heading={strings.formPageHeading}
                actions={isTruthyString(finalReportId) && (
                    <>
                        <Button
                            name={undefined}
                            onClick={setShowShareModalTrue}
                            disabled={isNotDefined(drefId)}
                        >
                            {strings.formShareButtonLabel}
                        </Button>
                        <Button
                            name={undefined}
                            onClick={setShowExportModalTrue}
                            icons={<DownloadTwoLineIcon />}
                            disabled={isNotDefined(drefId)}
                        >
                            {strings.formExportLabel}
                        </Button>
                    </>
                )}
                info={!shouldHideForm && (
                    <TabList className={styles.tabList}>
                        <Tab
                            name="overview"
                            step={1}
                            errored={checkTabErrors(formError, 'overview')}
                        >
                            {strings.formTabOverviewLabel}
                        </Tab>
                        <Tab
                            name="eventDetail"
                            step={2}
                            errored={checkTabErrors(formError, 'eventDetail')}
                        >
                            {strings.formTabEventDetailLabel}
                        </Tab>
                        <Tab
                            name="actions"
                            step={3}
                            errored={checkTabErrors(formError, 'actions')}
                        >
                            {strings.formTabActionsLabel}
                        </Tab>
                        <Tab
                            name="operation"
                            step={4}
                            errored={checkTabErrors(formError, 'operation')}
                        >
                            {strings.formTabOperationLabel}
                        </Tab>
                        <Tab
                            name="submission"
                            step={5}
                            errored={checkTabErrors(formError, 'submission')}
                        >
                            {strings.formTabSubmissionLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
            >
                {fetchingFinalReport && (
                    <Message
                        pending
                        title={strings.formLoadingMessage}
                    />
                )}
                {languageMismatch && (
                    <LanguageMismatchMessage
                        title={strings.formNotAvailableInSelectedLanguageMessage}
                        originalLanguage={finalReportResponse.translation_module_original_language}
                    />
                )}
                {isDefined(finalReportResponseError) && (
                    <Message
                        variant="error"
                        title={strings.formLoadErrorTitle}
                        description={finalReportResponseError.value.messageForNotification}
                        actions={strings.formLoadErrorHelpText}
                    />
                )}
                {!shouldHideForm && (
                    <>
                        <NonFieldError
                            error={formError}
                            withFallbackError
                        />
                        <TabPanel name="overview">
                            <Overview
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                                selectedUsers={selectedUsers}
                                districtOptions={districtOptions}
                                setDistrictOptions={setDistrictOptions}
                            />
                        </TabPanel>
                        <TabPanel name="eventDetail">
                            <EventDetail
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <TabPanel name="actions">
                            <Actions
                                value={value}
                                setFieldValue={setFieldValue}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <TabPanel name="operation">
                            <Operation
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <TabPanel name="submission">
                            <Submission
                                value={value}
                                setFieldValue={setFieldValue}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <div className={styles.actions}>
                            <div className={styles.pageActions}>
                                <Button
                                    name={prevStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(prevStep)}
                                    variant="secondary"
                                >
                                    {strings.formBackButtonLabel}
                                </Button>
                                <Button
                                    name={nextStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(nextStep)}
                                    variant="secondary"
                                >
                                    {strings.formContinueButtonLabel}
                                </Button>
                            </div>
                            <Button
                                name={undefined}
                                onClick={handleFormSubmit}
                                disabled={activeTab !== 'submission' || disabled}
                            >
                                {strings.formSubmitButtonLabel}
                            </Button>
                        </div>
                    </>
                )}
                {isTruthyString(finalReportId) && showObsoletePayloadModal && (
                    <ObsoletePayloadModal
                        finalReportId={+finalReportId}
                        onOverwriteButtonClick={handleObsoletePayloadOverwiteButtonClick}
                        onCancelButtonClick={setShowObsoletePayloadModal}
                    />
                )}
                {showShareModal && isDefined(drefId) && (
                    <DrefShareModal
                        onCancel={setShowShareModalFalse}
                        onSuccess={handleUserShareSuccess}
                        drefId={drefId}
                    />
                )}
                {showExportModal && (
                    <DrefExportModal
                        onCancel={setShowExportModalFalse}
                        id={Number(drefId)}
                        applicationType="DREF"
                    />
                )}
            </Page>
        </Tabs>
    );
}
