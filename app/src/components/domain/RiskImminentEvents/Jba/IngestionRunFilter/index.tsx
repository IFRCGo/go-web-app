import { useCallback } from 'react';
import {
    InfoPopup,
    ListView,
    SelectInput,
    TextOutput,
} from '@ifrc-go/ui';
import { formatDate } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

// One daily JBA fetch job. runDate equals the forecast issue date that keys the
// flood-forecast impacts (backend sets both from the same value).
export interface JbaIngestionRun {
    id: string;
    runDate: string;
    forecastIssueTime: string | null;
    status: string;
    filesExpected: number | null;
    filesProcessed: number | null;
    completedAt: string | null;
}

// Matches the datetime format used elsewhere in the risk-imminent-events module.
const RUN_DATETIME_FORMAT = 'yyyy-MM-dd, hh:mm';

function keySelector(run: JbaIngestionRun) {
    return run.id;
}
function labelSelector(run: JbaIngestionRun) {
    return run.runDate;
}

// Status + run metadata for the selected ingestion run, shown in an info popup
// rendered after the select input.
function IngestionRunInfo(props: { run: JbaIngestionRun }) {
    const { run } = props;

    return (
        <InfoPopup
            // FIXME: use strings
            title="Ingestion run"
            description={(
                <ListView
                    layout="block"
                    spacing="3xs"
                >
                    {/* FIXME: use strings */}
                    <TextOutput
                        label="Run date"
                        value={run.runDate}
                        strongValue
                    />
                    <TextOutput
                        label="Status"
                        value={run.status}
                    />
                    <TextOutput
                        label="Files processed"
                        value={`${run.filesProcessed ?? 0} / ${run.filesExpected ?? 0}`}
                    />
                    {isDefined(run.forecastIssueTime) && (
                        <TextOutput
                            label="Forecast issued"
                            value={formatDate(run.forecastIssueTime, RUN_DATETIME_FORMAT)}
                        />
                    )}
                    {isDefined(run.completedAt) && (
                        <TextOutput
                            label="Completed"
                            value={formatDate(run.completedAt, RUN_DATETIME_FORMAT)}
                        />
                    )}
                </ListView>
            )}
        />
    );
}

interface Props {
    runs: JbaIngestionRun[] | undefined;
    value: string | undefined;
    onChange: (value: string) => void;
    activeRun: JbaIngestionRun | undefined;
    pending?: boolean;
}

function IngestionRunFilter(props: Props) {
    const {
        runs,
        value,
        onChange,
        activeRun,
        pending,
    } = props;

    const handleChange = useCallback(
        (newValue: string) => {
            onChange(newValue);
        },
        [onChange],
    );

    return (
        <SelectInput
            className={styles.ingestionRunSelect}
            name="ingestionRun"
            value={value}
            options={runs}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onChange={handleChange}
            disabled={pending}
            nonClearable
            actions={isDefined(activeRun) ? <IngestionRunInfo run={activeRun} /> : undefined}
        />
    );
}

export default IngestionRunFilter;
