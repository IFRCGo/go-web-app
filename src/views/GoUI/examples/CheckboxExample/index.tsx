import React from 'react';
import Heading from '#components/Heading';
import Checkbox from '#components/Checkbox';

import styles from './styles.module.scss';

function CheckboxExample() {
  const [toggleSwitch, setToggleCheckbox] = React.useState<boolean>(false);

  const handleSwitch = () => setToggleCheckbox((current) => !current);

  return (
    <div className={styles.checkbox}>
      <Heading level={3}>
        Checkbox
      </Heading>
      <Heading level={5}>
        Active
      </Heading>
      <Checkbox
        label="Detailed Reporting"
        name="is_simplified_report"
        value={toggleSwitch}
        onChange={handleSwitch}
      />
      <Heading level={5}>
        Inverted Logic
      </Heading>
      <Checkbox
        label="Detailed Reporting"
        name="is_simplified_report"
        value={toggleSwitch}
        onChange={handleSwitch}
        invertedLogic
      />
      <Heading level={5}>
        Disabled
      </Heading>
      <Checkbox
        label="Disabled Detailed Reporting"
        name="is_simplified_report"
        value={false}
        onChange={handleSwitch}
        disabled
      />
    </div>
  );
}

export default CheckboxExample;
