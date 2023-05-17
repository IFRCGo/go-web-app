import React, { useCallback, useState } from "react";
import TextArea from "#components/TextArea";
import Heading from "#components/Heading";
import styles from './styles.module.scss';

function TextAreaExample() {
  const [textGroup, setTextGroup] = useState<string | undefined>('');

  const handleTextChange = useCallback((val: string | undefined) => {
    setTextGroup(val);
  }, [setTextGroup]);

  return (
    <div className={styles.textAreaInputs}>
      <Heading level={5}>Simple Text Area</Heading>
      <TextArea
        className={styles.textArea}
        name="anonymous"
        labelClassName={styles.textLabel}
        label="Write some random stuff"
        value={textGroup}
        onChange={handleTextChange}
        rows={5}
      />
      <Heading level={5}>Text Area Disabled</Heading>
      <TextArea
        className={styles.textArea}
        name="anonymous"
        labelClassName={styles.textLabel}
        label="An example of disabled text box"
        value={textGroup}
        onChange={handleTextChange}
        rows={5}
        disabled
      />
      <Heading level={5}>Text Area with error</Heading>
      <TextArea
        className={styles.textArea}
        name="anonymous"
        labelClassName={styles.textLabel}
        label="An example of error text box"
        value={textGroup}
        onChange={handleTextChange}
        rows={5}
        error="Please enter the right text"
      />
    </div>
  );
}
export default TextAreaExample;
