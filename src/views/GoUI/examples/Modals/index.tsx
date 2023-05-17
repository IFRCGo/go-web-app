import React, { useState, useCallback } from 'react';
import Modal, { SizeType } from '#components/Modal';
import SegmentInput from '#components/SegmentInput';
import Button from '#components/Button';
import Header from '#components/Header';
import Heading from '#components/Heading';
import TextInput from '#components/TextInput';

import styles from './styles.module.scss';

interface Option {
  key: SizeType;
  label: string;
}

const options: Option[] = [
  {
    key: 'sm',
    label: 'small',
  },
  {
    key: 'md',
    label: 'medium',
  },
  {
    key: 'lg',
    label: 'large',
  },
  {
    key: 'xl',
    label: 'extra large',
  },
  {
    key: 'full',
    label: 'full screen',
  },
  {
    key: 'auto',
    label: 'auto',
  }
];

const labelSelector = (d: Option) => d.label;
const keySelector = (d: Option) => d.key;

function Modals() {
  const [option, setOption] = useState<Option['key']>('md');
  const [opened, setOpened] = useState<boolean>(false);
  const [value, setValue] = useState<string>();
  const [surname, setSurname] = useState<string>();

  const handleChange = useCallback((value: SizeType | undefined) => {
    if (value) {
      setOption(value);
    }
  }, []);

  const showModal = useCallback(() => {
    setOpened(true);
  }, []);

  const handleCloseButtonClick = useCallback(() => {
    setOpened(false);
  }, []);

  return (
    <div className={styles.modals}>
      <Header>MODALS</Header>
      <SegmentInput
        name={undefined}
        onChange={handleChange}
        options={options}
        labelSelector={labelSelector}
        keySelector={keySelector}
        value={option}
        disabled={opened}
      />
      <Button
        name={undefined}
        onClick={showModal}
        variant="secondary"
      >
        Show Modal
      </Button>
      <Modal
        opened={opened}
        size={option}
        title={(
          <Heading level={2}>
            This is modal heading
          </Heading>
        )}
        onCloseButtonClick={handleCloseButtonClick}
        bodyClassName={styles.content}
      >
        <TextInput
          name="name"
          label="What is your name?"
          onChange={setValue}
          value={value}
        />
        <TextInput
          name="surname"
          label="What is your surname?"
          onChange={setSurname}
          value={surname}
        />
      </Modal>
    </div>
  );
}

export default Modals;
