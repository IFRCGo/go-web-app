import { useState, useCallback } from 'react';
import Modal, { SizeType } from '#components/Modal';
import SegmentInput from '#components/SegmentInput';
import Button from '#components/Button';
import Heading from '#components/Heading';
import TextInput from '#components/TextInput';

import styles from './styles.module.css';

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
    },
];

const labelSelector = (d: Option) => d.label;
const keySelector = (d: Option) => d.key;

function Modals() {
    const [option, setOption] = useState<Option['key']>('md');
    const [opened, setOpened] = useState<boolean>(false);
    const [value, setValue] = useState<string>();
    const [surname, setSurname] = useState<string>();

    const handleChange = useCallback((val: SizeType | undefined) => {
        if (val) {
            setOption(val);
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
            <Heading>Modals</Heading>
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
            {opened && (
                <Modal
                    size={option}
                    heading={(
                        <Heading level={2}>
                            This is modal heading
                        </Heading>
                    )}
                    onClose={handleCloseButtonClick}
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
            )}
        </div>
    );
}

export default Modals;
