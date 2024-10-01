import {
    Fragment,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    DownloadLineIcon,
    PencilFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateOutput,
    HtmlOutput,
    Image,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import DetailsFailedToLoadMessage from '#components/domain/DetailsFailedToLoadMessage';
import GoBreadcrumbs from '#components/GoBreadcrumbs';
import Link, { type InternalLinkProps } from '#components/Link';
import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';

import FlashUpdateExportModal from './FlashUpdateExportModal';
import FlashUpdateShareModal from './FlashUpdateShareModal';

import i18n from './i18n.json';
import styles from './styles.module.css';

type BreadcrumbsDataType = {
        to: InternalLinkProps['to'];
        label: string;
        urlParams?: Record<string, string | number | null | undefined>;
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { flashUpdateId } = useParams<{ flashUpdateId: string }>();
    const [
        showExportModal,
        {
            setTrue: setShowExportModalTrue,
            setFalse: setShowExportModalFalse,
        },
    ] = useBooleanState(false);

    const [
        showShareModal,
        {
            setTrue: setShowShareModalTrue,
            setFalse: setShowShareModalFalse,
        },
    ] = useBooleanState(false);

    const {
        pending: fetchingFlashUpdate,
        response: flashUpdateResponse,
        error: flashUpdateResponseError,
    } = useRequest({
        skip: isNotDefined(flashUpdateId),
        url: '/api/v2/flash-update/{id}/',
        pathVariables: isNotDefined(flashUpdateId) ? undefined : {
            id: Number(flashUpdateId),
        },
    });

    const definedActions = useMemo(
        () => {
            if (isNotDefined(flashUpdateResponse)
                || isNotDefined(flashUpdateResponse.actions_taken)
            ) {
                return undefined;
            }

            return flashUpdateResponse.actions_taken.map(
                (actionsTaken) => {
                    const {
                        actions,
                        summary,
                    } = actionsTaken;

                    if (
                        (isNotDefined(actions) || actions.length === 0)
                            && isFalsyString(summary)
                    ) {
                        return undefined;
                    }

                    return {
                        ...actionsTaken,
                        actions,
                        summary,
                    };
                },
            ).filter(isDefined);
        },
        [flashUpdateResponse],
    );

    const breadCrumbsData: BreadcrumbsDataType[] = useMemo(() => ([
        {
            to: 'home',
            label: strings.home,
        },
        {
            to: 'emergencies',
            label: strings.emergencies,
        },
        {
            to: 'flashUpdateFormDetails',
            label: flashUpdateResponse?.title ?? '-',
            urlParams: {
                flashUpdateId,
            },
        },
    ]), [
        strings.home,
        strings.emergencies,
        flashUpdateId,
        flashUpdateResponse?.title,
    ]);

    const shouldHideDetails = fetchingFlashUpdate
        || isDefined(flashUpdateResponseError);

    const countryDistricts = flashUpdateResponse?.country_district;

    return (
        <Page
            title={strings.flashUpdateDetailsPageTitle}
            className={styles.flashUpdateDetails}
            heading={flashUpdateResponse?.title ?? strings.flashUpdateDetailsHeading}
            breadCrumbs={(
                <GoBreadcrumbs routeData={breadCrumbsData} />
            )}
            actions={flashUpdateResponse && (
                <>
                    <Button
                        name={undefined}
                        onClick={setShowExportModalTrue}
                        variant="secondary"
                    >
                        {strings.flashUpdateExport}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={setShowShareModalTrue}
                        variant="secondary"
                    >
                        {strings.flashUpdateShare}
                    </Button>
                    <Link
                        className={styles.editLink}
                        to="flashUpdateFormEdit"
                        urlParams={{ flashUpdateId }}
                        icons={<PencilFillIcon />}
                        variant="primary"
                        disabled={shouldHideDetails}
                    >
                        {strings.flashUpdateEdit}
                    </Link>
                </>
            )}
            description={!shouldHideDetails && countryDistricts && countryDistricts.map(
                (country, i) => (
                    <Fragment key={country.country_details.id}>
                        <Link
                            to="countriesLayout"
                            urlParams={{ countryId: country?.country_details.id }}
                            withLinkIcon
                        >
                            {country.country_details.name}
                        </Link>
                        {i !== countryDistricts.length - 1 && ', '}
                    </Fragment>
                ),
            )}
            mainSectionClassName={styles.content}
            contentOriginalLanguage={flashUpdateResponse?.translation_module_original_language}
        >
            {fetchingFlashUpdate && (
                <Message pending />
            )}
            {isDefined(flashUpdateResponseError) && (
                <DetailsFailedToLoadMessage
                    description={flashUpdateResponseError.value.messageForNotification}
                />
            )}
            {!shouldHideDetails && flashUpdateResponse && (
                <>
                    {flashUpdateResponse.situational_overview && (
                        <Container
                            heading={strings.flashUpdateSituationalOverviewHeading}
                            className={styles.contentHeader}
                            withHeaderBorder
                        >
                            <HtmlOutput
                                className={styles.contentHeader}
                                value={flashUpdateResponse.situational_overview}
                            />
                        </Container>
                    )}
                    {flashUpdateResponse.map_files && flashUpdateResponse.map_files.length > 0 && (
                        <Container
                            heading={strings.flashUpdateMapHeading}
                            className={styles.maps}
                            withHeaderBorder
                            contentViewType="grid"
                            numPreferredGridContentColumns={4}
                        >
                            {flashUpdateResponse.map_files.map((item) => (
                                <Image
                                    key={item.id}
                                    imgElementClassName={styles.mapImageElement}
                                    src={item.file}
                                    caption={item.caption}
                                />
                            ))}
                        </Container>
                    )}
                    {flashUpdateResponse.graphics_files
                        && flashUpdateResponse.graphics_files.length > 0
                        && (
                            <Container
                                heading={strings.flashUpdateImagesHeading}
                                className={styles.graphics}
                                withHeaderBorder
                                contentViewType="grid"
                                numPreferredGridContentColumns={4}
                            >
                                {flashUpdateResponse?.graphics_files?.map((item) => (
                                    <Image
                                        key={item.id}
                                        src={item.file}
                                        caption={item.caption}
                                        imgElementClassName={styles.mapImageElement}
                                    />
                                ))}
                            </Container>
                        )}
                    {isDefined(definedActions) && (
                        <Container
                            heading={strings.flashUpdateActionTakenHeading}
                            withHeaderBorder
                            contentViewType="vertical"
                        >
                            {definedActions.map((actionTaken) => (
                                <Container
                                    childrenContainerClassName={styles.actionContent}
                                    heading={actionTaken.organization_display}
                                    headingLevel={4}
                                    spacing="cozy"
                                    key={actionTaken.id}
                                    contentViewType="vertical"
                                >
                                    {isTruthyString(actionTaken.summary) && (
                                        <TextOutput
                                            label={strings.flashUpdateActionDescription}
                                            value={actionTaken.summary}
                                            strongLabel
                                        />
                                    )}
                                    {actionTaken.action_details.length > 0 && (
                                        <Container
                                            heading={strings.flashUpdateActions}
                                            headingLevel={5}
                                            childrenContainerClassName={styles.actionList}
                                            spacing="none"
                                        >
                                            {actionTaken.action_details.map((actionDetail) => (
                                                <div
                                                    key={actionDetail.id}
                                                    className={styles.action}
                                                >
                                                    {actionDetail.name}
                                                </div>
                                            ))}
                                        </Container>
                                    )}
                                </Container>
                            ))}
                        </Container>
                    )}
                    {flashUpdateResponse?.references
                        && flashUpdateResponse.references.length > 0
                        && (
                            <Container
                                className={styles.references}
                                heading={strings.flashUpdateResourcesHeading}
                                withHeaderBorder
                                contentViewType="grid"
                                numPreferredGridContentColumns={3}
                            >
                                {flashUpdateResponse.references.map((reference) => (
                                    <Container
                                        key={reference.id}
                                        className={styles.referenceItem}
                                        heading={reference.source_description}
                                        headerDescription={<DateOutput value={reference.date} />}
                                        headingLevel={4}
                                        withInternalPadding
                                        contentViewType="vertical"
                                    >
                                        {isTruthyString(reference.url) && (
                                            <Link
                                                href={reference.url}
                                                external
                                                withLinkIcon
                                            >
                                                {strings.flashUpdateReference}
                                            </Link>
                                        )}
                                        {reference.document_details?.file && (
                                            <Link
                                                href={reference.document_details.file}
                                                external
                                                icons={<DownloadLineIcon className={styles.icon} />}
                                                variant="secondary"
                                            >
                                                {strings.flashUpdateDownloadDocument}
                                            </Link>
                                        )}
                                    </Container>
                                ))}
                            </Container>
                        )}
                </>
            )}
            {showShareModal && isDefined(flashUpdateId) && (
                <FlashUpdateShareModal
                    onClose={setShowShareModalFalse}
                    id={Number(flashUpdateId)}
                />
            )}
            {showExportModal && isDefined(flashUpdateId) && (
                <FlashUpdateExportModal
                    onClose={setShowExportModalFalse}
                    id={Number(flashUpdateId)}
                />
            )}
        </Page>
    );
}

Component.displayName = 'FlashUpdateDetails';
