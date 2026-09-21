import { graphql } from '#generated/gql';

export const ARC_OBSERVATIONS_QUERY = graphql(/* GraphQL */ `
    query ArcRainfallObservations($limit: Int!) {
        arcRainfallObservations(
            order: { observationDate: DESC },
            pagination: { limit: $limit },
        ) {
            results {
                id
                observationDate
                adminArea {
                    id
                    pcode
                    name
                }
                impact
                eventRp
                cellTrigger
            }
        }
    }
`);

export const ARC_TRIGGER_EVENTS_QUERY = graphql(/* GraphQL */ `
    query ArcTriggerEvents($limit: Int!) {
        arcTriggerEvents(
            order: { triggerDate: DESC },
            pagination: { limit: $limit },
        ) {
            results {
                id
                triggerDate
                status
                reviewNotes
            }
        }
    }
`);
