import {
    Label,
    ListView,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface StepGradientBarStep {
    color: string;
    label: React.ReactNode;
}

interface Props {
    className?: string;
    steps: StepGradientBarStep[];
}

function StepGradientBar(props: Props) {
    const {
        className,
        steps,
    } = props;

    return (
        <ListView
            className={_cs(styles.stepGradientBar, className)}
            spacing="none"
        >
            {steps.map((step, index) => (
                <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className={styles.step}
                >
                    <div
                        className={styles.swatch}
                        style={{ backgroundColor: step.color }}
                    />
                    <Label textSize="sm">
                        {step.label}
                    </Label>
                </div>
            ))}
        </ListView>
    );
}

export default StepGradientBar;
