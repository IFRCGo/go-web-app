import {
    IoAccessibilityOutline,
    IoAirplane,
    IoArchive,
} from 'react-icons/io5';
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
                    <IoAccessibilityOutline />
                </IconButton>
                <IconButton
                    name="primary-button"
                    variant="primary"
                    disabled
                    ariaLabel="Emergencies"
                >
                    <IoAccessibilityOutline />
                </IconButton>
                <IconButton
                    name="primary-button"
                    variant="primary"
                    ariaLabel="Emergencies"
                    round={false}
                >
                    <IoAccessibilityOutline />
                </IconButton>
            </div>
            <div className={styles.buttonsContainer}>
                <IconButton
                    name="secondary-button"
                    variant="secondary"
                    ariaLabel="IoAirplane"
                >
                    <IoAirplane />
                </IconButton>
                <IconButton
                    name="secondary-button"
                    variant="secondary"
                    ariaLabel="IoAirplane"
                    disabled
                >
                    <IoAirplane />
                </IconButton>
            </div>
            <div className={styles.buttonsContainer}>
                <IconButton
                    name="tertiary-button"
                    variant="tertiary"
                    ariaLabel="IoArchive"
                >
                    <IoArchive />
                </IconButton>
                <IconButton
                    name="tertiary-button"
                    variant="tertiary"
                    ariaLabel="IoArchive"
                    disabled
                >
                    <IoArchive />
                </IconButton>
            </div>
        </div>
    );
}

export default IconButtonExample;
