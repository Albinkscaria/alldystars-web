// Artboard 05 — business. Static, trusted markup: rendered with dangerouslySetInnerHTML.
// Build hooks (read by canvasEngine.js):
//   .el[data-box="x,y,w,h"][data-tool][data-mode]  one build step · modes: none | grow | pop | fade | iris
//   .tw[data-text] typewriter · .s stagger · .sb bar grows · .d line draws · .f/.fl fades in at the end · .c[data-to] counts up
export default (assets) => `
<div class="el" data-box="26,18,548,30" data-tool="text" data-mode="none">
  <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="tw" data-text="Monsoon — Growth strategy 2027" style="font-size:15px;font-weight:600;color:#0A0A0A"></span><span class="m9" style="color:#666666">Prepared Nov 2026</span></div></div>
 <div class="el" data-box="44,70,280,280" data-tool="pen" data-mode="none">
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
   <rect class="f" x="141" y="0" width="139" height="139" fill="rgba(255,68,51,.09)"/>
   <path class="d" d="M140 0 V280" stroke="#0A0A0A" stroke-width="1.4"/><path class="d" d="M0 140 H280" stroke="#0A0A0A" stroke-width="1.4"/>
   <rect class="d" x=".7" y=".7" width="278.6" height="278.6" stroke="rgba(0,0,0,.12)"/></svg>
  <span class="m9 fl" style="position:absolute;right:0;top:-16px;color:#FF4433;letter-spacing:.06em">Premium · immersive ▾</span>
  <span class="m9 fl" style="position:absolute;left:-18px;top:-16px;color:#0A0A0A;letter-spacing:.06em">↑ Price per night</span>
  <span class="m9 fl" style="position:absolute;right:0;bottom:-18px;color:#0A0A0A;letter-spacing:.06em">Depth of experience →</span></div>
 <div class="el" data-box="44,70,280,280" data-tool="ellipse" data-mode="none">
  <div class="s comp" style="left:22px;top:238px"><i></i>Budget OTAs</div>
  <div class="s comp" style="left:24px;top:52px"><i></i>Resort chains</div>
  <div class="s comp" style="left:22px;top:178px"><i></i>Homestay networks</div>
  <div class="s comp" style="left:150px;top:196px"><i></i>Houseboat operators</div>
  <div class="s comp" style="left:150px;top:16px"><i></i>Luxury boutiques</div></div>
 <div class="el" data-box="44,70,280,280" data-tool="pen" data-mode="none">
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
   <circle cx="182" cy="118" r="7" fill="#fff" stroke="#FF4433" stroke-width="2"/>
   <path class="d" d="M188 112 C 210 92, 226 74, 244 58" stroke="#FF4433" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1 0"/>
   <path class="f" d="M232 56 L246 56 L244 70" stroke="#FF4433" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <circle class="f" cx="252" cy="50" r="9" fill="#FF4433"/></svg>
  <span class="f you" style="left:130px;top:132px;background:#fff;color:#FF4433;border:1px solid #FF4433">Monsoon today</span>
  <span class="f you" style="left:166px;top:42px">2027 target</span></div>
 <div class="el" data-box="342,64,232,168" data-tool="rect" data-mode="fade">
  <div class="card" style="inset:0;padding:12px 14px"><span style="font-size:12.5px;font-weight:600">Bookings per year</span>
   <div style="position:absolute;left:14px;right:14px;bottom:30px;height:96px;display:flex;align-items:flex-end;gap:12px">
    <div class="sb barw" style="height:38%;background:#cccccc"><b>1,180</b></div><div class="sb barw" style="height:53%;background:#9A9A9A"><b>1,640</b></div>
    <div class="sb barw" style="height:73%;background:#0A0A0A"><b>2,260</b></div><div class="sb barw" style="height:100%;background:#FF4433"><b>3,100</b></div></div>
   <div class="m9" style="position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-around;color:#666666;letter-spacing:.02em"><span>2024</span><span>2025</span><span>2026 e</span><span style="color:#FF4433">2027 goal</span></div></div></div>
 <div class="el" data-box="342,244,232,112" data-tool="rect" data-mode="none">
  <div class="s kt" style="left:58px;top:0;width:116px;background:#0A0A0A;color:#fff">Revenue ₹2.8 Cr</div>
  <svg class="s" width="232" height="26" viewBox="0 0 232 26" style="position:absolute;left:0;top:30px" fill="none" stroke="#bbbbbb" stroke-width="1.4"><path d="M116 0 V10 M38 10 H194 M38 10 V26 M116 10 V26 M194 10 V26"/></svg>
  <div class="s kt" style="left:0;top:56px">3,100<br><small>bookings</small></div>
  <div class="s kt" style="left:80px;top:56px">₹9,000<br><small>avg. trip</small></div>
  <div class="s kt" style="left:160px;top:56px;background:#FF4433;color:#fff;border-color:#FF4433">28%<br><small style="color:#ffe0dc">repeat rate</small></div></div>
 <div class="el" data-box="26,392,548,186" data-tool="text" data-mode="none">
  <div class="m9" style="color:#FF4433;border-top:2px solid #0A0A0A;padding-top:12px">Key recommendation</div>
  <div class="disp" style="font-size:25px;line-height:1.18;margin-top:10px;color:#0A0A0A"><span class="tw serif" data-text="Own the rain. " style="font-style:italic;color:#FF4433;letter-spacing:-.01em"></span><span class="tw" data-text="Launch ‘Rain Retreats’ — monsoon-only stays from June to September — and move 30% of bookings into the off-season by 2027."></span></div>
  <div style="margin-top:14px;display:flex;gap:8px"><span class="glasschip">Q1 · Build the packages</span><span class="glasschip">Q2 · Sign 12 houseboat partners</span><span class="glasschip">Q3 · Launch campaign</span></div></div>
`;
