import { DeleteBinLineIcon, LockLineIcon, ShieldLineIcon } from '@ifrc-go/icons';
import IconButton from '#components/IconButton';
import styles from './styles.module.css';

function IconButtonExample() {
    return (
        <div className={styles.buttonCollection}>
            <div className={styles.buttonsContainer}>
                <IconButton
                    name="primary-button"
                    variant="primary"
                    ariaLabel="Emergencies"
                >
                    <LockLineIcon />
                </IconButton>
                <IconButton
                    name="primary-button"
                    variant="primary"
                    disabled
                    ariaLabel="Emergencies"
                >
                    <LockLineIcon />
                </IconButton>
                <IconButton
                    name="primary-button"
                    variant="primary"
                    ariaLabel="Emergencies"
                    round={false}
                >
                    <LockLineIcon />
                </IconButton>
            </div>
            <div className={styles.buttonsContainer}>
                <IconButton
                    name="secondary-button"
                    variant="secondary"
                    ariaLabel="IoAirplane"
                >
                    <ShieldLineIcon />
                </IconButton>
                <IconButton
                    name="secondary-button"
                    variant="secondary"
                    ariaLabel="IoAirplane"
                    disabled
                >
                    <ShieldLineIcon />
                </IconButton>
            </div>
            <div className={styles.buttonsContainer}>
                <IconButton
                    name="tertiary-button"
                    variant="tertiary"
                    ariaLabel="IoArchive"
                >
                    <DeleteBinLineIcon />
                </IconButton>
                <IconButton
                    name="tertiary-button"
                    variant="tertiary"
                    ariaLabel="IoArchive"
                    disabled
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default IconButtonExample;
