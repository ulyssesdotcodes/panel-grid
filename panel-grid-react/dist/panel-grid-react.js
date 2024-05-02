'use strict';

var usehooksTs = require('usehooks-ts');
var React = require('react');
var reactResizeDetector = require('react-resize-detector');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

// src/panel-grid-react.tsx

// src/utilities.ts
var gridTemplateSizeToString = (gridTemplateSize) => typeof gridTemplateSize === "string" ? gridTemplateSize : gridTemplateSize._kind === "auto" ? "auto" : gridTemplateSize._kind === "fr" ? `${gridTemplateSize.value}fr` : gridTemplateSize._kind === "em" ? `${gridTemplateSize.value}em` : `${gridTemplateSize.value}px`;
var gridTemplateSizeFromString = (gridTemplateSize) => gridTemplateSize === "auto" ? { _kind: "auto" } : gridTemplateSize.endsWith("fr") ? {
  _kind: "fr",
  value: Number(
    gridTemplateSize.substring(0, gridTemplateSize.length - 2)
  )
} : gridTemplateSize.endsWith("px") ? {
  _kind: "px",
  value: Number(
    gridTemplateSize.substring(0, gridTemplateSize.length - 2)
  )
} : gridTemplateSize.endsWith("em") ? {
  _kind: "em",
  value: Number(
    gridTemplateSize.substring(0, gridTemplateSize.length - 2)
  )
} : gridTemplateSize;
var DEFAULT_RESIZE_BAR_SIZE = 16;
var resizeBarPosition = (panelGridState, resizeBar, width = DEFAULT_RESIZE_BAR_SIZE) => ({
  resizeBar,
  x: panelGridState.areaRects[resizeBar.areaName].x + (resizeBar.position === "right" ? panelGridState.areaRects[resizeBar.areaName].width : 0) + (resizeBar.position === "left" || resizeBar.position === "right" ? -width * 0.5 : 0),
  y: panelGridState.areaRects[resizeBar.areaName].y + (resizeBar.position === "bottom" ? panelGridState.areaRects[resizeBar.areaName].height : 0) + (resizeBar.position === "top" || resizeBar.position === "bottom" ? -width * 0.5 : 0),
  width: resizeBar.position === "left" || resizeBar.position === "right" ? width : panelGridState.areaRects[resizeBar.areaName].width,
  height: resizeBar.position === "top" || resizeBar.position === "bottom" ? width : panelGridState.areaRects[resizeBar.areaName].height
});
var toReversed = (arr) => [...arr].reverse();
var arraywith = (arr, index, value) => {
  const arrp = [...arr];
  arrp[index] = value;
  return arrp;
};
var transpose = (arr) => arr[0].map((_, i) => arr.map((row) => row[i]));
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));
var eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
var findTemplateIndex = (areaNames, resizeBar) => resizeBar.position === "top" ? areaNames.reduce(
  (acc, row, idx) => acc ?? row.includes(resizeBar.areaName) ? { _kind: "row", value: idx } : void 0,
  void 0
) : resizeBar.position === "bottom" ? toReversed(areaNames).reduce(
  (acc, row, idx) => acc ?? (row.includes(resizeBar.areaName) ? { _kind: "row", value: areaNames.length - 1 - idx } : void 0),
  void 0
) : resizeBar.position === "left" ? areaNames.reduce(
  (acc, row) => acc ?? (row.indexOf(resizeBar.areaName) !== -1 ? { _kind: "column", value: row.indexOf(resizeBar.areaName) } : void 0),
  void 0
) : resizeBar.position === "right" ? areaNames.reduce(
  (acc, row) => acc ?? (row.indexOf(resizeBar.areaName) !== -1 ? {
    _kind: "column",
    value: row.length - 1 - toReversed(row).indexOf(resizeBar.areaName)
  } : void 0),
  void 0
) : void 0;
var CAPITALIZED_TEMPLATE_INDEX = {
  row: "Row",
  column: "Column"
};
var updateTemplateSizes = (state, resize, gridTemplates) => {
  const templateIndex = findTemplateIndex(state.areaNames, resize.resizeBar);
  if (!templateIndex)
    return gridTemplates;
  const capitalizedTemplateIndex = CAPITALIZED_TEMPLATE_INDEX[templateIndex._kind];
  return {
    ...gridTemplates,
    [`gridTemplate${capitalizedTemplateIndex}s`]: arraywith(
      gridTemplates[`gridTemplate${capitalizedTemplateIndex}s`],
      templateIndex.value,
      {
        _kind: "px",
        value: clamp(
          state.areaRects[resize.resizeBar.areaName][templateIndex._kind === "row" ? "height" : "width"] + (templateIndex._kind === "row" ? (resize.end.y - resize.start.y) * (resize.resizeBar.position === "top" ? -1 : 1) : (resize.end.x - resize.start.x) * (resize.resizeBar.position === "left" ? -1 : 1)),
          resize.resizeBar.minSize ?? -Infinity,
          resize.resizeBar.maxSize ?? Infinity
        )
      }
    )
  };
};
var minimizeTemplateSizes = (resizedTemplateSizes, resizeBars, areaNames, direction) => {
  const capitalizedDirection = direction === "row" ? "Rows" : "Columns";
  const key = `gridTemplate${capitalizedDirection}`;
  return {
    ...resizedTemplateSizes,
    [key]: resizedTemplateSizes[key].map((templateSize, idx) => {
      const templateSizeMinimized = resizedTemplateSizes.minimizedAreas.filter(
        (ma) => resizeBars.find(
          (rb) => rb.areaName === ma.area && (direction === "row" ? rb.position === "bottom" || rb.position === "top" : rb.position === "right" || rb.position === "left")
        )
      );
      const minimizedArea = areaNames[idx].map(
        (area) => templateSizeMinimized.find((ma) => ma.area === area)
      )[0];
      return minimizedArea?.size ?? templateSize;
    })
  };
};

