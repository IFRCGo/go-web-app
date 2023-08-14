import { useContext } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { PencilFillIcon } from '@ifrc-go/icons';

import Link from '#components/Link';
import Page from '#components/Page';
import Button from '#components/Button';
import TextOutput from '#components/TextOutput';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import DateOutput from '#components/DateOutput';
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
        url: `/api/v2/flash-update/{id}/`,
        pathVariables: {
            id: Number(flashUpdateId),
        },
    });

    const {
        country: countryRoute,
    } = useContext(RouteContext);

    const hasActions = flashUpdateResponse?.actions_taken?.some(
        (at) => (at?.actions?.length !== 0 || at.summary)
    );

    return (
        <Page
            title={strings.flashUpdateDetailsHeading}
            className={styles.fieldReportDetails}
            heading={flashUpdateResponse?.title}
            actions={flashUpdateResponse && (
                <>
                    <Button
                        name="Export"
                    >
                        Export
                    </Button>
                    <Button
                        name="Share"
                    >
                        Share
                    </Button>
                    <Button
                        name="Edit"
                    >
                        <Link
                            variant="secondary"
                            icons={<PencilFillIcon />
                            }
                        >
                            Edit
                        </Link>
                    </Button>
                </>
            )}
            descriptionContainerClassName={styles.description}
            description={
                (flashUpdateResponse?.country_district?.map((country) => (
                    <Link
                        to={country?.country_details
                            ? generatePath(
                                countryRoute.absolutePath,
                                {
                                    countryId: country
                                        ?.country_details.id,
                                },
                            ) : undefined}
                    >
                        {flashUpdateResponse?.country_district?.map(
                            (country) => country.country_details?.name
                        )}
                    </Link>
                )))
            }
            mainSectionClassName={styles.content}
        >
            {flashUpdatePending && <BlockLoading />}
            {!flashUpdatePending && flashUpdateResponse && (
                <Container
                    childrenContainerClassName={styles.reportDetails}
                >
                    {flashUpdateResponse.situational_overview && (
                        <Container
                            heading="Situational Overview"
                            className={styles.overviewContent}
                            withHeaderBorder
                        >
                            <TextOutput
                                value={flashUpdateResponse.situational_overview}
                            />
                        </Container>
                    )}
                    {flashUpdateResponse.map_files && flashUpdateResponse.map_files.length > 0 && (
                        <Container
                            heading="Map"
                            childrenContainerClassName={styles.maps}
                        >
                            {flashUpdateResponse.map_files.map((item) => (
                                <div
                                    className={styles.mapItem}
                                    key={item.id}
                                >
                                    <img
                                        className={styles.image}
                                        src={item.file}
                                        alt=""
                                    />
                                    <div className={styles.caption}>
                                        {item.caption}
                                    </div>
                                </div>
                            ))}
                        </Container>
                    )}
                    {flashUpdateResponse.graphics_files && flashUpdateResponse.graphics_files.length > 0 && (
                        <Container
                            heading="Image"
                            childrenContainerClassName={styles.graphics}
                        >
                            {flashUpdateResponse?.graphics_files?.map((item) => (
                                <div
                                    key={item.id}
                                    className={styles.graphicItem}
                                >
                                    <img
                                        className={styles.image}
                                        src={item.file}
                                        alt=""
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
                            heading="Action Taken"
                            childrenContainerClassName={styles.actionsTaken}
                        >
                            {flashUpdateResponse?.actions_taken?.map((at) => (
                                (at?.actions?.length !== 0 || isDefined(at?.summary)) && (
                                    <Container
                                        className={styles.containerWithShadow}
                                        heading={at.organization_display}
                                        headingLevel={4}
                                        childrenContainerClassName={styles.actionTakenContent}
                                        key={at.id}
                                        headerClassName={styles.headerWithBackground}
                                    >
                                        {at.summary && (
                                            <div className={styles.summary}>
                                                <div className={styles.title}>
                                                    Description
                                                </div>
                                                <div className={styles.text}>
                                                    {at.summary}
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.actions}>
                                            <div className={styles.title}>
                                                Actions
                                            </div>
                                            <div className={styles.list}>
                                                {at.action_details.map((ad) => (
                                                    <div
                                                        key={ad.id}
                                                        className={styles.action}
                                                    >
                                                        {ad.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Container>
                                )
                            ))}
                        </Container>
                    )}
                    {flashUpdateResponse?.references && flashUpdateResponse.references.length > 0 && (
                        <Container
                            heading="Resource Title"
                        >
                            {flashUpdateResponse.references.map((r) => (
                                <div
                                    className={styles.reference}
                                    key={r.id}
                                >
                                    <div className={styles.date}>
                                        <DateOutput value={r.date} />
                                    </div>
                                    <div className={styles.description}>
                                        {r.source_description}
                                    </div>
                                    <a
                                        target="_blank"
                                        href={r.url}
                                        className={styles.url}
                                    >
                                        {r.url}
                                    </a>
                                    {r.document_details?.file ? (
                                        <Button
                                            variant="secondary"
                                            className={styles.downloadLink}
                                            name={undefined}                                        >
                                            Download document
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
            {/* {flashUpdateResponse?.situational_overview && (
                <Container
                    heading="Situational Overview"
                >
                    <TextOutput
                        className={styles.overviewContent}
                        value={flashUpdateResponse?.situational_overview}
                    />
                </Container>
            )} */}
        </Page>
    );
}

Component.displayName = 'FlashUpdateDetails';
