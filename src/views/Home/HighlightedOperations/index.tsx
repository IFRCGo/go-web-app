import React from 'react';
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

import strings from '../strings';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function HighlightedOperations(props: Props) {
    const {
        className,
    } = props;

    const {
        response: featuredEmergencyResponse,
    } = useRequest<ListResponse<Emergency>>({
        url: 'api/v2/event/',
        query: {
            is_featured: 1,
        },
    });

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
                    {strings.viewAllEmergenciesLinkTitle}
                </Button>
            )}
            childrenContainerClassName={styles.emergencyList}
        >
            {featuredEmergencyResponse?.results.map(
                (emergency) => (
                    <OperationCard
                        className={styles.operation}
                        key={emergency.id}
                        data={emergency}
                    />
                )
            )}
        </Container>
    );
}

export default HighlightedOperations;
