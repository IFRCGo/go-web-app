import { graphql } from '#generated/gql';

const HDX_DATASETS_QUERY = graphql(/* GraphQL */ `
    query HdxDatasets($limit: Int!) {
        hdxDatasets(pagination: { limit: $limit }) {
            results {
                id
                datasetName
                hdxUrl
                loadedAt
            }
        }
    }
`);

export default HDX_DATASETS_QUERY;
