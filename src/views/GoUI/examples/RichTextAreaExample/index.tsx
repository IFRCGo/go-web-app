import Heading from '#components/Heading';
import RichTextArea from '#components/RichTextArea';

import styles from './styles.module.css';

function RichTextAreaExample() {
    return (
        <div className={styles.richTextArea}>
            <Heading level={3}>
                RichTextArea
            </Heading>
            <Heading level={5}>
                Active
            </Heading>
            <RichTextArea
                value=""
                name="rich-text-area-example"
            />
            <Heading level={5}>
                Disabled
            </Heading>
            <RichTextArea
                value=""
                name="rich-text-area-example"
                disabled
            />
            <Heading level={5}>
                Errored
            </Heading>
            <RichTextArea
                value=""
                name="rich-text-area-example"
                disabled
                error="This is test error"
            />
        </div>
    );
}

export default RichTextAreaExample;
