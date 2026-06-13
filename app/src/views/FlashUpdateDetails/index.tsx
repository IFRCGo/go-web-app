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
    Breadcrumbs,
    Button,
    Container,
    DateOutput,
    HtmlOutput,
    Image,
    Label,
    ListView,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import DetailsFailedToLoadMessage from '#components/domain/DetailsFailedToLoadMessage';
import Link from '#components/Link';
import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';

import FlashUpdateExportModal from './FlashUpdateExportModal';
import FlashUpdateShareModal from './FlashUpdateShareModal';

import i18n from './i18n.json';

/** @knipignore */
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

    const shouldHideDetails = fetchingFlashUpdate
        || isDefined(flashUpdateResponseError);

    const countryDistricts = flashUpdateResponse?.country_district;

    const pageTitle = (isDefined(flashUpdateResponse) && isDefined(flashUpdateResponse.title))
        ? resolveToString(
            strings.flashUpdateDetailsPageTitle,
            { flashUpdateName: flashUpdateResponse?.title },
        ) : strings.flashUpdatePageTitleFallback;

    return (
        <Page
            title={pageTitle}
            heading={flashUpdateResponse?.title ?? strings.flashUpdateDetailsHeading}
            breadCrumbs={(
                <Breadcrumbs>
                    <Link
                        to="home"
                    >
                        {strings.home}
                    </Link>
                    <Link
                        to="emergencies"
                    >
                        {strings.emergencies}
                    </Link>
                    <Link
                        to="flashUpdateFormDetails"
                        urlParams={{ flashUpdateId }}
                    >
                        {flashUpdateResponse?.title}
                    </Link>
                </Breadcrumbs>
            )}
            actions={flashUpdateResponse && (
                <>
                    <Button
                        name={undefined}
                        onClick={setShowExportModalTrue}
                    >
                        {strings.flashUpdateExport}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={setShowShareModalTrue}
                    >
                        {strings.flashUpdateShare}
                    </Button>
                    <Link
                        to="flashUpdateFormEdit"
                        urlParams={{ flashUpdateId }}
                        before={<PencilFillIcon />}
                        colorVariant="primary"
                        styleVariant="filled"
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
                            withHeaderBorder
                        >
                            <HtmlOutput
                                value={flashUpdateResponse.situational_overview}
                            />
                        </Container>
                    )}
                    {flashUpdateResponse.map_files && flashUpdateResponse.map_files.length > 0 && (
                        <Container
                            heading={strings.flashUpdateMapHeading}
                            withHeaderBorder
                        >
                            <ListView
                                layout="grid"
                                numPreferredGridColumns={4}
                            >
                                {flashUpdateResponse.map_files.map((item) => (
                                    <Image
                                        key={item.id}
                                        src={item.file}
                                        size="md"
                                    />
                                ))}
                            </ListView>
                        </Container>
                    )}
                    {flashUpdateResponse.graphics_files
                        && flashUpdateResponse.graphics_files.length > 0
                        && (
                            <Container
                                heading={strings.flashUpdateImagesHeading}
                                withHeaderBorder
                            >
                                <ListView
                                    layout="grid"
                                    numPreferredGridColumns={4}
                                >
                                    {flashUpdateResponse?.graphics_files?.map((item) => (
                                        <Image
                                            key={item.id}
                                            src={item.file}
                                            caption={item.caption}
                                            size="md"
                                        />
                                    ))}
                                </ListView>
                            </Container>
                        )}
                    {isDefined(definedActions) && (
                        <Container
                            heading={strings.flashUpdateActionTakenHeading}
                            withHeaderBorder
                        >
                            <ListView layout="block">
                                {definedActions.map((actionTaken) => (
                                    <Container
                                        heading={actionTaken.organization_display}
                                        headingLevel={4}
                                        key={actionTaken.id}
                                    >
                                        <ListView layout="block">
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
                                                    spacing="none"
                                                >
                                                    <ListView withWrap>
                                                        {actionTaken.action_details.map(
                                                            (actionDetail) => (
                                                                <Label key={actionDetail.id}>
                                                                    {actionDetail.name}
                                                                </Label>
                                                            ),
                                                        )}
                                                    </ListView>
                                                </Container>
                                            )}
                                        </ListView>
                                    </Container>
                                ))}
                            </ListView>
                        </Container>
                    )}
                    {flashUpdateResponse?.references
                        && flashUpdateResponse.references.length > 0
                        && (
                            <Container
                                heading={strings.flashUpdateResourcesHeading}
                                withHeaderBorder
                            >
                                <ListView
                                    layout="grid"
                                    numPreferredGridColumns={3}
                                >
                                    {flashUpdateResponse.references.map((reference) => (
                                        <Container
                                            key={reference.id}
                                            heading={reference.source_description}
                                            headerDescription={(
                                                <DateOutput value={reference.date} />
                                            )}
                                            headingLevel={4}
                                            withPadding
                                            backgroundColor="foreground"
                                            boxShadow="md"
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
                                                    before={(
                                                        <DownloadLineIcon />
                                                    )}
                                                    styleVariant="outline"
                                                >
                                                    {strings.flashUpdateDownloadDocument}
                                                </Link>
                                            )}
                                        </Container>
                                    ))}
                                </ListView>
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
