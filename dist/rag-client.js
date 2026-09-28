(() => {
  const sessionId=window.NexoraSession?.id;
  let syncPromise=null;
  let dirty=true;
  let latest={materialCount:0,chunkCount:0,materials:[],syncing:false};
  const readArray=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch(_){return[];}};

  function renderStatus(message='') {
    const status=document.querySelector('#nx-rag-status');
    const detail=document.querySelector('#nx-rag-materials');
    const drawer=document.querySelector('#nx-drawer-rag-status');
    const sync=document.querySelector('#nx-rag-sync');
    const count=latest.materialCount || 0;
    if(status) status.textContent=message || (count ? `${count} session material${count===1?'':'s'} ready` : 'No session materials indexed');
    if(detail) detail.textContent=count ? `${latest.chunkCount || 0} searchable passages · isolated to this session` : 'Add PDFs, notes, or question banks during this session.';
    if(drawer) drawer.textContent=latest.syncing ? 'Indexing session…' : count ? `${count} session source${count===1?'':'s'}` : 'No session sources';
    if(sync) { sync.disabled=latest.syncing; sync.textContent=latest.syncing?'Indexing…':'Refresh session files'; }
  }

  function noteMaterial(note) {
    const pages=[{section:'Overview',text:note.overview || ''},...(note.sections || []).map(section=>({section:section.heading,text:[section.heading,...(section.points || [])].join('\n')})),{section:'Key takeaways',text:(note.takeaways || []).join('\n')}];
    return {id:note.id,name:note.title || 'Study notes',type:'note',pages};
  }

  function paperMaterial(paper) {
    const grouped=new Map();
    (paper.questions || []).forEach(question=>{const page=Number(question.page)||1;const values=grouped.get(page)||[];values.push(`Question ${question.number || ''}: ${question.text}${question.marks?` [${question.marks} marks]`:''}`);grouped.set(page,values);});
    return {id:paper.id,name:paper.filename || 'Question bank',type:'paper',pages:[...grouped].map(([page,values])=>({page,section:'Question bank',text:values.join('\n')}))};
  }

  async function currentSources() {
    const files=(await window.NexoraVaultFileStore.list()).filter(item=>item.sessionId===sessionId && /\.(pdf|txt)$/i.test(item.name));
    const notes=readArray('nexora-vault-notes').filter(item=>item.sessionId===sessionId && item.id);
    const papers=readArray('nexora-vault-papers').filter(item=>item.sessionId===sessionId && item.id && Array.isArray(item.questions));
    const extractedNames=new Set(papers.map(item=>String(item.filename || '').trim().toLowerCase()));
    const originalsWithoutExtractedCopy=files.filter(item=>!extractedNames.has(String(item.name || '').trim().toLowerCase()));
    return [
      ...notes.map(item=>({kind:'json',id:item.id,material:noteMaterial(item)})),
      ...papers.map(item=>({kind:'json',id:item.id,material:paperMaterial(item)})),
      ...originalsWithoutExtractedCopy.map(item=>({kind:'file',id:item.id,file:item}))
    ];
  }

  async function getStatus() {
    const response=await fetch(`/api/rag/status?sessionId=${encodeURIComponent(sessionId)}`);
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error || 'Could not read the session index.');
    latest={...latest,...result}; renderStatus(); return latest;
  }

  async function indexSource(source) {
    if(source.kind==='json') {
      const response=await fetch('/api/rag/index',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId,material:source.material})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error || `Could not index ${source.material.name}.`);
      return result;
    }
    const record=await window.NexoraVaultFileStore.get(source.id);
    const params=new URLSearchParams({sessionId,materialId:record.id,name:record.name});
    const response=await fetch(`/api/rag/index-file?${params}`,{method:'POST',headers:{'Content-Type':record.type || 'application/octet-stream'},body:record.blob});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error || `Could not index ${record.name}.`);
    return result;
  }

  async function reconcileSources(sources) {
    const response=await fetch('/api/rag/reconcile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId,activeMaterialIds:sources.map(source=>String(source.id))})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error || 'Could not remove stale session sources.');
    latest={...latest,...result}; return result;
  }

  async function sync(force=false) {
    if(!sessionId) throw new Error('No active Nexora session was found.');
    if(!force && !dirty) return {...latest,failures:[]};
    if(syncPromise) return syncPromise;
    syncPromise=(async()=>{
      latest.syncing=true; renderStatus('Preparing this session…');
      const failures=[];
      try {
        let status;
        try { status=await getStatus(); } catch (_) { status={materials:[]}; }
        const sources=await currentSources();
        try { status=await reconcileSources(sources); } catch (error) { failures.push(error.message); }
        const known=new Set((status.materials || []).map(item=>item.id));
        const pending=force?sources:sources.filter(source=>!known.has(source.id));
        for(const [index,source] of pending.entries()) {
          const name=source.material?.name || source.file?.name || 'material';
          renderStatus(`Indexing ${index+1} of ${pending.length}: ${name}`);
          try { await indexSource(source); } catch (error) { failures.push(`${name}: ${error.message}`); }
        }
        await getStatus();
        if(!sources.length) renderStatus('No current-session files to index');
        else if(failures.length) renderStatus(`${latest.materialCount} ready · ${failures.length} skipped`);
        dirty=false;
        window.dispatchEvent(new CustomEvent('nexora:rag-updated',{detail:{...latest,failures}}));
        return {...latest,failures};
      } finally { latest.syncing=false; syncPromise=null; renderStatus(); }
    })();
    return syncPromise;
  }

  const ensureReady=()=>dirty ? sync(false) : Promise.resolve({...latest,failures:[]});

  window.NexoraRag={sync,ensureReady,getStatus,get state(){return {...latest};},sessionId};
  document.querySelector('#nx-rag-sync')?.addEventListener('click',()=>sync(true));
  window.addEventListener('hashchange',()=>{if(location.hash==='#assistant') sync(false);});
  window.addEventListener('nexora:vault-updated',()=>{dirty=true;if(location.hash==='#assistant') sync(false);});
  renderStatus();
  if(location.hash==='#assistant') sync(false);
})();
