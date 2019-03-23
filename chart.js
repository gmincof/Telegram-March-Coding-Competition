(function() {
  "use strict";

  window.Chart = function(renderNode, chartData) {
    const skipGraphIndexes = [];

    renderNode.classList.add("chart");

    const chartFrag = document.createDocumentFragment();

    const chartTitleElem = document.createElement("h1");
    chartFrag.appendChild(chartTitleElem);

    const chartViewElem = document.createElement("div");
    chartViewElem.classList.add("chart-view");
    chartFrag.appendChild(chartViewElem);

    const chartThumbnailElem = document.createElement("div");
    chartThumbnailElem.classList.add("chart-thumbnail");
    chartFrag.appendChild(chartThumbnailElem);

    const chartSwitchElem = document.createElement("div");
    chartSwitchElem.classList.add("chart-switches");
    for (let i in chartData.names) {
      const chartSwitchLabelElem = document.createElement("label");

      const chartSwitchCheckboxElem = document.createElement("input");
      chartSwitchCheckboxElem.setAttribute("type", "checkbox");
      chartSwitchCheckboxElem.setAttribute("checked", true);
      chartSwitchCheckboxElem.setAttribute("value", i.slice(1));
      chartSwitchLabelElem.appendChild(chartSwitchCheckboxElem);

      chartSwitchLabelElem.appendChild(
        document.createTextNode(chartData.names[i])
      );
      chartSwitchLabelElem.style.color = chartData.colors[i];

      chartSwitchElem.appendChild(chartSwitchLabelElem);
    }
    chartSwitchElem.addEventListener("change", e => {
      const val = Number(e.target.value);
      if (skipGraphIndexes.includes(val))
        skipGraphIndexes.splice(skipGraphIndexes.indexOf(val), 1);
      else skipGraphIndexes.push(val);
      renderGraphs();
    });
    chartFrag.appendChild(chartSwitchElem);

    window.requestAnimationFrame(() => renderNode.appendChild(chartFrag));

    function initGraphs(renderNode, width, height) {
      const graphElems = Array.from(
        renderNode.querySelectorAll("svg")
      ).reverse();

      const graphsFrag = document.createDocumentFragment();

      const maxGraphsYpoint = chartData.columns
        .slice(1)
        .reduce((acc, val, i) => {
          if (skipGraphIndexes.includes(i)) return acc;
          val = Math.max.apply(null, val.slice(1));
          return val > acc ? val : acc;
        }, 0);

      for (let i = chartData.columns.length - 1; i >= 1; i--) {
        const graphElemIndex = i - 1;

        let svgElem, polylineElem;

        if (graphElems[graphElemIndex] === undefined) {
          svgElem = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svgElem.setAttribute("xmlns", "http://www.w3.org/2000/svg");

          polylineElem = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
          );
          polylineElem.setAttribute("fill", "none");
          polylineElem.setAttribute("stroke", chartData.colors[`y${i - 1}`]);
          polylineElem.setAttribute("stroke-width", "3px");
          svgElem.appendChild(polylineElem);
        } else {
          svgElem = graphElems[graphElemIndex];
          polylineElem = svgElem.children[0];
        }

        if (skipGraphIndexes.includes(graphElemIndex))
          svgElem.classList.add("hide");
        else if (svgElem.classList.contains("hide"))
          svgElem.classList.remove("hide");

        let points = "";

        const xPoints = chartData.columns[0].slice(1);
        const maxXwidth = width / (xPoints.length - 1);

        const yPoints = chartData.columns[i].slice(1);
        let maxYpoint = Math.max.apply(null, yPoints);
        maxYpoint += maxGraphsYpoint - maxYpoint;

        xPoints.forEach((_, j) => {
          const x = maxXwidth * j;
          let y = yPoints[j];
          if (y === maxYpoint) y = height;
          else y = (height / 100) * (y / maxYpoint) * 100;
          points += `${x},${y} `;
        });

        points = points.trim();

        polylineElem.setAttribute("points", points);

        if (graphElems[graphElemIndex] === undefined)
          graphsFrag.appendChild(svgElem);
      }

      renderNode.appendChild(graphsFrag);
    }

    function renderGraphs() {
      window.requestAnimationFrame(() => {
        initGraphs(
          chartViewElem,
          chartViewElem.offsetWidth,
          chartViewElem.offsetHeight
        );
        initGraphs(
          chartThumbnailElem,
          chartThumbnailElem.offsetWidth,
          chartThumbnailElem.offsetHeight
        );
      });
    }

    renderGraphs();

    let resizeTaskId = null;
    window.addEventListener("resize", () => {
      if (resizeTaskId !== null) clearTimeout(resizeTaskId);
      resizeTaskId = setTimeout(() => {
        resizeTaskId = null;
        renderGraphs();
      }, 100);
    });
  };
})();
