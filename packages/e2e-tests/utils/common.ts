import { isNotDefined, isFalsyString, isTruthyString, isDefined } from '@togglecorp/fujs';

function getMaximumFractionDigits(value: number) {
    if (value < 1000) {
        return 2;
    }

    const formatter = new Intl.NumberFormat('default', { notation: 'compact' });
    const formattedParts = formatter.formatToParts(value);
    const fraction = formattedParts.find(({ type }) => type === 'fraction');

    if (isNotDefined(fraction) || isFalsyString(fraction.value)) {
        return 0;
    }

    if (Number(fraction.value) > 0.1) {
        return 1;
    }

    return 0;
}

interface FormatNumberOptions {
    currency?: boolean;
    unit?: Intl.NumberFormatOptions['unit'];
    maximumFractionDigits?: Intl.NumberFormatOptions['maximumFractionDigits'];
    compact?: boolean;
    separatorHidden?: boolean,
    language?: string,
}

export function formatNumber(
    value: number | string,
    options?: FormatNumberOptions,
) {
    const formattingOptions: Intl.NumberFormatOptions = {};

    const safeNumber = typeof value === 'string'
        ? Number(value)
        : value;

    if (isNotDefined(options)) {
        formattingOptions.maximumFractionDigits = getMaximumFractionDigits(safeNumber);
        return new Intl.NumberFormat('default', formattingOptions).format(safeNumber);
    }

    const {
        currency,
        unit,
        maximumFractionDigits,
        compact,
        separatorHidden,
        language,
    } = options;

    if (isTruthyString(unit)) {
        formattingOptions.unit = unit;
        formattingOptions.unitDisplay = 'short';
    }
    if (currency) {
        formattingOptions.currencyDisplay = 'narrowSymbol';
        formattingOptions.style = 'currency';
    }
    if (compact) {
        formattingOptions.notation = 'compact';
        formattingOptions.compactDisplay = 'short';
    }

    formattingOptions.useGrouping = !separatorHidden;

    if (isDefined(maximumFractionDigits)) {
        formattingOptions.maximumFractionDigits = maximumFractionDigits;
    } else {
        formattingOptions.maximumFractionDigits = getMaximumFractionDigits(safeNumber);
    }

    const newValue = new Intl.NumberFormat(language, formattingOptions)
        .format(safeNumber);

    return newValue;
}