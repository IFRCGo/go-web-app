import { readFileSync, writeFileSync } from 'fs';

const path = 'generated/translationTypes.ts';

const content = readFileSync(path, 'utf-8');

// If already added, skip
writeFileSync(path, `// eslint-disable-next-line @typescript-eslint/ban-ts-comment\n // @ts-nocheck\n${content}`);
console.log('✔ Added // @ts-nocheck to translationTypes.ts');
