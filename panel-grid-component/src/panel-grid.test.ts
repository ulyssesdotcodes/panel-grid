import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import "./panel-grid";

browser.addCommand(
  "getStyle",
  async function (styleName: string) {
    return await browser.execute(
      (el, styleName) => el.style[styleName],
      this,
      styleName
    );
  },
  true
);

describe("Lit component testing", () => {
  it("should render", async () => {
    render(
      html`<panel-grid
        gridtemplateareas="left
middle
bottom"
      ></panel-grid>`,
      document.body
    );

    const panelGridGrid = await $("panel-grid").$(">>>.panel-grid");
    expect(panelGridGrid).toExist();
    const gridtemplaterows = await panelGridGrid.getStyle("grid-template-rows");
    expect(gridtemplaterows).toBe("1fr 1fr 1fr");
  });
});
