import { ListView } from '@ifrc-go/ui';
import { Image } from '@ifrc-go/ui/printable';
import { isNotDefined } from '@togglecorp/fujs';

import Link from '#components/printable/Link';
import {
    getFileNameFromUrl,
    isImageFile,
} from '#utils/common';

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
        <ListView
            className={className}
            layout="block"
            spacing="md"
        >
            <ListView
                layout="block"
                spacing="4xs"
            >
                {imageFiles.map((imageFile) => (
                    <Image
                        key={imageFile.id}
                        src={imageFile.file}
                        caption={imageFile.caption}
                    />
                ))}
            </ListView>
            <ListView
                layout="block"
                spacing="xs"
            >
                {otherFiles.map((otherFile) => (
                    <Link
                        key={otherFile.id}
                        href={otherFile.file}
                    >
                        {getFileNameFromUrl(otherFile.file)}
                    </Link>
                ))}
            </ListView>
        </ListView>
    );
}

export default PrintableFileOutput;
