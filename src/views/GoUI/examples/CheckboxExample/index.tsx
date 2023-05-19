import React from 'react';
import Heading from '#components/Heading';
import Checkbox from '#components/Checkbox';

import styles from './styles.module.css';

function CheckboxExample() {
    const [toggleSwitch, setToggleCheckbox] = React.useState<boolean>(false);

    const handleSwitch = () => setToggleCheckbox((current) => !current);

    return (
        <div className={styles.checkbox}>
            <Heading level={3}>
                Checkbox
            </Heading>
            <Checkbox
                label="Detailed Reporting"
                name="checkbox"
                value={toggleSwitch}
                onChange={handleSwitch}
            />
            <Checkbox
                label="Disabled"
                name="checkbox"
                value={toggleSwitch}
                onChange={handleSwitch}
                disabled
            />
            <Checkbox
                label="Read only"
                name="checkbox"
                value={toggleSwitch}
                onChange={handleSwitch}
                readOnly
            />
            <Checkbox
                label="Indeterminate"
                name="checkbox"
                value={toggleSwitch}
                onChange={handleSwitch}
                indeterminate
            />
            <Checkbox
                label="Inverted Logic"
                name="checkbox"
                value={toggleSwitch}
                onChange={handleSwitch}
                invertedLogic
            />
        </div>
    );
}

export default CheckboxExample;
