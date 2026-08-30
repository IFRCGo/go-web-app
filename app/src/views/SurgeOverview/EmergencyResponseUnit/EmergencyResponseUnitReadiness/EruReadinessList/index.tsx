import {
    Container,
    ListView,
} from '@ifrc-go/ui';

import ReadinessIconList from '../ReadinessIconList';

interface Props {
    heading?: React.ReactNode;
    fundingReadiness: number | undefined;
    equipmentReadiness: number | undefined;
    peopleReadiness: number | undefined;
}

function EruReadinessList(props: Props) {
    const {
        heading,
        fundingReadiness,
        equipmentReadiness,
        peopleReadiness,
    } = props;

    return (
        <Container
            heading={heading}
            headingLevel={6}
            withDarkBackground
            withPadding
        >
            <ListView
                layout="grid"
                minGridColumnSize="6rem"
                numPreferredGridColumns={3}
            >
                <ReadinessIconList
                    fundingReadiness={fundingReadiness}
                    equipmentReadiness={equipmentReadiness}
                    peopleReadiness={peopleReadiness}
                />
            </ListView>
        </Container>
    );
}

export default EruReadinessList;
