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

import { type AdminAreaDetails } from '#utils/nrw/nrwDataFetchHelpers';
import { alertColors } from '#utils/nrw/nrwMapStyles';
import {
    type AdminAreaExposureDto,
    type EventResponseDto,
    type ExposedAdminAreaDto,
} from '#utils/nrw/shared-dtos';
import { LayerName } from '#utils/nrw/shared-enums';

import styles from './styles.module.css';

// Helper to group the flat list of exposed admin areas into a
// [adminLevel][items] structure, which is easier to parse in this component.
function groupAdminAreasByLevel(
    areas: ExposedAdminAreaDto[],
): ExposedAdminAreaDto[][] {
    const grouped: ExposedAdminAreaDto[][] = [];
    areas.forEach((area) => {
        if (area) {
            if (!grouped[area.adminLevel]) {
                grouped[area.adminLevel] = [];
            }
            grouped[area.adminLevel]?.push(area);
        }
    });
    return grouped;
}

// Helper to get exposure value by type from the exposure array
function getExposureByLayerName(
    exposure: AdminAreaExposureDto[] | undefined,
    layerName: LayerName,
): AdminAreaExposureDto | undefined {
    return exposure?.find((e) => e.layerName === layerName);
}

// Helper to get population exposure from admin area
function getExposedPopulation(
    adminArea: ExposedAdminAreaDto | undefined,
): number {
    const popExposure = getExposureByLayerName(
        adminArea?.exposure,
        LayerName.populationExposed,
    );
    return popExposure?.exposed ?? 0;
}

// Format label for exposure type - uses type value with _ID appended if no user-friendly label
// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function getExposureLabel(layer: LayerName): string {
    const labels: Partial<Record<LayerName, string>> = {
        [LayerName.populationExposed]: 'Population',
    };
    return labels[layer] ?? `${layer}_ID`;
}

interface EventButtonProps {
  event: EventResponseDto;
  onEventClick: (eventId: number) => void;
}

interface EventDetailViewProps {
  event: EventResponseDto;
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
    const adminAreasByLevel = groupAdminAreasByLevel(event.exposedAdminAreas);
    const admin0 = adminAreasByLevel[0]?.[0];
    const admin1Areas = adminAreasByLevel[1] ?? [];
    // TODO: fix this based on design. Note: admin 2 is missing
    const admin3Areas = adminAreasByLevel[3] ?? [];

    const totalPopulation = getExposedPopulation(admin0);
    const exposedDistrictsCount = admin3Areas.length;

    // Get exposure categories for infrastructure (exclude population)
    const infraExposure = admin0?.exposure.filter(
        (e) => e.layerName !== LayerName.populationExposed,
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
                    <span className={styles.headerTitle}>{event.eventLabel}</span>
                </div>
                <span
                    className={styles.alertClassBadge}
                    style={{
                        color: alertColors[event.alertClass][4],
                        backgroundColor: alertColors[event.alertClass][0],
                    }}
                >
                    {event.alertClass}
                </span>
            </div>

            {/* Event Info */}
            <div className={styles.eventInfo}>
                <div className={styles.infoRow}>
                    <span>
                        Started on:
                        {formatStartDate(event.startAt)}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span>
                        Reach high threshold:
                        {' '}
                        {formatPeakTime(event.reachesPeakAlertClassAt)}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span>{admin1Areas.map((r) => r.name).join(', ') || 'N/A'}</span>
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
                    {admin3Areas.map((district) => (
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
                            <div
                                key={`${item.layerName}-${item.exposed}-${item.total ?? 'null'}`}
                                className={styles.infraItem}
                            >
                                <span className={styles.infraLabel}>
                                    Exposed
                                    {' '}
                                    {getExposureLabel(item.layerName)}
                                </span>
                                <span className={styles.infraValue}>
                                    {item.exposed.toLocaleString()}
                                    {' '}
                                    /
                                    {' '}
                                    {item.total?.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Data Sources Section */}
            <CollapsibleSection title="Data Sources">
                {Array.from(new Set(event.forecastSources)).map((source, index) => (
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
 * Displays a single event with its affected areas and population.
 */
function EventButton({ event, onEventClick }: EventButtonProps) {
    // Get admin0 (country level) for total population
    const adminAreasByLevel = groupAdminAreasByLevel(event.exposedAdminAreas);
    const admin0 = adminAreasByLevel[0]?.[0];
    const totalPopulation = getExposedPopulation(admin0);

    // Get admin1 areas for affected areas
    const admin1Areas = adminAreasByLevel[1] ?? [];
    // TODO: fix this based on design. Note: admin 2 is missing
    // Get admin3 count for exposed districts
    const admin3Areas = adminAreasByLevel[3] ?? [];
    const exposedDistrictsCount = admin3Areas.length;

    const startTimeLabel = formatStartTime(event.startAt);

    return (
        <div className={styles.eventCard}>
            <div className={styles.eventTitle}>{event.eventLabel}</div>
            <div
                className={styles.eventAlert}
                style={{
                    color: alertColors[event.alertClass][4],
                    backgroundColor: alertColors[event.alertClass][0],
                }}
            >
                {event.alertClass}
            </div>
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
                    Affected areas:
                    <ul className={styles.areaList}>
                        {admin1Areas.map((area) => (
                            <li key={area.placeCode}>{area.name}</li>
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

interface NrwEventsPanelProps {
  eventData: EventResponseDto[];
  activeEventId: number | null;
  onEventClick: (eventId: number) => void;
  onRefreshAll: () => void;
  onDeselectEvent: () => void;
    countryCodes: string[];
  selectedAdminPlaceCode: string | null;
  adminDetails: AdminAreaDetails | null;
}

/**
 * Control panel showing upcoming events for the scoped country.
 * Each event displays affected admin1 areas and total population.
 */
export default function NrwEventsPanel({
    eventData,
    activeEventId,
    onEventClick,
    onRefreshAll,
    onDeselectEvent,
    countryCodes,
    selectedAdminPlaceCode,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adminDetails,
}: NrwEventsPanelProps) {
    const countryCode = countryCodes[0] ?? '';
    const selectedEvent = eventData.find((event) => event.eventId === activeEventId) ?? null;

    const handleBack = () => {
        onDeselectEvent();
    };

    if (selectedAdminPlaceCode) {
    // TODO: change the view based on this
        // eslint-disable-next-line no-console
        console.debug(
            `TODO: [NrwEventsPanel] Selected admin area: ${selectedAdminPlaceCode}`,
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

    if (eventData.length === 0) {
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
            {eventData.map((event) => (
                <EventButton
                    key={event.eventId}
                    event={event}
                    onEventClick={onEventClick}
                />
            ))}
        </div>
    );
}
