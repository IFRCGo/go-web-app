import {
    type RefObject,
    useEffect,
    useState,
} from 'react';
import { randomString } from '@togglecorp/fujs';

import styles from './styles.module.css';

type HeadingData = {
    id: string;
    text: string;
    level: number;
    children?: HeadingData[];
}

interface Props {
    mainRef: RefObject<HTMLDivElement>;
}

function TableOfContents(props: Props) {
    const { mainRef } = props;
    const [headings, setHeadings] = useState<HeadingData[]>([]);

    useEffect(() => {
        const contentElement = mainRef.current;

        if (!contentElement) return;

        const elements = Array.from(contentElement.querySelectorAll('h2, h3'));

        const headingList: HeadingData[] = [];

        elements.forEach((elem) => {
            const level = Number(elem.tagName.substring(1));

            if (level === 2) {
                headingList.push({
                    id: randomString(),
                    text: elem.textContent || '',
                    level,
                });
            }

            const lastHeadingData = headingList[headingList.length - 1];
            if (level === 3 && lastHeadingData) {
                if (!lastHeadingData.children) {
                    lastHeadingData.children = [];
                }

                lastHeadingData.children?.push({
                    id: randomString(),
                    text: elem.textContent || '',
                    level,
                });
            }
        });

        setHeadings(headingList);
    }, [mainRef]);

    return (
        <ol className={styles.tableOfContents}>
            {headings.map((heading) => (
                <li key={heading.id}>
                    {heading.text}
                    {heading.children && (
                        <ol className={styles.subSection}>
                            {heading.children?.map((subHeading) => (
                                <li key={subHeading.id}>
                                    {subHeading.text}
                                </li>
                            ))}
                        </ol>
                    )}
                </li>
            ))}
        </ol>
    );
}

export default TableOfContents;
