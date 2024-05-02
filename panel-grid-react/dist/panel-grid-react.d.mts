import { FunctionComponent, PropsWithChildren, ReactNode, CSSProperties } from 'react';

type BorderPosition = "top" | "right" | "bottom" | "left";
type ResizeBar = {
    areaName: string;
    position: BorderPosition;
    minSize?: number;
    maxSize?: number;
};

declare const Panel: FunctionComponent<PropsWithChildren<{
    gridArea: string;
    title?: ReactNode;
    collapsedSize: string;
    collapsedIcon?: ReactNode;
    expandedIcon?: ReactNode;
    resizeBorderStyle?: string;
    style?: CSSProperties;
    titleStyle?: CSSProperties;
}>>;
declare const PanelGrid: FunctionComponent<PropsWithChildren<{
    gridTemplateAreas: Exclude<CSSProperties["gridTemplateAreas"], undefined>;
    initialTemplates: {
        rows: Array<string>;
        columns: Array<string>;
    };
    resizeBars: Array<ResizeBar>;
    borderStyle?: string;
    style?: CSSProperties;
}>>;

export { Panel, PanelGrid };
