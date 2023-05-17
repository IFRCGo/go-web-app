import React from 'react';
import Heading from '#components/Heading';
import Switch from '#components/Switch';

import styles from './styles.module.css';

function SwitchExample() {
    const [toggleSwitch, setToggleSwitch] = React.useState<boolean>(false);

    const handleSwitch = () => setToggleSwitch((current) => !current);

    return (
        <div className={styles.switch}>
            <Heading level={3}>
                Switch
            </Heading>
            <Heading level={5}>
                Active
            </Heading>
            <Switch
                label="Detailed Reporting"
                name="is_simplified_report"
                value={toggleSwitch}
                onChange={handleSwitch}
            />
            <Heading level={5}>
                Inverted Logic
            </Heading>
            <Switch
                label="Detailed Reporting"
                name="is_simplified_report"
                value={toggleSwitch}
                onChange={handleSwitch}
                invertedLogic
            />
            <Heading level={5}>
                Disabled
            </Heading>
            <Switch
                label="Detailed Reporting"
                name="is_simplified_report"
                value={false}
                onChange={handleSwitch}
                disabled
            />
        </div>
    );
}

export default SwitchExample;
