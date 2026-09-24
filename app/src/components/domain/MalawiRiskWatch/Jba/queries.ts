import { graphql } from '#generated/gql';

export const JBA_INGESTION_RUNS_QUERY = graphql(/* GraphQL */ `
    query JbaIngestionRuns($limit: Int!) {
        jbaIngestionRuns(
            order: { runDate: DESC },
            pagination: { limit: $limit },
        ) {
            results {
                id
                runDate
                status
                startedAt
                completedAt
            }
        }
    }
`);

export const JBA_FORECAST_IMPACTS_QUERY = graphql(/* GraphQL */ `
    query JbaForecastImpacts($issueDate: Date!, $limit: Int!) {
        floodForecastImpacts(
            filters: { forecastIssueDate: { exact: $issueDate } },
            pagination: { limit: $limit },
        ) {
            results {
                id
                forecastIssueDate
                forecastTargetDate
                adminArea {
                    id
                    pcode
                    name
                }
                band5Mean
                band5Median
                band5P75
                band5P90
                band5Max
                ensemblesNonzeroCount
            }
        }
    }
`);

// Only url and name: the file size resolver fails on the backend
export const JBA_FORECAST_FILES_QUERY = graphql(/* GraphQL */ `
    query JbaForecastFiles($issueDate: Date!, $limit: Int!) {
        floodForecastFiles(
            filters: { forecastIssueDate: { exact: $issueDate } },
            pagination: { limit: $limit },
        ) {
            results {
                id
                forecastIssueDate
                forecastTargetDate
                tiff {
                    url
                    name
                }
            }
        }
    }
`);
