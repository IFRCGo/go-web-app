import {
    useEffect,
    useRef,
} from 'react';
import {
    isNotDefined,
} from '@togglecorp/fujs';

import {
    getOpticallyCorrectedSpacingValue,
    getSpacingValue,
    SpacingMode,
    SpacingType,
} from '#utils/style';

interface Props {
    spacing?: SpacingType;
    offset?: number;
    modes?: SpacingMode[];
    withoutOpticalCorrection?: boolean;
    withAdditionalInlinePadding?: boolean;
}

// Shared style element and ref-count map to avoid injecting duplicate <style> tags
// when multiple component instances use the same spacing parameters.
let sharedStyleEl: HTMLStyleElement | null = null;
const ruleRefCount = new Map<string, number>();

function getOrCreateStyleEl(): HTMLStyleElement {
    if (!sharedStyleEl || !sharedStyleEl.isConnected) {
        sharedStyleEl = document.createElement('style');
        document.head.appendChild(sharedStyleEl);
    }
    return sharedStyleEl;
}

function buildCssRule(
    className: string,
    spacing: SpacingType,
    offset: number,
    modes: SpacingMode[],
    withoutOpticalCorrection: boolean | undefined,
    withAdditionalInlinePadding: boolean | undefined,
) {
    const spacingValue = getSpacingValue(spacing, offset);
    const declarations = modes.map((mode) => {
        if (mode === 'padding-inline' && withAdditionalInlinePadding) {
            return `${mode}: calc(${spacingValue} * 1.5 + var(--go-ui-spacing-2xs))`;
        }
        if (withoutOpticalCorrection) {
            return `${mode}: ${spacingValue}`;
        }
        return `${mode}: ${getOpticallyCorrectedSpacingValue(spacingValue, mode)}`;
    }).join('; ');
    return `.${className} { ${declarations} }`;
}

function useSpacingToken(props: Props) {
    const {
        spacing = 'md',
        modes = ['padding-inline', 'padding-block'],
        offset = 0,
        withoutOpticalCorrection,
        withAdditionalInlinePadding,
    } = props;

    // Build a deterministic key from the spacing parameters
    const key = `${spacing}__${offset}__${modes.join(',')}__${!!withoutOpticalCorrection}__${!!withAdditionalInlinePadding}`;
    // Use the key as the class name so identical params share the same rule
    const className = `go-ui-st-${key.replace(/[^a-z0-9]/gi, '-')}`;
    const classNameRef = useRef(className);
    classNameRef.current = className;

    useEffect(
        () => {
            if (isNotDefined(spacing)) {
                return undefined;
            }

            const currentClassName = classNameRef.current;
            const currentCount = ruleRefCount.get(currentClassName) ?? 0;

            if (currentCount === 0) {
                const styleEl = getOrCreateStyleEl();
                if (styleEl.sheet) {
                    const rule = buildCssRule(
                        currentClassName,
                        spacing,
                        offset,
                        modes,
                        withoutOpticalCorrection,
                        withAdditionalInlinePadding,
                    );
                    styleEl.sheet.insertRule(rule);
                }
            }

            ruleRefCount.set(currentClassName, currentCount + 1);

            return () => {
                const count = ruleRefCount.get(currentClassName) ?? 0;
                const newCount = count - 1;
                if (newCount <= 0) {
                    ruleRefCount.delete(currentClassName);
                    // Remove the rule from the shared sheet
                    const styleEl = sharedStyleEl;
                    if (styleEl?.sheet) {
                        const { cssRules } = styleEl.sheet;
                        for (let i = 0; i < cssRules.length; i += 1) {
                            if (cssRules[i].cssText.startsWith(`.${currentClassName}`)) {
                                styleEl.sheet.deleteRule(i);
                                break;
                            }
                        }
                    }
                } else {
                    ruleRefCount.set(currentClassName, newCount);
                }
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key],
    );

    return className;
}

export default useSpacingToken;
