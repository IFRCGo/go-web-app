import {
    type ElementRef,
    useCallback,
    useRef,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    Button,
    Message,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { injectClientId } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import NonEnglishFormCreationMessage from '#components/domain/NonEnglishFormCreationMessage';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import ActionsTab from './ActionsTab';
import {
    checkTabErrors,
    getNextStep,
    type TabKeys,
} from './common';
import ContextTab from './ContextTab';
import FocalPointsTab from './FocalPointsTab';
import schema, {
    type FlashUpdateBody,
    type FlashUpdatePostBody,
    type FormType,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const formContentRef = useRef<ElementRef<'div'>>(null);

    const strings = useTranslation(i18n);
    const { flashUpdateId } = useParams<{ flashUpdateId: string }>();
    const alert = useAlert();
    const { navigate } = useRouting();

    const [activeTab, setActiveTab] = useState<TabKeys>('context');
    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});

    const {
        value,
        error,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(
        schema,
        {
            // FIXME: use function later
            value: {
                country_district: [{
                    client_id: randomString(),
                }],
                actions_taken: [
                    { client_id: randomString(), organization: 'NTLS', actions: [] },
                    { client_id: randomString(), organization: 'PNS', actions: [] },
                    { client_id: randomString(), organization: 'FDRN', actions: [] },
                    { client_id: randomString(), organization: 'GOV', actions: [] },
                ],
            },
        },
    );

    const {
        pending: fetchingFlashUpdate,
        response: flashUpdateResponse,
        error: flashUpdateResponseError,
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
                ...(response.map_files ?? []).map((item) => {
                    if (isDefined(item.file)) {
                        return {
                            id: item.id,
                            file: item.file,
                        };
                    }
                    return undefined;
                }),
                ...(response.graphics_files ?? []).map((item) => {
                    if (isDefined(item.file)) {
                        return {
                            id: item.id,
                            file: item.file,
                        };
                    }
                    return undefined;
                }),
                ...(response.references ?? []).map((item) => (
                    item.document && item.document_details && item.document_details.file ? ({
                        id: item.document,
                        file: item.document_details?.file,
                    }) : undefined
                )),
            ].filter(isDefined);
            setFileIdToUrlMap(
                listToMap(
                    files,
                    (item) => item.id,
                    (item) => item.file,
                ),
            );
            setDistrictOptions(
                response?.country_district?.flatMap((country) => (
                    country.district_details
                )),
            );
        },
    });

    const {
        pending: createSubmitPending,
        trigger: submitRequest,
    } = useLazyRequest({
        url: '/api/v2/flash-update/',
        method: 'POST',
        body: (ctx: FlashUpdatePostBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.flashUpdateFormRedirectMessage,
                { variant: 'success' },
            );
            navigate(
                'flashUpdateFormDetails',
                { params: { flashUpdateId: response.id } },
            );
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                debugMessage,
            } = err;

            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['country_district', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.country_district?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['graphics_files', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.graphics_files?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['map_files', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.map_files?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['references', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.references?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['actions_taken', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.actions_taken?.[index]?.client_id;
                    }
                    return undefined;
                },
            ));
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
        method: 'PATCH',
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
                'flashUpdateFormDetails',
                { params: { flashUpdateId: response.id } },
            );
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                    messageForNotification,
                },
                debugMessage,
            } = err;

            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['country_district', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.country_district?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['graphics_files', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.graphics_files?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['map_files', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.map_files?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['references', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.references?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['actions_taken', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.actions_taken?.[index]?.client_id;
                    }
                    return undefined;
                },
            ));
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

    const handleFormError = useCallback(() => {
        formContentRef.current?.scrollIntoView();
    }, []);

    const handleSubmit = useCallback((data: FormType) => {
        formContentRef.current?.scrollIntoView();
        if (!flashUpdateId) {
            submitRequest(data as FlashUpdatePostBody);
        } else {
            updateSubmitRequest(data as FlashUpdateBody);
        }
    }, [
        updateSubmitRequest,
        flashUpdateId,
        submitRequest,
    ]);

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    const submitPending = createSubmitPending || updateSubmitPending;
    const pending = submitPending || fetchingFlashUpdate;
    const disabled = pending;

    const prevTab = getNextStep(activeTab, -1);
    const nextTab = getNextStep(activeTab, 1);

    const currentLanguage = useCurrentLanguage();

    const nonEnglishCreate = isNotDefined(flashUpdateId) && currentLanguage !== 'en';
    const languageMismatch = isDefined(flashUpdateId)
        && isDefined(flashUpdateResponse)
        && currentLanguage !== flashUpdateResponse?.translation_module_original_language;
    const shouldHideForm = languageMismatch
        || nonEnglishCreate
        || fetchingFlashUpdate
        || isDefined(flashUpdateResponseError);

    // TODO:
    // Handle permission: Only ifrc user should be able do edit this page
    // Check language mismatch

    return (
        <Tabs
            value={activeTab}
            // NOTE: Not using handleTabChange
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                elementRef={formContentRef}
                className={styles.flashUpdateForm}
                title={strings.flashUpdateFormPageTitle}
                heading={strings.flashUpdateFormPageHeading}
                description={strings.flashUpdateFormPageDescription}
                mainSectionClassName={styles.content}
                info={!shouldHideForm && (
                    <TabList className={styles.tabList}>
                        <Tab
                            name="context"
                            step={1}
                            errored={checkTabErrors(error, 'context')}
                        >
                            {strings.flashUpdateTabContextLabel}
                        </Tab>
                        <Tab
                            name="actions"
                            step={2}
                            errored={checkTabErrors(error, 'actions')}
                        >
                            {strings.flashUpdateTabActionLabel}
                        </Tab>
                        <Tab
                            name="focal"
                            step={3}
                            errored={checkTabErrors(error, 'focal')}
                        >
                            {strings.flashUpdateTabFocalLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
            >
                {fetchingFlashUpdate && (
                    <Message
                        pending
                    />
                )}
                {nonEnglishCreate && (
                    <NonEnglishFormCreationMessage />
                )}
                {languageMismatch && (
                    <LanguageMismatchMessage
                        originalLanguage={flashUpdateResponse.translation_module_original_language ?? 'en'}
                    />
                )}
                {isDefined(flashUpdateResponseError) && (
                    <FormFailedToLoadMessage
                        description={flashUpdateResponseError.value.messageForNotification}
                    />
                )}
                {!shouldHideForm && (
                    <>
                        <NonFieldError
                            error={error}
                            withFallbackError
                        />
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
                        <div className={styles.actions}>
                            <div className={styles.pageActions}>
                                <Button
                                    name={prevTab ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(prevTab)}
                                    variant="secondary"
                                >
                                    {strings.flashUpdateBackButtonLabel}
                                </Button>
                                <Button
                                    name={nextTab ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(nextTab)}
                                    variant="secondary"
                                >
                                    {strings.flashUpdateContinueButtonLabel}
                                </Button>
                            </div>
                            <Button
                                name={undefined}
                                onClick={createSubmitHandler(
                                    validate,
                                    setError,
                                    handleSubmit,
                                    handleFormError,
                                )}
                                disabled={activeTab !== 'focal' || submitPending}
                                variant="secondary"
                            >
                                {strings.flashUpdateSubmitButtonLabel}
                            </Button>
                        </div>
                    </>
                )}
            </Page>
        </Tabs>
    );
}

Component.displayName = 'FlashUpdateForm';
