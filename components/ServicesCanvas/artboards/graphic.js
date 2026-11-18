// Artboard 03 — graphic. Static, trusted markup: rendered with dangerouslySetInnerHTML.
// Build hooks (read by canvasEngine.js):
//   .el[data-box="x,y,w,h"][data-tool][data-mode]  one build step · modes: none | grow | pop | fade | iris
//   .tw[data-text] typewriter · .s stagger · .sb bar grows · .d line draws · .f/.fl fades in at the end · .c[data-to] counts up
// The illustration opens first, then it's typeset into an exhibition poster:
// headline, event details, print specs.
export default (assets) => `
<div class="el" data-box="0,0,600,600" data-tool="ellipse" data-mode="iris">
  <div style="position:absolute;inset:0;background:url(${assets.graphic}) center/cover no-repeat"></div></div>
 <div class="el" data-box="0,0,600,600" data-tool="rect" data-mode="fade">
  <div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.7) 26%,rgba(255,255,255,0) 46%),linear-gradient(0deg,rgba(255,255,255,.85) 0%,rgba(255,255,255,0) 24%)"></div>
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" style="position:absolute;inset:0">
   <path class="d" d="M28 22 H572 M28 578 H572" stroke="#0A0A0A" stroke-width="1.5"/></svg></div>
 <div class="el" data-box="28,36,250,190" data-tool="text" data-mode="none">
  <div class="tw m9" data-text="Exhibition poster · A2" style="color:#FF4433"></div>
  <div class="disp" style="margin-top:12px;font-size:52px;line-height:.92;color:#0A0A0A">
   <div class="tw" data-text="Faces of"></div>
   <div class="tw serif" data-text="tomorrow." style="font-style:italic;color:#FF4433;letter-spacing:-.01em"></div></div>
  <div class="tw" data-text="Portraits where people, data and design meet." style="margin-top:12px;max-width:190px;font-size:12px;line-height:1.45;color:#454545"></div></div>
 <div class="el" data-box="28,446,240,118" data-tool="rect" data-mode="pop" data-origin="0 100%">
  <div class="glasscard" style="position:absolute;inset:0;border-radius:12px;padding:12px 14px">
   <div class="m9" style="color:#666666">Kochi Design Week</div>
   <div class="disp" style="margin-top:6px;font-size:22px;line-height:1;color:#0A0A0A">12 – 18 Jan <span class="serif" style="font-style:italic;color:#FF4433">2027</span></div>
   <div style="margin-top:8px;font-size:10.5px;line-height:1.5;color:#454545">Durbar Hall Art Gallery, Ernakulam<br>Free entry · 10 am – 7 pm</div></div></div>
 <div class="el" data-box="430,36,146,112" data-tool="text" data-mode="none">
  <div class="s glasschip" style="position:absolute;right:0;top:0">Vector illustration</div>
  <div class="s glasschip" style="position:absolute;right:0;top:38px">CMYK · <b>3 mm bleed</b></div>
  <div class="s glasschip" style="position:absolute;right:0;top:76px">420 × 594 mm</div></div>
`;
