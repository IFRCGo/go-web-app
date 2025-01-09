export interface TreemapNode {
    name: string;
    children?: TreemapNode[];
    data?: TreemapData;
    parent?: TreemapParentNode;
    depth?: number;
    color?: string;
    value?: number;
}

export interface TreemapParentNode {
    name: string;
    color?: string;
    data?: TreemapData;
}

export interface TreemapData {
    name: string;
    color?: string;
    children: TreemapNode[];
    value?: number;
}

export interface Props {
    d: TreemapNode;
    onClick?: (data: { area: string; component: string | null }) => void;
    activeIndex?: string | null;
}
