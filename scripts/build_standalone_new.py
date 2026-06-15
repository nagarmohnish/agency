# Assemble a single self-contained HTML of the new ROI Labs homepage design.
# Pulls the fully-rendered markup from the dev server (saved to build-home.html),
# inlines aurora.css (fonts switched to a Google Fonts link), inlines the logo
# as base64, and appends standalone vanilla JS (reveal, FAQ accordion, audit
# prefill, client-only contact success). Output: design/pages/roi-labs-new-design.html
import base64

rendered = open("build-home.html", encoding="utf-8").read()
i = rendered.find('class="aurora"')
start = rendered.find(">", i) + 1
end = rendered.rfind("</div></main>")
markup = rendered[start:end]
# drop any trailing Next dev inline scripts / flight data (our markup has none,
# so the first <script is the boundary). Keeps everything incl. the popup.
spos = markup.find("<script")
if spos != -1:
    markup = markup[:spos]

# inline both logo variants as data URIs so the file is fully portable
b64d = base64.b64encode(open("design/logos/roi-logo-dark.png", "rb").read()).decode()
b64l = base64.b64encode(open("design/logos/roi-logo-light.png", "rb").read()).decode()
markup = markup.replace("/roi-logo-dark.png", "data:image/png;base64," + b64d)
markup = markup.replace("/roi-logo-light.png", "data:image/png;base64," + b64l)
# the single file has no /audit route — point its audit link at the real tool
markup = markup.replace('href="/audit"', 'href="https://audit.roilabs.in"')

css = open("src/app/aurora.css", encoding="utf-8").read()
css = (css.replace('var(--font-sora)', '"Sora"')
          .replace('var(--font-manrope)', '"Manrope"')
          .replace('var(--font-fraunces)', '"Fraunces"'))
css = "html,body{margin:0;background:#FCFBF7;}\n" + css

JS = r'''(function(){
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl=document.documentElement; docEl.classList.add('aurora-js');
  setTimeout(function(){docEl.classList.add('aurora-reveal-off');},1100);
  var nav=document.querySelector('.aurora nav');
  function navShadow(){ if(nav) nav.classList.toggle('scrolled', window.scrollY>8); }
  var reveals=[].slice.call(document.querySelectorAll('.aurora [data-reveal]'));
  function inView(el,m){var r=el.getBoundingClientRect(),vh=window.innerHeight||800;if(!r.height&&!r.width)return false;return r.top<vh-(m||0)*vh&&r.bottom>0;}
  function check(){for(var i=reveals.length-1;i>=0;i--){var el=reveals[i];if(inView(el,0.06)){(function(el){var d=parseInt(el.getAttribute('data-delay')||'0',10);setTimeout(function(){el.classList.add('in');},rm?0:d);})(el);reveals.splice(i,1);}}}
  if(rm){[].slice.call(document.querySelectorAll('.aurora [data-reveal]')).forEach(function(el){el.classList.add('in');});}
  var tick=false;
  function onScroll(){navShadow();if(!tick){tick=true;requestAnimationFrame(function(){check();tick=false;});}}
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});
  navShadow();check();setTimeout(check,120);setTimeout(check,400);window.addEventListener('load',check);
  var qs=[].slice.call(document.querySelectorAll('.faq .q'));
  qs.forEach(function(b){b.addEventListener('click',function(){var open=b.getAttribute('aria-expanded')==='true';qs.forEach(function(x){x.setAttribute('aria-expanded','false');var a=x.nextElementSibling;if(a)a.classList.remove('open');});if(!open){b.setAttribute('aria-expanded','true');var a=b.nextElementSibling;if(a)a.classList.add('open');}});});
  var af=document.getElementById('auditForm');
  if(af)af.addEventListener('submit',function(e){e.preventDefault();var ue=document.getElementById('auditUrl');var u=ue?ue.value:'';if(!u.trim())return;var m=document.getElementById('c-msg');var c=document.getElementById('c-company');if(m)m.value='Free audit request for: '+u;if(c&&!c.value)c.value=u;var s=document.getElementById('auditSent');if(s)s.style.display='block';var ct=document.getElementById('contact');if(ct)ct.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});});
  var cf=document.getElementById('cf'); var re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function val(id){var el=document.getElementById(id);return el?el.value.trim():'';}
  if(cf){cf.addEventListener('submit',function(e){e.preventDefault();var ok=true;[['c-name',function(v){return !!v;}],['c-email',function(v){return re.test(v);}],['c-budget',function(v){return !!v;}],['c-msg',function(v){return !!v;}]].forEach(function(p){var el=document.getElementById(p[0]);if(!el)return;var box=el.closest('.f.row > div')||el.closest('.f');var bad=!p[1](val(p[0]));if(box)box.classList.toggle('err',bad);if(bad)ok=false;});if(!ok)return;var b=cf.querySelector('.fbtn');if(b)b.style.display='none';var s=document.getElementById('sent');if(s)s.style.display='block';cf.reset();});
  cf.addEventListener('input',function(e){var box=e.target.closest('.f.row > div')||e.target.closest('.f');if(box)box.classList.remove('err');});}
  var pop=document.getElementById('popup'),pclose=document.getElementById('popupClose');var POPKEY='roi_popup_shown';var pshown=false,ptimer=0;
  function popOpen(){if(pshown||!pop)return;try{if(sessionStorage.getItem(POPKEY)){pshown=true;return;}}catch(e){}pshown=true;try{sessionStorage.setItem(POPKEY,'1');}catch(e){}pop.classList.add('open');clearTimeout(ptimer);}
  function popClose(){if(pop)pop.classList.remove('open');}
  function popDepth(){var h=document.documentElement;if((window.scrollY+window.innerHeight)/(h.scrollHeight||1)>=0.5)popOpen();}
  try{if(!sessionStorage.getItem(POPKEY))ptimer=setTimeout(popOpen,20000);}catch(e){ptimer=setTimeout(popOpen,20000);}
  if(pclose)pclose.addEventListener('click',popClose);
  if(pop)pop.addEventListener('click',function(e){if(e.target===pop)popClose();});
  window.addEventListener('keydown',function(e){if(e.key==='Escape')popClose();});
  window.addEventListener('scroll',popDepth,{passive:true});
  var pf=document.getElementById('pf');
  if(pf)pf.addEventListener('submit',function(e){e.preventDefault();var n=val('p-name'),em=val('p-email');var perr=document.getElementById('p-err');if(!n||!re.test(em)){if(perr)perr.style.display='block';return;}if(perr)perr.style.display='none';var b=pf.querySelector('.mbtn');if(b)b.style.display='none';var ps=document.getElementById('p-sent');if(ps)ps.style.display='block';pf.reset();});
})();'''

head = (
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
    '<meta charset="utf-8" />\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n'
    '<title>ROI Labs | AI-Native Paid Media Agency</title>\n'
    '<meta name="description" content="ROI Labs is the AI-native paid media agency. We run the engine that researches, produces, launches, and optimizes Meta and Google creative until spend tracks to revenue." />\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
    '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />\n'
    '<style>\n' + css + '\n</style>\n</head>\n<body>\n'
)

out = head + '<div class="aurora" id="top">' + markup + '</div>\n<script>\n' + JS + '\n</script>\n</body>\n</html>\n'
open("design/pages/roi-labs-new-design.html", "w", encoding="utf-8").write(out)
print("wrote design/pages/roi-labs-new-design.html", len(out), "bytes; markup", len(markup))
