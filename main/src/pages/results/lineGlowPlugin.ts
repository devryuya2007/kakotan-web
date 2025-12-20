import type {Plugin} from "chart.js";

export const lineGlowPlugin: Plugin<"line"> = {
  id: "line-glow",
  beforeDatasetsDraw: (chart) => {
    const {ctx} = chart;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(242, 201, 125, 0.35)";
    ctx.globalAlpha = 1;
  },
  afterDatasetsDraw: (chart) => {
    chart.ctx.restore();
  },
};
