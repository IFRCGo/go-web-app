import { Fragment } from 'react';
import {
    ArrowRightLineIcon,
    InformationLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    DropdownMenu,
} from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Step {
    key: string;
    title: string;
    description: string;
    // Highlighted callout below the description (e.g. step 3's
    // "feeds directly into Red Cross operations").
    note?: string;
}

// FIXME: use strings
const STEPS: Step[] = [
    {
        key: 'monitor',
        title: 'Monitor hazard signals',
        description: 'Track forecasted and confirmed natural hazard events using model outputs, event catalogues, and national or partner data sources. Forecasts support early readiness; confirmed events support response decisions.',
    },
    {
        key: 'interpret',
        title: 'Interpret risk in context',
        description: 'Overlay hazard signals with exposure, vulnerability, population, critical services, administrative boundaries, and Red Cross operational presence to understand where impacts may be highest and which communities to prioritise.',
    },
    {
        key: 'decide',
        title: 'Support operational decisions',
        description: 'Generate early warning or confirmed event response reports that collate model outputs, contextual layers, MRCS information, IFRC operational data, and ongoing response activities to support planning and partner coordination.',
        note: 'Feeds directly into Red Cross operations',
    },
    {
        key: 'learn',
        title: 'Record, compare, and learn',
        description: 'Link events, activations, operations, and reports over time to compare forecasted impacts with observed impacts, identify false alarms or missed events, and improve thresholds, models, and operational readiness.',
    },
];

// Explains the Malawi Risk Watch flow in a wide dropdown panel, triggered
// from a labelled info button in the side panel.
function HowItWorks() {
    return (
        <DropdownMenu
            className={styles.trigger}
            // FIXME: use strings
            label="How it works"
            labelBefore={<InformationLineIcon />}
            labelStyleVariant="action"
            labelColorVariant="text"
            withoutDropdownIcon
            preferredPopupWidth={56}
            withoutPopupPadding
        >
            <Container
                // FIXME: use strings
                heading="How it works"
                headerDescription="From hazard signals to Red Cross action"
                withHeaderBorder
                withPadding
            >
                <div className={styles.steps}>
                    {STEPS.map((step, index) => (
                        <Fragment key={step.key}>
                            {index > 0 && (
                                <ArrowRightLineIcon
                                    className={styles.arrow}
                                    aria-hidden
                                />
                            )}
                            <div className={styles.step}>
                                <div className={styles.number}>
                                    {index + 1}
                                </div>
                                <div className={styles.stepTitle}>
                                    {step.title}
                                </div>
                                <div className={styles.description}>
                                    {step.description}
                                </div>
                                {step.note && (
                                    <div className={styles.note}>
                                        {step.note}
                                    </div>
                                )}
                            </div>
                        </Fragment>
                    ))}
                </div>
            </Container>
        </DropdownMenu>
    );
}

export default HowItWorks;
