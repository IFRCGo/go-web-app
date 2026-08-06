import { Image } from '@ifrc-go/ui/printable';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/printable/Link';
import {
    getFileNameFromUrl,
    isImageFile,
} from '#utils/common';

import styles from './styles.module.css';

interface FileType {
    id: number;
    file?: string | null;
    caption?: string | null;
}

interface Props {
    className?: string;
    files: FileType[] | null | undefined;
}

function PrintableFileOutput(props: Props) {
    const {
        className,
        files,
    } = props;

    if (isNotDefined(files) || files.length === 0) {
        return null;
    }

    const imageFiles = files.filter(({ file }) => isImageFile(file));
    const otherFiles = files.filter(({ file }) => !isImageFile(file));

    return (
        <div className={_cs(styles.printableFileOutput, className)}>
            {imageFiles.length > 0 && (
                <div className={styles.imageItems}>
                    {imageFiles.map((imageFile) => (
                        <Image
                            key={imageFile.id}
                            src={imageFile.file}
                            caption={imageFile.caption}
                        />
                    ))}
                </div>
            )}
            {otherFiles.length > 0 && (
                <div className={styles.fileItems}>
                    {otherFiles.map((otherFile) => (
                        <Link
                            key={otherFile.id}
                            href={otherFile.file}
                        >
                            {getFileNameFromUrl(otherFile.file)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PrintableFileOutput;
