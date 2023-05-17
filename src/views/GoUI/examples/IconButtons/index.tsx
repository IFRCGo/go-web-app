import React from 'react';
import {
    IoAccessibilityOutline,
    IoAirplane,
    IoArchive,
} from 'react-icons/io5';
import Header from '#components/Header';
import IconButton from '#components/IconButton';
import styles from './styles.module.css';

function IconButtons() {
    return (
        <div className={styles.buttonCollection}>
            <Header
                heading="ICON BUTTON COLLECTION"
                headingSize="medium"
            />
            <div className={styles.buttonsContainer}>
                <Header
                    heading="Primary IconButton"
                    headingSize="ultraSmall"
                />
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
                <Header
                    heading="Secondary IconButton"
                    headingSize="ultraSmall"
                />
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
                <Header
                    heading="Tertiary IconButton"
                    headingSize="ultraSmall"
                />
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

export default IconButtons;
