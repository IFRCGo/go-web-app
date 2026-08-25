import { isNotDefined } from '@togglecorp/fujs';

import {
    type DecisionTree,
    type NodeId,
} from './types';

interface TreeIssue {
    level: 'error' | 'warning';
    nodeId?: NodeId;
    message: string;
}

// Structural invariants for the decision graph. Run in engine.test.ts so a malformed edit
// (a dangling `next`, a duplicate option value, an orphan node) fails CI instead of shipping.
// Intentional gaps (`next: null`) and unreachable nodes are reported as warnings, not errors.
export function validateTree(tree: DecisionTree): TreeIssue[] {
    const issues: TreeIssue[] = [];
    const ids = new Set(Object.keys(tree.nodes));

    if (isNotDefined(tree.nodes[tree.root])) {
        issues.push({ level: 'error', message: `root "${tree.root}" is not present in nodes` });
    }

    Object.entries(tree.nodes).forEach(([id, node]) => {
        if (node.kind !== 'question') {
            return;
        }
        if (node.options.length < 2) {
            issues.push({ level: 'error', nodeId: id, message: 'question has fewer than 2 options' });
        }
        const seen = new Set<string>();
        node.options.forEach((opt) => {
            if (seen.has(opt.value)) {
                issues.push({ level: 'error', nodeId: id, message: `duplicate option value "${opt.value}"` });
            }
            seen.add(opt.value);

            if (isNotDefined(opt.next)) {
                issues.push({ level: 'warning', nodeId: id, message: `option "${opt.value}" has no destination yet (gap)` });
            } else if (!ids.has(opt.next)) {
                issues.push({ level: 'error', nodeId: id, message: `option "${opt.value}" points to unknown node "${opt.next}"` });
            }
        });
    });

    // Reachability from the root.
    const reachable = new Set<NodeId>();
    const stack: NodeId[] = [tree.root];
    while (stack.length > 0) {
        const id = stack.pop();
        if (isNotDefined(id) || reachable.has(id)) {
            continue; // eslint-disable-line no-continue
        }
        const node = tree.nodes[id];
        if (isNotDefined(node)) {
            continue; // eslint-disable-line no-continue
        }
        reachable.add(id);
        if (node.kind === 'question') {
            node.options.forEach((opt) => {
                if (!isNotDefined(opt.next)) {
                    stack.push(opt.next);
                }
            });
        }
    }
    ids.forEach((id) => {
        if (!reachable.has(id)) {
            issues.push({ level: 'warning', nodeId: id, message: 'node is unreachable from root' });
        }
    });

    return issues;
}

export function getTreeErrors(tree: DecisionTree): TreeIssue[] {
    return validateTree(tree).filter((issue) => issue.level === 'error');
}
