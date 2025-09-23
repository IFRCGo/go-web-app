import type { ESLint } from 'eslint';
import { AST_NODE_TYPES, parse, TSESTree } from "@typescript-eslint/typescript-estree";
import { visitorKeys } from '@typescript-eslint/visitor-keys';

import { isDefined, isNotDefined } from '@togglecorp/fujs';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { JSONLanguage } from '@eslint/json';

interface Position {
    line: number;
    column: number;
    offset: number;
}

interface Location {
    start: Position;
    end: Position;
}

type Range = [number, number];

interface NodeBase {
    loc: Location;
    range: Range;
}

interface StringValue extends NodeBase {
    type: 'String';
    value: string;
}

interface MemberNode extends NodeBase {
    type: 'Member',
    name: StringValue;
    value: StringValue | ObjectNode;
}

interface ObjectNode extends NodeBase {
    type: 'Object';
    members: Node[];
}

type Node = MemberNode | ObjectNode;

function getMemberKey(node: TSESTree.MemberExpression) {
    // strings.title
    if (!node.computed && node.property?.type === "Identifier") {
        return node.property.name;
    }

    // strings['title']
    if (node.computed && node.property?.type === "Literal" && typeof node.property.value === "string") {
        return node.property.value;
    }

    return undefined;
}

function getViewComponent(body: TSESTree.ProgramStatement[]) {
    const exportDeclarationWithViewComponent = body.find(
        (node) => {
            if (node?.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
                return false;
            }

            if (node.declaration?.type !== AST_NODE_TYPES.FunctionDeclaration) {
                return false;
            }

            if (node.declaration.id?.name !== 'Component') {
                return false;
            }

            return true;
        }
    ) as TSESTree.ExportNamedDeclaration | undefined;

    if (exportDeclarationWithViewComponent) {
        return exportDeclarationWithViewComponent?.declaration as TSESTree.FunctionDeclaration | undefined;
    }

    const defaultExportDeclaration = body.find(
        (node) => node?.type === AST_NODE_TYPES.ExportDefaultDeclaration
    );

    if (!defaultExportDeclaration) {
        return undefined;
    }

    if (defaultExportDeclaration.declaration.type === AST_NODE_TYPES.FunctionDeclaration) {
        return defaultExportDeclaration.declaration;
    }

    const defaultComponentName = defaultExportDeclaration.declaration.type === AST_NODE_TYPES.Identifier
        ? defaultExportDeclaration.declaration.name
        : undefined;

    if (!defaultComponentName) {
        return undefined;
    }

    const defaultComponent = body.find((node) => (
        node.type === AST_NODE_TYPES.FunctionDeclaration
            && node.id.name === defaultComponentName
    ));

    return defaultComponent as TSESTree.FunctionDeclaration | undefined;
}

function traverseForStringsKeyUsage(node: TSESTree.Node, stringsVarName: string): string[] {
    if (node?.type === AST_NODE_TYPES.MemberExpression) {
        if (node.object?.type === AST_NODE_TYPES.Identifier) {
            if (stringsVarName !== node.object.name) {
                return [];
            }

            const stringKey = getMemberKey(node);

            if (isNotDefined(stringKey)) {
                return [];
            }

            return [stringKey];
        }
    }

    const keysToVisit = visitorKeys[node?.type];

    if (!keysToVisit) {
        return [];
    }

    return keysToVisit.flatMap((visitorKey) => {
        const childNode = node[visitorKey as keyof typeof node] as TSESTree.Node | null | undefined;

        if (isNotDefined(childNode)) {
            return [];
        }

        if (Array.isArray(childNode)) {
            return childNode.flatMap(
                (potentialNode) => traverseForStringsKeyUsage(potentialNode, stringsVarName)
            );
        }

        return traverseForStringsKeyUsage(childNode, stringsVarName);
    });
}

function getUsedKeys(code: string) {
    const ast = parse(
        code,
        {
            jsx: true,
            loc: false,
            range: true,
        },
    );

    const importNode = ast.body.find(
        (node) => node?.type === AST_NODE_TYPES.ImportDeclaration && node.source.value === './i18n.json'
    );

    if (!importNode) {
        return [];
    }

    const viewComponent = getViewComponent(ast.body);
    if (!viewComponent) {
        return [];
    }

    const variableDeclarations = viewComponent.body.body.filter((statement) => (
        statement?.type === AST_NODE_TYPES.VariableDeclaration
    ));
    const stringsDeclaration = variableDeclarations.find((statement) => (
        statement.declarations.findIndex((declarator) => (
            declarator.init?.type === AST_NODE_TYPES.CallExpression
                && declarator.init.callee?.type === AST_NODE_TYPES.Identifier
                && declarator.init.callee.name === 'useTranslation'
        )) !== -1
    ));

    const useTranslationDeclaration = stringsDeclaration?.declarations.find((declarator) => (
        declarator.init?.type === AST_NODE_TYPES.CallExpression
            && declarator.init.callee?.type === AST_NODE_TYPES.Identifier
            && declarator.init.callee.name === 'useTranslation'
    ));

    if (useTranslationDeclaration?.id?.type !== AST_NODE_TYPES.Identifier) {
        return [];
    }

    const stringsVarName = useTranslationDeclaration.id.name;

    if (isNotDefined(stringsVarName)) {
        return [];
    }

    const usedStringKeys = ast.body.flatMap((node) => (
        traverseForStringsKeyUsage(
            node,
            stringsVarName,
        )
    ));

    return usedStringKeys;
}


