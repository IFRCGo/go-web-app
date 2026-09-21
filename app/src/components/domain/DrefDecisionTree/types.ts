// Stable identifier of a node within the decision graph.
export type NodeId = string;

// Abstract content identifier. Resolved to a translated string in index.tsx.
// The graph never holds user-facing text, so copy can change without touching structure.
export type ContentKey = string;

// What an outcome's call-to-action does. The graph declares INTENT only: where to
// go and what router state to seed there (e.g. initial values for the new-DREF
// form, built via getNewDrefRouteState). The target route owns any field-level
// derivation beyond that.
export type OutcomeAction =
    | {
        type: 'navigate';
        route: string;
        urlParams?: Record<string, string | number>;
        state?: unknown;
        // CTA label; falls back to the outcome's own label when omitted.
        labelKey?: ContentKey;
    }
    | {
        // Guidance published outside GO (the DREF Guidelines wiki, shared folders).
        type: 'external';
        url: string;
        labelKey: ContentKey;
    };

export interface Option {
    // Stable machine value. Branching and stored answers key off this, never off display copy.
    value: string;
    labelKey: ContentKey;
    // Optional helper note shown after this option is chosen.
    noteKey?: ContentKey;
    // Next node. `null` marks a branch that is intentionally not defined yet (a known gap).
    next: NodeId | null;
}

export interface QuestionNode {
    kind: 'question';
    questionKey: ContentKey;
    options: Option[];
}

// Guidance shown with an outcome. `link` renders after the text, so copy and target
// stay separable (the tree owns the url, i18n.json owns the wording).
export interface OutcomeNote {
    textKey: ContentKey;
    link?: {
        url: string;
        labelKey: ContentKey;
    };
}

export interface OutcomeNode {
    kind: 'outcome';
    outcomeKey: ContentKey;
    notes?: OutcomeNote[];
    // Empty for advisory-only outcomes, which carry their guidance in `notes`.
    actions: OutcomeAction[];
}

export type TreeNode = QuestionNode | OutcomeNode;

export interface DecisionTree {
    root: NodeId;
    nodes: Record<NodeId, TreeNode>;
}

// A single answered step (which node was answered, and with which option value).
export interface Answer {
    nodeId: NodeId;
    value: string;
}

export type AnswerPath = Answer[];
