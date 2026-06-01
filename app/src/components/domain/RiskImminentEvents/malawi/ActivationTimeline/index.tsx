import { CheckLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import { type ActivationStep } from './utils';

import styles from './styles.module.css';

interface Props {
    steps: ActivationStep[];
}

function ActivationTimeline(props: Props) {
    const { steps } = props;

    return (
        <div className={styles.activationTimeline}>
            {steps.map((step, i) => (
                <div
                    key={step.key}
                    className={styles.step}
                >
                    <div className={styles.indicator}>
                        <div
                            className={_cs(
                                styles.circle,
                                step.state === 'completed' && styles.circleCompleted,
                                step.state === 'active' && styles.circleActive,
                                step.state === 'pending' && styles.circlePending,
                            )}
                        >
                            {step.state === 'completed' && (
                                <CheckLineIcon className={styles.checkIcon} />
                            )}
                        </div>
                        {i < (steps.length - 1) && (
                            <div
                                className={_cs(
                                    styles.connector,
                                    step.state === 'completed' && styles.connectorCompleted,
                                )}
                            />
                        )}
                    </div>
                    <div
                        className={_cs(
                            styles.label,
                            step.state === 'active' && styles.labelActive,
                            step.state === 'pending' && styles.labelPending,
                        )}
                    >
                        {step.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ActivationTimeline;
