import { ChevronRightLineIcon } from '@ifrc-go/icons';
import Heading from '#components/Heading';
import Button from '#components/Button';
import styles from './styles.module.css';

function Buttons() {
    return (
        <div className={styles.buttonCollection}>
            <div className={styles.buttonsContainer}>
                <Heading level={5}>
                    Primary Button
                </Heading>
                <Button
                    name="primary-button"
                    variant="primary"
                >
                    Emergencies
                </Button>
                <Button
                    name="primary-button"
                    variant="primary"
                    actions={<ChevronRightLineIcon />}
                >
                    Countries on ifrc-go
                </Button>
                <Button
                    name="primary-button"
                    variant="primary"
                    disabled
                    actions={<ChevronRightLineIcon />}
                >
                    Countries on ifrc-go
                </Button>
            </div>
            <div className={styles.buttonsContainer}>
                <Heading level={5}>
                    Secondary Button
                </Heading>
                <Button
                    name="secondary-button"
                    variant="secondary"
                >
                    Secondary
                </Button>
                <Button
                    name="secondary-button"
                    variant="secondary"
                    actions={<ChevronRightLineIcon />}
                >
                    Secondary
                </Button>
                <Button
                    name="secondary-button"
                    variant="secondary"
                    disabled
                    actions={<ChevronRightLineIcon />}
                >
                    Secondary
                </Button>
            </div>
            <div className={styles.buttonsContainer}>
                <Heading level={5}>
                    Tertiary Button
                </Heading>
                <Button
                    name="tertiary-button"
                    variant="tertiary"
                >
                    Tertiary
                </Button>
                <Button
                    name="tertiary-button"
                    variant="tertiary"
                    actions={<ChevronRightLineIcon />}
                >
                    Tertiary
                </Button>
                <Button
                    name="tertiary-button"
                    variant="tertiary"
                    disabled
                    actions={<ChevronRightLineIcon />}
                >
                    Tertiary
                </Button>
            </div>
        </div>
    );
}

export default Buttons;
