import React from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import sanitizeHtml from 'sanitize-html';

import styles from './styles.module.css';

function useSanitizedHtml(rawHtml: string | null | undefined) {
    const sanitizedHtml = React.useMemo(() => {
        if (isNotDefined(rawHtml)) {
            return undefined;
        }

        const value = sanitizeHtml(
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
                    'iframe',
                    // some emergencies, like 3972, needed iframe reference to a dashboard
                    // 'base', 'canvas', 'video', // can be switched on when need occurs
                    // 'area', 'map', 'label', 'meter', // can be switched on when need occurs
                    // forbid: 'input', 'textarea', 'button',
                ],
                allowedAttributes: {
                    p: ['style'],
                    span: ['style'],
                    div: ['style'],
                    img: ['style', 'src', 'width', 'height', 'alt'],
                    iframe: ['style', 'src', 'width', 'height', 'frameborder'],
                    a: ['style', 'href'],
                },
                allowedSchemes: ['http', 'https', 'data'],
                allowedStyles: {
                    '*': {
                        'padding-left': [/^\d+px$/],
                        'font-size': [/^\d+px$/],
                        'text-align': [/.+/],
                    },
                    iframe: {
                        width: [/^\d+px$/],
                        height: [/^\d+px$/],
                        border: [/.+/],
                    },
                },
            },
        );

        return value;
    }, [rawHtml]);

    return sanitizedHtml;
}

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'dangerouslySetInnerHTML' | 'value' | 'children'> {
    value: string | null | undefined;
}

function HtmlOutput(props: Props) {
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
            className={_cs(styles.htmlOutput, className)}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={isDefined(sanitizedValue) ? {
                __html: sanitizedValue,
            } : undefined}
        />
    );
}

export default HtmlOutput;
