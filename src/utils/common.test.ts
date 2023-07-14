import { isNotDefined } from '@togglecorp/fujs';
import { expect, test } from 'vitest';
import { splitList } from './common';

test('Split list', () => {
    const list1 = [1, 2, 3, undefined, 2, 3, 5, 6, undefined, 10];
    const list2 = [undefined, 1, 2, 3];
    const list3 = [undefined, 1, 2, 3, undefined];
    const list4 = [
        undefined, 1, 2, 3,
        undefined, 6, 8,
        undefined, 10,
        undefined, 13, 1, 2, 3, undefined];
    const list5 = [1, 2, 3, undefined, undefined, undefined, 2];
    const list6 = [1, 2, 3];

    const splittedList1 = splitList(list1, isNotDefined);
    const splittedList2 = splitList(list2, isNotDefined);
    const splittedList3 = splitList(list3, isNotDefined);
    const splittedList4 = splitList(list4, isNotDefined);
    const splittedList5 = splitList(list5, isNotDefined);
    const splittedList6 = splitList(list6, isNotDefined);

    expect(splittedList1.length).toBe(3);
    expect(splittedList2.length).toBe(1);
    expect(splittedList3.length).toBe(1);
    expect(splittedList4.length).toBe(4);
    expect(splittedList5.length).toBe(2);
    expect(splittedList6.length).toBe(1);
});
