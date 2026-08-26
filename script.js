
// ---------------------------------------------------------
// Character reshuffle hover
// Inspired by the kinetic letter treatment in the reference:
// random glyphs briefly replace letters, then resolve cleanly.
// ---------------------------------------------------------
const scrambleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#';

function scrambleElement(el){
  if(!el || el.dataset.scrambling === 'true') return;

  const original = el.dataset.text || el.textContent.trim();
  if(!original) return;

  el.dataset.scrambling = 'true';
  el.classList.add('is-scrambling');

  let frame = 0;
  const totalFrames = Math.max(12, Math.min(24, original.length * 2));
  const interval = 28;

  const timer = setInterval(()=>{
    const progress = frame / totalFrames;

    let output = '';
    for(let i = 0; i < original.length; i++){
      const char = original[i];

      if(char === ' ' || char === '·' || char === '/' || char === '↗' || char === '↓'){
        output += char;
        continue;
      }

      const resolvePoint = i / Math.max(1, original.length - 1);

      if(progress > resolvePoint){
        output += char;
      } else {
        output += scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
      }
    }

    el.textContent = output;
    frame++;

    if(frame > totalFrames){
      clearInterval(timer);
      el.textContent = original;
      el.classList.remove('is-scrambling');
      el.dataset.scrambling = 'false';
    }
  }, interval);
}

function bindScrambleHover(){
  document.querySelectorAll('.scramble-text').forEach(el=>{
    const parent = el.closest('a, button, .journal-item, .project-meta, .studio-trigger') || el;

    parent.addEventListener('mouseenter', ()=>{
      if(window.innerWidth > 900) scrambleElement(el);
    });

    // Mobile/touch: a tap plays the same scramble the hover triggers on desktop.
    let downX = 0, downY = 0;
    parent.addEventListener('pointerdown', e=>{
      downX = e.clientX;
      downY = e.clientY;
    }, {passive:true});

    parent.addEventListener('pointerup', e=>{
      if(!isMobileLayout()) return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if(moved > 10) return; // finger was scrolling, not tapping
      scrambleElement(el);
    });
  });
}

bindScrambleHover();


const studioItems = [...document.querySelectorAll('.studio-item')];
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const MOBILE_BREAKPOINT = 900;

// Checked live (not just once at load) so resizing into/out of mobile
// width — e.g. testing "mobile view" with a mouse — switches modes correctly.
function isMobileLayout(){
  return window.innerWidth <= MOBILE_BREAKPOINT || !canHover.matches;
}

function setStudio(item, open){
  item.classList.toggle('active', open);
  const trigger = item.querySelector('.studio-trigger');
  if(trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function openStudio(item){
  studioItems.forEach(other=>setStudio(other, other === item));
}

// On touch/mobile start collapsed so the page stays compact.
if(isMobileLayout()){
  studioItems.forEach(item=>setStudio(item, false));
}

studioItems.forEach(item=>{
  const trigger = item.querySelector('.studio-trigger');
  let downX = 0, downY = 0;

  // Desktop: hover or click opens (never toggles closed).
  item.addEventListener('mouseenter', ()=>{
    if(!isMobileLayout()) openStudio(item);
  });
  trigger?.addEventListener('click', ()=>{
    if(!isMobileLayout()) openStudio(item);
  });

  // Mobile: tap toggles open/closed, tapping another item switches to it.
  trigger?.addEventListener('pointerdown', e=>{
    downX = e.clientX;
    downY = e.clientY;
  }, {passive:true});

  trigger?.addEventListener('pointerup', e=>{
    if(!isMobileLayout()) return;
    const moved = Math.hypot(e.clientX-downX, e.clientY-downY);
    if(moved > 10) return; // finger was scrolling, not tapping

    const isOpen = item.classList.contains('active');
    if(isOpen) setStudio(item, false);
    else openStudio(item);
  });
});

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
},{threshold:.12});
revealEls.forEach(el=>io.observe(el));


const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
menuBtn.addEventListener('click', ()=>{
  mobileMenu.classList.toggle('open');
  mobileMenu.setAttribute('aria-hidden', mobileMenu.classList.contains('open') ? 'false' : 'true');
});
document.querySelectorAll('.mobile-menu a').forEach(a=>{
  a.addEventListener('click', ()=>{
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden','true');
  });
});

