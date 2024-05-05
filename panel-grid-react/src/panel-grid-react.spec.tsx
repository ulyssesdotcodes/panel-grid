import matchers from "@testing-library/jest-dom/matchers";
import {
  fireEvent,
  getByTestId,
  render,
  waitFor,
} from "@testing-library/react";

import { PanelGrid } from "./panel-grid";

expect.extend(matchers);
const areas = ["left", "center", "right", "bottom"];
const internal = (
  <>
    {areas.map((area) => (
      <div
        key={area}
        data-testid={area}
        style={{
          gridArea: area,
        }}
      >
        {area}
      </div>
    ))}
  </>
);

describe("panel grid", () => {
  beforeAll(() => {
    window.PointerEvent = window.MouseEvent;
  });

  it("should render the children components", () => {
    const { container } = render(
      <div>
        <PanelGrid
          gridTemplateAreas={`
            "left center right"
            "left center right"
            "bottom bottom right"
          `}
          initialTemplates={{
            rows: ["auto", "1fr", "auto"],
            columns: ["auto", "auto", "auto"],
          }}
          resizeBars={[]}
        >
          {internal}
        </PanelGrid>
        ,
      </div>,
    );

    areas.forEach((area) => {
      expect(getByTestId(container, area)).toBeInTheDocument();
    });
  });

  it("should resize the template row / column", () => {
    const { container } = render(
      <div>
        <PanelGrid
          gridTemplateAreas={`
            "left center right"
            "left center right"
            "bottom bottom right"
          `}
          initialTemplates={{
            rows: ["auto", "1fr", "auto"],
            columns: ["auto", "auto", "auto"],
          }}
          resizeBars={[
            {
              areaName: "left",
              position: "right",
            },
            {
              areaName: "right",
              position: "left",
            },
            {
              areaName: "bottom",
              position: "top",
            },
          ]}
        >
          {internal}
        </PanelGrid>
        ,
      </div>,
    );

    fireEvent.pointerDown(getByTestId(container, "resizebar-bottom-top"), {
      clientX: 0,
      clientY: 400,
    });
    fireEvent.pointerMove(getByTestId(container, "resizebar-bottom-top"), {
      clientX: 0,
      clientY: 300,
    });

    expect(
      container
        .querySelector(".panel-grid")
        .style.gridTemplateRows.split(" ")
        .at(-1),
    ).toBe("100px");
  });
});
