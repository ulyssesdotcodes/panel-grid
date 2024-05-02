import { useLocalStorage } from "usehooks-ts";
import React, {
  CSSProperties,
  FunctionComponent,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
  PointerEvent,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useResizeDetector } from "react-resize-detector";
import {
  gridTemplateSizeFromString,
  gridTemplateSizeToString,
  Resize,
  ResizeBar,
  resizeBarPosition,
  PanelGridState,
  updateTemplateSizes,
  transpose,
  GridTemplateSize,
  GridTemplates,
  minimizeTemplateSizes,
  eq,
  cloneDeep,
} from "./utilities";

const ResizeBarElement: FunctionComponent<{
  x: number;
  y: number;
  width: number;
  height: number;
  onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: PointerEvent<SVGSVGElement>) => void;
  resizeBar: ResizeBar;
}> = ({
  resizeBar,
  x,
  y,
  width,
  height,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => (
  <svg
    data-testid={`resizebar-${resizeBar.areaName}-${resizeBar.position}`}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    style={{
      position: "absolute",
      top: y,
      left: x,
      width,
      height,
      cursor:
        resizeBar.position === "top" || resizeBar.position === "bottom"
          ? "row-resize"
          : "col-resize",
    }}
  ></svg>
);

const calculateAreaRects =
  (gridRef: HTMLDivElement | null) => (state: PanelGridState) => {
    if (!gridRef) return state;
    const newState = cloneDeep(state);
    const children = gridRef.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLDivElement;
      const style = getComputedStyle(child);
      newState.areaRects[style.gridArea] = child.getBoundingClientRect();
    }
    return newState;
  };

type PanelGridContextState = {
  minimize: (areaName: string, size: GridTemplateSize) => void;
  findResizeBar: (areaName: string) => ResizeBar | undefined;
  minimizedAreas: Array<string>;
};

const PanelGridContext = createContext<PanelGridContextState>({
  minimize: (areaName: string, size: GridTemplateSize) => {},
  findResizeBar: (areaName: string) => undefined,
  minimizedAreas: [],
});

const styles = {
  title: {
    opacity: 1,
    transition: "opacity .1s ease-out",
    transitionDelay: ".25s",
  },
  titleCollapsed: {
    opacity: 0,
    transitionDelay: "0s",
  },
};

export const Panel: FunctionComponent<
  PropsWithChildren<{
    gridArea: string;
    title?: ReactNode;
    collapsedSize: string;
    collapsedIcon?: ReactNode;
    expandedIcon?: ReactNode;
    resizeBorderStyle?: string;
    style?: CSSProperties;
    titleStyle?: CSSProperties;
  }>
> = ({
  children,
  title,
  gridArea,
  collapsedSize,
  collapsedIcon,
  expandedIcon,
  resizeBorderStyle = "1px solid rgba(0, 0, 0, 0.12)",
  style,
  titleStyle,
}) => {
  const panelGridContext = useContext(PanelGridContext);
  const [wrapperRect, setWrapperRect] = useState<DOMRect>();
  const [titleRect, setTitleRect] = useState<DOMRect>();
  const [iconRect, setIconRect] = useState<DOMRect>();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const isMinimized = panelGridContext.minimizedAreas.includes(gridArea);
  const resizeBar = panelGridContext.findResizeBar(gridArea);

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      setWrapperRect(wrapperRef.current.getBoundingClientRect());
    }
    if (titleRef.current) {
      setTitleRect(titleRef.current.getBoundingClientRect());
    }
    if (iconRef.current) {
      setIconRect(iconRef.current.getBoundingClientRect());
    }
  }, []);

  return resizeBar ? (
    <div
      ref={wrapperRef}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0.8em",
        [`border-${resizeBar.position}`]: resizeBorderStyle,
        gap: "0.4em",
        gridArea,
        ...style,
      }}
    >
      <div
        ref={titleRef}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexBasis: "2em",
          gap: "0.4em",
          ...titleStyle,
        }}
      >
        {collapsedSize && resizeBar.position === "right" && (
          <div
            ref={iconRef}
            style={{ display: "flex", flex: "0 0 auto" }}
            onClick={() =>
              wrapperRect &&
              titleRect &&
              iconRect &&
              panelGridContext.minimize(
                gridArea,
                gridTemplateSizeFromString(collapsedSize),
              )
            }
          >
            {isMinimized ? collapsedIcon : expandedIcon}
          </div>
        )}
        {(!isMinimized ||
          resizeBar?.position === "top" ||
          resizeBar?.position === "bottom") && (
          <div
            style={{
              flexGrow: 1,
              ...(isMinimized && styles.titleCollapsed),
              ...styles.title,
            }}
          >
            {title}
          </div>
        )}
        {collapsedSize && resizeBar.position !== "right" && (
          <div
            ref={iconRef}
            style={{ display: "flex", flex: "0 0 auto" }}
            onClick={() =>
              wrapperRect &&
              titleRect &&
              iconRect &&
              panelGridContext.minimize(
                gridArea,
                gridTemplateSizeFromString(collapsedSize),
              )
            }
          >
            {isMinimized ? collapsedIcon : expandedIcon}
          </div>
        )}
      </div>
      <div
        style={{
          flexBasis: "0px",
          flexGrow: 1,
          flexShrink: 1,
          display: isMinimized ? "none" : "block",
          overflowY: "clip",
        }}
      >
        {children}
      </div>
    </div>
  ) : (
    <>{children}</>
  );
};

