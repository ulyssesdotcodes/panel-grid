type Span = {
  start: number;
  end: number;
};

type AdjacentAreaPair = {
  to: string;
  from: string;
  row: Span;
  column: Span;
};

type Rect = { x: number; y: number; width: number; height: number };
type AreaRects = Record<string, Rect>;

type GridTemplateSizeAuto = {
  _kind: "auto";
};
type GridTemplateSizePixel = {
  _kind: "px";
  value: number;
};
type GridTemplateSizeFr = {
  _kind: "fr";
  value: number;
};
type GridTemplateSizeEm = {
  _kind: "em";
  value: number;
};

export type GridTemplateSize =
  | GridTemplateSizeAuto
  | GridTemplateSizePixel
  | GridTemplateSizeFr
  | GridTemplateSizeEm
  | string;

export const gridTemplateSizeToString = (gridTemplateSize: GridTemplateSize) =>
  typeof gridTemplateSize === "string"
    ? gridTemplateSize
    : gridTemplateSize._kind === "auto"
    ? "auto"
    : gridTemplateSize._kind === "fr"
    ? `${gridTemplateSize.value}fr`
    : gridTemplateSize._kind === "em"
    ? `${gridTemplateSize.value}em`
    : `${gridTemplateSize.value}px`;

export const gridTemplateSizeFromString = (
  gridTemplateSize: string,
): GridTemplateSize =>
  gridTemplateSize === "auto"
    ? { _kind: "auto" }
    : gridTemplateSize.endsWith("fr")
    ? {
        _kind: "fr",
        value: Number(
          gridTemplateSize.substring(0, gridTemplateSize.length - 2),
        ),
      }
    : gridTemplateSize.endsWith("px")
    ? {
        _kind: "px",
        value: Number(
          gridTemplateSize.substring(0, gridTemplateSize.length - 2),
        ),
      }
    : gridTemplateSize.endsWith("em")
    ? {
        _kind: "em",
        value: Number(
          gridTemplateSize.substring(0, gridTemplateSize.length - 2),
        ),
      }
    : gridTemplateSize;

type BorderPosition = "top" | "right" | "bottom" | "left";

export type ResizeBar = {
  areaName: string;
  position: BorderPosition;
  minSize?: number;
  maxSize?: number;
};

export type PanelGridState = {
  areaNames: string[][];
  areaRects: AreaRects;
};

export type GridTemplates = {
  gridTemplateRows: GridTemplateSize[];
  gridTemplateColumns: GridTemplateSize[];
  minimizedAreas: Array<{ area: string; size: GridTemplateSize }>;
};

export type Vector2 = {
  x: number;
  y: number;
};

export type Resize = {
  resizeBar: ResizeBar;
  start: Vector2;
  end: Vector2;
};

const DEFAULT_RESIZE_BAR_SIZE = 16;

export const resizeBarPosition = (
  panelGridState: PanelGridState,
  resizeBar: ResizeBar,
  width = DEFAULT_RESIZE_BAR_SIZE,
): Rect & { resizeBar: ResizeBar } => ({
  resizeBar,
  x:
    panelGridState.areaRects[resizeBar.areaName].x +
    (resizeBar.position === "right"
      ? panelGridState.areaRects[resizeBar.areaName].width
      : 0) +
    (resizeBar.position === "left" || resizeBar.position === "right"
      ? -width * 0.5
      : 0),
  y:
    panelGridState.areaRects[resizeBar.areaName].y +
    (resizeBar.position === "bottom"
      ? panelGridState.areaRects[resizeBar.areaName].height
      : 0) +
    (resizeBar.position === "top" || resizeBar.position === "bottom"
      ? -width * 0.5
      : 0),
  width:
    resizeBar.position === "left" || resizeBar.position === "right"
      ? width
      : panelGridState.areaRects[resizeBar.areaName].width,
  height:
    resizeBar.position === "top" || resizeBar.position === "bottom"
      ? width
      : panelGridState.areaRects[resizeBar.areaName].height,
});

type TemplateIndex =
  | { _kind: "row"; value: number }
  | { _kind: "column"; value: number };

// util functions
const toReversed = <T>(arr: T[]): T[] => [...arr].reverse();
const arraywith = <T>(arr: T[], index: number, value: T): T[] => {
  const arrp = [...arr];
  arrp[index] = value;
  return arrp;
};
export const transpose = <T>(arr: T[][]): T[][] =>
  arr[0].map((_, i) => arr.map((row) => row[i]));
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
// TODO: hacky, rewrite
export const cloneDeep = (obj: any) => JSON.parse(JSON.stringify(obj));
export const eq = <T>(a: T, b: T): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export const findTemplateIndex = (
  areaNames: string[][],
  resizeBar: ResizeBar,
): TemplateIndex | undefined =>
  resizeBar.position === "top"
    ? areaNames.reduce<TemplateIndex | undefined>(
        (acc, row, idx) =>
          acc ?? row.includes(resizeBar.areaName)
            ? { _kind: "row", value: idx }
            : undefined,
        undefined,
      )
    : resizeBar.position === "bottom"
    ? toReversed(areaNames).reduce<TemplateIndex | undefined>(
        (acc, row, idx) =>
          acc ??
          (row.includes(resizeBar.areaName)
            ? { _kind: "row", value: areaNames.length - 1 - idx }
            : undefined),
        undefined,
      )
    : resizeBar.position === "left"
    ? areaNames.reduce<TemplateIndex | undefined>(
        (acc, row) =>
          acc ??
          (row.indexOf(resizeBar.areaName) !== -1
            ? { _kind: "column", value: row.indexOf(resizeBar.areaName) }
            : undefined),
        undefined,
      )
    : resizeBar.position === "right"
    ? areaNames.reduce<TemplateIndex | undefined>(
        (acc, row) =>
          acc ??
          (row.indexOf(resizeBar.areaName) !== -1
            ? {
                _kind: "column",
                value:
                  row.length - 1 - toReversed(row).indexOf(resizeBar.areaName),
              }
            : undefined),
        undefined,
      )
    : undefined;

