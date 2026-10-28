import {
    Container,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

function Intro() {
    const strings = useTranslation(i18n);

    const steps = [
        {
            key: 'monitor',
            title: strings.malawiIntroMonitorTitle,
            description: strings.malawiIntroMonitorDescription,
        },
        {
            key: 'interpret',
            title: strings.malawiIntroInterpretTitle,
            description: strings.malawiIntroInterpretDescription,
        },
        {
            key: 'decide',
            title: strings.malawiIntroDecideTitle,
            description: strings.malawiIntroDecideDescription,
        },
        {
            key: 'learn',
            title: strings.malawiIntroLearnTitle,
            description: strings.malawiIntroLearnDescription,
        },
    ];

    return (
        <Container
            className={styles.intro}
            heading={strings.malawiIntroHeading}
            headerDescription={(
                <ListView
                    layout="block"
                    spacing="2xs"
                >
                    <div className={styles.tagline}>
                        {strings.malawiIntroTagline}
                    </div>
                    <div>
                        {strings.malawiIntroDescription}
                    </div>
                </ListView>
            )}
        >
            <Container
                heading={strings.malawiIntroHowItWorks}
                headingLevel={4}
                withBorder
                withPadding
            >
                <ListView
                    layout="grid"
                    numPreferredGridColumns={4}
                    spacing="md"
                >
                    {steps.map((step, index) => (
                        <Container
                            key={step.key}
                            heading={step.title}
                            headingLevel={5}
                            headerIcons={(
                                <div className={styles.stepNumber}>
                                    {index + 1}
                                </div>
                            )}
                            spacing="xs"
                        >
                            {step.description}
                        </Container>
                    ))}
                </ListView>
            </Container>
        </Container>
    );
}

export default Intro;
