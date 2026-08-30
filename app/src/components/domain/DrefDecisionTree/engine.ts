import { isNotDefined } from '@togglecorp/fujs';

import {
    type AnswerPath,
    type ContentKey,
    type DecisionTree,
    type NodeId,
    type Option,
    type OutcomeNode,
    type QuestionNode,
    type TreeNode,
} from './types';

interface ResolvedStep {
    nodeId: NodeId;
    questionKey: ContentKey;
    selectedValue: string;
    selectedLabelKey: ContentKey;
    noteKey?: ContentKey;
}

interface ResolvedState {
    // Answered questions, in order — drives the cumulative view from the wireframe.
    steps: ResolvedStep[];
    // The next unanswered question, if the path has not terminated.
    activeNodeId?: NodeId;
    activeQuestion?: QuestionNode;
    // The terminal recommendation, if the path reached one.
    outcome?: OutcomeNode;
    // True when the path ran into an undefined branch (`next === null`).
    isDeadEnd: boolean;
}

// Walk the answer path from the root and derive everything the UI renders. Pure.
// Tolerant of a stale path (e.g. after the tree is edited): it stops at the first
// step that no longer matches rather than throwing.
export function resolve(tree: DecisionTree, path: AnswerPath): ResolvedState {
    const steps: ResolvedStep[] = [];
    let currentId: NodeId | null = tree.root;

    for (let i = 0; i < path.length; i += 1) {
        const step = path[i];
        if (isNotDefined(step) || isNotDefined(currentId)) {
            break;
        }
        const node: TreeNode | undefined = tree.nodes[currentId];
        if (isNotDefined(node) || node.kind !== 'question' || currentId !== step.nodeId) {
            break;
        }
        const option: Option | undefined = node.options.find((opt) => opt.value === step.value);
        if (isNotDefined(option)) {
            break;
        }
        steps.push({
            nodeId: step.nodeId,
            questionKey: node.questionKey,
            selectedValue: option.value,
            selectedLabelKey: option.labelKey,
            noteKey: option.noteKey,
        });
        currentId = option.next;
    }

    if (isNotDefined(currentId)) {
        return { steps, isDeadEnd: true };
    }

    const node = tree.nodes[currentId];
    if (isNotDefined(node)) {
        return { steps, isDeadEnd: true };
    }
    if (node.kind === 'outcome') {
        return { steps, outcome: node, isDeadEnd: false };
    }
    return {
        steps,
        activeNodeId: currentId,
        activeQuestion: node,
        isDeadEnd: false,
    };
}

// Answer the currently-active question; returns a new path. No-op if no active question.
export function answer(tree: DecisionTree, path: AnswerPath, value: string): AnswerPath {
    const { activeNodeId } = resolve(tree, path);
    if (isNotDefined(activeNodeId)) {
        return path;
    }
    return [...path, { nodeId: activeNodeId, value }];
}

export function restart(): AnswerPath {
    return [];
}
