import { Outlet, useParams } from 'react-router-dom';
import { useMemo, useRef } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import Page from '#components/Page';
import Link from '#components/Link';
import NonEnglishFormCreationMessage from '#components/domain/NonEnglishFormCreationMessage';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import useTranslation from '#hooks/useTranslation';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import { useRequest } from '#utils/restRequest';

import {
    getCurrentPerProcessStep,
    PER_PHASE_WORKPLAN,
    PER_PHASE_PRIORITIZATION,
    PER_PHASE_ASSESSMENT,
    PER_PHASE_OVERVIEW,
} from '#utils/domain/per';
import { type PerProcessOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { perId } = useParams<{ perId: string }>();
    const currentLanguage = useCurrentLanguage();

    const {
        pending: fetchingStatus,
        response: statusResponse,
        retrigger: refetchStatusResponse,
        error: statusResponseError,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-process-status/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });

    const currentStep = statusResponse?.phase
        ?? getCurrentPerProcessStep(statusResponse)
        ?? PER_PHASE_OVERVIEW;

    const actionDivRef = useRef<HTMLDivElement>(null);
    const outletContext: PerProcessOutletContext = useMemo(
        () => ({
            fetchingStatus,
            statusResponse,
            refetchStatusResponse,
            actionDivRef,
        }),
        [fetchingStatus, statusResponse, refetchStatusResponse, actionDivRef],
    );

    // TODO: Use content language from server if applicable
    // const contentOriginalLanguage = perOverviewResponse
    //     ?.translation_module_original_language ?? 'en';
    const contentOriginalLanguage = 'en';
    const nonEnglishCreate = isNotDefined(perId) && currentLanguage !== 'en';
    const languageMismatch = isDefined(perId)
        && currentLanguage !== contentOriginalLanguage;

    const shouldHideForm = languageMismatch
        || nonEnglishCreate
        || isDefined(statusResponseError);

    return (
        <Page
            className={styles.perProcessForm}
            title={strings.perFormTitle}
            heading={strings.perFormHeading}
            description={strings.perFormProcessDescription}
            actions={(
                <>
                    <Link
                        to="accountPerForms"
                        variant="secondary"
                    >
                        {strings.perProcessBackButtonLabel}
                    </Link>
                    <div ref={actionDivRef} />
                </>
            )}
            withBackgroundColorInMainSection
            info={!shouldHideForm && (
                <NavigationTabList
                    className={styles.tabList}
                    variant="step"
                >
                    <NavigationTab
                        stepCompleted={currentStep > PER_PHASE_OVERVIEW}
                        to={isDefined(perId) ? 'perOverviewForm' : 'newPerOverviewForm'}
                        urlParams={isDefined(perId) ? { perId } : undefined}
                    >
                        {strings.perFormTabOverviewLabel}
                    </NavigationTab>
                    <NavigationTab
                        stepCompleted={currentStep > PER_PHASE_ASSESSMENT}
                        to={isDefined(perId) && currentStep >= PER_PHASE_ASSESSMENT
                            ? 'perAssessmentForm'
                            : undefined}
                        urlParams={isDefined(perId) ? { perId } : undefined}
                    >
                        {strings.perFormTabAssessmentLabel}
                    </NavigationTab>
                    <NavigationTab
                        stepCompleted={currentStep > PER_PHASE_PRIORITIZATION}
                        to={isDefined(perId) && currentStep >= PER_PHASE_PRIORITIZATION
                            ? 'perPrioritizationForm'
                            : undefined}
                        urlParams={isDefined(perId) ? { perId } : undefined}
                    >
                        {strings.perFormTabPrioritizationLabel}
                    </NavigationTab>
                    <NavigationTab
                        stepCompleted={currentStep > PER_PHASE_WORKPLAN}
                        to={isDefined(perId) && currentStep >= PER_PHASE_WORKPLAN
                            ? 'perWorkPlanForm'
                            : undefined}
                        urlParams={isDefined(perId) ? { perId } : undefined}
                    >
                        {strings.perFormTabWorkPlanLabel}
                    </NavigationTab>
                </NavigationTabList>
            )}
        >
            {nonEnglishCreate && (
                <NonEnglishFormCreationMessage />
            )}
            {languageMismatch && (
                <LanguageMismatchMessage
                    originalLanguage={contentOriginalLanguage}
                />
            )}
            {isDefined(statusResponseError) && (
                <FormFailedToLoadMessage
                    description={statusResponseError.value.messageForNotification}
                />
            )}
            {!shouldHideForm && (
                <Outlet context={outletContext} />
            )}
        </Page>
    );
}

Component.displayName = 'PerProcessForm';
