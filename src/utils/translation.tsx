import { Fragment } from 'react';
import { isDefined } from '@togglecorp/fujs';

export function resolveToString(template: string, params: Record<string, string>) {
    if (!isDefined(template)) {
        return '';
    }

    const parts = template.split('{');
    const resolvedParts = parts.map((part) => {
        const endIndex = part.indexOf('}');

        if (endIndex === -1) {
            return part;
        }

        const key = part.substring(0, endIndex);
        if (!isDefined(params[key])) {
            // eslint-disable-next-line no-console
            console.error(`value for key "${key}" not provided`);
            return '';
        }

        return part.replace(`${key}}`, params[key]);
    });

    return resolvedParts.join('');
}

const emptyObject: Record<string, React.ReactNode> = {};
export function resolveToComponent(template: string, params = emptyObject) {
    if (!isDefined(template)) {
        return '';
    }

    const parts = template.split('{');
    const resolvedParts = parts.map((part) => {
        const endIndex = part.indexOf('}');

        if (endIndex === -1) {
            return part;
        }

        const key = part.substring(0, endIndex);
        if (!isDefined(params[key])) {
            // eslint-disable-next-line no-console
            console.error(`value for key "${key}" not provided`);
            return null;
        }

        return (
            <>
                {/* And, replace with associated component */}
                { params[key] }
                {/* Remove the key */}
                { part.replace(`${key}}`, '')}
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
