#!/usr/bin/env node
import {
  analyze,
  loadAliases,
  parseFile,
  resetAliases,
  resetWorkspaceCache,
  resolveImport
} from "./chunk-VTHIBN4B.js";
import {
  init_esm_shims
} from "./chunk-STPGDZXW.js";

// src/cli.ts
init_esm_shims();
import { cac } from "cac";
import pc3 from "picocolors";
import path5 from "path";

// src/render.ts
init_esm_shims();
import pc from "picocolors";
import path from "path";
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function clientLabel(text) {
  return pc.bold(pc.yellow(text));
}
function serverLabel(text) {
  return pc.bold(pc.blue(text));
}
function dimPath(p) {
  const dir = path.dirname(p);
  const base = path.basename(p);
  return pc.dim(dir === "." ? "" : dir + "/") + base;
}
function renderChain(chain, projectRoot) {
  const lines = [];
  for (let i = 0; i < chain.length; i++) {
    const filePath = chain[i];
    const rel = path.relative(projectRoot, filePath);
    const indent = "  ".repeat(i);
    const connector = i === 0 ? "" : `${indent}\u2514\u2500 `;
    const isRoot = i === 0;
    const label = isRoot ? `${connector}${pc.bold(pc.yellow("\u26A1"))} ${clientLabel(rel)} ${pc.dim("\u2190 use client")}` : `${connector}${dimPath(rel)}`;
    lines.push(label);
  }
  return lines.join("\n");
}
function renderTerminal(result) {
  const {
    projectRoot,
    totalFiles,
    clientBoundaries,
    clientGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces
  } = result;
  const LINE = pc.dim("\u2500".repeat(60));
  console.log();
  console.log(LINE);
  const frameworkLabel = {
    nextjs: "Next.js",
    remix: "Remix",
    "vite-rsc": "Vite RSC",
    unknown: "RSC"
  };
  console.log(
    pc.bold("  client-creep") + pc.dim(`  ${frameworkLabel[result.framework ?? "unknown"] ?? "RSC"} client component analysis`)
  );
  console.log(LINE);
  console.log();
  console.log(
    "  " + pc.bold("Project:") + " " + pc.dim(projectRoot)
  );
  console.log(
    "  " + pc.bold("Files scanned:") + " " + totalFiles
  );
  console.log(
    "  " + pc.bold("Client components:") + " " + clientLabel(`${clientGraph.length}`) + pc.dim(` (${clientBoundaries.length} boundaries)`)
  );
  console.log(
    "  " + pc.bold("Estimated client JS:") + " " + pc.bold(pc.yellow(formatBytes(totalClientBytes))) + pc.dim("  (estimate \u2014 raw source bytes)")
  );
  if (recoverableBytes > 0) {
    console.log(
      "  " + pc.bold("Potentially recoverable:") + " " + pc.bold(pc.green(formatBytes(recoverableBytes))) + pc.dim(`  (${creepCandidates.length} creep candidates)`)
    );
  }
  console.log();
  if (clientBoundaries.length === 0) {
    console.log(serverLabel("  \u2713 No client boundaries found."));
    console.log();
    return;
  }
  console.log(LINE);
  console.log(pc.bold("  Client Boundaries"));
  console.log(LINE);
  console.log();
  for (const boundary of clientBoundaries) {
    const signals = boundary.clientSignals.length > 0 ? pc.dim("  signals: ") + pc.cyan(boundary.clientSignals.slice(0, 4).join(", ")) : pc.dim("  ") + pc.red("no client signals detected") + pc.dim(" \u2190 possibly unnecessary");
    console.log(
      "  " + pc.yellow("\u26A1") + " " + pc.bold(boundary.displayPath) + signals
    );
    const pulled = clientGraph.filter(
      (n) => !n.isClientBoundary && whyTraces.get(n.filePath)?.boundaryRoot === boundary.filePath
    );
    if (pulled.length > 0) {
      const shown = pulled.slice(0, 3);
      for (const dep of shown) {
        console.log("     " + pc.dim("\u2514\u2500") + " " + pc.dim(dep.displayPath));
      }
      if (pulled.length > 3) {
        console.log("     " + pc.dim(`\u2514\u2500 \u2026 and ${pulled.length - 3} more`));
      }
    }
    console.log();
  }
  if (creepCandidates.length > 0) {
    console.log(LINE);
    console.log(
      pc.bold("  \u26A0  Accidental Client Creep") + pc.dim("  \u2014 components that may not need to be client")
    );
    console.log(LINE);
    console.log();
    const shown = creepCandidates.slice(0, 10);
    for (const candidate of shown) {
      console.log(
        "  " + pc.red("\u26A0") + " " + pc.bold(candidate.displayPath) + "  " + pc.dim(formatBytes(candidate.recoverableBytes)) + " potentially recoverable"
      );
      console.log(
        "    " + pc.dim(candidate.reason)
      );
      const trace = candidate.whyTrace;
      if (trace.chain.length > 1) {
        console.log("    " + pc.dim("Why client:"));
        console.log(
          renderChain(trace.chain, projectRoot).split("\n").map((l) => "    " + l).join("\n")
        );
      }
      console.log();
    }
    if (creepCandidates.length > 10) {
      console.log(
        pc.dim(`  \u2026 and ${creepCandidates.length - 10} more creep candidates. Use --json for full output.`)
      );
      console.log();
    }
  }
  const unnecessaryBoundaries = clientBoundaries.filter(
    (b) => b.clientSignals.length === 0
  );
  if (unnecessaryBoundaries.length > 0) {
    console.log(LINE);
    console.log(
      pc.bold("  \u2139  Possibly Unnecessary Boundaries") + pc.dim("  \u2014 'use client' with no detected client signals")
    );
    console.log(LINE);
    console.log();
    for (const b of unnecessaryBoundaries) {
      console.log(
        "  " + pc.yellow("?") + " " + pc.bold(b.displayPath) + pc.dim("  \u2014 review: no hooks, event handlers, or browser APIs found")
      );
    }
    console.log();
  }
  console.log(LINE);
  console.log(
    pc.dim(
      "  Sizes are estimates (raw source bytes). Run npx @next/bundle-analyzer for exact bundle impact."
    )
  );
  console.log(LINE);
  console.log();
}
function renderJson(result) {
  const output = {
    projectRoot: result.projectRoot,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      serverComponents: result.serverGraph.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes,
      creepCandidates: result.creepCandidates.length
    },
    boundaries: result.clientBoundaries.map((b) => ({
      file: b.displayPath,
      signals: b.clientSignals,
      sizeBytes: b.sizeBytes
    })),
    creepCandidates: result.creepCandidates.map((c) => ({
      file: c.displayPath,
      reason: c.reason,
      recoverableBytes: c.recoverableBytes,
      whyChain: c.whyTrace.chain.map(
        (f) => path.relative(result.projectRoot, f)
      )
    }))
  };
  console.log(JSON.stringify(output, null, 2));
}

