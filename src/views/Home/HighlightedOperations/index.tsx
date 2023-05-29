import { ChevronRightLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';

import Container from '#components/Container';
import Link from '#components/Link';
import List from '#components/List';
import useTranslation from '#hooks/useTranslation';
import { Emergency } from '#types/emergency';

import OperationCard from './OperationCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

const keySelector = (emergency: Emergency) => emergency.id;
const rendererParams = (_: Emergency['id'], emergency: Emergency) => ({
    data: emergency,
    className: styles.operation,
});

interface Props {
    className?: string;
}

function HighlightedOperations(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);

    const {
        error: featuredEmergencyResponseError,
        pending: featuredEmergencyPending,
        response: featuredEmergencyResponse,
    } = useRequest<ListResponse<Emergency>>({
        url: 'api/v2/event/',
        query: {
            is_featured: 1,
        },
    });

    const featuredEmergencies = featuredEmergencyResponse?.results;

    return (
        <Container
            className={_cs(styles.highlightedOperations, className)}
            withHeaderBorder
            heading={strings.highlightedOperationsTitle}
            actions={(
                <Link
                    to="/"
                    actions={<ChevronRightLineIcon />}
                    underline
                >
                    {strings.highlightedOperationsViewAll}
                </Link>
            )}
            childrenContainerClassName={styles.emergencyList}
        >
            <List
                data={featuredEmergencies}
                pending={featuredEmergencyPending}
                errored={!!featuredEmergencyResponseError}
                filtered={false}
                keySelector={keySelector}
                renderer={OperationCard}
                rendererParams={rendererParams}
            />
        </Container>
    );
}

export default HighlightedOperations;
