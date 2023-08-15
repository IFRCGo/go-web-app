import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import sanitizeHtml from 'sanitize-html';

import styles from './styles.module.css';

function useSanitizedHtml(rawHtml: string) {
    const sanitizedHtml = useMemo(() => (
        sanitizeHtml(
            rawHtml,
            {
                allowedTags: [
                    // https://www.semrush.com/blog/html-tags-list
                    'p', 'br', 'hr', 'span', 'div',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'strong', 'b', 'i', 'em', 'u',
                    'li', 'ul', 'ol',
                    'a',
                    'table', 'thead', 'tbody', 'th', 'tr', 'td',
                    'dd', 'dt', 'dl',
                    'sub', 'sup',
                    'img', 'svg',
                    'pre', 'cite', 'code', 'q',
                    'iframe', // some emergencies, like 3972, needed iframe reference to a dashboard
                    // 'base', 'canvas', 'video', // can be switched on when need occurs
                    // 'area', 'map', 'label', 'meter', // can be switched on when need occurs
                    // forbid: 'input', 'textarea', 'button',
                ],
                // TODO: create comprehensive list of the attributes used
                // to improve security
                allowedAttributes: {
                    p: ['style'],
                    span: ['style'],
                    div: ['style'],
                    img: ['src', 'width', 'height', 'style'],
                    iframe: ['src', 'width', 'height', 'frameborder', 'style'],
                    a: ['href'],
                },
                allowedSchemes: ['http', 'https', 'data'],
                allowedStyles: {
                    '*': {
                        // Allow indentation
                        'padding-left': [/^\d+(?:px)$/],
                        'font-size': [/^\d+(?:px)$/],
                        'text-align': [/.+/],
                    },
                },
            },
        )
    ), [rawHtml]);

    return sanitizedHtml;
}

interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'dangerouslySetInnerHTML'> {
    value: string;
}

// eslint-disable-next-line import/prefer-default-export
function RichTextOutput(props: Props) {
    const {
        className,
        value,
        ...otherProps
    } = props;

    const sanitizedValue = useSanitizedHtml(value);

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.richTextOutput, className)}
            dangerouslySetInnerHTML={{
                __html: sanitizedValue,
            }}
        />
    );
}

export default RichTextOutput;
