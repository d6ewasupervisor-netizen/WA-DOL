// No external libraries; single-file SPA.
(function(){
  'use strict';

  // ===== Config =====
  const YES_COUNT = 78, NO_COUNT = 47;
  const YES_FOLDER = 'yes', NO_FOLDER = 'no';
  const yesUrl = n => `./${YES_FOLDER}/Yes_${n}.jpg`;
  const noUrl  = n => `./${NO_FOLDER}/No_${n}.jpg`;

  // ===== Data =====
  const QUESTION_BANK = [
    { id:'sign-1', category:'Road Signs', question:'What does a flashing yellow light mean?',
      choices:['Stop completely, then proceed when clear','Proceed with caution; slow down and be prepared to yield','It’s a protected left-turn signal','Traffic signal is about to turn red; stop immediately'],
      correctIndex:1, explanation:'Proceed with caution and be ready to yield.' },
    { id:'sign-2', category:'Road Signs', question:'A pentagon-shaped sign indicates:',
      choices:['Railroad crossing','School zone or school crossing','No passing zone','Work zone'], correctIndex:1, explanation:'Pentagon = school zone/crossing.' },
    { id:'rules-1', category:'Rules of the Road', question:'You reach a four-way stop at the same time as a car on your right. Who goes first?',
      choices:['You do','They do','Whoever is going straight','Largest vehicle'], correctIndex:1, explanation:'Vehicle on the right has right-of-way.' },
    { id:'rules-2', category:'Rules of the Road', question:'When must you use headlights in WA?',
      choices:['Only when it\\'s raining','30 min after sunset to 30 min before sunrise, and when visibility is reduced','Only on rural roads','Only on highways'], correctIndex:1, explanation:'Use headlights during those times or when visibility is reduced.' },
    { id:'veh-1', category:'Vehicles', question:'When parking downhill with a curb, turn your wheels:',
      choices:['Toward the curb','Away from the curb','Straight','Doesn\\'t matter'], correctIndex:0, explanation:'Turn toward the curb so the car rolls into it if brakes fail.' },
    { id:'veh-2', category:'Vehicles', question:'ABS helps you during emergency braking by:',
      choices:['Shortening stopping distance','Letting you steer while braking','Turning on hazard lights','Locking the wheels for grip'], correctIndex:1, explanation:'ABS allows steering while braking hard.' },
    { id:'risk-1', category:'Risks', question:'Hydroplaning: what should you do first?',
      choices:['Brake hard','Ease off the accelerator and steer straight','Turn sharply','Shift to neutral and turn off ignition'], correctIndex:1, explanation:'Ease off gas and keep wheels straight.' },
    { id:'risk-2', category:'Risks', question:'The three‑second rule helps you set:',
      choices:['Stopping distance','Following distance','Reaction time','Blind spot size'], correctIndex:1, explanation:'It\\'s for safe following distance.' },
    { id:'safe-1', category:'Safety', question:'Before changing lanes, best practice is to:',
      choices:['Signal only','Signal, check mirrors, and look over your shoulder','Honk and go','Speed up without signaling'], correctIndex:1, explanation:'Signal + mirrors + quick shoulder check.' },
  ];

  const KEY_ATTEMPTS = 'eliana_attempts_v2';

  // ===== Utilities =====
  const $ = (sel, el=document) => el.querySelector(sel);
  const el = (tag, attrs={}, ...kids) => {
    const n = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k==='class') n.className = v;
      else if(k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else if(v!==false && v!=null) n.setAttribute(k, v===true?'':v);
    }
    for(const c of kids.flat()){
      if(c==null) continue;
      n.appendChild(c.nodeType? c : document.createTextNode(String(c)));
    }
    return n;
  };
  const shuffle = (a) => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
  const randInt=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

  const readAttempts = () => { try{ return JSON.parse(localStorage.getItem(KEY_ATTEMPTS) || '[]'); } catch{ return []; } };
  const writeAttempts = (a) => localStorage.setItem(KEY_ATTEMPTS, JSON.stringify(a));
  const bestScoresByCategory = (attempts) => {
    const best = {}; for(const a of attempts){ const k=a.category||'All'; if(!best[k] || a.percent>best[k].percent) best[k]=a; } return best;
  };

  // ===== Rendering =====
  const routes = {};
  function mount(route, fn){ routes[route]=fn; }
  function go(route){ window.scrollTo(0,0); routes[route] && routes[route](); }

  function Home(){
    const app = $('#app'); app.innerHTML='';
    app.appendChild(el('div', {class:'grid two'},
      card('Take a Quiz','Smart practice across topics.', ()=>go('quiz')),
      card('Top Scores','Can you beat your best today?', ()=>go('scores')),
      card('Hints & Tips','Memory boosters and strategies.', ()=>go('tips')),
      card('Rules of the Road','Signals, intersections, parking.', ()=>go('rules')),
      card('Vehicles','Controls, maintenance, safety tech.', ()=>go('vehicles')),
      card('Risks','Speed, space, time, conditions.', ()=>go('risks')),
      card('Vocab','Glossary flashcards (from DOL PDF).', ()=>go('vocab')),
    ));
    app.prepend(el('div', {class:'row'},
      el('h1', {}, 'Eliana’s WA Driver’s Practice'),
      el('span', {class:'small'}, 'Beat your best, learn fast.')
    ));
  }
  function card(title,desc,onClick){
    return el('button', {class:'card', onClick}, el('div', {class:'p'}, el('strong',{},title)), el('div',{class:'small'}, desc));
  }

  function Tips(){ sectionList('Hints & Tips', [
    'Do 10–15 questions at a time; short breaks help memory.',
    'Say answers out loud; teach back to a parent for bonus points.',
    'Use the Yes/No images as “streaks.” Aim for a 5‑in‑a‑row streak!',
    'When unsure, eliminate 2 choices first, then pick between the final 2.',
    'On the road, call out signs and their meanings while riding as a passenger.'
  ]); }
  function Rules(){ sectionCards('Rules of the Road',[
    ['Traffic signals & signs','Concise summaries + quick quizzes.'],
    ['Intersections, turns & roundabouts','Right‑of‑way, U‑turns, diverging diamonds.'],
    ['Parking & hills','Where/when you can park; hills with/without curbs.'],
    ['School / work / emergency zones','Speeds, fines, and safe passing rules.'],
  ]); }
  function Vehicles(){ sectionCards('Vehicles',[
    ['Know your vehicle','Controls, reference points, mirrors, blind zones.'],
    ['Safety tech (ADAS)','ABS, lane keeping, blind‑spot monitoring—assist, not replace!'],
    ['Maintenance','Tires (2/32"), lights, signals, wipers, fluids.'],
    ['Occupant protection','Seat belts, airbags, child seats.'],
  ]); }
  function Risks(){ sectionCards('Risks',[
    ['Speed / Space / Time','Following distance, merging, counting seconds.'],
    ['Conditions','Night, rain, fog, curves, hydroplaning & skids.'],
    ['Impairment & distraction','Alcohol, cannabis, meds, fatigue, phones.'],
    ['Breakdowns & crashes','Communicating risks, reporting collisions.'],
  ]); }
  function Vocab(){
    const app = $('#app'); app.innerHTML='';
    app.appendChild(el('div',{class:'card'},
      el('div', {class:'p'}, el('strong',{},'Glossary Flashcards')),
      el('div', {class:'small'}, 'I’ll auto-fill from the WA DOL glossary next.')
    ));
  }

  function sectionList(title, items){
    const app = $('#app'); app.innerHTML='';
    app.appendChild(el('div',{class:'card'}, el('div',{class:'p'}, el('strong',{},title)),
      el('ul', {}, ...items.map(t=>el('li',{class:'p'},t)))
    ));
  }
  function sectionCards(title, pairs){
    const app = $('#app'); app.innerHTML='';
    app.appendChild(el('div',{}, el('div',{class:'p'}, el('strong',{},title))));
    const grid = el('div',{class:'grid two'});
    for(const [t,d] of pairs){
      grid.appendChild(el('div',{class:'card'}, el('div',{class:'p'}, el('strong',{},t)), el('div',{class:'small'}, d)));
    }
    app.appendChild(grid);
  }

  function Quiz(){
    const app = $('#app'); app.innerHTML='';
    const categories = ['All', ...Array.from(new Set(QUESTION_BANK.map(q=>q.category)))];
    let started=false, category='All', count=10, instantFeedback=true;
    let current=0, filtered=[], answers={}, feedbackImg=null, showResults=false;

    const box = el('div',{class:'card'});
    app.appendChild(box);

    function render(){
      box.innerHTML='';
      if(!started){
        box.appendChild(el('div',{}, el('div',{class:'p'}, el('strong',{},'Quiz Settings'))));
        const g = el('div', {class:'grid two'});
        const sel = el('select', {}, ...categories.map(c=>el('option',{value:c},c)));
        sel.addEventListener('change', e=> category=e.target.value);
        const num = el('input',{type:'number',min:5,max:20,value:count});
        num.addEventListener('input', e=> count = Number(e.target.value||10));
        const cb  = el('input',{type:'checkbox',checked:true});
        cb.addEventListener('change', e=> instantFeedback = !!e.target.checked);
        g.appendChild(el('div',{}, el('div',{class:'small'},'Category'), sel));
        g.appendChild(el('div',{}, el('div',{class:'small'},'# of Questions'), num));
        g.appendChild(el('div',{}, el('label',{}, cb, ' Instant feedback')));
        box.appendChild(g);
        box.appendChild(el('div',{class:'row', style:'margin-top:1rem'},
          el('button',{class:'btn primary', onClick: ()=>{ started=true; begin(); }},'Start'),
          el('button',{class:'btn', onClick: ()=>go('scores')},'See Top Scores')
        ));
        return;
      }
      if(showResults){
        const score = filtered.reduce((s,q)=> s + ((answers[q.id]===q.correctIndex)?1:0), 0);
        const percent = Math.round((score/filtered.length)*100);
        box.appendChild(el('div',{}, el('div',{class:'p'}, el('strong',{},'Great work, Eliana!'))));
        box.appendChild(el('div',{class:'p small'}, `Score: ${score} / ${filtered.length} (${percent}%)`));
        box.appendChild(el('div',{class:'row', style:'margin-top:.6rem'},
          el('button',{class:'btn primary', onClick: restart},'Try Again'),
          el('button',{class:'btn', onClick: ()=>go('scores')},'View Top Scores'),
          el('button',{class:'btn', onClick: ()=>go('home')},'Home'),
        ));
        return;
      }
      const q = filtered[current];
      box.appendChild(el('div',{class:'row small'}, el('span',{},`Question ${current+1} of ${filtered.length}`), el('span',{},`• ${q.category}`)));
      box.appendChild(el('div',{class:'p'}, el('strong',{}, q.question)));
      const order = shuffle(q.choices.map((_,i)=>i));
      for(const i of order){
        const sel = answers[q.id]===i;
        const cls = ['answer', sel?'selected':''].join(' ');
        box.appendChild(el('button',{class:cls, onClick:()=>selectAnswer(i)}, q.choices[i]));
      }
      if(feedbackImg){
        box.appendChild(el('div',{class:'feedback '+(feedbackImg.ok?'ok':'no')},
          el('div',{class:'small'}, feedbackImg.ok?'Correct!':'Not quite. '+(q.explanation||'')),
          el('div', {style:'display:flex;justify-content:center;margin-top:.4rem'},
            el('img',{src:feedbackImg.src, alt:feedbackImg.ok?'Yes':'No', class:'reward', onerror:(e)=>{e.target.style.display='none';}}))
        ));
      }
      box.appendChild(el('div',{class:'footer-actions'},
        el('button',{class:'btn', disabled: current===0, onClick: ()=>{ if(current>0){ current--; feedbackImg=null; render(); } }},'Back'),
        el('button',{class:'btn primary', onClick: ()=>{ if(current<filtered.length-1){ current++; feedbackImg=null; render(); } else { finish(); } }}, current===filtered.length-1?'Finish':'Next')
      ));
    }

    function selectAnswer(idx){
      const q = filtered[current];
      answers[q.id] = idx;
      const ok = idx===q.correctIndex;
      feedbackImg = ok ? {ok:true, src: yesUrl(randInt(1,YES_COUNT))} : {ok:false, src: noUrl(randInt(1,NO_COUNT))};
      if(!instantFeedback){
        // do nothing until next
      }
      render();
    }
    function begin(){
      const pool = category==='All' ? QUESTION_BANK : QUESTION_BANK.filter(q=>q.category===category);
      filtered = shuffle(pool).slice(0, Math.min(count, pool.length));
      current=0; answers={}; feedbackImg=null; showResults=false;
      render();
    }
    function finish(){
      showResults=true;
      const score = filtered.reduce((s,q)=> s + ((answers[q.id]===q.correctIndex)?1:0), 0);
      const percent = Math.round((score/filtered.length)*100);
      const attempts = readAttempts(); attempts.push({date:new Date().toISOString(), category, score, total:filtered.length, percent});
      writeAttempts(attempts);
      render();
    }
    function restart(){ started=false; render(); }
    render();
  }

  function Scores(){
    const app = $('#app'); app.innerHTML='';
    const attempts = readAttempts();
    app.appendChild(el('div',{class:'card'}, el('div',{class:'p'}, el('strong',{},'Top Scores'))));
    const best = bestScoresByCategory(attempts);
    const keys = Object.keys(best);
    if(keys.length===0){
      app.appendChild(el('div',{class:'p small'}, 'No attempts yet. Take a quiz!'));
    }else{
      const grid = el('div',{class:'grid two'});
      for(const cat of keys){
        const b = best[cat];
        grid.appendChild(el('div',{class:'card'}, el('div',{class:'small'},cat), el('div',{}, `${b.percent}% (${b.score}/${b.total})`), el('div',{class:'small'}, new Date(b.date).toLocaleString())));
      }
      app.appendChild(grid);
    }
    app.appendChild(el('div',{class:'card', style:'margin-top:1rem'},
      el('div',{class:'p'}, el('strong',{},'All Attempts')),
      attempts.length? table(attempts) : el('div',{class:'p small'},'No attempts yet.'),
      attempts.length? el('button',{class:'btn', onClick:()=>{ if(confirm('Clear all saved scores?')){ localStorage.removeItem(KEY_ATTEMPTS); go('scores'); } }},'Clear all'): null
    ));
  }
  function table(rows){
    const t = el('table',{}, el('thead',{}, el('tr',{}, el('th',{},'When'), el('th',{},'Category'), el('th',{},'Score'), el('th',{},'%'))), el('tbody',{}));
    for(const a of rows.slice().reverse()){
      t.querySelector('tbody').appendChild(el('tr',{}, el('td',{}, new Date(a.date).toLocaleString()), el('td',{}, a.category), el('td',{}, `${a.score}/${a.total}`), el('td',{}, `${a.percent}%`)));
    }
    return t;
  }

  // ===== Router wires =====
  mount('home', Home);
  mount('tips', Tips);
  mount('rules', Rules);
  mount('vehicles', Vehicles);
  mount('risks', Risks);
  mount('vocab', Vocab);
  mount('scores', Scores);
  mount('quiz', Quiz);

  // Header buttons
  document.getElementById('btn-home').addEventListener('click', ()=>go('home'));
  document.querySelectorAll('.nav [data-route]').forEach(b=> b.addEventListener('click', ()=> go(b.getAttribute('data-route')) ));

  // Start
  go('home');
})();
