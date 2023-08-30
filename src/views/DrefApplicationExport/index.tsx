import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isFalsyString } from '@togglecorp/fujs';

import Container from '#components/Container';
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import { useRequest } from '#utils/restRequest';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { drefId } = useParams<{ drefId: string }>();
    const [previewReady, setPreviewReady] = useState(false);

    const {
        // pending: fetchingDref,
        response: drefResponse,
    } = useRequest({
        skip: isFalsyString(drefId),
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(drefId) ? {
            id: drefId,
        } : undefined,
        onSuccess: () => {
            async function waitForImages() {
                const images = document.querySelectorAll('img');
                const promises = Array.from(images).map(
                    (image) => (
                        new Promise((accept) => {
                            image.addEventListener('load', () => {
                                accept(true);
                            });
                        })
                    ),
                );

                await Promise.all(promises);
                setPreviewReady(true);
            }

            waitForImages();
        },
    });

    return (
        <div className={styles.drefApplicationExport}>
            <Header
                heading="DREF Application"
                headingLevel={1}
            >
                {drefResponse?.title}
            </Header>
            {drefResponse?.cover_image_file && (
                <figure className={styles.cover}>
                    <img
                        className={styles.image}
                        alt=""
                        src={drefResponse.cover_image_file.file}
                    />
                    <figcaption className={styles.caption}>
                        {drefResponse.cover_image_file.caption}
                    </figcaption>
                </figure>
            )}
            <div className={styles.metaSection}>
                <TextOutput
                    label="Appeal"
                    value={drefResponse?.appeal_code}
                    strongValue
                />
                <TextOutput
                    label="Country"
                    value={drefResponse?.country}
                    strongValue
                />
                <TextOutput
                    label="Hazard"
                    value={drefResponse?.disaster_type_details?.name}
                    strongValue
                />
                <TextOutput
                    label="Type of DREF"
                    value={drefResponse?.type_of_dref_display}
                    strongValue
                />
                <TextOutput
                    label="Crisis Category"
                    value={drefResponse?.disaster_category_display}
                    strongValue
                />
                <TextOutput
                    label="Event Onset"
                    value={drefResponse?.type_of_onset_display}
                    strongValue
                />
                <TextOutput
                    className={styles.budget}
                    label="DREF Allocation"
                    value={drefResponse?.amount_requested}
                    valueType="number"
                    prefix="CHF "
                    strongValue
                />
                <TextOutput
                    label="Glide Number"
                    value={drefResponse?.glide_code}
                    strongValue
                />
                <TextOutput
                    label="People Affected"
                    value={drefResponse?.num_affected}
                    valueType="number"
                    suffix=" People"
                    strongValue
                />
                <TextOutput
                    label="People Targeted"
                    value={drefResponse?.total_targeted_population}
                    suffix=" People"
                    strongValue
                />
                {/* TODO: add other details */}
            </div>
            <Container
                heading="Description of the Event"
                className={styles.eventDescriptionSection}
                headingLevel={1}
                childrenContainerClassName={styles.content}
            >
                {drefResponse?.event_map_file && (
                    <figure className={styles.eventMap}>
                        <img
                            className={styles.image}
                            alt=""
                            src={drefResponse.event_map_file.file}
                        />
                        <figcaption className={styles.caption}>
                            {drefResponse.event_map_file.caption}
                        </figcaption>
                    </figure>
                )}
                <Container
                    heading="What happened, where and when?"
                    childrenContainerClassName={styles.descriptionText}
                    spacing="compact"
                >
                    {drefResponse?.event_description}
                </Container>
                <Container
                    heading="Scope and Scale"
                    childrenContainerClassName={styles.descriptionText}
                    spacing="compact"
                >
                    {drefResponse?.event_scope}
                </Container>
            </Container>
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}
