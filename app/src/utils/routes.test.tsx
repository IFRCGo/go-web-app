import {
    expect,
    test,
} from 'vitest';

import {
    joinUrlPart,
    trimChar,
} from './routes.tsx';

// Edit an assertion and save to see HMR in action

test('Trim char on both sides', () => {
    expect(trimChar('/hari', '/')).toBe('hari');
    expect(trimChar('hari/', '/')).toBe('hari');
    expect(trimChar('/hari/', '/')).toBe('hari');
    expect(trimChar('//hari', '/')).toBe('/hari');
    expect(trimChar('//', '/')).toBe('');
    expect(trimChar('shyam', '/')).toBe('shyam');
});

test('Join url parts', () => {
    expect(joinUrlPart([''])).toBe('/');
    expect(joinUrlPart(['', ''])).toBe('/');

    expect(joinUrlPart(['/'])).toBe('/');
    expect(joinUrlPart(['/', '/'])).toBe('/');
    expect(joinUrlPart(['/', '/', '/'])).toBe('/');

    expect(joinUrlPart(['/', 'car'])).toBe('/car');
    expect(joinUrlPart(['/', 'car', 'audi'])).toBe('/car/audi');

    expect(joinUrlPart(['audi'])).toBe('/audi');
    expect(joinUrlPart(['car', 'audi'])).toBe('/car/audi');
    expect(joinUrlPart(['vehicle', 'car', 'audi'])).toBe('/vehicle/car/audi');
});
