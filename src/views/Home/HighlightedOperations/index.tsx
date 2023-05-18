import { ChevronRightLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';

import Container from '#components/Container';
import Button from '#components/Button';
import { Emergency } from '#types/emergency';
import OperationCard from './OperationCard';
import useTranslation from '#hooks/useTranslation';

import commonStrings from '#strings/common';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function HighlightedOperations(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation('common', commonStrings);

    const {
        response: featuredEmergencyResponse,
    } = useRequest<ListResponse<Emergency>>({
        url: 'api/v2/event/',
        query: {
            is_featured: 1,
        },
    });

    const featuredEmergencies = featuredEmergencyResponse?.results;
    const layoutDifficiencies = 3 - (featuredEmergencies?.length ?? 0) % 3;

    return (
        <Container
            className={_cs(styles.highlightedOperations, className)}
            withHeaderBorder
            heading={strings.highlightedOperationsTitle}
            actions={(
                <Button
                    name={undefined}
                    variant="tertiary"
                    actions={<ChevronRightLineIcon />}
                >
                    {strings.highlightedOperationsViewAll}
                </Button>
            )}
            childrenContainerClassName={styles.emergencyList}
        >
            {featuredEmergencies?.map(
                (emergency) => (
                    <OperationCard
                        className={styles.operation}
                        key={emergency.id}
                        data={emergency}
                    />
                )
            )}
            {Array.from(Array(layoutDifficiencies).keys()).map(
                (key) => (
                    <div
                        key={key}
                        className={styles.filler}
                    />
                )
            )}
        </Container>
    );
}

export default HighlightedOperations;