// src/panel-grid-react.tsx
var ResizeBarElement = ({
  resizeBar,
  x,
  y,
  width,
  height,
  onPointerDown,
  onPointerMove,
  onPointerUp
}) => /* @__PURE__ */ React__default.default.createElement(
  "svg",
  {
    "data-testid": `resizebar-${resizeBar.areaName}-${resizeBar.position}`,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    style: {
      position: "absolute",
      top: y,
      left: x,
      width,
      height,
      cursor: resizeBar.position === "top" || resizeBar.position === "bottom" ? "row-resize" : "col-resize"
    }
  }
);
var calculateAreaRects = (gridRef) => (state) => {
  if (!gridRef)
    return state;
  const newState = cloneDeep(state);
  const children = gridRef.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const style = getComputedStyle(child);
    newState.areaRects[style.gridArea] = child.getBoundingClientRect();
  }
  return newState;
};
var PanelGridContext = React.createContext({
  minimize: (areaName, size) => {
  },
  findResizeBar: (areaName) => void 0,
  minimizedAreas: []
});
var styles = {
  title: {
    opacity: 1,
    transition: "opacity .1s ease-out",
    transitionDelay: ".25s"
  },
  titleCollapsed: {
    opacity: 0,
    transitionDelay: "0s"
  }
};
var Panel = ({
  children,
  title,
  gridArea,
  collapsedSize,
  collapsedIcon,
  expandedIcon,
  resizeBorderStyle = "1px solid rgba(0, 0, 0, 0.12)",
  style,
  titleStyle
}) => {
  const panelGridContext = React.useContext(PanelGridContext);
  const [wrapperRect, setWrapperRect] = React.useState();
  const [titleRect, setTitleRect] = React.useState();
  const [iconRect, setIconRect] = React.useState();
  const wrapperRef = React.useRef(null);
  const titleRef = React.useRef(null);
  const iconRef = React.useRef(null);
  const isMinimized = panelGridContext.minimizedAreas.includes(gridArea);
  const resizeBar = panelGridContext.findResizeBar(gridArea);
  React.useLayoutEffect(() => {
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
  return resizeBar ? /* @__PURE__ */ React__default.default.createElement(
    "div",
    {
      ref: wrapperRef,
      style: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0.8em",
        [`border-${resizeBar.position}`]: resizeBorderStyle,
        gap: "0.4em",
        gridArea,
        ...style
      }
    },
    /* @__PURE__ */ React__default.default.createElement(
      "div",
      {
        ref: titleRef,
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexBasis: "2em",
          gap: "0.4em",
          ...titleStyle
        }
      },
      collapsedSize && resizeBar.position === "right" && /* @__PURE__ */ React__default.default.createElement(
        "div",
        {
          ref: iconRef,
          style: { display: "flex", flex: "0 0 auto" },
          onClick: () => wrapperRect && titleRect && iconRect && panelGridContext.minimize(
            gridArea,
            gridTemplateSizeFromString(collapsedSize)
          )
        },
        isMinimized ? collapsedIcon : expandedIcon
      ),
      (!isMinimized || resizeBar?.position === "top" || resizeBar?.position === "bottom") && /* @__PURE__ */ React__default.default.createElement(
        "div",
        {
          style: {
            flexGrow: 1,
            ...isMinimized && styles.titleCollapsed,
            ...styles.title
          }
        },
        title
      ),
      collapsedSize && resizeBar.position !== "right" && /* @__PURE__ */ React__default.default.createElement(
        "div",
        {
          ref: iconRef,
          style: { display: "flex", flex: "0 0 auto" },
          onClick: () => wrapperRect && titleRect && iconRect && panelGridContext.minimize(
            gridArea,
            gridTemplateSizeFromString(collapsedSize)
          )
        },
        isMinimized ? collapsedIcon : expandedIcon
      )
    ),
    /* @__PURE__ */ React__default.default.createElement(
      "div",
      {
        style: {
          flexBasis: "0px",
          flexGrow: 1,
          flexShrink: 1,
          display: isMinimized ? "none" : "block",
          overflowY: "clip"
        }
      },
      children
    )
  ) : /* @__PURE__ */ React__default.default.createElement(React__default.default.Fragment, null, children);
};
var PanelGrid = ({ gridTemplateAreas, initialTemplates, resizeBars, children, style }) => {
  const areaNames = [...gridTemplateAreas.matchAll(/"([^"]+)"/g)].map((m) => m[1]).map((row) => row.split(" "));
  const gridRef = React.useRef(null);
  const [templateSizes, setTemplateSizes] = usehooksTs.useLocalStorage(
    "shot-edit-grid-template-sizes",
    {
      minimizedAreas: [],
      gridTemplateRows: initialTemplates.rows.map(gridTemplateSizeFromString),
      gridTemplateColumns: initialTemplates.columns.map(
        gridTemplateSizeFromString
      )
    }
  );
  const [state, setState] = React.useState({
    areaNames,
    areaRects: {}
  });
  const [resize, setResize] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  reactResizeDetector.useResizeDetector({
    targetRef: gridRef,
    onResize: () => setState(calculateAreaRects(gridRef.current))
  });
  const resizedTemplateSizes = resize === false ? templateSizes : updateTemplateSizes(state, resize, templateSizes);
  const minimizedTemplateSizes = minimizeTemplateSizes(
    minimizeTemplateSizes(resizedTemplateSizes, resizeBars, areaNames, "row"),
    resizeBars,
    transpose(areaNames),
    "column"
  );
  return /* @__PURE__ */ React__default.default.createElement("div", { style: { height: "100%", width: "100%" } }, /* @__PURE__ */ React__default.default.createElement(
    "div",
    {
      ref: gridRef,
      className: "panel-grid",
      style: {
        display: "grid",
        gridTemplateAreas,
        gridTemplateRows: minimizedTemplateSizes.gridTemplateRows.map(gridTemplateSizeToString).join(" "),
        gridTemplateColumns: minimizedTemplateSizes.gridTemplateColumns.map(gridTemplateSizeToString).join(" "),
        width: "100%",
        height: "100%",
        transition: isAnimating ? "grid-template-rows .25s ease-in-out, grid-template-columns .25s ease-in-out" : void 0,
        ...style
      }
    },
    /* @__PURE__ */ React__default.default.createElement(
      PanelGridContext.Provider,
      {
        value: {
          minimize: (area, size) => {
            setIsAnimating(true);
            setTimeout(() => {
              setIsAnimating(false);
              setState(calculateAreaRects(gridRef.current));
            }, 250);
            setTemplateSizes((templateSizes2) => ({
              ...templateSizes2,
              minimizedAreas: templateSizes2.minimizedAreas.find(
                (ma) => ma.area === area
              ) ? templateSizes2.minimizedAreas.filter(
                (ma) => ma.area !== area
              ) : templateSizes2.minimizedAreas.concat({ area, size })
            }));
          },
          findResizeBar: (areaName) => resizeBars.find((rb) => rb.areaName === areaName),
          minimizedAreas: templateSizes.minimizedAreas.map((ma) => ma.area)
        }
      },
      children
    )
  ), /* @__PURE__ */ React__default.default.createElement("div", null, resizeBars.filter(
    (x) => state.areaRects[x.areaName] && !templateSizes.minimizedAreas.find(
      (ma) => ma.area === x.areaName
    )
  ).map((resizeBar) => resizeBarPosition(state, resizeBar)).map(
    (resizeBarPos) => resize && eq(resizeBarPos.resizeBar, resize.resizeBar) ? {
      ...resizeBarPos,
      x: resize.resizeBar.position === "left" || resize.resizeBar.position === "right" ? resizeBarPos.x + (resize.end.x - resize.start.x) : resizeBarPos.x,
      y: resize.resizeBar.position === "top" || resize.resizeBar.position === "bottom" ? resizeBarPos.y + (resize.end.y - resize.start.y) : resizeBarPos.y
    } : resizeBarPos
  ).map((props) => /* @__PURE__ */ React__default.default.createElement(
    ResizeBarElement,
    {
      ...props,
      key: `resizebar-${props.resizeBar.areaName}-${props.resizeBar.position}`,
      onPointerDown: (e) => {
        if (!resize) {
          e.preventDefault();
          e.target?.setPointerCapture?.(e.pointerId);
          setState(calculateAreaRects(gridRef.current));
          setResize({
            resizeBar: props.resizeBar,
            start: {
              x: e.clientX,
              y: e.clientY
            },
            end: {
              x: e.clientX,
              y: e.clientY
            }
          });
        }
      },
      onPointerMove: (e) => {
        if (resize && resize.resizeBar) {
          e.preventDefault();
          e.stopPropagation();
          setResize({
            ...resize,
            end: {
              x: e.clientX,
              y: e.clientY
            }
          });
        }
      },
      onPointerUp: (e) => {
        if (resize) {
          e.preventDefault();
          e.stopPropagation();
          setState(calculateAreaRects(gridRef.current));
          setTemplateSizes(resizedTemplateSizes);
          setResize(false);
        }
      }
    }
  ))));
};

exports.Panel = Panel;
exports.PanelGrid = PanelGrid;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=panel-grid-react.js.map