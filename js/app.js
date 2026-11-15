(() => {
  const $ = id => document.getElementById(id);
  let bank = [], questions = [], index = 0, selected = null, session = [], mistakes = [];
  let importedMistakes = JSON.parse(localStorage.getItem('kidsImportedMistakes') || '[]');

  const saved = JSON.parse(localStorage.getItem('kidsAssessmentHistory') || '[]');
  $('correctStat').textContent = saved.reduce((n,a)=>n+(a.correct||0),0);
  async function init(){
    try {
      const response = await fetch('./data/question-bank.json');
      if(!response.ok) throw new Error('Could not load question bank');
      const data = await response.json(); bank = data.questions || [];
      const subjects = [...new Set(bank.map(q=>q.subject))];
      subjects.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;$('subjectFilter').append(o)});
      $('totalStat').textContent = bank.length;
      $('wrongStat').textContent = '0';
      start();
    } catch(e) {
      $('quizArea').innerHTML = '<p class="empty">Question bank could not be loaded. Run this site using a local web server, or open the published GitHub Pages site.</p>';
      $('position').textContent = 'Question bank unavailable';
    }
  }
  function start(){
    const subject=$('subjectFilter').value;
    questions=bank.filter(q=>subject==='all'||q.subject===subject);
    index=0;selected=null;session=[];mistakes=[];
    render();
  }
  function render(){
    $('wrongStat').textContent=mistakes.length;
    $('reviewList').innerHTML=mistakes.length?'<ul class="list">'+mistakes.map(m=>'<li>'+escapeHtml(m.skill||m.subject)+': '+escapeHtml(m.prompt)+'</li>').join('')+'</ul>':'<span class="empty">No mistakes yet. Your review list will build as you answer.</span>';
    $('progressBar').style.width=(questions.length?index/questions.length*100:0)+'%';
    if(index>=questions.length){
      $('position').textContent='Quiz complete';
      const correct=session.filter(a=>a.isCorrect).length;
      $('quizArea').innerHTML='<h2>Nice work!</h2><p>You got <strong>'+correct+' out of '+questions.length+'</strong> correct ('+(questions.length?Math.round(correct/questions.length*100):0)+'%).</p><p class="muted">'+mistakes.length+' question(s) added to your review list.</p><button class="primary" id="againBtn">Try again</button>';
      $('againBtn').onclick=start;
      $('progressBar').style.width='100%';
      const history=JSON.parse(localStorage.getItem('kidsAssessmentHistory')||'[]');history.push({date:new Date().toISOString(),correct,total:questions.length,subject:$('subjectFilter').value});localStorage.setItem('kidsAssessmentHistory',JSON.stringify(history.slice(-100)));
      $('correctStat').textContent=correct;
      return;
    }
    const q=questions[index]; selected=null;
    $('position').textContent='Question '+(index+1)+' of '+questions.length+' • '+q.subject+' • '+q.skill;
    $('quizArea').innerHTML='<div class="question">'+escapeHtml(q.prompt)+'</div><div id="choices"></div><div id="feedback" class="feedback"></div><div class="actions"><button id="checkBtn" class="primary" disabled>Check answer</button><button id="nextBtn" disabled>'+(index===questions.length-1?'Finish':'Next question')+'</button></div>';
    q.options.forEach((option,i)=>{
      const b=document.createElement('button');b.className='choice';b.textContent=String.fromCharCode(65+i)+'. '+option;
      b.onclick=()=>{selected=i;document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('checkBtn').disabled=false};
      $('choices').append(b);
    });
    $('checkBtn').onclick=()=>check(q);
    $('nextBtn').onclick=()=>{index++;render()};
  }
  function check(q){
    const ok=selected===q.answerIndex;
    session.push({questionId:q.id,isCorrect:ok});
    document.querySelectorAll('.choice').forEach((b,i)=>{b.disabled=true;if(i===q.answerIndex)b.classList.add('correct');else if(i===selected)b.classList.add('incorrect')});
    $('feedback').textContent=(ok?'Correct! ':'Not quite. ')+q.explanation;
    $('checkBtn').disabled=true;$('nextBtn').disabled=false;
    if(!ok)mistakes.push({...q,selectedAnswerIndex:selected,correctAnswer:q.options[q.answerIndex]});
    $('wrongStat').textContent=mistakes.length;
    $('reviewList').innerHTML=mistakes.length?'<ul class="list">'+mistakes.map(m=>'<li>'+escapeHtml(m.skill||m.subject)+': '+escapeHtml(m.prompt)+'</li>').join('')+'</ul>':'<span class="empty">No mistakes yet.</span>';
  }
  function exportMistakes(){
    const payload={schemaVersion:'1.0',exportedAt:new Date().toISOString(),source:'Kids Assessment Kit MVP',items:mistakes.map(m=>({id:m.id,subject:m.subject,yearLevel:m.yearLevel,skill:m.skill,prompt:m.prompt,options:m.options,selectedAnswerIndex:m.selectedAnswerIndex,correctAnswerIndex:m.answerIndex,correctAnswer:m.correctAnswer,explanation:m.explanation,sourceType:m.sourceType}))};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mistakes-for-targeted-practice.json';a.click();URL.revokeObjectURL(url);
  }
  function renderGapSummary(){
    const host=$('gapSummary');
    if(!importedMistakes.length){host.innerHTML='<span class="empty">Your learning gaps will appear here after importing an export.</span>';return;}
    const groups=new Map();
    importedMistakes.forEach(item=>{
      const key=(item.subject||'Unknown subject')+'|||'+(item.skill||'Unspecified skill');
      if(!groups.has(key))groups.set(key,{subject:item.subject||'Unknown subject',skill:item.skill||'Unspecified skill',count:0,examples:[]});
      const g=groups.get(key);g.count++;if(g.examples.length<3)g.examples.push(item.prompt||'');
    });
    host.innerHTML='<p class="muted">'+importedMistakes.length+' incorrect answer record(s) imported across '+groups.size+' skill area(s).</p>'+
      [...groups.values()].sort((a,b)=>b.count-a.count).map(g=>
        '<div class="gap-card"><strong>'+escapeHtml(g.subject)+' · '+escapeHtml(g.skill)+'</strong>'+
        '<div class="gap-meta">'+g.count+' incorrect attempt(s)</div>'+
        g.examples.map(p=>'<div class="gap-meta" style="margin-top:6px">Example: '+escapeHtml(p)+'</div>').join('')+
        '</div>').join('');
  }
  async function importMistakesFile(file){
    if(!file)return;
    try{
      const text=await file.text(),data=JSON.parse(text);
      if(data.schemaVersion!=='1.0'||!Array.isArray(data.items))throw new Error('This file is not a recognised Kids Assessment Kit mistakes export.');
      if(!data.items.length){$('importStatus').textContent='This export contains no mistakes. Complete a quiz with at least one incorrect answer and export again.';return;}
      const valid=data.items.filter(x=>x&&typeof x==='object'&&x.prompt&&x.subject);
      if(!valid.length)throw new Error('No usable mistake records were found in this file.');
      const tagged=valid.map(x=>({...x,importedAt:new Date().toISOString(),exportedAt:data.exportedAt||null}));
      importedMistakes=importedMistakes.concat(tagged).slice(-500);
      localStorage.setItem('kidsImportedMistakes',JSON.stringify(importedMistakes));
      $('importStatus').textContent='Successfully imported '+valid.length+' mistake(s) from '+file.name+'. Repeated imports are counted as additional attempts.';
      renderGapSummary();
    }catch(err){$('importStatus').textContent='Import failed: '+err.message;}
    $('mistakesFile').value='';
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  $('startBtn').onclick=start;$('subjectFilter').onchange=start;$('exportBtn').onclick=exportMistakes;
  $('mistakesFile').addEventListener('change',e=>importMistakesFile(e.target.files[0]));
  $('clearImportedBtn').onclick=()=>{
    if(!importedMistakes.length)return;
    if(confirm('Clear all imported mistake records from this browser?')){
      importedMistakes=[];localStorage.removeItem('kidsImportedMistakes');
      $('importStatus').textContent='Imported records cleared from this browser.';renderGapSummary();
    }
  };
  renderGapSummary();

  init();
})();
