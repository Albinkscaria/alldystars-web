// Artboard 04 — data. Static, trusted markup: rendered with dangerouslySetInnerHTML.
// Build hooks (read by canvasEngine.js):
//   .el[data-box="x,y,w,h"][data-tool][data-mode]  one build step · modes: none | grow | pop | fade | iris
//   .tw[data-text] typewriter · .s stagger · .sb bar grows · .d line draws · .f/.fl fades in at the end · .c[data-to] counts up
export default (assets) => `
<div class="el" data-box="22,18,556,30" data-tool="text" data-mode="none">
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="tw" data-text="Kova Coffee — Sales overview" style="font-size:15px;font-weight:600;color:#0A0A0A"></span><span class="m9" style="color:#666666">Nov 1 – 30, 2026</span></div></div>
 <div class="el" data-box="22,52,556,90" data-tool="rect" data-mode="none">
  <div class="s card kpi" style="left:0"><div class="m9">Revenue</div><div class="v">₹<span class="c" data-to="421800" data-dec="0" data-comma="1"></span></div><span class="up">▲ 12.4%</span><small>vs October</small></div>
  <div class="s card kpi" style="left:141px"><div class="m9">Orders</div><div class="v"><span class="c" data-to="1284" data-dec="0" data-comma="1"></span></div><span class="up">▲ 8.1%</span><small>vs October</small></div>
  <div class="s card kpi" style="left:282px"><div class="m9">Avg. order</div><div class="v">₹<span class="c" data-to="328" data-dec="0"></span></div><span class="up">▲ 3.9%</span><small>vs October</small></div>
  <div class="s card kpi" style="left:423px"><div class="m9">Repeat buyers</div><div class="v"><span class="c" data-to="41" data-dec="0"></span>%</div><span class="dn">▼ 2.3%</span><small>vs October</small></div></div>
 <div class="el" data-box="22,154,350,226" data-tool="pen" data-mode="fade">
  <div class="card" style="inset:0;padding:12px 14px">
   <div style="display:flex;justify-content:space-between"><span style="font-size:12.5px;font-weight:600">Weekly revenue</span><span class="m9" style="color:#666666"><i class="lg" style="background:#0A0A0A"></i>2026 <i class="lg" style="background:#bbbbbb;margin-left:8px"></i>2025</span></div>
   <svg width="322" height="170" viewBox="0 0 322 170" style="margin-top:6px" fill="none" font-family="DejaVu Sans Mono" font-size="8.5">
    <g fill="#7a7a7a" stroke="none"><text x="0" y="14">₹1.2L</text><text x="0" y="56">₹90k</text><text x="0" y="98">₹60k</text><text x="0" y="140">₹30k</text>
     <text x="38" y="166">Sep</text><text x="150" y="166">Oct</text><text x="262" y="166">Nov</text></g>
    <path d="M34 10 H322 M34 52 H322 M34 94 H322 M34 136 H322" stroke="rgba(0,0,0,.06)"/>
    <path class="f" d="M34 112 L60 104 L86 108 L112 92 L138 96 L164 80 L190 84 L216 66 L242 70 L268 50 L294 42 L320 26 V150 H34Z" fill="rgba(10,10,10,.07)"/>
    <path class="d" d="M34 126 L60 122 L86 120 L112 114 L138 112 L164 106 L190 102 L216 98 L242 92 L268 88 L294 82 L320 78" stroke="#bbbbbb" stroke-width="2"/>
    <path class="d" d="M34 112 L60 104 L86 108 L112 92 L138 96 L164 80 L190 84 L216 66 L242 70 L268 50 L294 42 L320 26" stroke="#0A0A0A" stroke-width="2.6" stroke-linejoin="round"/>
    <circle class="f" cx="320" cy="26" r="5" fill="#FF4433" stroke="#fff" stroke-width="2"/></svg>
   <div class="glasschip f" style="position:absolute;right:20px;top:34px;font-size:10px">Nov 24–30 · <b>₹1,12,600</b></div></div></div>
 <div class="el" data-box="384,154,194,226" data-tool="ellipse" data-mode="fade">
  <div class="card" style="inset:0;padding:12px 14px"><span style="font-size:12.5px;font-weight:600">Sales by channel</span>
   <svg width="104" height="104" viewBox="0 0 120 120" style="position:absolute;left:45px;top:38px;transform:rotate(-90deg)" fill="none" stroke-width="18">
    <circle cx="60" cy="60" r="44" stroke="rgba(0,0,0,.05)"/>
    <path class="d" d="M104.0 60.8 A44 44 0 0 1 17.6 71.8" stroke="#0A0A0A"/><path class="d" d="M17.2 70.1 A44 44 0 0 1 67.4 16.6" stroke="#FF4433"/>
    <path class="d" d="M69.1 16.9 A44 44 0 0 1 98.1 38.1" stroke="#9A9A9A"/><path class="d" d="M99.0 39.5 A44 44 0 0 1 104.0 59.2" stroke="#d6d6d6"/></svg>
   <div style="position:absolute;left:14px;right:14px;bottom:12px;font-size:10.5px;line-height:1.75;color:#3a3a3a">
    <div class="row2"><span><i class="lg" style="background:#0A0A0A"></i>Website</span><b>46%</b></div><div class="row2"><span><i class="lg" style="background:#FF4433"></i>Café counter</span><b>32%</b></div>
    <div class="row2"><span><i class="lg" style="background:#9A9A9A"></i>Instagram</span><b>14%</b></div><div class="row2"><span><i class="lg" style="background:#d6d6d6"></i>Swiggy</span><b>8%</b></div></div></div></div>
 <div class="el" data-box="22,392,556,188" data-tool="rect" data-mode="none">
  <div class="card" style="inset:0;padding:12px 14px">
   <div class="trow head m9"><span>Top products</span><span>Units</span><span>Revenue</span><span>Last 8 weeks</span></div>
   <div class="trow s"><span><b>Attikan Estate</b> · 250 g</span><span>312</span><span>₹1,24,800</span><svg width="70" height="18"><path d="M0 14 L10 12 L20 13 L30 9 L40 10 L50 6 L60 7 L70 3" stroke="#0A0A0A" stroke-width="1.6" fill="none"/></svg></div>
   <div class="trow s"><span><b>Filter Coffee Blend</b> · 500 g</span><span>241</span><span>₹72,300</span><svg width="70" height="18"><path d="M0 10 L10 11 L20 9 L30 10 L40 8 L50 9 L60 7 L70 6" stroke="#0A0A0A" stroke-width="1.6" fill="none"/></svg></div>
   <div class="trow s"><span><b>Cold Brew</b> · 330 ml</span><span>268</span><span>₹53,600</span><svg width="70" height="18"><path d="M0 16 L10 14 L20 15 L30 11 L40 9 L50 8 L60 5 L70 2" stroke="#FF4433" stroke-width="1.6" fill="none"/></svg></div>
   <div class="trow s"><span><b>Kova Ceramic Mug</b></span><span>96</span><span>₹38,400</span><svg width="70" height="18"><path d="M0 6 L10 8 L20 7 L30 9 L40 9 L50 11 L60 10 L70 12" stroke="#9A9A9A" stroke-width="1.6" fill="none"/></svg></div></div></div>
`;
