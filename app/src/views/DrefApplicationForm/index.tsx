import {
    type ElementRef,
    useCallback,
    useRef,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    DownloadTwoLineIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Message,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { injectClientId } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import DrefExportModal from '#components/domain/DrefExportModal';
import DrefShareModal from '#components/domain/DrefShareModal';
import { type FieldReportItem as FieldReportSearchItem } from '#components/domain/FieldReportSearchSelectInput';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import NonEnglishFormCreationMessage from '#components/domain/NonEnglishFormCreationMessage';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import useRouting from '#hooks/useRouting';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import Actions from './Actions';
import {
    checkTabErrors,
    TYPE_LOAN,
    type TypeOfDrefEnum,
} from './common';
import EventDetail from './EventDetail';
import ObsoletePayloadModal from './ObsoletePayloadModal';
import Operation from './Operation';
import Overview from './Overview';
import drefSchema, {
    type DrefRequestBody,
    type DrefRequestPostBody,
} from './schema';
import Submission from './Submission';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetDrefResponse = GoApiResponse<'/api/v2/dref/{id}/'>;

export type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';

// FIXME: fix typings in server (medium priority)
function getNextStep(current: TabKeys, direction: 1 | -1, typeOfDref: TypeOfDrefEnum | '' | undefined) {
    if (typeOfDref === TYPE_LOAN && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            overview: 'eventDetail',
            eventDetail: 'submission',
        };
        return mapping[current];
    }
    if (typeOfDref === TYPE_LOAN && direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            submission: 'eventDetail',
            eventDetail: 'overview',
        };
        return mapping[current];
    }
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
    const { drefId } = useParams<{ drefId: string }>();

    const alert = useAlert();
    const { navigate } = useRouting();
    const strings = useTranslation(i18n);

    const formContentRef = useRef<ElementRef<'div'>>(null);

    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const [drefUsers, setDrefUsers] = useInputState<User[] | undefined | null>([]);
    const currentLanguage = useCurrentLanguage();

    const [
        showObsoletePayloadModal,
        setShowObsoletePayloadModal,
    ] = useState(false);

    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);
    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);
    const lastModifiedAtRef = useRef<string | undefined>();

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);
    const [fieldReportOptions, setFieldReportOptions] = useState<
        FieldReportSearchItem[] | undefined | null
    >([]);

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(
        drefSchema,
        {
            value: {},
        },
    );

    const handleDrefLoad = useCallback(
        (response: GetDrefResponse) => {
            lastModifiedAtRef.current = response?.modified_at;

            setFileIdToUrlMap((prevMap) => {
                const newMap = {
                    ...prevMap,
                };

                const {
                    supporting_document_details,
                    assessment_report_details,
                    event_map_file,
                    cover_image_file,
                    images_file,
                    disaster_category_analysis_details,
                    targeting_strategy_support_file_details,
                    budget_file_details,
                } = response;

                if (
                    supporting_document_details
                    && supporting_document_details.file
                ) {
                    newMap[
                        supporting_document_details.id
                    ] = supporting_document_details.file;
                }

                if (
                    assessment_report_details
                    && assessment_report_details.file
                ) {
                    newMap[
                        assessment_report_details.id
                    ] = assessment_report_details.file;
                }

                if (
                    event_map_file
                    && event_map_file.file
                ) {
                    newMap[event_map_file.id] = event_map_file.file;
                }

                if (
                    cover_image_file
                    && cover_image_file.file
                ) {
                    newMap[cover_image_file.id] = cover_image_file.file;
                }

                if ((images_file?.length ?? 0) > 0) {
                    images_file?.forEach((img) => {
                        if (isDefined(img.file)) {
                            newMap[img.id] = img.file;
                        }
                    });
                }

                if (
                    disaster_category_analysis_details
                    && disaster_category_analysis_details.file
                ) {
                    newMap[
                        disaster_category_analysis_details.id
                    ] = disaster_category_analysis_details.file;
                }

                if (
                    targeting_strategy_support_file_details
                    && targeting_strategy_support_file_details.file
                ) {
                    newMap[
                        targeting_strategy_support_file_details.id
                    ] = targeting_strategy_support_file_details.file;
                }

                if (budget_file_details && budget_file_details.file) {
                    newMap[budget_file_details.id] = budget_file_details.file;
                }

                return newMap;
            });
        },
        [],
    );

    const {
        pending: fetchingDref,
        response: drefResponse,
        error: drefResponseError,
    } = useRequest({
        skip: isFalsyString(drefId),
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(drefId) ? {
            id: drefId,
        } : undefined,
        onSuccess: (response) => {
            handleDrefLoad(response);

            const {
                planned_interventions,
                needs_identified,
                national_society_actions,
                risk_security,
                event_map_file,
                cover_image_file,
                images_file,
                source_information,
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
                source_information: source_information?.map(injectClientId),
                needs_identified: needs_identified?.map(injectClientId),
                national_society_actions: national_society_actions?.map(injectClientId),
                risk_security: risk_security?.map(injectClientId),
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

    const {
        pending: updateDrefPending,
        trigger: updateDref,
    } = useLazyRequest({
        url: '/api/v2/dref/{id}/',
        method: 'PATCH',
        pathVariables: isDefined(drefId) ? { id: drefId } : undefined,
        body: (formFields: DrefRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.formSaveRequestSuccessMessage,
                { variant: 'success' },
            );
            handleDrefLoad(response);
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
                    match = matchArray(locations, ['national_society_actions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.national_society_actions?.[index]?.client_id;
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
                    match = matchArray(locations, ['source_information', NUM, 'source_link', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.source_information?.[index]?.source_link;
                    }
                    match = matchArray(locations, ['source_information', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.source_information?.[index]?.client_id;
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
        pending: createDrefPending,
        trigger: createDref,
    } = useLazyRequest({
        url: '/api/v2/dref/',
        method: 'POST',
        body: (formFields: DrefRequestPostBody) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.formSaveRequestSuccessMessage,
                { variant: 'success' },
            );
            navigate(
                'drefApplicationForm',
                { params: { drefId: response.id } },
            );
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
                    match = matchArray(locations, ['national_society_actions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.national_society_actions?.[index]?.client_id;
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
                    match = matchArray(locations, ['source_information', NUM, 'source_link', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.source_information?.[index]?.source_link;
                    }
                    match = matchArray(locations, ['source_information', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.source_information?.[index]?.client_id;
                    }
                    return undefined;
                },
            ));

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
        skip: isNotDefined(drefId),
        url: '/api/v2/dref-share-user/{id}/',
        pathVariables: { id: Number(drefId) },
        onSuccess: (response) => {
            setDrefUsers(response.users_details);
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

            if (isDefined(drefId)) {
                updateDref({
                    ...result.value,
                    modified_at: modifiedAt ?? lastModifiedAtRef.current,
                } as DrefRequestBody);
            } else {
                createDref({
                    ...result.value,
                    modified_at: modifiedAt ?? lastModifiedAtRef.current,
                } as DrefRequestPostBody);
            }
        },
        [validate, setError, updateDref, createDref, drefId],
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

    const nextStep = getNextStep(activeTab, 1, value.type_of_dref);
    const prevStep = getNextStep(activeTab, -1, value.type_of_dref);
    const saveDrefPending = createDrefPending || updateDrefPending;
    const disabled = fetchingDref || saveDrefPending;

    // New DREFs can only be created in English
    const nonEnglishCreate = isNotDefined(drefId) && currentLanguage !== 'en';
    const languageMismatch = isDefined(drefId)
        && isDefined(drefResponse)
        && currentLanguage !== drefResponse?.translation_module_original_language;
    const shouldHideForm = nonEnglishCreate
        || languageMismatch
        || fetchingDref
        || isDefined(drefResponseError);

    return (
        <Tabs
            value={activeTab}
            // NOTE: not using handleTabChange here
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                elementRef={formContentRef}
                className={styles.drefApplicationForm}
                title={strings.formPageTitle}
                heading={strings.formPageHeading}
                description={(
                    <Link
                        href="https://forms.office.com/e/wFQsu0V7Zb"
                        variant="tertiary"
                        external
                        withLinkIcon
                        withUnderline
                    >
                        {strings.drefFeedbackForm}
                    </Link>
                )}
                actions={(
                    <>
                        {isDefined(drefId) && (
                            <>
                                <Button
                                    name={undefined}
                                    onClick={setShowShareModalTrue}
                                    variant="secondary"
                                    icons={<ShareLineIcon />}
                                >
                                    {strings.formShareButtonLabel}
                                </Button>
                                <Button
                                    name={undefined}
                                    onClick={setShowExportModalTrue}
                                    icons={<DownloadTwoLineIcon />}
                                    variant="secondary"
                                >
                                    {strings.formExportLabel}
                                </Button>
                            </>
                        )}
                        <Button
                            name={undefined}
                            onClick={handleFormSubmit}
                            disabled={disabled}
                        >
                            {strings.formSaveButtonLabel}
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
                        {value.type_of_dref !== TYPE_LOAN && (
                            <Tab
                                name="actions"
                                step={3}
                                errored={checkTabErrors(formError, 'actions')}
                            >
                                {strings.formTabActionsLabel}
                            </Tab>
                        )}
                        {value.type_of_dref !== TYPE_LOAN && (
                            <Tab
                                name="operation"
                                step={4}
                                errored={checkTabErrors(formError, 'operation')}
                            >
                                {strings.formTabOperationLabel}
                            </Tab>
                        )}
                        <Tab
                            name="submission"
                            step={value.type_of_dref === TYPE_LOAN ? 3 : 5}
                            errored={checkTabErrors(formError, 'submission')}
                        >
                            {strings.formTabSubmissionLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
            >
                {fetchingDref && (
                    <Message
                        pending
                        title={strings.formLoadingMessage}
                    />
                )}
                {languageMismatch && (
                    <LanguageMismatchMessage
                        title={strings.formEditNotAvailableInSelectedLanguageMessage}
                        originalLanguage={drefResponse.translation_module_original_language}
                    />
                )}
                {nonEnglishCreate && (
                    <NonEnglishFormCreationMessage
                        title={strings.formNotAvailableInNonEnglishMessage}
                    />
                )}
                {isDefined(drefResponseError) && (
                    <FormFailedToLoadMessage
                        title={strings.formLoadErrorTitle}
                        description={drefResponseError.value.messageForNotification}
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
                                districtOptions={districtOptions}
                                setDistrictOptions={setDistrictOptions}
                                fieldReportOptions={fieldReportOptions}
                                setFieldReportOptions={setFieldReportOptions}
                                drefUsers={drefUsers}
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
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
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
                        </div>
                    </>
                )}
                {isTruthyString(drefId) && showObsoletePayloadModal && (
                    <ObsoletePayloadModal
                        drefId={+drefId}
                        onOverwriteButtonClick={handleObsoletePayloadOverwiteButtonClick}
                        onCancelButtonClick={setShowObsoletePayloadModal}
                    />
                )}
                {showShareModal && isDefined(drefId) && (
                    <DrefShareModal
                        onCancel={setShowShareModalFalse}
                        onSuccess={handleUserShareSuccess}
                        drefId={Number(drefId)}
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
