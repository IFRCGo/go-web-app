import React from 'react';
import sanitizeHtml from 'sanitize-html';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.scss';

function useSanitizedHtml(rawHtml: string) {
    const sanitizedHtml = React.useMemo(() => (
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

interface Props {
    className: string;
    value: string | React.ReactNode;
}

function RichTextOutput(props: Props) {
    const {
        className,
        value,
        ...otherProps
    } = props;

    const sanitizedValue = useSanitizedHtml(value);

    return (
        <div
            {...otherProps}
            className={_cs(styles.richTextOutput, className)}
            dangerouslySetInnerHTML={{
                __html: sanitizedValue,
            }}
        />
    );
}

export default RichTextOutput;
