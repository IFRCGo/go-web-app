import Overlay from '#components/Overlay';
import styles from './styles.module.css';

const text = 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of';

function OverlayExample() {
    return (
        <div className={styles.overlayContent}>
            <Overlay>
                <div className={styles.content}>
                    {text}
                </div>
            </Overlay>
        </div>
    );
}

export default OverlayExample;
