import { isNotDefined } from '@togglecorp/fujs';
import {
    expect,
    test,
} from 'vitest';

import {
    denormalizeList,
    splitList,
} from './common';

test('Split list', () => {
    const list1 = [1, 2, 3, undefined, 2, 3, 5, 6, undefined, 10];
    const separatedList1Expected = [
        [1, 2, 3],
        [2, 3, 5, 6],
        [10],
    ];
    const separatedList1Result = splitList(list1, isNotDefined);
    expect(separatedList1Result).toEqual(separatedList1Expected);

    const list2 = [undefined, 1, 2, 3];
    const separatedList2Expected = [
        [1, 2, 3],
    ];
    const separatedList2Result = splitList(list2, isNotDefined);
    expect(separatedList2Result).toEqual(separatedList2Expected);

    const list3 = [undefined, 1, 2, 3, undefined];
    const separatedList3Expected = [
        [1, 2, 3],
    ];
    const separatedList3Result = splitList(list3, isNotDefined);
    expect(separatedList3Result).toEqual(separatedList3Expected);

    const list4 = [
        undefined, undefined, 1, 2, 3,
        undefined, 6, 8,
        undefined, 10,
        undefined, 13, 1, 2, 3, undefined];
    const separatedList4Expected = [
        [1, 2, 3],
        [6, 8],
        [10],
        [13, 1, 2, 3],
    ];
    const separatedList4Result = splitList(list4, isNotDefined);
    expect(separatedList4Result).toEqual(separatedList4Expected);

    const list5 = [1, 2, 3, undefined, undefined, undefined, 2];
    const separatedList5Expected = [
        [1, 2, 3],
        [2],
    ];
    const separatedList5Result = splitList(list5, isNotDefined);
    expect(separatedList5Result).toEqual(separatedList5Expected);

    const list6 = [1, 2, 3];
    const separatedList6Expected = [
        [1, 2, 3],
    ];
    const separatedList6Result = splitList(list6, isNotDefined);
    expect(separatedList6Result).toEqual(separatedList6Expected);
});

test('Denormalize List', () => {
    const list = [{
        id: 1,
        country: 'Nepal',
        districts: [1, 2, 3],
    }, {
        id: 2,
        country: 'Afghanistan',
        districts: [1, 2, 3, 4, 5],
    }];
    const expected = [
        {
            id: 1,
            country: 'Nepal',
            district: 1,
        },
        {
            id: 1,
            country: 'Nepal',
            district: 2,
        },
        {
            id: 1,
            country: 'Nepal',
            district: 3,
        },
        {
            id: 2,
            country: 'Afghanistan',
            district: 1,
        },
        {
            id: 2,
            country: 'Afghanistan',
            district: 2,
        },
        {
            id: 2,
            country: 'Afghanistan',
            district: 3,
        },
        {
            id: 2,
            country: 'Afghanistan',
            district: 4,
        },
        {
            id: 2,
            country: 'Afghanistan',
            district: 5,
        },
    ];
    const result = denormalizeList(
        list,
        (li) => li.districts,
        (li, sli) => ({ id: li.id, country: li.country, district: sli }),
    );
    expect(result).toEqual(expected);

    interface User {
        id: number;
        name: string;
    }

    interface Post {
        id: number;
        userId: number;
        title: string;
    }

    const users: User[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
    ];

    const posts: Post[] = [
        { id: 1, userId: 1, title: 'Post by Alice 1' },
        { id: 2, userId: 1, title: 'Post by Alice 2' },
        { id: 3, userId: 2, title: 'Post by Bob 1' },
    ];

    const userToPostsSelector = (user: User) => posts.filter((post) => post.userId === user.id);
    const combineUserAndPost = (user: User, post: Post) => ({
        userId: user.id,
        userName: user.name,
        postId: post.id,
        postTitle: post.title,
    });

    const denormalizedData = denormalizeList(users, userToPostsSelector, combineUserAndPost);

    expect(denormalizedData).toEqual([
        {
            userId: 1, userName: 'Alice', postId: 1, postTitle: 'Post by Alice 1',
        },
        {
            userId: 1, userName: 'Alice', postId: 2, postTitle: 'Post by Alice 2',
        },
        {
            userId: 2, userName: 'Bob', postId: 3, postTitle: 'Post by Bob 1',
        },
    ]);

    const userToPostsSelectorTwo = () => [];
    const combineUserAndPostTwo = () => ({});

    const denormalizedData2 = denormalizeList(users, userToPostsSelectorTwo, combineUserAndPostTwo);
    expect(denormalizedData2).toEqual([]);

    const capitalizePostTitle = (user: User, post: Post) => ({
        userId: user.id, userName: user.name, postId: post.id, postTitle: post.title.toUpperCase(),
    });

    const denormalizedData3 = denormalizeList(users, userToPostsSelector, capitalizePostTitle);
    expect(denormalizedData3).toEqual([
        {
            userId: 1, userName: 'Alice', postId: 1, postTitle: 'POST BY ALICE 1',
        },
        {
            userId: 1, userName: 'Alice', postId: 2, postTitle: 'POST BY ALICE 2',
        },
        {
            userId: 2, userName: 'Bob', postId: 3, postTitle: 'POST BY BOB 1',
        },
    ]);
});
