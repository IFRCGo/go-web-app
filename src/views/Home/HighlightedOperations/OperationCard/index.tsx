import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Header from '#components/Header';
import Button from '#components/Button';
import { Emergency } from '#types/emergency';

import SeverityIndicator from './SeverityIndicator';
import styles from './styles.module.css';

interface Props {
    className?: string;
    data: Emergency;
}

function OperationCard(props: Props) {
    const {
        className,
        data: {
            name,
            ifrc_severity_level,
        },
    } = props;

    return (
        <div className={_cs(styles.operationCard, className)}>
            <Header
                icons={(
                    <SeverityIndicator
                        level={ifrc_severity_level}
                    />
                )}
                heading={name}
                actions={(
                    <Button name={undefined}>
                        Follow
                    </Button>
                )}
            />
        </div>
    );
}

export default OperationCard;
