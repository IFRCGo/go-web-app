declare module 'docx4js' {
    export interface Node {
        name: string;
        prev: Node | null;
        next: Node | null;
        children: Node[] | null;
        attribs?: Record<string, string>;
        data?: string;
    }

    export const docx: {
        load: (file: File) => ({
            officeDocument: {
                content: {
                    _root: Node | undefined;
                } | undefined;
            } | undefined;
        }) | undefined;
    };
}
