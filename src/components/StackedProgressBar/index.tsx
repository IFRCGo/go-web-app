import React from 'react';

import styles from './styles.module.css';

interface BarProps {
    value: number;
    width: number;
    label: string;
}

function Bar(props: BarProps) {
    const {
        value,
        width,
        label,
    } = props;

    return (
        <div>
            <div>{value}</div>
            <div style={{ width: `${width}` }} />
            <div>{label}</div>
        </div>
    );
}

interface Value {
    label: string;
    value: number;
}

interface StackedProgressBarProps {
    values: Value[];
    className?: string;
    barHeight?: number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    value: number;
    totalValue: number;
    color?: string;
}

function StackedProgressBar(props: StackedProgressBarProps) {

    const { values } = props;

    const fixedWidth = 100;
    const totalValues = 500;

    return (
        <>
            <div
                className={styles.progress}
                style={{
                    width: `100`,
                    backgroundColor: '#011E41',
                }}
            />
            <Bar value={100} label={''} {...values} width={fixedWidth} />
        </>
    );
}

export default StackedProgressBar;
