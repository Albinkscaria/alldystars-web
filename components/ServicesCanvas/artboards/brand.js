// Artboard 01 — brand. Static, trusted markup: rendered with dangerouslySetInnerHTML.
// Build hooks (read by canvasEngine.js):
//   .el[data-box="x,y,w,h"][data-tool][data-mode]  one build step · modes: none | grow | pop | fade | iris
//   .tw[data-text] typewriter · .s stagger · .sb bar grows · .d line draws · .f/.fl fades in at the end · .c[data-to] counts up
export default (assets) => `
<div class="el" data-box="30,34,252,252" data-tool="ellipse" data-mode="none">
  <svg width="252" height="252" viewBox="0 0 252 252" fill="none" stroke="#FF4433" stroke-width="1" opacity=".7">
   <circle class="d" cx="126" cy="126" r="112"/><circle class="d" cx="126" cy="126" r="84"/><path class="d" d="M126 4 V248 M4 126 H248"/></svg></div>
 <div class="el" data-box="40,44,232,232" data-tool="pen" data-mode="pop" data-origin="50% 50%">
  <svg width="232" height="232" viewBox="0 0 232 232"><defs><radialGradient id="sc-gm" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#4a4a4a"/><stop offset=".6" stop-color="#0A0A0A"/><stop offset="1" stop-color="#000000"/></radialGradient></defs>
   <circle cx="116" cy="116" r="84" fill="url(#sc-gm)"/><path class="d" d="M116 44 C 86 82, 146 150, 116 190" stroke="#F5F5F5" stroke-width="13" fill="none" stroke-linecap="round"/>
   <circle class="f" cx="178" cy="60" r="12" fill="#FF4433"/></svg></div>
 <div class="el" data-box="300,40,272,150" data-tool="text" data-mode="none">
  <div class="tw serif" data-text="kova" style="font-weight:700;font-size:86px;line-height:.9;color:#0A0A0A;letter-spacing:-.02em"></div>
  <div class="tw m9" data-text="Coffee roasters · Fort Kochi" style="color:#666666;margin-top:10px"></div>
  <div class="tw serif" data-text="Roasted slow. Served warm." style="font-style:italic;font-size:21px;color:#3a3a3a;margin-top:12px"></div></div>
 <div class="el" data-box="300,196,272,104" data-tool="text" data-mode="fade">
  <div style="display:flex;align-items:flex-end;gap:14px;border-top:1px solid rgba(10,10,10,.12);padding-top:10px">
   <span class="serif" style="font-size:66px;line-height:.8;color:#0A0A0A">Aa</span>
   <span style="font-size:11.5px;line-height:1.55;color:#3a3a3a"><b style="font-weight:600">Crimson Text</b> · Display<br><b style="font-weight:600">Inter</b> · Body &amp; menus</span></div>
  <p style="margin-top:10px;font-size:11.5px;line-height:1.5;color:#454545">Single-origin beans from Attikan Estate, roasted every Thursday in small batches.</p></div>
 <div class="el" data-box="30,312,252,128" data-tool="rect" data-mode="none">
  <div class="s sw" style="left:0;background:#0A0A0A;color:#f5f5f5"><b>Roast</b><span>#0A0A0A</span></div>
  <div class="s sw" style="left:64px;background:#FF4433;color:#fff"><b>Kochi Red</b><span>#FF4433</span></div>
  <div class="s sw" style="left:128px;background:#9A9A9A;color:#0A0A0A"><b>Steam</b><span>#9A9A9A</span></div>
  <div class="s sw" style="left:192px;background:#F5F5F5;color:#0A0A0A;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)"><b>Milk</b><span>#F5F5F5</span></div></div>
 <div class="el" data-box="30,456,252,118" data-tool="rect" data-mode="pop">
  <div style="position:absolute;left:18px;top:14px;width:228px;height:100px;border-radius:10px;background:#FF4433;transform:rotate(4deg)"></div>
  <div class="glasscard" style="position:absolute;left:0;top:4px;width:232px;height:104px;border-radius:10px;transform:rotate(-2deg);padding:12px 14px">
   <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="serif" style="font-weight:700;font-size:24px;color:#0A0A0A">kova</span><span class="m9" style="color:#FF4433">Fort Kochi</span></div>
   <div style="margin-top:8px;font-size:12px;font-weight:600;color:#0A0A0A">Anjali Menon</div><div style="font-size:10.5px;color:#454545">Head Roaster</div>
   <div class="m9" style="margin-top:7px;color:#454545;letter-spacing:.06em">hello@kova.coffee</div></div></div>
 <div class="el" data-box="306,318,128,250" data-tool="rect" data-mode="pop" data-origin="50% 100%">
  <div style="position:absolute;left:6px;top:0;width:116px;height:22px;border-radius:4px 4px 0 0;background:#2a2a2a"></div>
  <div style="position:absolute;left:0;top:18px;width:128px;height:230px;border-radius:6px 6px 12px 12px;background:linear-gradient(160deg,#2e2e2e,#141414);box-shadow:0 18px 30px -16px rgba(0,0,0,.55)">
   <div class="glasscard dark" style="position:absolute;left:12px;right:12px;top:30px;bottom:18px;border-radius:8px;padding:12px 10px;color:#f5f5f5">
    <div class="serif" style="font-weight:700;font-size:26px;line-height:1">kova</div>
    <div class="m9" style="margin-top:8px;color:#FF4433;letter-spacing:.08em">Attikan Estate</div>
    <div style="margin-top:4px;font-size:10px;color:#cccccc">Medium roast · Arabica</div>
    <div style="margin-top:12px;font-size:9.5px;line-height:1.5;color:#aaaaaa">Notes: cocoa,<br>jaggery, orange peel</div>
    <div style="position:absolute;left:10px;right:10px;bottom:10px;display:flex;justify-content:space-between" class="m9"><span>250 g</span><span style="color:#FF4433">●</span></div></div></div></div>
 <div class="el" data-box="452,392,120,176" data-tool="pen" data-mode="pop" data-origin="50% 100%">
  <div style="position:absolute;left:4px;top:0;width:112px;height:16px;border-radius:8px;background:#eaeaea;box-shadow:inset 0 -2px 0 rgba(0,0,0,.08)"></div>
  <div style="position:absolute;left:10px;top:14px;width:100px;height:160px;background:linear-gradient(90deg,#f7f7f7,#e0e0e0);clip-path:polygon(0 0,100% 0,88% 100%,12% 100%)"></div>
  <div style="position:absolute;left:12px;top:62px;width:96px;height:54px;background:#FF4433;clip-path:polygon(0 0,100% 0,96% 100%,4% 100%);display:grid;place-items:center">
   <span class="serif" style="font-weight:700;font-size:22px;color:#fff">kova</span></div>
  <div class="m9" style="position:absolute;left:0;right:0;top:132px;text-align:center;color:#666666;letter-spacing:.08em">Cold brew</div></div>
`;
