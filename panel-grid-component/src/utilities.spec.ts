import {
  calculateAdjacentAreas,
  combineAdjacentAreas,
  ResizeBar,
  resizeBarPosition,
  PanelGridState,
  findTemplateIndex,
  updateTemplateSizes,
} from "./utilities";

const areas = [
  ["a", "b", "c"],
  ["d", "b", "c"],
  ["e", "e", "c"],
];

const panelGridState: PanelGridState = {
  areaNames: areas,
  areaRects: {
    a: { x: 0, y: 0, width: 10, height: 10 },
    b: { x: 10, y: 0, width: 10, height: 20 },
    c: { x: 20, y: 0, width: 10, height: 30 },
    d: { x: 0, y: 10, width: 10, height: 10 },
    e: { x: 0, y: 20, width: 20, height: 10 },
  },
  gridTemplateRows: [
    { _kind: "px", value: 10 },
    { _kind: "px", value: 10 },
    { _kind: "px", value: 10 },
  ],
  gridTemplateColumns: [
    { _kind: "px", value: 10 },
    { _kind: "px", value: 10 },
    { _kind: "px", value: 10 },
  ],
};

const resizeBars = [
  {
    areaName: "e",
    position: "top",
  },
  {
    areaName: "c",
    position: "left",
  },
  {
    areaName: "a",
    position: "right",
  },
] as ResizeBar[];

describe("area parsing", () => {
  it("can calculate adjacent areas", () => {
    const adjacentAreaPairs = calculateAdjacentAreas(areas);
    expect(adjacentAreaPairs).toMatchSnapshot();
  });

  it("should combine adjacent areas between two children", () => {
    const adjacentAreaPairs = calculateAdjacentAreas(areas);
    const combinedAreaPairs = combineAdjacentAreas(adjacentAreaPairs);

    expect(combinedAreaPairs.length).toBeLessThan(adjacentAreaPairs.length);
    expect(combinedAreaPairs).toMatchSnapshot();
  });

  it("should position resize bars correctly", () => {
    const eBar = resizeBarPosition(panelGridState, resizeBars[0], 2);

    expect(eBar).toEqual({
      resizeBar: resizeBars[0],
      x: 0,
      y: 19,
      width: 20,
      height: 2,
    });

    const cBar = resizeBarPosition(panelGridState, resizeBars[1], 2);
    expect(cBar).toEqual({
      resizeBar: resizeBars[1],
      x: 19,
      y: 0,
      width: 2,
      height: 30,
    });
  });

  it("should find a resize bar's relevant template index", () => {
    expect(findTemplateIndex(areas, resizeBars[0])).toEqual({
      _kind: "row",
      value: 2,
    });
    expect(findTemplateIndex(areas, resizeBars[1])).toEqual({
      _kind: "column",
      value: 2,
    });
    expect(findTemplateIndex(areas, resizeBars[2])).toEqual({
      _kind: "column",
      value: 0,
    });
    expect(
      findTemplateIndex(areas, { areaName: "e", position: "right" }),
    ).toEqual({ _kind: "column", value: 1 });
  });

  it("should update template sizes", () => {
    expect(
      updateTemplateSizes(
        panelGridState,
        {
          resizeBar: resizeBars[0],
          start: { x: 0, y: 4 },
          end: { x: 0, y: 0 },
        },
        panelGridState,
      ).gridTemplateRows.at(-1),
    ).toEqual({ _kind: "px", value: 14 });
  });
});
