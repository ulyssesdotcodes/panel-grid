import {
  gridTemplateSizeFromString,
  gridTemplateSizeToString,
  Resize,
  ResizeBar,
  resizeBarPosition,
  updateTemplateSizes,
  transpose,
  GridTemplateSize,
  GridTemplates,
  minimizeTemplateSizes,
  eq,
  cloneDeep,
} from "./utilities";

import {
  LitElement,
  PropertyDeclaration,
  PropertyValueMap,
  css,
  html,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("panel-grid")
export class PanelGrid extends LitElement {
  static styles = css`
    .wrapper {
      width: 100%;
      height: 100%;
    }

    .panel-grid {
      display: grid;
    }
  `;

  @property({
    type: String,
    converter: (areas) => areas?.split("\n").map((a) => a.split(" ")) ?? [],
  })
  gridTemplateAreas: string[][] = [];

  @state()
  private _templateSizes: GridTemplates = {
    gridTemplateRows: this.gridTemplateAreas.map(() => "1fr"),
    gridTemplateColumns: this.gridTemplateAreas[0]?.map(() => "1fr"),
    minimizedAreas: [],
  };

  @state()
  private _isAnimating: boolean = false;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this._templateSizes = {
      gridTemplateRows: this.gridTemplateAreas.map(() => "1fr"),
      gridTemplateColumns: this.gridTemplateAreas[0]?.map(() => "1fr"),
      minimizedAreas: [],
    };
  }

  protected render() {
    console.log("gta", this.gridTemplateAreas, this._templateSizes);
    return html`
      <div class="wrapper">
        <div
          class="panel-grid"
          style=${styleMap({
            gridTemplateAreas: this.gridTemplateAreas
              .map((row) => `"${row.join(" ")}"`)
              .join("\n"),
            gridTemplateRows: this._templateSizes.gridTemplateRows
              .map(gridTemplateSizeToString)
              .join(" "),
            gridTemplateColumns: this._templateSizes.gridTemplateColumns
              .map(gridTemplateSizeToString)
              .join(" "),
            transition: this._isAnimating
              ? "grid-template-rows .25s ease-in-out, grid-template-columns .25s ease-in-out"
              : undefined,
          })}
        ></div>
      </div>
    `;
  }
}

