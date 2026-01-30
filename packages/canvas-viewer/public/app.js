let packData = null;
const outlineList = document.getElementById("outlineList");
const artifactView = document.getElementById("artifactView");
const evidenceContent = document.getElementById("evidenceContent");
const fileInput = document.getElementById("fileInput");

async function loadPackFromServer() {
  try {
    const params = new URLSearchParams(window.location.search);
    const packUrl = params.get("packUrl") || "pack.json";
    const res = await fetch(packUrl);
    if (!res.ok) return;
    const data = await res.json();
    setPack(data);
  } catch (err) {
    // ignore if not available
  }
}

function setPack(data) {
  packData = data;
  renderOutline();
  setActiveView("summaries");
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  setPack(JSON.parse(text));
});

function renderOutline() {
  outlineList.innerHTML = "";
  const nodes = packData?.artifacts?.outline?.nodes || [];
  if (!nodes.length) {
    const fallback = packData?.structure?.sections || packData?.structure?.pages || [];
    fallback.forEach((item) => {
      const label = item.title || `Page ${item.page_number}`;
      addOutlineItem(label);
    });
    return;
  }
  nodes.forEach((node) => addOutlineItem(node.title));
}

function addOutlineItem(label) {
  const li = document.createElement("li");
  li.textContent = label;
  outlineList.appendChild(li);
}

function setActiveView(view) {
  document.querySelectorAll(".toolbar button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  renderArtifact(view);
}

document.querySelectorAll(".toolbar button").forEach((btn) => {
  btn.addEventListener("click", () => setActiveView(btn.dataset.view));
});

function renderArtifact(view) {
  if (!packData) {
    artifactView.innerHTML = "<p>No CanvasPack loaded.</p>";
    return;
  }
  if (view === "summaries") renderSummaries();
  if (view === "runbook") renderRunbook();
  if (view === "flowcharts") renderFlowchart();
  if (view === "tables") renderTables();
  if (view === "qa") renderQa();
}

function renderSummaries() {
  const items = packData.artifacts?.summaries?.items || [];
  artifactView.innerHTML = `<h3>Summary</h3>${items
    .map((item) => renderLine(item.text, item.citations))
    .join("")}`;
}

function renderRunbook() {
  const steps = packData.artifacts?.runbook?.steps || [];
  artifactView.innerHTML = `<h3>Runbook</h3>${steps
    .map((step) => `<div class="card"><strong>${step.title}</strong><p>${step.instructions.join(" ")}</p>${renderCitations(step.citations)}</div>`)
    .join("")}`;
}

function renderFlowchart() {
  const mermaid = packData.artifacts?.flowcharts?.mermaid;
  artifactView.innerHTML = `<h3>Flowchart</h3>`;
  if (!mermaid) {
    artifactView.insertAdjacentHTML("beforeend", "<p>No flowchart available.</p>");
    return;
  }

  const container = document.createElement("div");
  container.className = "mermaid";
  container.textContent = mermaid;
  artifactView.appendChild(container);

  if (window.mermaid && typeof window.mermaid.run === "function") {
    try {
      window.mermaid.initialize({ startOnLoad: false });
      window.mermaid.run({ nodes: [container] });
      return;
    } catch (err) {
      // fall through to preformatted fallback
    }
  }

  const fallback = document.createElement("pre");
  fallback.textContent = mermaid;
  artifactView.appendChild(fallback);
}

function renderTables() {
  const tables = packData.artifacts?.tables?.tables || [];
  artifactView.innerHTML = tables
    .map(
      (table) => `
      <h3>${table.title}</h3>
      ${table.rows
        .map((row) => `<div><strong>${row.cells.join(" | ")}</strong> ${renderCitations(row.citations)}</div>`)
        .join("")}
    `
    )
    .join("");
}

function renderQa() {
  const items = packData.artifacts?.qa?.items || [];
  artifactView.innerHTML = `<h3>Q&A Seeds</h3>${items
    .map((item) => `<p>${item.question} ${renderCitations(item.citations)}</p>`)
    .join("")}`;
}

function renderLine(text, citations) {
  return `<p>${text} ${renderCitations(citations)}</p>`;
}

function renderCitations(citations = []) {
  if (!citations.length) return "";
  return citations
    .map((citation, index) => `<span class="citation" data-cite='${encodeURIComponent(JSON.stringify(citation))}'>Citation ${index + 1}</span>`)
    .join(" ");
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("citation")) {
    const citation = JSON.parse(decodeURIComponent(target.dataset.cite));
    evidenceContent.innerHTML = `
      <p><strong>Source:</strong> ${citation.kind}</p>
      <p>${citation.excerpt}</p>
    `;
  }
});

loadPackFromServer();
