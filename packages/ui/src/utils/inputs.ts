import { listToMap } from '@togglecorp/fujs';

import { Props as InputContainerProps } from '#components/InputContainer';

// eslint-disable-next-line import/prefer-default-export
export function extractInputContainerProps<MIXED_PROPS extends Partial<InputContainerProps>>(
    mixedProps: MIXED_PROPS,
): [Pick<MIXED_PROPS, keyof InputContainerProps>, Omit<MIXED_PROPS, keyof InputContainerProps>] {
    const keysToExtract: Record<(keyof InputContainerProps), boolean> = {
        className: true,
        containerRef: true,
        inputSectionRef: true,
        label: true,
        icons: true,
        input: true,
        actions: true,
        hint: true,
        error: true,
        errorOnTooltip: true,
        disabled: true,
        readOnly: true,
        prevValue: true,
        withPrevValue: true,
        highlightMode: true,
        required: true,
        variant: true,
        withAsterisk: true,
        spacing: true,
        withBackground: true,
        withDarkBackground: true,
        withPadding: true,
    };

    const keys = Object.keys(keysToExtract) as (keyof typeof keysToExtract)[];

    const props = listToMap(
        keys,
        (key) => key,
        (key) => mixedProps[key],
    );

    const remainingProps = {
        ...mixedProps,
    };

    keys.forEach((key) => {
        delete remainingProps[key];
    });

    return [props as Pick<MIXED_PROPS, keyof InputContainerProps>, remainingProps];
}