export const PanelGrid: FunctionComponent<
  PropsWithChildren<{
    gridTemplateAreas: Exclude<CSSProperties["gridTemplateAreas"], undefined>;
    initialTemplates: {
      rows: Array<string>;
      columns: Array<string>;
    };
    resizeBars: Array<ResizeBar>;
    borderStyle?: string;
    style?: CSSProperties;
  }>
> = ({ gridTemplateAreas, initialTemplates, resizeBars, children, style }) => {
  const areaNames = [...gridTemplateAreas.matchAll(/"([^"]+)"/g)]
    .map((m) => m[1])
    .map((row) => row.split(" "));

  const gridRef = useRef<HTMLDivElement>(null);

  const [templateSizes, setTemplateSizes] = useLocalStorage<GridTemplates>(
    "shot-edit-grid-template-sizes",
    {
      minimizedAreas: [],
      gridTemplateRows: initialTemplates.rows.map(gridTemplateSizeFromString),
      gridTemplateColumns: initialTemplates.columns.map(
        gridTemplateSizeFromString,
      ),
    },
  );

  const [state, setState] = useState<PanelGridState>({
    areaNames,
    areaRects: {},
  });
  const [resize, setResize] = useState<Resize | false>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useResizeDetector({
    targetRef: gridRef,
    onResize: () => setState(calculateAreaRects(gridRef.current)),
  });

  const resizedTemplateSizes =
    resize === false
      ? templateSizes
      : updateTemplateSizes(state, resize, templateSizes);

  const minimizedTemplateSizes = minimizeTemplateSizes(
    minimizeTemplateSizes(resizedTemplateSizes, resizeBars, areaNames, "row"),
    resizeBars,
    transpose(areaNames),
    "column",
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div
        ref={gridRef}
        className="panel-grid"
        style={{
          display: "grid",
          gridTemplateAreas,
          gridTemplateRows: minimizedTemplateSizes.gridTemplateRows
            .map(gridTemplateSizeToString)
            .join(" "),
          gridTemplateColumns: minimizedTemplateSizes.gridTemplateColumns
            .map(gridTemplateSizeToString)
            .join(" "),
          width: "100%",
          height: "100%",
          transition: isAnimating
            ? "grid-template-rows .25s ease-in-out, grid-template-columns .25s ease-in-out"
            : undefined,
          ...style,
        }}
      >
        <PanelGridContext.Provider
          value={{
            minimize: (area: string, size: GridTemplateSize) => {
              setIsAnimating(true);
              setTimeout(() => {
                setIsAnimating(false);
                setState(calculateAreaRects(gridRef.current));
              }, 250);
              setTemplateSizes((templateSizes) => ({
                ...templateSizes,
                minimizedAreas: templateSizes.minimizedAreas.find(
                  (ma) => ma.area === area,
                )
                  ? templateSizes.minimizedAreas.filter(
                      (ma) => ma.area !== area,
                    )
                  : templateSizes.minimizedAreas.concat({ area, size }),
              }));
            },
            findResizeBar: (areaName: string) =>
              resizeBars.find((rb) => rb.areaName === areaName),
            minimizedAreas: templateSizes.minimizedAreas.map((ma) => ma.area),
          }}
        >
          {children}
        </PanelGridContext.Provider>
      </div>
      <div>
        {resizeBars
          .filter(
            (x) =>
              state.areaRects[x.areaName] &&
              !templateSizes.minimizedAreas.find(
                (ma) => ma.area === x.areaName,
              ),
          )
          .map((resizeBar) => resizeBarPosition(state, resizeBar))
          .map((resizeBarPos) =>
            resize && eq(resizeBarPos.resizeBar, resize.resizeBar)
              ? {
                  ...resizeBarPos,
                  x:
                    resize.resizeBar.position === "left" ||
                    resize.resizeBar.position === "right"
                      ? resizeBarPos.x + (resize.end.x - resize.start.x)
                      : resizeBarPos.x,
                  y:
                    resize.resizeBar.position === "top" ||
                    resize.resizeBar.position === "bottom"
                      ? resizeBarPos.y + (resize.end.y - resize.start.y)
                      : resizeBarPos.y,
                }
              : resizeBarPos,
          )
          .map((props) => (
            <ResizeBarElement
              {...props}
              key={`resizebar-${props.resizeBar.areaName}-${props.resizeBar.position}`}
              onPointerDown={(e) => {
                if (!resize) {
                  e.preventDefault();
                  (e.target as SVGElement)?.setPointerCapture?.(e.pointerId);
                  setState(calculateAreaRects(gridRef.current));
                  setResize({
                    resizeBar: props.resizeBar,
                    start: {
                      x: e.clientX,
                      y: e.clientY,
                    },
                    end: {
                      x: e.clientX,
                      y: e.clientY,
                    },
                  });
                }
              }}
              onPointerMove={(e) => {
                if (resize && resize.resizeBar) {
                  e.preventDefault();
                  e.stopPropagation();
                  setResize({
                    ...resize,
                    end: {
                      x: e.clientX,
                      y: e.clientY,
                    },
                  });
                }
              }}
              onPointerUp={(e) => {
                if (resize) {
                  e.preventDefault();
                  e.stopPropagation();
                  setState(calculateAreaRects(gridRef.current));
                  setTemplateSizes(resizedTemplateSizes);
                  setResize(false);
                }
              }}
            />
          ))}
      </div>
    </div>
  );
};
