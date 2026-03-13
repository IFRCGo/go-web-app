import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Description,
    KeyFigure,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        pending: fetchingFieldReport,
        response: fieldReportResponse,
    } = useRequest({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    const countries = fieldReportResponse?.countries_details;
    const disasterType = fieldReportResponse?.dtype_details?.name;
    const startDate = fieldReportResponse?.start_date;
    const visibility = fieldReportResponse?.visibility_display;
    const appeal = fieldReportResponse?.appeal;
    const drefRequested = fieldReportResponse?.dref_display;
    const nsRequested = fieldReportResponse?.ns_request_assistance;

    // TODO: Please verify requested assistance is gov req assistance?
    const govRequested = fieldReportResponse?.request_assistance;
    const fieldReportContact = fieldReportResponse?.contacts;

    const groupedContacts = useMemo(
        () => {
            type Contact = Omit<NonNullable<typeof fieldReportContact>[number], 'event'>;
            let contactsToProcess: Contact[] | undefined = fieldReportContact;
            if (!fieldReportContact || fieldReportContact.length <= 0) {
                contactsToProcess = fieldReportContact;
            }
            const grouped = listToGroupList(
                contactsToProcess?.map(
                    (contact) => {
                        if (isNotDefined(contact)) {
                            return undefined;
                        }

                        const { ctype } = contact;
                        if (isNotDefined(ctype)) {
                            return undefined;
                        }

                        return {
                            ...contact,
                            ctype,
                        };
                    },
                ).filter(isDefined) ?? [],
                (contact) => (
                    contact.email.endsWith('ifrc.org')
                        ? strings.contactIFRCLabel
                        : strings.contactNsLabel
                ),
            );
            return grouped;
        },
        [
            strings,
            fieldReportContact,
        ],
    );

    return (
        <TabPage
            pending={fetchingFieldReport}
        >
            {isDefined(fieldReportResponse) && (
                <Container
                    heading={strings.keyFiguresHeading}
                    withHeaderBorder
                >
                    <Container
                        withShadow
                        withBackground
                    >
                        <ListView
                            layout="inline"
                            withSpaceBetweenContents
                            spacing="xl"
                            withBackground
                            withPadding
                        >
                            <KeyFigure
                                label={strings.injuredLabel}
                                value={fieldReportResponse?.other_num_injured}
                                valueType="number"
                            />
                            <KeyFigure
                                label={strings.deadLabel}
                                value={fieldReportResponse?.num_dead}
                                valueType="number"
                            />
                            <KeyFigure
                                label={strings.missingLabel}
                                value={fieldReportResponse?.num_missing}
                                valueType="number"
                            />
                            <KeyFigure
                                label={strings.affectedLabel}
                                value={fieldReportResponse?.num_affected}
                                valueType="number"
                            />
                            <KeyFigure
                                label={strings.displacedLabel}
                                value={fieldReportResponse?.num_displaced}
                                valueType="number"
                            />
                        </ListView>
                    </Container>
                </Container>
            )}
            {isDefined(fieldReportResponse) && (
                <Container
                    heading={strings.emergencyOverviewHeading}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                    >
                        <TextOutput
                            label={strings.countryLabel}
                            value={countries?.map((country) => country.name).join(', ')}
                            strongValue
                        />
                        <TextOutput
                            label={strings.startDateLabel}
                            value={startDate}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            label={strings.governmentRequestLabel}
                            value={govRequested}
                            strongValue
                        />
                        <TextOutput
                            label={strings.disasterTypeLabel}
                            value={disasterType}
                            strongValue
                        />
                        <TextOutput
                            label={strings.drefLabel}
                            value={drefRequested}
                            strongValue
                        />
                        <TextOutput
                            label={strings.nsRequestLabel}
                            value={nsRequested}
                            strongValue
                        />
                        <TextOutput
                            label={strings.visibilityLabel}
                            value={visibility}
                            strongValue
                        />
                        <TextOutput
                            label={strings.emergencyAppealLabel}
                            value={appeal}
                            strongValue
                        />
                    </ListView>
                </Container>
            )}
            {isDefined(groupedContacts) && Object.keys(groupedContacts).length > 0
                && (
                    <Container
                        heading={strings.contactHeading}
                        withHeaderBorder
                    >
                        <ListView layout="block">
                            {/* FIXME: lets not use Object.entries here */}
                            {Object.entries(groupedContacts).map(([contactGroup, contacts]) => (
                                <Container
                                    key={contactGroup}
                                    heading={contactGroup}
                                    headingLevel={5}
                                >
                                    <ListView
                                        layout="grid"
                                        numPreferredGridColumns={4}
                                        spacing="sm"
                                    >
                                        {contacts.map((contact) => (
                                            <Container
                                                key={contact.id}
                                                headingLevel={6}
                                                heading={contact.name}
                                                withPadding
                                                withShadow
                                                withBackground
                                            >
                                                <ListView
                                                    layout="block"
                                                    withSpacingOpticalCorrection
                                                >
                                                    <Description
                                                        textSize="sm"
                                                        withLightText
                                                    >
                                                        {contact.title}
                                                    </Description>
                                                    <ListView
                                                        layout="block"
                                                        spacing="none"
                                                    >
                                                        <Description
                                                            textSize="sm"
                                                            withLightText
                                                        >
                                                            {contact.ctype}
                                                        </Description>
                                                        {isTruthyString(contact.email) && (
                                                            <Link
                                                                href={`mailto:${contact.email}`}
                                                                external
                                                                withLinkIcon
                                                                textSize="sm"
                                                                withEllipsizedContent
                                                            >
                                                                {contact.email}
                                                            </Link>
                                                        )}
                                                        {isTruthyString(contact.phone) && (
                                                            <Link
                                                                href={`tel:${contact.phone}`}
                                                                withLinkIcon
                                                                external
                                                                textSize="sm"
                                                                withEllipsizedContent
                                                            >
                                                                {contact.phone}
                                                            </Link>
                                                        )}
                                                    </ListView>
                                                </ListView>
                                            </Container>
                                        ))}
                                    </ListView>
                                </Container>
                            ))}
                        </ListView>
                    </Container>
                )}
        </TabPage>
    );
}

Component.displayName = 'EmergencyOverview';
