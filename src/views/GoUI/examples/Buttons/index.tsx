import { ChevronRightLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';
import Heading from '#components/Heading';
import Button from '#components/Button';
import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noOp() {
}

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
                    onClick={noOp}
                >
                    Emergencies
                </Button>
                <Button
                    name="primary-button"
                    variant="primary"
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
                >
                    Countries on ifrc-go
                </Button>
                <Button
                    name="primary-button"
                    variant="primary"
                    disabled
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
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
                    onClick={noOp}
                >
                    Secondary
                </Button>
                <Button
                    name="secondary-button"
                    variant="secondary"
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
                >
                    Secondary
                </Button>
                <Button
                    name="secondary-button"
                    variant="secondary"
                    disabled
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
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
                    onClick={noOp}
                >
                    Tertiary
                </Button>
                <Button
                    name="tertiary-button"
                    variant="tertiary"
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
                >
                    Tertiary
                </Button>
                <Button
                    name="tertiary-button"
                    variant="tertiary"
                    disabled
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
                >
                    Tertiary
                </Button>
            </div>
            <div className={_cs(styles.buttonsContainer, styles.darker)}>
                <Heading level={5}>
                    Tertiary on Dark Button
                </Heading>
                <Button
                    name="tertiary-button"
                    variant="tertiary-on-dark"
                    onClick={noOp}
                >
                    Tertiary Button
                </Button>
                <Button
                    name="tertiary-button"
                    variant="tertiary-on-dark"
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
                >
                    Tertiary
                </Button>
                <Button
                    name="tertiary-button"
                    variant="tertiary-on-dark"
                    disabled
                    actions={<ChevronRightLineIcon />}
                    onClick={noOp}
                >
                    Tertiary
                </Button>
            </div>
        </div>
    );
}

export default Buttons;