export const CAPITALIZED_TEMPLATE_INDEX = {
  row: "Row",
  column: "Column",
};

export const updateTemplateSizes = (
  state: PanelGridState,
  resize: Resize,
  gridTemplates: GridTemplates,
): GridTemplates => {
  const templateIndex = findTemplateIndex(state.areaNames, resize.resizeBar);
  if (!templateIndex) return gridTemplates;

  const capitalizedTemplateIndex =
    CAPITALIZED_TEMPLATE_INDEX[templateIndex._kind];

  return {
    ...gridTemplates,
    [`gridTemplate${capitalizedTemplateIndex}s`]: arraywith(
      gridTemplates[
        `gridTemplate${capitalizedTemplateIndex}s` as Extract<
          keyof GridTemplates,
          "gridTemplateRows" | "gridTemplateColumns"
        >
      ],
      templateIndex.value,
      {
        _kind: "px",
        value: clamp(
          state.areaRects[resize.resizeBar.areaName][
            templateIndex._kind === "row" ? "height" : "width"
          ] +
            (templateIndex._kind === "row"
              ? (resize.end.y - resize.start.y) *
                (resize.resizeBar.position === "top" ? -1 : 1)
              : (resize.end.x - resize.start.x) *
                (resize.resizeBar.position === "left" ? -1 : 1)),
          resize.resizeBar.minSize ?? -Infinity,
          resize.resizeBar.maxSize ?? Infinity,
        ),
      },
    ),
  };
};

export const minimizeTemplateSizes = (
  resizedTemplateSizes: GridTemplates,
  resizeBars: ResizeBar[],
  areaNames: string[][],
  direction: "row" | "column",
) => {
  const capitalizedDirection = direction === "row" ? "Rows" : "Columns";
  const key = `gridTemplate${capitalizedDirection}` as keyof GridTemplates;
  return {
    ...resizedTemplateSizes,
    [key]: resizedTemplateSizes[key].map((templateSize, idx) => {
      const templateSizeMinimized = resizedTemplateSizes.minimizedAreas.filter(
        (ma) =>
          resizeBars.find(
            (rb) =>
              rb.areaName === ma.area &&
              (direction === "row"
                ? rb.position === "bottom" || rb.position === "top"
                : rb.position === "right" || rb.position === "left"),
          ),
      );
      const minimizedArea = areaNames[idx].map((area) =>
        templateSizeMinimized.find((ma) => ma.area === area),
      )[0];

      return minimizedArea?.size ?? templateSize;
    }),
  };
};

export const calculateAdjacentAreas = (
  areaNames: string[][],
): AdjacentAreaPair[] => {
  const adjacentAreaPairs: AdjacentAreaPair[] = [];
  for (let y = 0; y < areaNames.length; y++) {
    for (let x = 0; x < areaNames[y].length; x++) {
      if (
        x + 1 < areaNames[y].length &&
        areaNames[y][x] !== areaNames[y][x + 1]
      ) {
        adjacentAreaPairs.push({
          to: areaNames[y][x + 1],
          from: areaNames[y][x],
          row: {
            start: y,
            end: y,
          },
          column: {
            start: x,
            end: x + 1,
          },
        });
      }

      if (y + 1 < areaNames.length && areaNames[y][x] !== areaNames[y + 1][x]) {
        adjacentAreaPairs.push({
          to: areaNames[y + 1][x],
          from: areaNames[y][x],
          row: {
            start: y,
            end: y + 1,
          },
          column: {
            start: x,
            end: x,
          },
        });
      }
    }
  }
  return adjacentAreaPairs;
};

export const combineAdjacentAreas = (
  adjacentAreaPairs: AdjacentAreaPair[],
): AdjacentAreaPair[] =>
  Object.values(
    adjacentAreaPairs.reduce((acc, value) => {
      const currentFrom = acc[value.from] ?? {};
      const currentTo = currentFrom[value.to] ?? value;
      return {
        ...acc,
        [value.from]: {
          ...currentFrom,
          [value.to]: {
            ...currentTo,
            row: {
              start: Math.min(currentTo.row.start, value.row.start),
              end: Math.max(currentTo.row.end, value.row.end),
            },
            column: {
              start: Math.min(currentTo.column.start, value.column.start),
              end: Math.max(currentTo.column.end, value.column.end),
            },
          },
        },
      };
    }, {} as Record<string, Record<string, AdjacentAreaPair>>),
  ).flatMap((o) => Object.values(o));