// src/render-html.ts
init_esm_shims();
import fs from "fs";
import path2 from "path";
function formatBytes2(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function renderHtml(result, outputPath) {
  const html = buildHtml(result);
  fs.writeFileSync(outputPath, html, "utf-8");
}
function buildHtml(result) {
  const nodes = [];
  const links = [];
  const nodeIndex = /* @__PURE__ */ new Map();
  const visibleFiles = /* @__PURE__ */ new Set();
  for (const n of result.clientGraph) visibleFiles.add(n.filePath);
  for (const b of result.clientBoundaries) {
    const node = result.clientGraph.find((n) => n.filePath === b.filePath);
    if (node) node.imports.forEach((i) => visibleFiles.add(i));
  }
  const isCreep = new Set(result.creepCandidates.map((c) => c.filePath));
  let idx = 0;
  for (const filePath of visibleFiles) {
    const node = result.clientGraph.find((n) => n.filePath === filePath) || result.serverGraph.find((n) => n.filePath === filePath);
    if (!node) continue;
    let type = "server";
    if (node.isClientBoundary) type = "boundary";
    else if (isCreep.has(filePath)) type = "creep";
    else if (node.isClientGraph) type = "client";
    const trace = result.whyTraces.get(filePath);
    nodes.push({
      id: idx,
      label: path2.basename(filePath),
      path: node.displayPath,
      type,
      size: node.sizeBytes,
      signals: node.clientSignals,
      whyChain: trace ? trace.chain.map((f) => path2.relative(result.projectRoot, f)) : []
    });
    nodeIndex.set(filePath, idx);
    idx++;
  }
  for (const [filePath, deps] of Object.entries(
    Object.fromEntries(
      [...visibleFiles].map((f) => {
        const node = result.clientGraph.find((n) => n.filePath === f) || result.serverGraph.find((n) => n.filePath === f);
        return [f, node?.imports ?? []];
      })
    )
  )) {
    const sourceIdx = nodeIndex.get(filePath);
    if (sourceIdx === void 0) continue;
    for (const dep of deps) {
      const targetIdx = nodeIndex.get(dep);
      if (targetIdx !== void 0) {
        links.push({ source: sourceIdx, target: targetIdx });
      }
    }
  }
  const data = JSON.stringify({ nodes, links });
  const summary = {
    totalFiles: result.totalFiles,
    clientComponents: result.clientGraph.length,
    clientBoundaries: result.clientBoundaries.length,
    serverComponents: result.serverGraph.length,
    estimatedClientJs: formatBytes2(result.totalClientBytes),
    recoverable: formatBytes2(result.recoverableBytes),
    creepCandidates: result.creepCandidates.length,
    projectRoot: result.projectRoot
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>client-creep \u2014 ${path2.basename(result.projectRoot)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #1e1e2e; --surface: #181825; --overlay: #313244;
    --text: #cdd6f4; --subtext: #a6adc8; --dim: #585b70;
    --amber: #f9e2af; --amber-dim: #f38ba820;
    --blue: #89b4fa; --blue-dim: #89b4fa20;
    --red: #f38ba8; --red-dim: #f38ba820;
    --green: #a6e3a1; --mauve: #cba6f7;
    --border: #313244;
  }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* Header */
  #header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
  #header h1 { font-size: 15px; font-weight: 700; color: var(--amber); letter-spacing: -0.3px; }
  #header .project { font-size: 12px; color: var(--dim); }
  .stats { display: flex; gap: 16px; margin-left: auto; }
  .stat { text-align: center; }
  .stat .val { font-size: 18px; font-weight: 700; line-height: 1; }
  .stat .lbl { font-size: 10px; color: var(--subtext); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  .stat.client .val { color: var(--amber); }
  .stat.server .val { color: var(--blue); }
  .stat.creep .val { color: var(--red); }
  .stat.recover .val { color: var(--green); }

  /* Legend */
  #legend { padding: 8px 20px; border-bottom: 1px solid var(--border); display: flex; gap: 16px; align-items: center; flex-shrink: 0; }
  #legend span { font-size: 11px; color: var(--subtext); }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
  .dot.boundary { background: var(--amber); }
  .dot.creep { background: var(--red); }
  .dot.client { background: #fab387; }
  .dot.server { background: var(--blue); }
  .filter-btn { background: var(--overlay); border: 1px solid var(--border); color: var(--subtext); padding: 3px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.15s; }
  .filter-btn:hover, .filter-btn.active { background: var(--amber); color: var(--bg); border-color: var(--amber); }
  #search { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 4px 10px; border-radius: 4px; font-size: 12px; width: 180px; margin-left: auto; outline: none; }
  #search:focus { border-color: var(--amber); }

  /* Main */
  #main { display: flex; flex: 1; overflow: hidden; }
  #graph-container { flex: 1; position: relative; overflow: hidden; }
  svg { width: 100%; height: 100%; }

  /* Sidebar */
  #sidebar { width: 300px; border-left: 1px solid var(--border); overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
  #sidebar.empty { display: flex; align-items: center; justify-content: center; color: var(--dim); font-size: 13px; }
  .detail-header { font-weight: 600; font-size: 13px; word-break: break-all; }
  .detail-path { font-size: 11px; color: var(--dim); margin-top: 2px; word-break: break-all; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-top: 6px; }
  .badge.boundary { background: var(--amber-dim); color: var(--amber); }
  .badge.creep { background: var(--red-dim); color: var(--red); }
  .badge.client { background: #fab38720; color: #fab387; }
  .badge.server { background: var(--blue-dim); color: var(--blue); }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--dim); margin-top: 8px; }
  .signal-tag { display: inline-block; background: var(--overlay); color: var(--subtext); padding: 2px 6px; border-radius: 3px; font-size: 11px; margin: 2px 2px 0 0; font-family: monospace; }
  .chain { font-size: 12px; line-height: 1.8; }
  .chain-item { color: var(--subtext); padding-left: 0; }
  .chain-item.boundary-node { color: var(--amber); font-weight: 600; }
  .chain-arrow { color: var(--dim); margin-right: 4px; }
  .no-node { color: var(--dim); font-size: 13px; text-align: center; margin-top: 40px; }

  /* D3 styles */
  .node circle { cursor: pointer; transition: r 0.1s; stroke-width: 1.5px; }
  .node circle.boundary { fill: var(--amber); stroke: #f9e2af80; }
  .node circle.creep { fill: var(--red); stroke: #f38ba880; }
  .node circle.client { fill: #fab387; stroke: #fab38780; }
  .node circle.server { fill: var(--blue); stroke: #89b4fa80; }
  .node circle:hover { stroke-width: 3px; }
  .node circle.selected { stroke-width: 3px; stroke: white; }
  .link { stroke: var(--dim); stroke-opacity: 0.4; stroke-width: 1; }
  .link.client-link { stroke: var(--amber); stroke-opacity: 0.2; }
  .node text { font-size: 9px; fill: var(--subtext); pointer-events: none; }

  /* Scrollbar */
  #sidebar::-webkit-scrollbar { width: 4px; }
  #sidebar::-webkit-scrollbar-track { background: transparent; }
  #sidebar::-webkit-scrollbar-thumb { background: var(--overlay); border-radius: 2px; }
</style>
</head>
<body>

<div id="header">
  <h1>\u26A1 client-creep</h1>
  <span class="project">${summary.projectRoot}</span>
  <div class="stats">
    <div class="stat client"><div class="val">${summary.clientComponents}</div><div class="lbl">client</div></div>
    <div class="stat"><div class="val" style="color:var(--mauve)">${summary.clientBoundaries}</div><div class="lbl">boundaries</div></div>
    <div class="stat server"><div class="val">${summary.serverComponents}</div><div class="lbl">server</div></div>
    <div class="stat creep"><div class="val">${summary.creepCandidates}</div><div class="lbl">creep</div></div>
    <div class="stat recover"><div class="val">${summary.recoverable}</div><div class="lbl">recoverable</div></div>
    <div class="stat"><div class="val" style="color:var(--amber)">${summary.estimatedClientJs}</div><div class="lbl">est. client JS</div></div>
  </div>
</div>

<div id="legend">
  <span><span class="dot boundary"></span>use client boundary</span>
  <span><span class="dot creep"></span>accidental creep</span>
  <span><span class="dot client"></span>client (transitive)</span>
  <span><span class="dot server"></span>server</span>
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="boundaries">Boundaries only</button>
  <button class="filter-btn" data-filter="creep">Creep only</button>
  <input id="search" type="text" placeholder="Search files\u2026">
</div>

<div id="main">
  <div id="graph-container">
    <svg id="graph"></svg>
  </div>
  <div id="sidebar">
    <div class="no-node">Click a node to inspect it</div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script>
const RAW = ${data};
const TYPES = { boundary: 0, creep: 1, client: 2, server: 3 };
let currentFilter = 'all';
let searchQuery = '';
let selectedId = null;

function getVisibleNodes() {
  return RAW.nodes.filter(n => {
    if (currentFilter === 'boundaries' && n.type !== 'boundary') return false;
    if (currentFilter === 'creep' && n.type !== 'creep') return false;
    if (searchQuery && !n.path.toLowerCase().includes(searchQuery)) return false;
    return true;
  });
}

function nodeRadius(n) {
  const base = n.type === 'boundary' ? 7 : n.type === 'creep' ? 6 : 4;
  return base + Math.min(Math.sqrt(n.size / 500), 5);
}

let simulation, svg, linkGroup, nodeGroup;

function render() {
  const visibleNodes = getVisibleNodes();
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleLinks = RAW.links.filter(l =>
    visibleIds.has(typeof l.source === 'object' ? l.source.id : l.source) &&
    visibleIds.has(typeof l.target === 'object' ? l.target.id : l.target)
  );

  const container = document.getElementById('graph-container');
  const W = container.clientWidth, H = container.clientHeight;

  d3.select('#graph').selectAll('*').remove();

  svg = d3.select('#graph')
    .attr('viewBox', [0, 0, W, H])
    .call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', (e) => {
      g.attr('transform', e.transform);
    }));

  const g = svg.append('g');

  simulation = d3.forceSimulation(visibleNodes)
    .force('link', d3.forceLink(visibleLinks).id(d => d.id).distance(60).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 4));

  linkGroup = g.append('g')
    .selectAll('line')
    .data(visibleLinks)
    .join('line')
    .attr('class', l => {
      const src = typeof l.source === 'object' ? l.source : visibleNodes.find(n => n.id === l.source);
      return 'link' + (src && (src.type === 'boundary' || src.type === 'client') ? ' client-link' : '');
    });

  nodeGroup = g.append('g')
    .selectAll('g')
    .data(visibleNodes)
    .join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on('click', (e, d) => { e.stopPropagation(); selectNode(d); });

  nodeGroup.append('circle')
    .attr('r', d => nodeRadius(d))
    .attr('class', d => d.type + (d.id === selectedId ? ' selected' : ''));

  nodeGroup.append('text')
    .attr('dy', d => nodeRadius(d) + 10)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  simulation.on('tick', () => {
    linkGroup
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeGroup.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
  });

  svg.on('click', () => { selectedId = null; updateSidebar(null); });
}

function selectNode(d) {
  selectedId = d.id;
  d3.selectAll('.node circle').attr('class', n => n.type + (n.id === selectedId ? ' selected' : ''));
  updateSidebar(d);
}

function updateSidebar(node) {
  const sb = document.getElementById('sidebar');
  if (!node) {
    sb.innerHTML = '<div class="no-node">Click a node to inspect it</div>';
    return;
  }

  const badgeLabel = { boundary: '\u26A1 use client boundary', creep: '\u26A0 accidental creep', client: 'client (transitive)', server: 'server component' };
  const signalsHtml = node.signals.length
    ? node.signals.map(s => \`<span class="signal-tag">\${s}</span>\`).join('')
    : '<span style="color:var(--dim);font-size:12px">none detected</span>';

  const chainHtml = node.whyChain.length > 1
    ? node.whyChain.map((f, i) => {
        const isBoundary = i === 0;
        return \`<div class="chain-item \${isBoundary ? 'boundary-node' : ''}">
          \${i > 0 ? '<span class="chain-arrow">' + '  '.repeat(i) + '\u2514\u2500</span>' : '\u26A1'}
          \${f}
        </div>\`;
      }).join('')
    : '<span style="color:var(--dim);font-size:12px">this is the boundary root</span>';

  sb.innerHTML = \`
    <div>
      <div class="detail-header">\${node.label}</div>
      <div class="detail-path">\${node.path}</div>
      <span class="badge \${node.type}">\${badgeLabel[node.type]}</span>
    </div>
    <div>
      <div class="section-title">Client signals</div>
      <div style="margin-top:6px">\${signalsHtml}</div>
    </div>
    <div>
      <div class="section-title">Why client?</div>
      <div class="chain" style="margin-top:6px">\${chainHtml}</div>
    </div>
    <div>
      <div class="section-title">File size</div>
      <div style="margin-top:4px;font-size:12px;color:var(--subtext)">\${formatBytes(node.size)}</div>
    </div>
  \`;
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// Search
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

// Initial render
render();
window.addEventListener('resize', render);
</script>
</body>
</html>`;
}

// src/watch.ts
init_esm_shims();
import fs2 from "fs";
import pc2 from "picocolors";
async function runWatch(targetDir) {
  let debounce = null;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    process.stdout.write("\x1Bc");
    process.stdout.write(pc2.dim("  Scanning\u2026\r"));
    try {
      resetAliases();
      resetWorkspaceCache();
      const result = await analyze(targetDir);
      renderTerminal(result);
      console.log(pc2.dim("  Watching for changes\u2026 (Ctrl+C to stop)"));
    } catch (err) {
      console.error(pc2.red(`  Error: ${err instanceof Error ? err.message : String(err)}`));
    } finally {
      running = false;
    }
  };
  await run();
  const watcher = fs2.watch(
    targetDir,
    { recursive: true },
    (_event, filename) => {
      if (!filename) return;
      if (filename.includes("node_modules") || filename.includes(".next") || filename.includes("dist") || filename.includes(".git"))
        return;
      if (!/\.(tsx?|jsx?|mjs|mts)$/.test(filename)) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 400);
    }
  );
  process.on("SIGINT", () => {
    watcher.close();
    console.log(pc2.dim("\n  Stopped watching."));
    process.exit(0);
  });
  await new Promise(() => {
  });
}

// src/push.ts
init_esm_shims();
import path3 from "path";
async function detectRepoFromGit(projectRoot) {
  try {
    const { execa } = await import("./execa-MNBESVMJ.js");
    const { stdout } = await execa("git", ["remote", "get-url", "origin"], { cwd: projectRoot });
    const url = stdout.trim();
    const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
    if (sshMatch) return { owner: sshMatch[1], name: sshMatch[2] };
    const httpsMatch = url.match(/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
    if (httpsMatch) return { owner: httpsMatch[1], name: httpsMatch[2] };
  } catch {
  }
  return null;
}
async function pushToDashboard(result, options, scanDurationMs) {
  const dashboardUrl = (options.dashboardUrl ?? "https://client-creep-dashboard.vercel.app").replace(/\/$/, "");
  let owner = options.owner;
  let repoName = options.repo;
  if (!owner || !repoName) {
    const detected = await detectRepoFromGit(result.projectRoot);
    if (detected) {
      owner = owner ?? detected.owner;
      repoName = repoName ?? detected.name;
    } else {
      owner = owner ?? "unknown";
      repoName = repoName ?? path3.basename(result.projectRoot);
    }
  }
  const payload = {
    token: options.token,
    owner,
    name: repoName,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      creepCandidates: result.creepCandidates.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes
    },
    scanDurationMs: scanDurationMs ?? null,
    engineVersion: "client-creep@0.3.0",
    // Include full JSON payload for the detail view
    payload: {
      projectRoot: result.projectRoot,
      totalFiles: result.totalFiles,
      creepCandidates: result.creepCandidates.map((c) => ({
        file: c.displayPath,
        recoverableKb: c.recoverableBytes / 1024,
        chain: c.whyTrace.chain.map((f) => result.clientGraph.find((n) => n.filePath === f)?.displayPath ?? f).join(" \u2192 "),
        signals: c.whyTrace.chain.length
      })),
      boundaries: result.clientBoundaries.map((b) => ({
        file: b.displayPath,
        signals: b.clientSignals.length,
        kb: b.sizeBytes / 1024
      }))
    }
  };
  try {
    const response = await fetch(`${dashboardUrl}/api/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    if (!response.ok) {
      return { ok: false, error: json.error ?? `HTTP ${response.status}` };
    }
    return {
      ok: true,
      analysisId: json.analysisId,
      dashboardUrl: json.dashboard
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Network error: ${message}` };
  }
}

// src/fix.ts
init_esm_shims();
import fs3 from "fs";
import path4 from "path";
function applyFix(candidates) {
  const fixed = [];
  const skipped = [];
  for (const candidate of candidates) {
    try {
      const original = fs3.readFileSync(candidate.filePath, "utf-8");
      const patched = removeUseClientDirective(original);
      if (patched === original) {
        skipped.push(candidate.filePath);
      } else {
        fs3.writeFileSync(candidate.filePath, patched, "utf-8");
        fixed.push(candidate.filePath);
      }
    } catch {
      skipped.push(candidate.filePath);
    }
  }
  return { fixed, skipped };
}
function fixBarrels(result) {
  const barrelsFixed = [];
  const componentsAdded = [];
  const skipped = [];
  const nodeByPath = /* @__PURE__ */ new Map();
  for (const node of [...result.clientBoundaries, ...result.clientGraph]) {
    nodeByPath.set(node.filePath, node);
  }
  const aliases = loadAliases(result.projectRoot);
  for (const boundary of result.clientBoundaries) {
    const base = path4.basename(boundary.filePath, path4.extname(boundary.filePath));
    if (base !== "index") continue;
    const parsed = parseFile(boundary.filePath);
    if (!parsed.hasUseClient || parsed.reExportSources.length === 0) continue;
    const barrelDir = path4.dirname(boundary.filePath);
    const toAddUseClient = [];
    for (const src of parsed.reExportSources) {
      const resolved = resolveImport(src, barrelDir, aliases);
      if (!resolved) continue;
      const node = nodeByPath.get(resolved);
      if (node && node.clientSignals.length > 0) {
        toAddUseClient.push(resolved);
      }
    }
    if (toAddUseClient.length === 0) {
      skipped.push(boundary.filePath);
      continue;
    }
    let anyAdded = false;
    for (const filePath of toAddUseClient) {
      try {
        const content = fs3.readFileSync(filePath, "utf-8");
        if (/^["']use client["']/.test(content)) continue;
        fs3.writeFileSync(filePath, `"use client";
${content}`, "utf-8");
        componentsAdded.push(filePath);
        anyAdded = true;
      } catch {
        skipped.push(filePath);
      }
    }
    if (anyAdded) {
      try {
        const original = fs3.readFileSync(boundary.filePath, "utf-8");
        const patched = removeUseClientDirective(original);
        if (patched !== original) {
          fs3.writeFileSync(boundary.filePath, patched, "utf-8");
          barrelsFixed.push(boundary.filePath);
        }
      } catch {
        skipped.push(boundary.filePath);
      }
    }
  }
  return { barrelsFixed, componentsAdded, skipped };
}
function removeUseClientDirective(content) {
  return content.replace(/^["']use client["'];?\r?\n/, "");
}

// src/cli.ts
var cli = cac("client-creep");
cli.command("[dir]", "Analyze a Next.js project for client component creep").option("--dir <path>", "Path to the Next.js project (alias for positional arg)").option("--json", "Output results as JSON").option("--html [file]", "Write an interactive HTML report (default: client-creep-report.html)").option("--watch", "Watch for file changes and re-run analysis").option("--ci", "CI mode: exit 1 if client creep is detected").option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold").option("--push", "Push results to the client-creep dashboard").option("--token <token>", "Supabase access token for --push (get from dashboard \u2192 Settings)").option("--dashboard <url>", "Dashboard URL (default: https://client-creep-dashboard.vercel.app)").option("--owner <owner>", "Repo owner override for --push (default: auto-detected from git remote)").option("--repo <name>", "Repo name override for --push (default: auto-detected from git remote)").option("--fix", "Remove 'use client' from files with no client signals (creep candidates)").option("--fix-barrels", "Move 'use client' from barrel files (index.ts) to the components that need it").action(async (dir = ".", options) => {
  const targetDir = options.dir ?? dir ?? ".";
  if (options.watch) {
    await runWatch(path5.resolve(targetDir));
    return;
  }
  if (options.push && !options.token) {
    console.error(pc3.red("  Error: --push requires --token"));
    console.error(pc3.dim("  Get your token from the dashboard \u2192 Settings \u2192 Access Token"));
    console.error(pc3.dim("  Usage: npx client-creep --push --token <your-token>"));
    process.exit(1);
  }
  try {
    const showSpinner = !options.json && !options.html;
    if (showSpinner) {
      process.stdout.write(pc3.dim("  Scanning\u2026\r"));
    }
    const scanStart = Date.now();
    const result = await analyze(targetDir);
    const scanDurationMs = Date.now() - scanStart;
    if (options.html !== void 0 && options.html !== false) {
      const outFile = typeof options.html === "string" ? options.html : "client-creep-report.html";
      renderHtml(result, outFile);
      if (!options.json) {
        console.log(pc3.green(`  \u2713 HTML report written to ${outFile}`));
      }
    }
    if (options.json) {
      renderJson(result);
    } else if (!options.html) {
      renderTerminal(result);
    }
    if (options.fix) {
      if (result.creepCandidates.length === 0) {
        if (!options.json) console.log(pc3.green("  \u2713 No creep candidates to fix"));
      } else {
        const fixResult = applyFix(result.creepCandidates);
        if (!options.json) {
          for (const f of fixResult.fixed) {
            console.log(pc3.green(`  \u2713 fixed  `) + pc3.dim(path5.relative(path5.resolve(options.dir ?? dir ?? "."), f)));
          }
          if (fixResult.skipped.length > 0) {
            for (const f of fixResult.skipped) {
              console.log(pc3.yellow(`  \u26A0 skipped `) + pc3.dim(path5.relative(path5.resolve(options.dir ?? dir ?? "."), f)));
            }
          }
          console.log(pc3.green(`
  \u2713 Fixed ${fixResult.fixed.length} file${fixResult.fixed.length !== 1 ? "s" : ""}`));
        }
      }
    }
    if (options.fixBarrels) {
      const barrelResult = fixBarrels(result);
      if (!options.json) {
        if (barrelResult.barrelsFixed.length === 0 && barrelResult.componentsAdded.length === 0) {
          console.log(pc3.green("  \u2713 No barrel file boundaries to fix"));
        } else {
          for (const f of barrelResult.barrelsFixed) {
            console.log(pc3.green("  \u2713 barrel  ") + pc3.dim(path5.relative(path5.resolve(options.dir ?? dir ?? "."), f)) + pc3.dim(" \u2190 removed"));
          }
          for (const f of barrelResult.componentsAdded) {
            console.log(pc3.green("  \u2713 added   ") + pc3.dim(path5.relative(path5.resolve(options.dir ?? dir ?? "."), f)) + pc3.dim(' \u2190 "use client"'));
          }
          console.log(pc3.green(`
  \u2713 Fixed ${barrelResult.barrelsFixed.length} barrel${barrelResult.barrelsFixed.length !== 1 ? "s" : ""}, updated ${barrelResult.componentsAdded.length} component${barrelResult.componentsAdded.length !== 1 ? "s" : ""}`));
        }
      }
    }
    if (options.push && options.token) {
      if (!options.json) {
        process.stdout.write(pc3.dim("  Pushing to dashboard\u2026\r"));
      }
      const pushResult = await pushToDashboard(
        result,
        {
          token: options.token,
          dashboardUrl: options.dashboard,
          owner: options.owner,
          repo: options.repo
        },
        scanDurationMs
      );
      if (!options.json) {
        if (pushResult.ok) {
          console.log(pc3.green(`  \u2713 Pushed to dashboard`));
          if (pushResult.dashboardUrl) {
            console.log(pc3.dim(`    ${pushResult.dashboardUrl}`));
          }
        } else {
          console.error(pc3.red(`  \u2717 Push failed: ${pushResult.error}`));
        }
      }
    }
    if (options.ci || options.budget) {
      const budgetKb = options.budget ? Number(options.budget) : void 0;
      let failed = false;
      if (budgetKb !== void 0) {
        const actualKb = result.totalClientBytes / 1024;
        if (actualKb > budgetKb) {
          failed = true;
          if (!options.json) {
            console.error(pc3.red(`
  \u2717 client-creep: budget exceeded`));
            console.error(pc3.red(`    ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`));
            console.error(pc3.dim(`    Run without --ci to see the full report and where to recover KB.`));
          }
        }
      }
      if (options.ci && result.creepCandidates.length > 0) {
        failed = true;
        if (!options.json) {
          console.error(pc3.red(`
  \u2717 client-creep: ${result.creepCandidates.length} accidental creep candidates found`));
          console.error(pc3.dim(`    ~${(result.recoverableBytes / 1024).toFixed(0)} KB potentially recoverable.`));
          console.error(pc3.dim(`    Run without --ci to see the full report.`));
        }
      }
      if (!failed && !options.json) {
        console.log(pc3.green(`  \u2713 client-creep: no issues found`));
      }
      if (failed) process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(pc3.red(`  Error: ${message}`));
    process.exit(1);
  }
});
cli.help();
cli.version("0.3.0");
cli.parse();
