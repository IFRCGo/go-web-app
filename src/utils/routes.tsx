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

type OmitInputRouteObjectKeys = 'Component' | 'element' | 'lazy';
type MyInputIndexRouteObject<T> = {
    title: string;
    componentProps: T & JSX.IntrinsicAttributes;
    component: () => Promise<{
        Component: (props: T) => React.ReactElement<any, any> | null;
    } & Omit<IndexRouteObject, ImmutableRouteKey | OmitInputRouteObjectKeys>>;
    parent?: MyOutputRouteObject;
} & Omit<IndexRouteObject, OmitInputRouteObjectKeys>;

type MyInputNonIndexRouteObject<T> = {
    title: string;
    componentProps: T & JSX.IntrinsicAttributes;
    component: () => Promise<{
        Component: (props: T) => React.ReactElement<any, any> | null;
    } & Omit<IndexRouteObject, ImmutableRouteKey | OmitInputRouteObjectKeys>>;
    parent?: MyOutputRouteObject;
} & Omit<NonIndexRouteObject, OmitInputRouteObjectKeys>;

type MyInputRouteObject<T> = (
    MyInputIndexRouteObject<T> | MyInputNonIndexRouteObject<T>
);

type OmitOutputRouteObjectKeys = 'Component' | 'element';

type MyOutputIndexRouteObject = {
    id: string;
    absolutePath: string;
    parent?: MyOutputRouteObject;
} & Omit<IndexRouteObject, OmitOutputRouteObjectKeys>;

type MyOutputNonIndexRouteObject = {
    id: string;
    absolutePath: string;
    parent?: MyOutputRouteObject;
} & Omit<NonIndexRouteObject, OmitOutputRouteObjectKeys>;

type MyOutputRouteObject = (
    MyOutputIndexRouteObject | MyOutputNonIndexRouteObject
);

export function wrapRoute<T>(
    myRouteOptions: MyInputIndexRouteObject<T>
): MyOutputIndexRouteObject
export function wrapRoute<T>(
    myRouteOptions: MyInputNonIndexRouteObject<T>
): MyOutputNonIndexRouteObject
export function wrapRoute<T>(
    myRouteOptions: MyInputRouteObject<T>,
): MyOutputRouteObject {
    if (myRouteOptions.index) {
        const {
            componentProps,
            component,
            parent,
            ...remainingRouteOptions
        } = myRouteOptions;
        const lazy = async () => {
            const {
                Component,
                ...otherProps
            } = await component();
            return {
                ...otherProps,
                // eslint-disable-next-line react/jsx-props-no-spreading
                element: <Component {...componentProps} />,
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
        componentProps,
        component,
        parent,
        ...remainingRouteOptions
    } = myRouteOptions;
    const lazy = async () => {
        const {
            Component,
            ...otherProps
        } = await component();
        return {
            ...otherProps,
            // eslint-disable-next-line react/jsx-props-no-spreading
            element: <Component {...componentProps} />,
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

export function unwrapRoute(wrappedRoutes: MyOutputRouteObject[]): RouteObject[] {
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
