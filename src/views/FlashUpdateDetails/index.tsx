import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { PencilFillIcon } from '@ifrc-go/icons';

import Link from '#components/Link';
import Page from '#components/Page';
import Button from '#components/Button';
import Container from '#components/Container';
import Image from '#components/Image';
import Message from '#components/Message';
import DetailsFailedToLoadMessage from '#components/domain/DetailsFailedToLoadMessage';
import TextOutput from '#components/TextOutput';
import DateOutput from '#components/DateOutput';
import HtmlOutput from '#components/HtmlOutput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { flashUpdateId } = useParams<{ flashUpdateId: string }>();

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

    return (
        <Page
            title={strings.flashUpdateDetailsPageTitle}
            className={styles.flashUpdateDetails}
            heading={flashUpdateResponse?.title ?? strings.flashUpdateDetailsHeading}
            actions={flashUpdateResponse && (
                <>
                    <Button
                        name="export"
                    >
                        {strings.flashUpdateExport}
                    </Button>
                    <Button
                        name="share"
                    >
                        {strings.flashUpdateShare}
                    </Button>
                    <Link
                        className={styles.editLink}
                        to="flashUpdateFormEdit"
                        urlParams={{ flashUpdateId }}
                        icons={<PencilFillIcon />}
                        variant="secondary"
                        disabled={shouldHideDetails}
                    >
                        {strings.flashUpdateEdit}
                    </Link>
                </>
            )}
            description={!shouldHideDetails && countryDistricts && countryDistricts.map(
                (country, i) => (
                    <>
                        <Link
                            key={country.country_details.id}
                            to="countriesLayout"
                            urlParams={{ countryId: country?.country_details.id }}
                        >
                            {country.country_details.name}
                        </Link>
                        {i !== countryDistricts.length - 1 && ', '}
                    </>
                ),
            )}
            mainSectionClassName={styles.content}
        >
            {fetchingFlashUpdate && (
                <Message
                    pending
                />
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
                            className={styles.contentHeader}
                            childrenContainerClassName={styles.maps}
                            withHeaderBorder
                        >
                            {flashUpdateResponse.map_files.map((item) => (
                                <Image
                                    key={item.id}
                                    src={item.file}
                                    caption={item.caption}
                                />
                            ))}
                        </Container>
                    )}
                    {flashUpdateResponse.graphics_files
                        && flashUpdateResponse.graphics_files.length > 0 && (
                        <Container
                            heading={strings.flashUpdateImagesHeading}
                            className={styles.contentHeader}
                            childrenContainerClassName={styles.graphics}
                            withHeaderBorder
                        >
                            {flashUpdateResponse?.graphics_files?.map((item) => (
                                <Image
                                    key={item.id}
                                    src={item.file}
                                    caption={item.caption}
                                />
                            ))}
                        </Container>
                    )}
                    {isDefined(definedActions) && (
                        <Container
                            heading={strings.flashUpdateActionTakenHeading}
                            childrenContainerClassName={styles.actionsTakenContent}
                            withHeaderBorder
                        >
                            {definedActions.map((actionTaken) => (
                                <Container
                                    childrenContainerClassName={styles.actionContent}
                                    heading={actionTaken.organization_display}
                                    headingLevel={4}
                                    key={actionTaken.id}
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
                                            spacing="condensed"
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
                        && flashUpdateResponse.references.length > 0 && (
                        <Container
                            className={styles.contentHeader}
                            heading={strings.flashUpdateResourcesHeading}
                            withHeaderBorder
                        >
                            {flashUpdateResponse.references.map((reference) => (
                                <div
                                    className={styles.reference}
                                    key={reference.id}
                                >
                                    <div className={styles.date}>
                                        <DateOutput value={reference.date} />
                                    </div>
                                    <div className={styles.description}>
                                        {reference.source_description}
                                    </div>
                                    <Link
                                        to={reference.url}
                                        external
                                    >
                                        {reference.url}
                                    </Link>
                                    {reference.document_details?.file ? (
                                        <Button
                                            variant="secondary"
                                            className={styles.downloadLink}
                                            name={undefined}
                                        >
                                            {strings.flashUpdateDownloadDocument}
                                        </Button>
                                    ) : (
                                        <div className={styles.notDownloadLink} />
                                    )}
                                </div>
                            ))}
                        </Container>
                    )}
                </>
            )}
        </Page>
    );
}

Component.displayName = 'FlashUpdateDetails';
