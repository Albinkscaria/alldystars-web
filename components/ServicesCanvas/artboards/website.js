// Artboard 02 — website. Static, trusted markup: rendered with dangerouslySetInnerHTML.
// Build hooks (read by canvasEngine.js):
//   .el[data-box="x,y,w,h"][data-tool][data-mode]  one build step · modes: none | grow | pop | fade | iris
//   .tw[data-text] typewriter · .s stagger · .sb bar grows · .d line draws · .f/.fl fades in at the end · .c[data-to] counts up
export default (assets) => `
<div class="el" data-box="16,26,474,548" data-tool="frame" data-mode="grow">
  <div class="glasscard" style="position:absolute;inset:0;border-radius:14px;overflow:hidden">
   <div style="height:28px;display:flex;align-items:center;gap:6px;padding:0 12px;border-bottom:1px solid rgba(0,0,0,.05)">
    <i style="width:9px;height:9px;border-radius:50%;background:#FF4433"></i><i style="width:9px;height:9px;border-radius:50%;background:#cccccc"></i><i style="width:9px;height:9px;border-radius:50%;background:#cccccc"></i>
    <span style="margin-left:96px;font:10px 'DejaVu Sans Mono';color:#7d7d7d;background:rgba(255,255,255,.7);padding:3px 46px;border-radius:6px">monsoon.travel</span></div></div></div>
 <div class="el" data-box="38,62,432,132" data-tool="text" data-mode="none">
  <div style="display:flex;align-items:center;margin-bottom:14px"><span class="serif" style="font-style:italic;font-size:21px;color:#0A0A0A">monsoon.</span>
   <span style="margin-left:auto;display:flex;gap:16px;font-size:11px;color:#3a3a3a"><span>Stays</span><span>Journeys</span><span>Journal</span></span>
   <span style="margin-left:16px;font-size:10.5px;font-weight:600;color:#fff;background:#0A0A0A;padding:6px 12px;border-radius:99px">Book now</span></div>
  <div style="display:flex;gap:22px;align-items:flex-start">
   <div style="flex:none"><div class="tw disp" data-text="Find your" style="font-size:38px;line-height:1;color:#0A0A0A"></div>
    <div class="disp" style="font-size:38px;line-height:1.05"><span class="tw serif" data-text="slow season." style="font-style:italic;color:#FF4433;letter-spacing:-.01em"></span></div></div>
   <p class="tw" data-text="Houseboats, hill stays and quiet beaches across Kerala — planned around the rain, not against it." style="margin-top:4px;font-size:11.5px;line-height:1.5;color:#454545"></p></div></div>
 <div class="el" data-box="38,204,432,226" data-tool="rect" data-mode="grow">
  <div style="position:absolute;inset:0;border-radius:10px;background:url(${assets.website}) center/cover no-repeat;box-shadow:0 16px 30px -18px rgba(0,0,0,.45),inset 0 0 0 1px rgba(0,0,0,.05)"></div></div>
 <div class="el" data-box="38,442,432,36" data-tool="rect" data-mode="pop" data-origin="0 50%">
  <span style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 18px;border-radius:99px;background:#FF4433;color:#fff;font-size:12.5px;font-weight:600;box-shadow:0 8px 16px -8px rgba(255,68,51,.8)">Plan a trip →</span>
  <span style="display:inline-flex;align-items:center;height:36px;padding:0 16px;margin-left:8px;border-radius:99px;border:1px solid rgba(10,10,10,.2);color:#0A0A0A;font-size:12.5px">See journeys</span>
  <span style="margin-left:12px;font-size:11px;color:#454545">★ 4.9 · 1,200+ trips</span></div>
 <div class="el" data-box="38,492,432,72" data-tool="rect" data-mode="none">
  <div class="s tripc" style="left:0"><i style="background:linear-gradient(#eaeaea 55%,#0A0A0A 55%)"></i><b>Vembanad houseboat</b><span>2 nights · from ₹12,900</span></div>
  <div class="s tripc" style="left:146px"><i style="background:linear-gradient(160deg,#cccccc,#707070)"></i><b>Munnar tea trails</b><span>3 nights · from ₹16,500</span></div>
  <div class="s tripc" style="left:292px"><i style="background:linear-gradient(#f2f2f2 60%,#FF4433 60%)"></i><b>Varkala cliff stay</b><span>4 nights · from ₹14,200</span></div></div>
 <div class="el" data-box="482,282,108,236" data-tool="frame" data-mode="grow" data-origin="50% 50%">
  <div style="position:absolute;inset:0;border-radius:20px;background:#0A0A0A;padding:6px;box-shadow:0 20px 34px -16px rgba(0,0,0,.6)"><div style="height:100%;border-radius:15px;background:#f6f6f6;padding:12px 9px;overflow:hidden">
   <div class="serif" style="font-style:italic;font-size:11px;color:#0A0A0A">monsoon.</div>
   <div class="disp" style="margin-top:8px;font-size:15px;line-height:1;color:#0A0A0A">Find your <span class="serif" style="font-style:italic;color:#FF4433">slow season.</span></div>
   <div style="margin-top:8px;height:58px;border-radius:7px;background:linear-gradient(#eaeaea 50%,#8f8f8f 50%,#8f8f8f 72%,#0A0A0A 72%);position:relative"><i style="position:absolute;right:16px;top:12px;width:14px;height:14px;border-radius:50%;background:#FF4433"></i></div>
   <div style="margin-top:8px;display:inline-block;font-size:8.5px;font-weight:600;color:#fff;background:#FF4433;padding:5px 9px;border-radius:99px">Plan a trip →</div>
   <div style="margin-top:8px;font-size:8px;color:#454545">Vembanad houseboat<br>from ₹12,900</div></div></div></div>
`;
