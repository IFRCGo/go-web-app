import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

type PendingRemoval<KEY extends string | number> = {
    type: 'checklist';
    keys: KEY[] | undefined;
} | {
    type: 'delete';
    index: number;
};

interface Options<KEY extends string | number, ITEM> {
    value: ITEM[] | undefined;
    // NOTE: keySelector and createItem must be stable references, otherwise the
    // returned handlers are re-created on each render
    keySelector: (item: ITEM) => KEY;
    createItem: (key: KEY) => ITEM;
    setValue: (getNewValue: (previousValue: ITEM[] | undefined) => ITEM[] | undefined) => void;
    removeValue: (index: number) => void;
}

function useChecklistFormArray<KEY extends string | number, ITEM>(
    options: Options<KEY, ITEM>,
) {
    const {
        value,
        keySelector,
        createItem,
        setValue,
        removeValue,
    } = options;

    const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval<KEY> | undefined>();

    const applyKeys = useCallback(
        (keys: KEY[] | undefined) => {
            setValue((previousValue) => {
                const previousValueMapping = listToMap(previousValue, keySelector);

                return keys?.map((key) => previousValueMapping?.[key] ?? createItem(key));
            });
        },
        [setValue, keySelector, createItem],
    );

    const handleChecklistChange = useCallback(
        (keys: KEY[] | undefined) => {
            const hasRemovedKey = value?.some(
                (item) => isNotDefined(keys) || !keys.includes(keySelector(item)),
            );

            if (hasRemovedKey) {
                setPendingRemoval({ type: 'checklist', keys });
                return;
            }

            applyKeys(keys);
        },
        [value, keySelector, applyKeys],
    );

    const handleRemoveClick = useCallback(
        (index: number) => {
            setPendingRemoval({ type: 'delete', index });
        },
        [],
    );

    const handleRemovalCancel = useCallback(
        () => {
            setPendingRemoval(undefined);
        },
        [],
    );

    const handleRemovalConfirm = useCallback(
        () => {
            if (isNotDefined(pendingRemoval)) {
                return;
            }

            if (pendingRemoval.type === 'checklist') {
                applyKeys(pendingRemoval.keys);
            } else {
                removeValue(pendingRemoval.index);
            }

            setPendingRemoval(undefined);
        },
        [pendingRemoval, applyKeys, removeValue],
    );

    const selectedKeys = useMemo(
        () => value?.map(keySelector),
        [value, keySelector],
    );

    return {
        selectedKeys,
        pendingRemoval,
        handleChecklistChange,
        handleRemoveClick,
        handleRemovalCancel,
        handleRemovalConfirm,
    };
}

export default useChecklistFormArray;
