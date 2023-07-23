import { isNotDefined } from '@togglecorp/fujs';
import { expect, test } from 'vitest';
import { splitList } from './common';

test('Split list', () => {
    const list1 = [1, 2, 3, undefined, 2, 3, 5, 6, undefined, 10];
    const splittedList1Expected = [
        [1, 2, 3],
        [2, 3, 5, 6],
        [10],
    ];
    const splittedList1Result = splitList(list1, isNotDefined);
    expect(splittedList1Result).toEqual(splittedList1Expected);

    const list2 = [undefined, 1, 2, 3];
    const splittedList2Expected = [
        [1, 2, 3],
    ];
    const splittedList2Result = splitList(list2, isNotDefined);
    expect(splittedList2Result).toEqual(splittedList2Expected);

    const list3 = [undefined, 1, 2, 3, undefined];
    const splittedList3Expected = [
        [1, 2, 3],
    ];
    const splittedList3Result = splitList(list3, isNotDefined);
    expect(splittedList3Result).toEqual(splittedList3Expected);

    const list4 = [
        undefined, undefined, 1, 2, 3,
        undefined, 6, 8,
        undefined, 10,
        undefined, 13, 1, 2, 3, undefined];
    const splittedList4Expected = [
        [1, 2, 3],
        [6, 8],
        [10],
        [13, 1, 2, 3],
    ];
    const splittedList4Result = splitList(list4, isNotDefined);
    expect(splittedList4Result).toEqual(splittedList4Expected);

    const list5 = [1, 2, 3, undefined, undefined, undefined, 2];
    const splittedList5Expected = [
        [1, 2, 3],
        [2],
    ];
    const splittedList5Result = splitList(list5, isNotDefined);
    expect(splittedList5Result).toEqual(splittedList5Expected);

    const list6 = [1, 2, 3];
    const splittedList6Expected = [
        [1, 2, 3],
    ];
    const splittedList6Result = splitList(list6, isNotDefined);
    expect(splittedList6Result).toEqual(splittedList6Expected);
});
