import {
    type RefObject,
    useEffect,
    useState,
} from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface Props {
    mainRef: RefObject<HTMLDivElement>;
}

function TableOfContents(props: Props) {
    const { mainRef } = props;
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        const contentElement = mainRef.current;

        if (!contentElement) return;

        const elements = Array.from(contentElement.querySelectorAll('h2, h3, h4'));

        const headingData = elements.map((elem) => (
            {
                id: elem.id,
                text: elem.textContent || '',
                level: Number(elem.tagName.substring(1)),
            }
        ));

        setHeadings(headingData);
    }, [mainRef]);

    return (
        <ol>
            {headings.map((heading) => (
                <li
                    key={heading.id}
                    style={{
                        marginLeft: heading.level === 3 ? '1rem' : '0',
                    }}
                >
                    {heading.text}
                </li>
            ))}
        </ol>
    );
}

export default TableOfContents;
