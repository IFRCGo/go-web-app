import {
    listToMap,
    mapToList,
    randomString,
} from '@togglecorp/fujs';
import {
    IndexRouteObject,
    NonIndexRouteObject,
    RouteObject,
} from 'react-router-dom';

export function trimChar(str: string, char: string) {
    let op = str;
    if (op.endsWith(char)) {
        op = op.substring(0, op.length - 1);
    }
    if (op.startsWith(char)) {
        op = op.substring(char.length, op.length);
    }
    return op;
}

export function joinUrlPart(parts: string[]) {
    const url = parts
        .map((part) => part.trim())
        .map((part) => trimChar(part, '/'))
        .filter((part) => part !== '')
        .join('/');

    return url === ''
        ? '/'
        : `/${url}/`;
}

type ImmutableRouteKey = 'lazy' | 'caseSensitive' | 'path' | 'id' | 'index' | 'children';

type OmitInputRouteObjectKeys = 'Component' | 'element' | 'lazy' | 'children';
export type MyInputIndexRouteObject<T, K extends object> = {
    wrapperComponent?: (props: {
        children: React.ReactElement,
        context: K,
    }) => React.ReactElement;
    componentProps: T & JSX.IntrinsicAttributes;
    component: () => Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Component: (props: T) => React.ReactElement<any, any> | null;
    } & Omit<IndexRouteObject, ImmutableRouteKey | OmitInputRouteObjectKeys>>;
    parent?: MyOutputRouteObject<K>;
    context: K;
} & Omit<IndexRouteObject, OmitInputRouteObjectKeys>;

export type MyInputNonIndexRouteObject<T, K extends object> = {
    wrapperComponent?: (props: {
        children: React.ReactElement,
        context: K,
    }) => React.ReactElement;
    componentProps: T & JSX.IntrinsicAttributes;
    component: () => Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Component: (props: T) => React.ReactElement<any, any> | null;
    } & Omit<IndexRouteObject, ImmutableRouteKey | OmitInputRouteObjectKeys>>;
    parent?: MyOutputRouteObject<K>;
    context: K;
} & Omit<NonIndexRouteObject, OmitInputRouteObjectKeys>;

export type MyInputRouteObject<T, K extends object> = (
    MyInputIndexRouteObject<T, K> | MyInputNonIndexRouteObject<T, K>
);

type OmitOutputRouteObjectKeys = 'Component' | 'element';

export type MyOutputIndexRouteObject<K extends object> = {
    id: string;
    absolutePath: string;
    parent?: MyOutputRouteObject<K>;
} & Omit<IndexRouteObject, OmitOutputRouteObjectKeys> & K;

export type MyOutputNonIndexRouteObject<K extends object> = {
    id: string;
    absolutePath: string;
    parent?: MyOutputRouteObject<K>;
} & Omit<NonIndexRouteObject, OmitOutputRouteObjectKeys> & K;

export type MyOutputRouteObject<K extends object> = (
    MyOutputIndexRouteObject<K> | MyOutputNonIndexRouteObject<K>
);

export function wrapRoute<K extends object, T>(
    myRouteOptions: MyInputIndexRouteObject<T, K>
): MyOutputIndexRouteObject<K>
export function wrapRoute<K extends object, T>(
    myRouteOptions: MyInputNonIndexRouteObject<T, K>
): MyOutputNonIndexRouteObject<K>
export function wrapRoute<K extends object, T>(
    myRouteOptions: MyInputRouteObject<T, K>,
): MyOutputRouteObject<K> {
    if (myRouteOptions.index) {
        const {
            wrapperComponent: Wrapper,
            componentProps,
            component,
            parent,
            context,
            ...remainingRouteOptions
        } = myRouteOptions;
        const lazy = async () => {
            const {
                Component,
                ...otherProps
            } = await component();

            // eslint-disable-next-line react/jsx-props-no-spreading
            const element = <Component {...componentProps} />;
            // NOTE: Wrapper will only be mounted after waiting for the Component
            return {
                ...otherProps,
                element: Wrapper
                    ? <Wrapper context={context}>{element}</Wrapper>
                    : element,
            };
        };
        return {
            ...remainingRouteOptions,
            lazy,

            parent,
            absolutePath: parent?.absolutePath ?? '/',
            id: randomString(),
        };
    }

    const {
        wrapperComponent: Wrapper,
        componentProps,
        component,
        parent,
        context,
        ...remainingRouteOptions
    } = myRouteOptions;
    const lazy = async () => {
        const {
            Component,
            ...otherProps
        } = await component();
        // eslint-disable-next-line react/jsx-props-no-spreading
        const element = <Component {...componentProps} />;
        // NOTE: Wrapper will only be mounted after waiting for the Component
        return {
            ...otherProps,
            element: Wrapper
                ? <Wrapper context={context}>{element}</Wrapper>
                : element,
        };
    };

    const absolutePath = parent
        ? joinUrlPart([parent.absolutePath ?? '/', remainingRouteOptions.path ?? '/'])
        : remainingRouteOptions.path ?? '/';

    return {
        ...remainingRouteOptions,
        lazy,

        parent,
        absolutePath,
        id: randomString(),
    };
}

export function unwrapRoute<K extends object>(
    wrappedRoutes: MyOutputRouteObject<K>[],
): RouteObject[] {
    const mapping = listToMap(
        wrappedRoutes.filter((item) => !item.index),
        (item) => item.id,
        (item) => ({
            ...item,
        }),
    );

    wrappedRoutes.forEach((route) => {
        if (route.parent) {
            const parentId = route.parent.id;

            const parentRoute = mapping[parentId];
            if (parentRoute.children) {
                parentRoute.children.push(route);
            } else {
                parentRoute.children = [route];
            }
        }
    });

    const results = mapToList(
        mapping,
        (item) => item,
    ).filter((item) => !item.parent);

    return results;
}
