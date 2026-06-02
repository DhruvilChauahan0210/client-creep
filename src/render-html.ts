import fs from "node:fs";
import path from "node:path";
import type { AnalysisResult } from "./types.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function renderHtml(result: AnalysisResult, outputPath: string): void {
  const html = buildHtml(result);
  fs.writeFileSync(outputPath, html, "utf-8");
}

function buildHtml(result: AnalysisResult): string {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIndex = new Map<string, number>();

  // Build node list — limit to client graph + direct server neighbours for perf
  const visibleFiles = new Set<string>();
  for (const n of result.clientGraph) visibleFiles.add(n.filePath);
  // Add server nodes that are direct imports of client boundaries (context)
  for (const b of result.clientBoundaries) {
    const node = result.clientGraph.find((n) => n.filePath === b.filePath);
    if (node) node.imports.forEach((i) => visibleFiles.add(i));
  }

  const isCreep = new Set(result.creepCandidates.map((c) => c.filePath));

  let idx = 0;
  for (const filePath of visibleFiles) {
    const node =
      result.clientGraph.find((n) => n.filePath === filePath) ||
      result.serverGraph.find((n) => n.filePath === filePath);
    if (!node) continue;

    let type: "boundary" | "creep" | "client" | "server" = "server";
    if (node.isClientBoundary) type = "boundary";
    else if (isCreep.has(filePath)) type = "creep";
    else if (node.isClientGraph) type = "client";

    const trace = result.whyTraces.get(filePath);
    nodes.push({
      id: idx,
      label: path.basename(filePath),
      path: node.displayPath,
      type,
      size: node.sizeBytes,
      signals: node.clientSignals,
      whyChain: trace
        ? trace.chain.map((f) => path.relative(result.projectRoot, f))
        : [],
    });
    nodeIndex.set(filePath, idx);
    idx++;
  }

  // Build links
  for (const [filePath, deps] of Object.entries(
    Object.fromEntries(
      [...visibleFiles].map((f) => {
        const node =
          result.clientGraph.find((n) => n.filePath === f) ||
          result.serverGraph.find((n) => n.filePath === f);
        return [f, node?.imports ?? []];
      })
    )
  )) {
    const sourceIdx = nodeIndex.get(filePath);
    if (sourceIdx === undefined) continue;
    for (const dep of deps as string[]) {
      const targetIdx = nodeIndex.get(dep);
      if (targetIdx !== undefined) {
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
    estimatedClientJs: formatBytes(result.totalClientBytes),
    recoverable: formatBytes(result.recoverableBytes),
    creepCandidates: result.creepCandidates.length,
    projectRoot: result.projectRoot,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>client-creep — ${path.basename(result.projectRoot)}</title>
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
  <h1>⚡ client-creep</h1>
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
  <input id="search" type="text" placeholder="Search files…">
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

  const badgeLabel = { boundary: '⚡ use client boundary', creep: '⚠ accidental creep', client: 'client (transitive)', server: 'server component' };
  const signalsHtml = node.signals.length
    ? node.signals.map(s => \`<span class="signal-tag">\${s}</span>\`).join('')
    : '<span style="color:var(--dim);font-size:12px">none detected</span>';

  const chainHtml = node.whyChain.length > 1
    ? node.whyChain.map((f, i) => {
        const isBoundary = i === 0;
        return \`<div class="chain-item \${isBoundary ? 'boundary-node' : ''}">
          \${i > 0 ? '<span class="chain-arrow">' + '  '.repeat(i) + '└─</span>' : '⚡'}
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

interface GraphNode {
  id: number;
  label: string;
  path: string;
  type: "boundary" | "creep" | "client" | "server";
  size: number;
  signals: string[];
  whyChain: string[];
}

interface GraphLink {
  source: number;
  target: number;
}