const i18nUsage: ESLint.Plugin = {
    meta: {
        name: 'eslint-plugin-i18n-usage',
        version: '0.0.1',
    },
    languages: {
        json: new JSONLanguage({ mode: "json" }),
    },
    configs: {
        recommended: {
            plugins: ['i18n-usage'],
            rules: {
                'i18n-usage/ensure-i18n-keys-used': 'warn',
            },
        },
    },
    rules: {
        "ensure-i18n-keys-used": {
            meta: {
                type: "problem",
                docs: {
                    description: "Ensure all keys in i18n.json are used in the component",
                    recommended: true
                },
                fixable: "code",
                schema: [],
                messages: {
                    unusedKey: "Unused key '{{key}}' found.",
                }
            },
            create: (context) => {
                const usedKeysMap: Record<string, boolean> = {};
                const indexFilePath = join(dirname(context.filename), 'index.tsx');
                const indexFileContent = readFileSync(indexFilePath, 'utf-8');

                const usedKeys = getUsedKeys(indexFileContent);
                usedKeys?.forEach((key) => {
                    usedKeysMap[key] = true;
                });

                let stringsStartLineNumber: number;
                let stringsEndLineNumber: number;

                return {
                    Object: (node: ObjectNode) => {
                        if (node.range[0] === 0 && Array.isArray(node.members)) {
                            const namespace = node.members.find(
                                (member) => member?.type === 'Member'
                                    ? member.name.value === 'namespace'
                                    : undefined
                            );

                            if(!namespace) {
                                context.report({
                                    loc: node.loc,
                                    message: 'The object must contain "namespace"',
                                });
                            }

                            const strings = node.members.find(
                                (member) => member?.type === 'Member'
                                    ? member.name.value === 'strings'
                                    : undefined
                            );

                            if (strings) {
                                stringsStartLineNumber = strings.loc.start.line;
                                stringsEndLineNumber = strings.loc.end.line;

                            } else {
                                context.report({
                                    loc: node.loc,
                                    message: 'The object must contain "strings"',
                                });
                            }

                            const topLevelKeys = node.members.map(
                                (member) => member.type === 'Member'
                                    ? member.name.value
                                    : undefined
                            ).filter(isDefined);

                            const extraKeys = topLevelKeys.filter(
                                (key) => key !== 'namespace' && key !== 'strings'
                            );

                            if (extraKeys.length !== 0) {
                                context.report({
                                    loc: node.loc,
                                    message: `Unknown keys ${extraKeys.join(', ')}`,
                                });
                            }
                        }
                    },
                    Member: (node: MemberNode) => {
                        if (isNotDefined(stringsStartLineNumber) || isNotDefined(stringsEndLineNumber)) {
                            return;
                        }

                        if (node.loc.start.line <= stringsStartLineNumber
                            || node.loc.end.line >= stringsEndLineNumber
                        ) {
                            return;
                        }

                        const key = node.name.value;

                        const sourceCodeText = 'text' in context.sourceCode
                            && typeof context.sourceCode.text === 'string'
                            ? context.sourceCode.text
                            : undefined;

                        if (!usedKeysMap[key]) {
                            context.report({
                                loc: node.name.loc,
                                messageId: 'unusedKey',
                                data: { key },
                                fix: sourceCodeText
                                    ? (fixer) => {
                                        if ('text' in context.sourceCode && typeof context.sourceCode.text === 'string') {
                                        }
                                        const range = node.range;
                                        const after = sourceCodeText[
                                            node.range[1]
                                        ];
                                        const before = sourceCodeText[
                                            node.range[0] - node.loc.start.column
                                        ];

                                        if (before === '\n') {
                                            range[0] = range[0] - node.loc.start.column;
                                        }

                                        if (after === ',') {
                                            range[1] = range[1] + 1;
                                        } else {
                                            range[0] = range[0] - 1;
                                        }

                                        return fixer.removeRange(range);
                                    }
                                : undefined
                            });
                        }
                    }
                }
            },
        },
    },
}

export default i18nUsage;
