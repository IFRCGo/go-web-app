// TODO: This component has debug UI, and much will be rewritten.
// The same for the CSS file.
// It will be rereviewed fully later.
// The functions/callbacks passed in and calling out are planned to be kept though,
// so those can be reviewed.

import { useState } from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';

import {
    type AllEventsData,
    type EventAdminAreaData,
    type EventOverviewData,
    ExposedItemType,
    type ExposureCategory,
} from '#utils/nrw/nrwMapTypes';

import styles from './styles.module.css';

// Helper to get exposure value by type from the exposure array
function getExposureByType(
    exposure: ExposureCategory[] | undefined,
    type: ExposedItemType,
): ExposureCategory | undefined {
    return exposure?.find((e) => e.type === type);
}

// Helper to get population exposure from admin area
function getExposedPopulation(
    adminArea: EventAdminAreaData | undefined,
): number {
    const popExposure = getExposureByType(
        adminArea?.exposure,
        ExposedItemType.Population,
    );
    return popExposure?.exposed ?? 0;
}

// Format label for exposure type - uses type value with _ID appended if no user-friendly label
// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function getExposureLabel(type: ExposedItemType): string {
    const labels: Record<ExposedItemType, string> = {
        [ExposedItemType.Population]: 'Population',
        [ExposedItemType.Buildings]: 'Buildings',
        [ExposedItemType.Roads]: 'Roads',
        [ExposedItemType.Schools]: 'Schools',
        [ExposedItemType.Clinics]: 'Health Clinics',
    };
    return labels[type] ?? `${type}_ID`;
}

interface EventButtonProps {
  event: EventOverviewData;
  onEventClick: (eventId: string) => void;
}

interface EventDetailViewProps {
  event: EventOverviewData;
  onBack: () => void;
}

/**
 * Formats event start time for display.
 */
// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function formatStartDate(startTime: string): string {
    const start = new Date(startTime);
    return start.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

/**
 * Formats peak reached time for display.
 */
// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function formatPeakTime(peakTime: string): string {
    const peak = new Date(peakTime);
    return peak.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

/**
 * Formats date for footer display.
 */
// TODO: Get correct string formatting for locale, pending design.
function formatFooterDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

/**
 * Collapsible section component.
 * NOTE: this is generic enough to move into its own component.
 * If there is not a GO component already, and if the UI mock ups still need this, do so.
 */
function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={styles.collapsibleSection}>
            <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.sectionHeaderLeft}>
                    <span>{title}</span>
                </span>
                {isOpen ? <ChevronUpLineIcon /> : <ChevronDownLineIcon />}
            </button>
            {isOpen && <div className={styles.sectionContent}>{children}</div>}
        </div>
    );
}

/**
 * Detail view for a selected event
 */
