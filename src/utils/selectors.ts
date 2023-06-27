export function booleanValueSelector<T extends { value: boolean }>(option: T) {
    return option.value;
}
export function numericValueSelector<T extends { value: number }>(option: T) {
    return option.value;
}
export function stringValueSelector<T extends { value: string }>(option: T) {
    return option.value;
}

export function stringLabelSelector<T extends { label: string }>(option: T) {
    return option.label;
}

export function numericIdSelector<T extends { id: number }>(option: T) {
    return option.id;
}

export function stringNameSelector<T extends { name: string }>(option: T) {
    return option.name;
}

export function stringKeySelector<T extends { key: string }>(option: T) {
    return option.key;
}
