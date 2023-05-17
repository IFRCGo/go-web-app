import React from 'react';
import PasswordInput from '#components/PasswordInput';
import Heading from '#components/Heading';

import styles from './styles.module.css';

function PasswordInputExample() {
    const [passwordInput, setPasswordInput] = React.useState<string | undefined>('');
    return (
        <div className={styles.passwordInput}>
            <Heading level={3}>
                Password Input example
            </Heading>
            <Heading level={5}>
                Active
            </Heading>
            <PasswordInput
                name="test-name"
                label="Password"
                value={passwordInput}
                onChange={setPasswordInput}
            />
            <Heading level={5}>
                Disabled
            </Heading>
            <PasswordInput
                name="test-name"
                label="Password"
                value={passwordInput}
                onChange={setPasswordInput}
                disabled
            />
            <Heading level={5}>
                Errored
            </Heading>
            <PasswordInput
                name="test-name"
                label="Password"
                value={passwordInput}
                onChange={setPasswordInput}
                error="This is the test error"
            />
        </div>
    );
}

export default PasswordInputExample;