// const ResizeBarElement: FunctionComponent<{
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
//   onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
//   onPointerUp: (e: PointerEvent<SVGSVGElement>) => void;
//   resizeBar: ResizeBar;
// }> = ({
//   resizeBar,
//   x,
//   y,
//   width,
//   height,
//   onPointerDown,
//   onPointerMove,
//   onPointerUp,
// }) => (
// );
//
// const calculateAreaRects =
//   (gridRef: HTMLDivElement | null) => (state: PanelGridState) => {
//     if (!gridRef) return state;
//     const newState = cloneDeep(state);
//     const children = gridRef.children;
//     for (let i = 0; i < children.length; i++) {
//       const child = children[i] as HTMLDivElement;
//       const style = getComputedStyle(child);
//       newState.areaRects[style.gridArea] = child.getBoundingClientRect();
//     }
//     return newState;
//   };
//
// type PanelGridContextState = {
//   minimize: (areaName: string, size: GridTemplateSize) => void;
//   findResizeBar: (areaName: string) => ResizeBar | undefined;
//   minimizedAreas: Array<string>;
// };
//
// const PanelGridContext = createContext<PanelGridContextState>({
//   minimize: (areaName: string, size: GridTemplateSize) => {},
//   findResizeBar: (areaName: string) => undefined,
//   minimizedAreas: [],
// });
//
// const styles = {
//   title: {
//     opacity: 1,
//     transition: "opacity .1s ease-out",
//     transitionDelay: ".25s",
//   },
//   titleCollapsed: {
//     opacity: 0,
//     transitionDelay: "0s",
//   },
// };
//
//
//   PropsWithChildrenExclude<CSSProperties["gridTemplateAreas"], undefined><{
//     gridTemplateAreas: Exclude<CSSProperties["gridTemplateAreas"], undefined>;
//     initialTemplates: {
//       rows: Array<string>;
//       columns: Array<string>;
//     };
//     resizeBars: Array<ResizeBar>;
//     borderStyle?: string;
//     style?: CSSProperties;
//   }>
// > = ({ gridTemplateAreas, initialTemplates, resizeBars, children, style }) => {
//   const areaNames = [...gridTemplateAreas.matchAll(/"([^"]+)"/g)]
//     .map((m) => m[1])
//     .map((row) => row.split(" "));
//
//   const gridRef = useRef<HTMLDivElement>(null);
//
//   const [templateSizes, setTemplateSizes] = useLocalStorage<GridTemplates>(
//     "shot-edit-grid-template-sizes",
//     {
//       minimizedAreas: [],
//       gridTemplateRows: initialTemplates.rows.map(gridTemplateSizeFromString),
//       gridTemplateColumns: initialTemplates.columns.map(
//         gridTemplateSizeFromString,
//       ),
//     },
//   );
//
//   const [state, setState] = useState<PanelGridState>({
//     areaNames,
//     areaRects: {},
//   });
//   const [resize, setResize] = useState<Resize | false>(false);
//   const [isAnimating, setIsAnimating] = useState<boolean>(false);
//
//   useResizeDetector({
//     targetRef: gridRef,
//     onResize: () => setState(calculateAreaRects(gridRef.current)),
//   });
//
//   const resizedTemplateSizes =
//     resize === false
//       ? templateSizes
//       : updateTemplateSizes(state, resize, templateSizes);
//
//   const minimizedTemplateSizes = minimizeTemplateSizes(
//     minimizeTemplateSizes(resizedTemplateSizes, resizeBars, areaNames, "row"),
//     resizeBars,
//     transpose(areaNames),
//     "column",
//   );
//
//   return (
//     <div style={{ height: "100%", width: "100%" }}>
//       <div
//         ref={gridRef}
//         className="panel-grid"
//         style={{
//           display: "grid",
//           gridTemplateAreas,
//           gridTemplateRows: minimizedTemplateSizes.gridTemplateRows
//             .map(gridTemplateSizeToString)
//             .join(" "),
//           gridTemplateColumns: minimizedTemplateSizes.gridTemplateColumns
//             .map(gridTemplateSizeToString)
//             .join(" "),
//           width: "100%",
//           height: "100%",
//           transition: isAnimating
//             ? "grid-template-rows .25s ease-in-out, grid-template-columns .25s ease-in-out"
//             : undefined,
//           ...style,
//         }}
//       >
//         <PanelGridContext.Provider
//           value={{
//             minimize: (area: string, size: GridTemplateSize) => {
//               setIsAnimating(true);
//               setTimeout(() => {
//                 setIsAnimating(false);
//                 setState(calculateAreaRects(gridRef.current));
//               }, 250);
//               setTemplateSizes((templateSizes) => ({
//                 ...templateSizes,
//                 minimizedAreas: templateSizes.minimizedAreas.find(
//                   (ma) => ma.area === area,
//                 )
//                   ? templateSizes.minimizedAreas.filter(
//                       (ma) => ma.area !== area,
//                     )
//                   : templateSizes.minimizedAreas.concat({ area, size }),
//               }));
//             },
//             findResizeBar: (areaName: string) =>
//               resizeBars.find((rb) => rb.areaName === areaName),
//             minimizedAreas: templateSizes.minimizedAreas.map((ma) => ma.area),
//           }}
//         >
//           {children}
//         </PanelGridContext.Provider>
//       </div>
//       <div>
//         {resizeBars
//           .filter(
//             (x) =>
//               state.areaRects[x.areaName] &&
//               !templateSizes.minimizedAreas.find(
//                 (ma) => ma.area === x.areaName,
//               ),
//           )
//           .map((resizeBar) => resizeBarPosition(state, resizeBar))
//           .map((resizeBarPos) =>
//             resize && eq(resizeBarPos.resizeBar, resize.resizeBar)
//               ? {
//                   ...resizeBarPos,
//                   x:
//                     resize.resizeBar.position === "left" ||
//                     resize.resizeBar.position === "right"
//                       ? resizeBarPos.x + (resize.end.x - resize.start.x)
//                       : resizeBarPos.x,
//                   y:
//                     resize.resizeBar.position === "top" ||
//                     resize.resizeBar.position === "bottom"
//                       ? resizeBarPos.y + (resize.end.y - resize.start.y)
//                       : resizeBarPos.y,
//                 }
//               : resizeBarPos,
//           )
//           .map((props) => (
//             <ResizeBarElement
//               {...props}
//               key={`resizebar-${props.resizeBar.areaName}-${props.resizeBar.position}`}
//               onPointerDown={(e) => {
//                 if (!resize) {
//                   e.preventDefault();
//                   (e.target as SVGElement)?.setPointerCapture?.(e.pointerId);
//                   setState(calculateAreaRects(gridRef.current));
//                   setResize({
//                     resizeBar: props.resizeBar,
//                     start: {
//                       x: e.clientX,
//                       y: e.clientY,
//                     },
//                     end: {
//                       x: e.clientX,
//                       y: e.clientY,
//                     },
//                   });
//                 }
//               }}
//               onPointerMove={(e) => {
//                 if (resize && resize.resizeBar) {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setResize({
//                     ...resize,
//                     end: {
//                       x: e.clientX,
//                       y: e.clientY,
//                     },
//                   });
//                 }
//               }}
//               onPointerUp={(e) => {
//                 if (resize) {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setState(calculateAreaRects(gridRef.current));
//                   setTemplateSizes(resizedTemplateSizes);
//                   setResize(false);
//                 }
//               }}
//             />
//           ))}
//       </div>
//     </div>
//   );
// };
