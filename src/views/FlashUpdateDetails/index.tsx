import { useContext, useMemo } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { PencilFillIcon } from '@ifrc-go/icons';

import Link from '#components/Link';
import Page from '#components/Page';
import Button from '#components/Button';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
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
        response: flashUpdateResponse,
        pending: flashUpdatePending,
    } = useRequest({
        skip: isNotDefined(flashUpdateId),
        url: '/api/v2/flash-update/{id}/',
        pathVariables: isNotDefined(flashUpdateId) ? undefined : {
            id: Number(flashUpdateId),
        },
    });

    const {
        country: countryRoute,
        flashUpdateFormEdit: flashUpdateFormEditRoute,
    } = useContext(RouteContext);

    const hasActions = useMemo(
        () => flashUpdateResponse?.actions_taken?.map(
            (action) => action?.actions?.length !== 0 || action.summary,
        ),
        [flashUpdateResponse],
    );

    return (
        <Page
            title={strings.flashUpdateDetailsHeading}
            className={styles.flashUpdateDetails}
            heading={flashUpdateResponse?.title}
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
                        to={generatePath(
                            flashUpdateFormEditRoute.absolutePath,
                            { flashUpdateId },
                        )}
                        icons={<PencilFillIcon />}
                        variant="secondary"
                    >
                        {strings.flashUpdateEdit}
                    </Link>
                </>
            )}
            descriptionContainerClassName={styles.pageDescription}
            description={
                (flashUpdateResponse?.country_district?.map((country) => (
                    <Link
                        key={country.country_details.id}
                        to={country?.country_details
                            ? generatePath(
                                countryRoute.absolutePath,
                                {
                                    countryId: country
                                        ?.country_details.id,
                                },
                            ) : undefined}
                    >
                        {country.country_details.name}
                    </Link>
                )))
            }
            withBackgroundColorInMainSection
        >
            {flashUpdatePending && <BlockLoading />}
            {!flashUpdatePending && flashUpdateResponse && (
                <Container childrenContainerClassName={styles.reportDetails}>
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
                                <div
                                    className={styles.mapItem}
                                    key={item.id}
                                >
                                    <img
                                        className={styles.image}
                                        src={item.file}
                                        alt={strings.flashUpdateMapImage}
                                    />
                                    <div className={styles.caption}>
                                        {item.caption}
                                    </div>
                                </div>
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
                                <div
                                    key={item.id}
                                    className={styles.graphicItem}
                                >
                                    <img
                                        className={styles.image}
                                        src={item.file}
                                        alt={strings.flashUpdateFile}
                                    />
                                    <div className={styles.caption}>
                                        {item.caption}
                                    </div>
                                </div>
                            ))}
                        </Container>
                    )}
                    {hasActions && (
                        <Container
                            heading={strings.flashUpdateActionTakenHeading}
                            className={styles.contentHeader}
                            childrenContainerClassName={styles.actionsTaken}
                            withHeaderBorder
                        >
                            {flashUpdateResponse?.actions_taken?.map((actionTaken) => (
                                (actionTaken?.actions?.length !== 0
                                    || isDefined(actionTaken?.summary)) && (
                                    <Container
                                        className={styles.containerWithShadow}
                                        childrenContainerClassName={styles.actionTakenContent}
                                        heading={actionTaken.organization_display}
                                        headingLevel={4}
                                        headerClassName={styles.headerWithBackground}
                                        key={actionTaken.id}
                                        withHeaderBorder
                                    >
                                        {actionTaken.summary && (
                                            <div className={styles.summary}>
                                                <div className={styles.title}>
                                                    {strings.flashUpdateActionDescription}
                                                </div>
                                                <div className={styles.text}>
                                                    {actionTaken.summary}
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.actions}>
                                            <div className={styles.title}>
                                                {strings.flashUpdateActions}
                                            </div>
                                            <div className={styles.list}>
                                                {actionTaken.action_details.map((actionDetail) => (
                                                    <div
                                                        key={actionDetail.id}
                                                        className={styles.action}
                                                    >
                                                        {actionDetail.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Container>
                                )
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
                                    <Link to={reference.url}>
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
                </Container>
            )}
        </Page>
    );
}

Component.displayName = 'FlashUpdateDetails';
