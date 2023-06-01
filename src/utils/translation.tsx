import { Fragment } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

export function resolveToString(
    template: string,
    params: Record<string, string | number | boolean | null | undefined>,
) {
    if (isNotDefined(template)) {
        return '';
    }

    const parts = template.split('{');
    const resolvedParts = parts.map((part) => {
        const endIndex = part.indexOf('}');

        if (endIndex === -1) {
            return part;
        }

        const key = part.substring(0, endIndex);
        const value = params[key];
        if (isNotDefined(value)) {
            // eslint-disable-next-line no-console
            console.error(`value for key "${key}" not provided`);
            return '';
        }

        return part.replace(`${key}}`, String(value));
    });

    return resolvedParts.join('');
}

const emptyObject: Record<string, React.ReactNode> = {};
export function resolveToComponent(template: string, params = emptyObject) {
    if (isNotDefined(template)) {
        return '';
    }

    const parts = template.split('{');
    const resolvedParts = parts.map((part) => {
        const endIndex = part.indexOf('}');

        if (endIndex === -1) {
            return part;
        }

        const key = part.substring(0, endIndex);
        const value = params[key];
        if (isNotDefined(value)) {
            // eslint-disable-next-line no-console
            console.error(`value for key "${key}" not provided`);
            return null;
        }

        return (
            <>
                {/* And, replace with associated component */}
                {value}
                {/* Remove the key */}
                {part.replace(`${key}}`, '')}
            </>
        );
    });

    return (
        <>
            {resolvedParts.map((d, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={i}>
                    {d}
                </Fragment>
            ))}
        </>
    );
}