function EventDetailView({ event, onBack }: EventDetailViewProps) {
    // Get admin data at different levels
    // TODO: support multiple max admin levels
    // See task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41768
    const admin0 = event.exposedAdminAreas[0]?.[0];
    const admin1Regions = event.exposedAdminAreas[1] ?? [];
    const admin3Regions = event.exposedAdminAreas[3] ?? [];

    const totalPopulation = getExposedPopulation(admin0);
    const exposedDistrictsCount = admin3Regions.length;

    // Get exposure categories for infrastructure (exclude population)
    const infraExposure = admin0?.exposure.filter(
        (e) => e.type !== ExposedItemType.Population,
    ) ?? [];

    return (
        <div className={styles.eventDetailView}>
            {/* Back Button */}
            <button type="button" className={styles.backButton} onClick={onBack}>
                &larr; Back
            </button>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerTitle}>{event.eventName}</span>
                </div>
                <span className={styles.severityBadge}>{event.alertClass}</span>
            </div>

            {/* Event Info */}
            <div className={styles.eventInfo}>
                <div className={styles.infoRow}>
                    <span>
                        Started on:
                        {formatStartDate(event.startTime)}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span>
                        Reach high threshold:
                        {' '}
                        {formatPeakTime(event.reachesPeakAlertClassTime)}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span>{admin1Regions.map((r) => r.name).join(', ') || 'N/A'}</span>
                </div>
            </div>

            {/* Population Exposure Section */}
            <CollapsibleSection title="Population Exposure" defaultOpen>
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Exposed Districts</span>
                        <span className={styles.statValue}>{exposedDistrictsCount}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total People Exposed</span>
                        <span className={styles.statValue}>
                            {totalPopulation.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* District Table */}
                <div className={styles.districtTable}>
                    <div className={styles.districtTableHeader}>
                        <span>District name</span>
                        <span>Exposed Population</span>
                    </div>
                    {admin3Regions.map((district) => (
                        <div key={district.placeCode} className={styles.districtTableRow}>
                            <span>{district.name}</span>
                            <span>{getExposedPopulation(district).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* Infrastructure Exposure Section */}
            {infraExposure.length > 0 && (
                <CollapsibleSection title="Infrastructure Exposure">
                    <div className={styles.infraGrid}>
                        {infraExposure.map((item) => (
                            <div key={item.type} className={styles.infraItem}>
                                <span className={styles.infraLabel}>
                                    Exposed
                                    {' '}
                                    {getExposureLabel(item.type)}
                                </span>
                                <span className={styles.infraValue}>
                                    {item.exposed.toLocaleString()}
                                    {item.unit ? ` ${item.unit}` : ''}
                                    {' '}
                                    /
                                    {' '}
                                    {item.total.toLocaleString()}
                                    {item.unit ? ` ${item.unit}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Data Sources Section */}
            <CollapsibleSection title="Data Sources">
                {event.dataSources.map((source, index) => (
                    <div key={source} className={styles.sourceItem}>
                        <span className={styles.sourceLabel}>
                            {index === 0 ? 'Forecast Source' : 'Data Source'}
                            :
                            {source}
                        </span>
                    </div>
                ))}
            </CollapsibleSection>

            {/* Footer */}
            <div className={styles.footer}>
                Event created on:
                {' '}
                {formatFooterDate(event.firstIssuedAt)}
                . Last updated
                on:
                {formatFooterDate(event.lastUpdatedAt)}
            </div>
        </div>
    );
}

/**
 * Formats the start time relative to now.
 */
// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function formatStartTime(startTime: string): string {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();

    if (diffMs <= 0) {
        return 'Ongoing';
    }

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `Starts in ${rtf.format(diffDays, 'day')}`;
    }
    return `Starts in ${rtf.format(diffHours, 'hour')}`;
}

/**
 * Displays a single event with its affected regions and population.
 */
function EventButton({ event, onEventClick }: EventButtonProps) {
    // Get admin0 (country level) for total population
    const admin0 = event.exposedAdminAreas[0]?.[0];
    const totalPopulation = getExposedPopulation(admin0);

    // Get admin1 regions for affected areas
    const admin1Regions = event.exposedAdminAreas[1] ?? [];

    // Get admin3 count for exposed districts
    const admin3Regions = event.exposedAdminAreas[3] ?? [];
    const exposedDistrictsCount = admin3Regions.length;

    const startTimeLabel = formatStartTime(event.startTime);

    return (
        <div className={styles.eventCard}>
            <div className={styles.eventTitle}>{event.eventName}</div>
            <div className={styles.eventAlert}>{event.alertClass}</div>
            <div className={styles.eventDetails}>
                <div>{startTimeLabel}</div>
                <div>
                    Population:
                    {totalPopulation.toLocaleString()}
                </div>
                <div>
                    Exposed districts:
                    {exposedDistrictsCount}
                </div>
                <div>
                    Affected regions:
                    <ul className={styles.regionList}>
                        {admin1Regions.map((region) => (
                            <li key={region.placeCode}>{region.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <Button name={event.eventId} onClick={() => onEventClick(event.eventId)}>
                View event &gt;
            </Button>
        </div>
    );
}

interface NrwControlPanelProps {
  eventData: AllEventsData;
  activeEventId: string | null;
  onEventClick: (eventId: string) => void;
  onRefreshAll: () => void;
  onDeselectEvent: () => void;
  countryCode: string;
  selectedAdminPlaceCode: string | null;
}

/**
 * Control panel showing upcoming events for the selected country.
 * Each event displays affected admin1 regions and total population.
 */
export default function NrwControlPanel({
    eventData,
    activeEventId,
    onEventClick,
    onRefreshAll,
    onDeselectEvent,
    countryCode,
    selectedAdminPlaceCode,
}: NrwControlPanelProps) {
    const events = Object.values(eventData);
    const selectedEvent = activeEventId ? eventData[activeEventId] : null;

    const handleBack = () => {
        onDeselectEvent();
    };

    if (selectedAdminPlaceCode) {
    // TODO: change the view based on this
        console.debug(
            `TODO: [NrwControlPanel] Selected admin area: ${selectedAdminPlaceCode}`,
        );
    }

    // Show detail view if an event is selected
    if (selectedEvent) {
        return (
            <div className={styles.dataContainer}>
                <EventDetailView event={selectedEvent} onBack={handleBack} />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className={styles.dataContainer}>
                <p>
                    No upcoming events for
                    {countryCode}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.dataContainer}>
            <div className={styles.headerRow}>
                <h3>
                    Upcoming Events (
                    {countryCode}
                    )
                </h3>
                <Button name="refresh-all" onClick={onRefreshAll}>
                    Refresh All
                </Button>
            </div>
            {events.map((event) => (
                <EventButton
                    key={event.eventId}
                    event={event}
                    onEventClick={onEventClick}
                />
            ))}
        </div>
    );
}