const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.transform=`translate(${mx-2.5}px,${my-2.5}px)`;
});
function animateCursor(){
  rx += (mx-rx)*.14;
  ry += (my-ry)*.14;
  ring.style.transform=`translate(${rx-17}px,${ry-17}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a,button,.studio-trigger').forEach(el=>{
  el.addEventListener('mouseenter',()=>{
    ring.style.width='54px'; ring.style.height='54px';
  });
  el.addEventListener('mouseleave',()=>{
    ring.style.width='34px'; ring.style.height='34px';
  });
});

document.querySelectorAll('.journal-item').forEach(item=>{
  const preview=item.querySelector('.journal-preview');
  item.addEventListener('mousemove',e=>{
    if(!preview) return;
    preview.style.left=(e.clientX+24)+'px';
    preview.style.top=(e.clientY-70)+'px';
  });
});

const manifestWords = document.querySelectorAll('.manifesto-word');
window.addEventListener('scroll',()=>{
  if(canHover.matches && window.innerWidth > 900){
    const y=window.scrollY;
    manifestWords.forEach((w,i)=>{
      const dir=i%2===0?1:-1;
      const shift=(y*.012*dir);
      w.style.translate = `${shift}px 0`;
    });
  }else{
    manifestWords.forEach(w=>w.style.translate='0px 0px');
  }
},{passive:true});

document.querySelectorAll('a[href="#"]').forEach(a=>{
  a.addEventListener('click',e=>e.preventDefault());
});


// Subtle sci-fi parallax; keeps the V1 hero content untouched.
const scifiPlanet = document.querySelector('.scifi-planet');
const wfA = document.querySelector('.wf-a');
const wfB = document.querySelector('.wf-b');

window.addEventListener('mousemove', e => {
  if (window.innerWidth <= 900) return;
  const x = e.clientX / window.innerWidth - .5;
  const y = e.clientY / window.innerHeight - .5;
  if (scifiPlanet) scifiPlanet.style.transform = `translate(${x*16}px, ${y*14}px)`;
  if (wfA) wfA.style.transform = `translate(${x*-22}px, ${y*-16}px) rotate(45deg)`;
  if (wfB) wfB.style.transform = `translate(${x*18}px, ${y*14}px) rotate(45deg)`;
});


// ---------------------------------------------------------
// Expandable contact form
// ---------------------------------------------------------
const contactToggle = document.querySelector('.contact-toggle');
const contactPanel = document.querySelector('.contact-form-panel');
const projectForm = document.querySelector('#project-form');

if(contactToggle && contactPanel){
  contactToggle.addEventListener('click', ()=>{
    const willOpen = !contactPanel.classList.contains('open');
    contactPanel.classList.toggle('open', willOpen);
    contactToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

    if(willOpen){
      setTimeout(()=>{
        contactPanel.scrollIntoView({behavior:'smooth', block:'nearest'});
      }, 180);
    }
  });
}

if(projectForm){
  projectForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const success = projectForm.querySelector('.form-success');
    const submitButton = projectForm.querySelector('.form-submit');
    const submitText = projectForm.querySelector('.form-submit .scramble-text');
    const endpoint = projectForm.dataset.googleScriptUrl;
    const originalText = submitText ? submitText.dataset.text : 'Send enquiry ↗︎';

    if (!projectForm.reportValidity()) return;

    if (!endpoint || endpoint.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
      if(success){
        success.textContent = 'Form setup is incomplete. Add your Google Apps Script web app URL.';
        success.classList.add('show', 'error');
      }
      return;
    }

    if(success) success.classList.remove('show', 'error');
    if(submitButton) submitButton.disabled = true;
    if(submitText){
      submitText.dataset.text = 'Sending…';
      submitText.textContent = 'Sending…';
    }

    try {
      const formData = new FormData(projectForm);
      formData.append('page', window.location.href);
      formData.append('submittedAt', new Date().toISOString());

      // Apps Script web apps redirect their response. no-cors lets a static site
      // submit successfully without exposing credentials in the browser.
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(formData)
      });

      projectForm.reset();
      if(success){
        success.textContent = 'Thanks — your enquiry has been sent. We’ll get back to you soon.';
        success.classList.add('show');
      }
      if(submitText){
        submitText.dataset.text = 'Enquiry sent ✓';
        submitText.textContent = 'Enquiry sent ✓';
      }
    } catch (error) {
      if(success){
        success.textContent = 'We couldn’t send your enquiry. Please try again or email us directly.';
        success.classList.add('show', 'error');
      }
      if(submitText){
        submitText.dataset.text = originalText;
        submitText.textContent = originalText;
      }
    } finally {
      if(submitButton) submitButton.disabled = false;
    }
  });
}

// Manifesto words get scramble on hover/touch too.
document.querySelectorAll('.manifesto-scramble').forEach(el=>{
  const parent = el.closest('.manifesto-word') || el;
  parent.addEventListener('mouseenter', ()=>{
    if(window.innerWidth > 900) scrambleElement(el);
  });
});

// V9 Studio Journal accordion — hover on mouse, intentional tap on touch.
const journalEntriesV8 = [...document.querySelectorAll('.journal-entry')];

function setJournalEntryV8(entry, open){
  entry.classList.toggle('active', open);
  const trigger = entry.querySelector('.journal-trigger');
  if(trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function openJournalEntryV8(entry){
  journalEntriesV8.forEach(item=>setJournalEntryV8(item, item === entry));
}

// Mobile/touch begins fully collapsed.
if(isMobileLayout()){
  journalEntriesV8.forEach(item=>setJournalEntryV8(item, false));
}

journalEntriesV8.forEach(entry=>{
  const trigger = entry.querySelector('.journal-trigger');
  let downX = 0, downY = 0;

  // Desktop: hover opens (never toggles closed).
  entry.addEventListener('mouseenter', ()=>{
    if(!isMobileLayout()) openJournalEntryV8(entry);
  });

  // Mobile: tap toggles open/closed, tapping another entry switches to it.
  trigger?.addEventListener('pointerdown', e=>{
    downX = e.clientX;
    downY = e.clientY;
  }, {passive:true});

  trigger?.addEventListener('pointerup', e=>{
    if(!isMobileLayout()) return;
    const moved = Math.hypot(e.clientX-downX, e.clientY-downY);
    if(moved > 10) return;

    const isOpen = entry.classList.contains('active');
    if(isOpen) setJournalEntryV8(entry, false);
    else openJournalEntryV8(entry);
  });
});


// ---------------------------------------------------------
// Hero background — slow "live code terminal" readout.
// Types a few lines in, blinks a cursor, mutates a couple of
// values, then clears and retypes — looping quietly forever.
// Purely decorative: sits in .hero-scifi, behind the real copy.
// ---------------------------------------------------------
(function initHeroTerminal(){
  const term = document.querySelector('.hero-terminal');
  if(!term) return;

  const lineEls = [...term.querySelectorAll('.terminal-line')];
  const cursorEl = term.querySelector('.terminal-cursor');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lines = [
    'const idea = create();',
    'idea.transform("interactive");',
    'render(world);',
    '',
    'SYSTEM_01 · render_pass: active',
    'x: 42.18   y: 17.04',
    'interaction: ready'
  ];

  function placeCursor(el){
    if(cursorEl && el) el.appendChild(cursorEl);
  }

  function typeLine(idx, done){
    const el = lineEls[idx];
    const text = lines[idx];
    if(!el) return done();

    placeCursor(el);

    if(!text){ done(); return; }

    if(reduceMotion){
      el.insertBefore(document.createTextNode(text), cursorEl && cursorEl.parentNode === el ? cursorEl : null);
      done();
      return;
    }

    let i = 0;
    const speed = 30 + Math.random() * 26;
    const timer = setInterval(()=>{
      i++;
      const firstNode = el.childNodes[0];
      if(firstNode && firstNode.nodeType === 3){
        firstNode.nodeValue = text.slice(0, i);
      } else {
        el.insertBefore(document.createTextNode(text.slice(0, i)), cursorEl && cursorEl.parentNode === el ? cursorEl : null);
      }

      if(i >= text.length){
        clearInterval(timer);
        setTimeout(done, 240 + Math.random() * 360);
      }
    }, speed);
  }

  function typeAll(idx, done){
    if(idx >= lines.length){ done(); return; }
    typeLine(idx, ()=>typeAll(idx + 1, done));
  }

  function setLineText(el, text){
    if(!el) return;
    const cursorHere = cursorEl && cursorEl.parentNode === el;
    el.textContent = text;
    if(cursorHere) el.appendChild(cursorEl);
  }

  function clearAll(){
    lineEls.forEach(el => { el.textContent = ''; });
  }

  function randomValueLine(){
    const x = (38 + Math.random() * 12).toFixed(2);
    const y = (12 + Math.random() * 10).toFixed(2);
    return `x: ${x}   y: ${y}`;
  }

  function randomStatusLine(){
    const states = ['interaction: ready', 'interaction: idle', 'interaction: ready', 'interaction: listening'];
    return states[Math.floor(Math.random() * states.length)];
  }

  function runCycle(){
    clearAll();
    typeAll(0, ()=>{
      if(reduceMotion){
        setTimeout(runCycle, 6000);
        return;
      }

      const valueLine = lineEls[5];
      const statusLine = lineEls[6];

      let updates = 0;
      const maxUpdates = 2 + Math.floor(Math.random() * 2); // a couple of live tweaks per pass
      const updateTimer = setInterval(()=>{
        setLineText(valueLine, randomValueLine());
        setLineText(statusLine, randomStatusLine());
        updates++;
        if(updates >= maxUpdates){
          clearInterval(updateTimer);
          setTimeout(runCycle, 2600 + Math.random() * 1200);
        }
      }, 3400 + Math.random() * 1600);
    });
  }

  runCycle();
})();


// V10 — clicking/tapping the logo returns to the hero section.
const brandHomeV10 = document.querySelector('.brand[href="#hero"]');
brandHomeV10?.addEventListener('click', e=>{
  const hero = document.querySelector('#hero');
  if(!hero) return;
  e.preventDefault();
  hero.scrollIntoView({behavior:'smooth', block:'start'});
  if(history.replaceState){
    history.replaceState(null, '', '#hero');
  }
});
