(() => {
  const CONFIG_KEY = 'nexora-avatar-config';
  const ONBOARDED_KEY = 'nexora-avatar-onboarded';
  const NICKNAME_KEY = 'nexora-avatar-nickname';
  const defaults = {
    backdrop: 'mint', skin: 'warm', hair: 'short', hairColor: 'ink',
    eyes: 'happy', mouth: 'smile', glasses: 'none', outfit: 'hoodie', outfitColor: 'teal'
  };
  const choices = {
    backdrop: [['mint','Study mint'],['sky','Clear sky'],['gold','Golden hour'],['lilac','Soft lilac'],['slate','Quiet slate']],
    skin: [['light','Light'],['warm','Warm'],['tan','Tan'],['deep','Deep'],['dark','Dark']],
    hair: [['short','Short crop'],['waves','Soft waves'],['bob','Classic bob'],['bun','High bun'],['bald','No hair']],
    hairColor: [['ink','Ink'],['black','Black'],['brown','Brown'],['auburn','Auburn'],['blonde','Blonde']],
    eyes: [['default','Focused'],['happy','Happy'],['wink','Wink'],['bright','Bright']],
    mouth: [['smile','Soft smile'],['neutral','Calm'],['grin','Cheerful'],['surprised','Curious']],
    glasses: [['none','None'],['round','Round'],['square','Square']],
    outfit: [['hoodie','Hoodie'],['sweater','Sweater'],['blazer','Blazer'],['tee','T-shirt']],
    outfitColor: [['teal','Polaris teal'],['cyan','Signal cyan'],['gold','Study gold'],['lilac','Lilac'],['coral','Coral']]
  };
  const palette = {
    backdrop: {mint:'#a7f3d0', sky:'#bae6fd', gold:'#fde68a', lilac:'#ddd6fe', slate:'#cbd5e1'},
    skin: {light:'#f8d9c4', warm:'#eab894', tan:'#c9895b', deep:'#915c3d', dark:'#5c382b'},
    hairColor: {ink:'#142c33', black:'#111827', brown:'#5b3a29', auburn:'#8a3f2d', blonde:'#d6a84d'},
    outfitColor: {teal:'#08778d', cyan:'#06b6d4', gold:'#f6b51b', lilac:'#8b5cf6', coral:'#ea6a5b'}
  };

  const readConfig = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
      return value && Object.keys(defaults).every(key => choices[key].some(([id]) => id === value[key])) ? value : null;
    } catch (_) { return null; }
  };
  const storageGet = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const storageSet = (key, value) => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } };
  const storageRemove = key => { try { localStorage.removeItem(key); } catch (_) {} };
  const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));

  function defaultAvatar(label = 'Default profile') {
    return `<svg class="nx-avatar-svg" viewBox="0 0 200 220" role="img" aria-label="${escapeXml(label)}"><circle cx="100" cy="104" r="91" fill="var(--nx-surface-soft)"/><circle cx="100" cy="82" r="38" fill="var(--nx-muted)" opacity=".54"/><path d="M35 196c7-43 31-65 65-65s58 22 65 65" fill="var(--nx-muted)" opacity=".54"/><circle cx="100" cy="104" r="90" fill="none" stroke="var(--nx-line)" stroke-width="4"/></svg>`;
  }

  function hairSvg(type, color) {
    if (type === 'bald') return '';
    if (type === 'waves') return `<path d="M57 75c-5-34 14-57 44-57 32 0 51 20 45 59-7-12-13-15-22-11-5-16-19-24-40-19-4 15-14 24-27 28Z" fill="${color}"/><circle cx="55" cy="76" r="13" fill="${color}"/><circle cx="145" cy="76" r="13" fill="${color}"/>`;
    if (type === 'bob') return `<path d="M55 79c-4-40 13-61 45-61s50 22 46 63l-8 46-15-10 3-54c-15-1-29-8-40-19-4 13-9 22-16 28l6 45-15 9Z" fill="${color}"/>`;
    if (type === 'bun') return `<circle cx="105" cy="20" r="23" fill="${color}"/><path d="M57 75c-2-37 14-57 44-57 31 0 48 21 44 59-12-13-18-22-19-32-18 11-39 15-64 12-1 7-3 13-5 18Z" fill="${color}"/>`;
    return `<path d="M57 74c-1-37 16-56 45-56 29 0 46 18 44 52-12-4-21-13-26-27-12 11-31 16-58 14l-5 17Z" fill="${color}"/>`;
  }

  function eyeSvg(type) {
    if (type === 'happy') return `<path class="nx-avatar-eyes" d="M72 87q9 11 18 0M111 87q9 11 18 0" fill="none" stroke="#17252b" stroke-width="4" stroke-linecap="round"/>`;
    if (type === 'wink') return `<g class="nx-avatar-eyes"><circle cx="81" cy="89" r="4" fill="#17252b"/><path d="M112 90q9 7 17 0" fill="none" stroke="#17252b" stroke-width="4" stroke-linecap="round"/></g>`;
    if (type === 'bright') return `<g class="nx-avatar-eyes"><ellipse cx="81" cy="89" rx="6" ry="8" fill="#17252b"/><ellipse cx="120" cy="89" rx="6" ry="8" fill="#17252b"/><circle cx="83" cy="86" r="2" fill="white"/><circle cx="122" cy="86" r="2" fill="white"/></g>`;
    return `<g class="nx-avatar-eyes"><circle cx="81" cy="89" r="4" fill="#17252b"/><circle cx="120" cy="89" r="4" fill="#17252b"/></g>`;
  }

  function mouthSvg(type) {
    if (type === 'neutral') return `<path d="M93 119q8 2 16 0" fill="none" stroke="#7e4b50" stroke-width="2.6" stroke-linecap="round"/>`;
    if (type === 'grin') return `<path d="M90 116q11 11 22 0" fill="none" stroke="#7e4b50" stroke-width="3" stroke-linecap="round"/>`;
    if (type === 'surprised') return `<path d="M94 120q7-5 14 0" fill="none" stroke="#7e4b50" stroke-width="2.6" stroke-linecap="round"/>`;
    return `<path d="M92 117q9 8 18 0" fill="none" stroke="#7e4b50" stroke-width="2.8" stroke-linecap="round"/>`;
  }

  function glassesSvg(type) {
    if (type === 'round') return `<g fill="none" stroke="#17252b" stroke-width="3"><circle cx="80" cy="90" r="14"/><circle cx="121" cy="90" r="14"/><path d="M94 90h13M65 87l-11-4M136 87l11-4"/></g>`;
    if (type === 'square') return `<g fill="none" stroke="#17252b" stroke-width="3"><rect x="65" y="77" width="30" height="24" rx="5"/><rect x="106" y="77" width="30" height="24" rx="5"/><path d="M95 88h11M65 84l-11-3M136 84l11-3"/></g>`;
    return '';
  }

  function outfitSvg(type, color) {
    const body = `<path d="M30 214c5-49 30-74 70-74s65 25 70 74Z" fill="${color}"/>`;
    if (type === 'hoodie') return `${body}<path d="M67 151q33 32 66 0l14 37-19 26H72l-19-26Z" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="5"/><path d="M91 176v28M110 176v28" stroke="#fff" stroke-opacity=".72" stroke-width="3"/>`;
    if (type === 'blazer') return `${body}<path d="M77 146l23 27 23-27 15 68H62Z" fill="#fff" opacity=".2"/><path d="M77 146l23 27-17 14M123 146l-23 27 17 14" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>`;
    if (type === 'sweater') return `${body}<path d="M68 173h64M60 190h80" stroke="#fff" stroke-opacity=".25" stroke-width="8"/>`;
    return `${body}<path d="M83 143q17 21 34 0" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="5"/>`;
  }

  function avatarSvg(config, label = 'Customized study companion') {
    const bg = palette.backdrop[config.backdrop];
    const skin = palette.skin[config.skin];
    const hair = palette.hairColor[config.hairColor];
    const outfit = palette.outfitColor[config.outfitColor];
    return `<svg class="nx-avatar-svg" viewBox="0 0 200 220" role="img" aria-label="${escapeXml(label)}"><circle cx="100" cy="104" r="91" fill="${bg}"/><circle cx="100" cy="104" r="90" fill="none" stroke="#073846" stroke-opacity=".16" stroke-width="4"/>${outfitSvg(config.outfit, outfit)}<path d="M88 130h25v28q-13 13-25 0Z" fill="${skin}"/><ellipse cx="58" cy="91" rx="11" ry="15" fill="${skin}"/><ellipse cx="143" cy="91" rx="11" ry="15" fill="${skin}"/><ellipse cx="100" cy="82" rx="44" ry="57" fill="${skin}"/>${hairSvg(config.hair, hair)}${eyeSvg(config.eyes)}<path d="M100 94l-3 12 6 1" fill="none" stroke="#8c5842" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>${mouthSvg(config.mouth)}${glassesSvg(config.glasses)}</svg>`;
  }

  const selectMarkup = (name, label) => `<label class="nx-avatar-field"><span>${label}</span><select name="${name}">${choices[name].map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
  const root = document.createElement('div');
  root.id = 'nx-avatar-ui';
  root.innerHTML = `
    <button class="nx-avatar-rail" id="nx-avatar-rail" type="button" aria-controls="nx-avatar-drawer nx-companion-chat" aria-expanded="false"><span class="nx-avatar-rail-art" id="nx-avatar-rail-art" aria-hidden="true"></span><span id="nx-avatar-rail-name">Companion</span></button>
    <div class="nx-avatar-backdrop" id="nx-avatar-backdrop" hidden></div>
    <aside class="nx-avatar-drawer" id="nx-avatar-drawer" role="dialog" aria-modal="false" aria-labelledby="nx-avatar-drawer-title" data-required="false" hidden>
      <header><div><p class="nx-kicker">Nexora companion</p><h2 id="nx-avatar-drawer-title">Make it yours</h2></div><button class="nx-avatar-close" id="nx-avatar-close" type="button" aria-label="Close avatar customizer">×</button></header>
      <div class="nx-avatar-onboarding" id="nx-avatar-onboarding"><strong>Welcome to your study companion.</strong><p>Customize a character now, or keep the simple default profile. You can change it anytime from AI Study Assistant.</p></div>
      <div class="nx-avatar-preview" id="nx-avatar-preview" aria-live="polite"></div>
      <label class="nx-avatar-nickname" for="nx-avatar-nickname"><span>Companion nickname <small>optional</small></span><input id="nx-avatar-nickname" type="text" maxlength="24" autocomplete="off" placeholder="e.g. Nova"><small id="nx-avatar-nickname-status">Checked by Gemini and Groq when you save.</small></label>
      <button class="nx-avatar-randomize" id="nx-avatar-randomize" type="button"><span aria-hidden="true">↻</span> Randomize avatar</button>
      <form class="nx-avatar-controls" id="nx-avatar-controls">
        <fieldset><legend>Face & hair</legend><div class="nx-avatar-field-grid">${selectMarkup('skin','Skin tone')}${selectMarkup('hair','Hair style')}${selectMarkup('hairColor','Hair color')}${selectMarkup('eyes','Eyes')}${selectMarkup('mouth','Expression')}${selectMarkup('glasses','Glasses')}</div></fieldset>
        <fieldset><legend>Style</legend><div class="nx-avatar-field-grid">${selectMarkup('backdrop','Backdrop')}${selectMarkup('outfit','Outfit')}${selectMarkup('outfitColor','Outfit color')}</div></fieldset>
      </form>
      <footer><button class="nx-secondary-button" id="nx-avatar-default" type="button">Use default</button><button class="nx-primary-button nx-avatar-save" id="nx-avatar-save" type="button">Save avatar</button></footer>
    </aside>
    <aside class="nx-companion-chat" id="nx-companion-chat" role="dialog" aria-modal="false" aria-labelledby="nx-chat-title" hidden>
      <header><div class="nx-chat-avatar" id="nx-chat-avatar-art" aria-hidden="true"></div><div><p class="nx-kicker">Study companion</p><h2 id="nx-chat-title">Companion</h2><small id="nx-drawer-rag-status">Session RAG</small></div><button class="nx-avatar-close" id="nx-chat-close" type="button" aria-label="Close study chat">×</button></header>
      <div class="nx-chat-tools"><span>Answers only from this session</span><button type="button" id="nx-chat-customize">Customize avatar</button></div>
      <div class="nx-chat-messages" id="nx-drawer-chat-messages" aria-live="polite"></div>
      <div class="nx-chat-suggestions" id="nx-drawer-chat-suggestions"></div>
      <form class="nx-chat-form" id="nx-drawer-chat-form"><label class="nx-sr-only" for="nx-drawer-chat-input">Ask about this session</label><textarea id="nx-drawer-chat-input" rows="2" maxlength="3000" placeholder="Ask about this session…" required></textarea><button class="nx-primary-button" type="submit" aria-label="Send question">Send</button></form>
      <p class="nx-chat-disclaimer">Nexora answers from indexed session materials. Verify important details using the citations.</p>
    </aside>`;
  document.body.append(root);

  const $ = selector => document.querySelector(selector);
  const drawer = $('#nx-avatar-drawer');
  const chatDrawer = $('#nx-companion-chat');
  const rail = $('#nx-avatar-rail');
  const controls = $('#nx-avatar-controls');
  let saved = readConfig();
  let draft = saved ? {...saved} : {...defaults};
  let savedNickname = storageGet(NICKNAME_KEY) || '';
  let draftNickname = savedNickname;
  let lastFocus = null;
  let chatBusy = false;
  const sessionId = window.NexoraSession?.id || 'session';
  const CHAT_KEY = `nexora-rag-chat-${sessionId}`;
  const suggestions = [
    {label:'Summarize this session',prompt:'Summarize this session'},
    {label:'Create a quiz',target:'#quiz'},
    {label:'Analyze exam patterns',target:'#pattern'}
  ];

  const readChat = () => {
    try {
      const value = JSON.parse(sessionStorage.getItem(CHAT_KEY) || '[]');
      return Array.isArray(value) ? value.filter(item => ['user','assistant'].includes(item?.role) && typeof item?.content === 'string').map(item => ({...item,citations:Array.isArray(item.citations)?item.citations:[]})).slice(-18) : [];
    } catch (_) { return []; }
  };
  let chatMessages = readChat();

  function welcomeMessage() {
    const name = savedNickname || 'your study companion';
    return `Hi, I’m ${name}. Ask me about the PDFs, notes, and question banks used in this session.`;
  }

  function saveChat() {
    try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(chatMessages.slice(-18))); } catch (_) {}
  }

  function renderChat() {
    const visibleMessages = chatMessages.length ? chatMessages : [{role:'assistant',content:welcomeMessage()}];
    ['#nx-drawer-chat-messages','#nx-page-chat-messages'].forEach(selector => {
      const container = $(selector);
      if (!container) return;
      container.replaceChildren();
      visibleMessages.forEach(message => {
        const bubble = document.createElement('div');
        bubble.className = `nx-chat-message nx-chat-message-${message.role}`;
        const label = document.createElement('span');
        label.textContent = message.role === 'assistant' ? (savedNickname || 'Companion') : 'You';
        const content = document.createElement('p');
        content.textContent = message.content;
        bubble.append(label,content);
        if (message.role === 'assistant' && message.citations?.length) {
          const citations = document.createElement('div');
          citations.className = 'nx-chat-citations';
          message.citations.forEach(citation => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'nx-chat-citation';
            const location = Number(citation.page) > 0 ? ` · p. ${citation.page}` : citation.section ? ` · ${citation.section}` : '';
            button.textContent = `${citation.title || citation.filename || 'Session source'}${location}`;
            button.addEventListener('click', () => window.dispatchEvent(new CustomEvent('nexora:open-rag-citation',{detail:citation})));
            citations.append(button);
          });
          bubble.append(citations);
        }
        container.append(bubble);
      });
      if (chatBusy) {
        const pending = document.createElement('div');
        pending.className = 'nx-chat-message nx-chat-message-assistant nx-chat-pending';
        pending.innerHTML = `<span>${escapeXml(savedNickname || 'Companion')}</span><p>Thinking<span aria-hidden="true">…</span></p>`;
        container.append(pending);
      }
      container.scrollTop = container.scrollHeight;
    });
    ['#nx-drawer-chat-suggestions','#nx-page-chat-suggestions'].forEach(selector => {
      const container = $(selector);
      if (!container) return;
      container.replaceChildren();
      suggestions.forEach(action => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.disabled = chatBusy;
        button.addEventListener('click', () => {
          if(action.target) { closeChat(false); location.hash=action.target; return; }
          sendMessage(action.prompt);
        });
        container.append(button);
      });
    });
    ['#nx-drawer-chat-form','#nx-page-chat-form'].forEach(selector => {
      const form = $(selector);
      if (form) form.querySelector('button[type="submit"]').disabled = chatBusy;
    });
  }

  function renderSavedAvatar() {
    const graphic = saved ? avatarSvg(saved) : defaultAvatar();
    $('#nx-avatar-rail-art').innerHTML = graphic;
    $('#nx-chat-avatar-art').innerHTML = graphic;
    const assistantPreview = $('#nx-assistant-avatar-preview');
    if (assistantPreview) assistantPreview.innerHTML = graphic;
    const title = $('#nx-assistant-avatar-title');
    const copy = $('#nx-assistant-avatar-copy');
    if (title) title.textContent = savedNickname || (saved ? 'Your custom companion' : 'Default profile');
    if (copy) copy.textContent = savedNickname ? `${savedNickname} is ready to answer from this session.` : 'Ready to answer from this session’s files.';
    $('#nx-chat-title').textContent = savedNickname || 'Companion';
    $('#nx-avatar-rail-name').textContent = savedNickname || 'Companion';
    renderChat();
  }

  function renderDraft() {
    $('#nx-avatar-preview').innerHTML = avatarSvg(draft, 'Avatar preview');
    Object.entries(draft).forEach(([key, value]) => { if (controls.elements[key]) controls.elements[key].value = value; });
    $('#nx-avatar-nickname').value = draftNickname;
  }

  function openDrawer(onboarding = false) {
    lastFocus = document.activeElement;
    closeChat(false);
    if (!saved) draft = {...defaults};
    draftNickname = savedNickname;
    renderDraft();
    const nicknameStatus = $('#nx-avatar-nickname-status');
    nicknameStatus.textContent = 'Checked by Gemini and Groq when you save.';
    nicknameStatus.className = '';
    drawer.dataset.required = onboarding ? 'true' : 'false';
    const onboardingPanel = $('#nx-avatar-onboarding');
    onboardingPanel.hidden = !onboarding;
    if (onboarding) onboardingPanel.innerHTML = '<strong>Complete your avatar setup to continue.</strong><p>Choose a look or randomize one, then save it. You can change it later from AI Study Assistant.</p>';
    $('#nx-avatar-close').hidden = onboarding;
    $('#nx-avatar-default').hidden = onboarding;
    drawer.hidden = false;
    $('#nx-avatar-backdrop').hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add('nx-open');
      document.body.classList.add('nx-avatar-drawer-open');
      rail.setAttribute('aria-expanded', 'true');
      (onboarding ? $('#nx-avatar-randomize') : $('#nx-avatar-close')).focus();
    });
  }

  function closeDrawer(discard = true, force = false) {
    if (drawer.dataset.required === 'true' && !force) return;
    drawer.classList.remove('nx-open');
    document.body.classList.remove('nx-avatar-drawer-open');
    rail.setAttribute('aria-expanded', 'false');
    if (discard) { draft = saved ? {...saved} : {...defaults}; draftNickname = savedNickname; }
    setTimeout(() => { drawer.hidden = true; $('#nx-avatar-backdrop').hidden = true; }, 220);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function openChat() {
    if (!saved) { openDrawer(true); return; }
    lastFocus = document.activeElement;
    window.NexoraRag?.sync(false);
    renderChat();
    chatDrawer.hidden = false;
    $('#nx-avatar-backdrop').hidden = false;
    requestAnimationFrame(() => {
      chatDrawer.classList.add('nx-open');
      document.body.classList.add('nx-avatar-drawer-open');
      rail.setAttribute('aria-expanded','true');
      $('#nx-drawer-chat-input').focus();
    });
  }

  function closeChat(restoreFocus = true) {
    if (chatDrawer.hidden) return;
    chatDrawer.classList.remove('nx-open');
    document.body.classList.remove('nx-avatar-drawer-open');
    rail.setAttribute('aria-expanded','false');
    setTimeout(() => {
      chatDrawer.hidden = true;
      if (drawer.hidden) $('#nx-avatar-backdrop').hidden = true;
    },220);
    if (restoreFocus && lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  async function sendMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text || chatBusy) return;
    const history = chatMessages.slice(-8).map(({role,content}) => ({role,content}));
    chatMessages.push({role:'user',content:text});
    chatMessages = chatMessages.slice(-18);
    saveChat();
    chatBusy = true;
    ['#nx-drawer-chat-input','#nx-page-chat-input'].forEach(selector => { const input = $(selector); if (input) input.value = ''; });
    renderChat();
    try {
      await window.NexoraRag?.ensureReady();
      const response = await fetch('/api/rag/chat',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({sessionId,question:text,history})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.answer) throw new Error(result.error || 'The session assistant is unavailable right now.');
      chatMessages.push({role:'assistant',content:String(result.answer),citations:Array.isArray(result.citations)?result.citations:[],provider:result.provider || ''});
    } catch (error) {
      chatMessages.push({role:'assistant',content:error.message || 'I could not search this session just now. Please try again.',citations:[]});
    } finally {
      chatBusy = false;
      chatMessages = chatMessages.slice(-18);
      saveChat();
      renderChat();
    }
  }

  rail.addEventListener('click', () => saved ? openChat() : openDrawer(true));
  $('#nx-avatar-close').addEventListener('click', () => closeDrawer());
  $('#nx-chat-close').addEventListener('click', () => closeChat());
  $('#nx-chat-customize').addEventListener('click', () => { closeChat(false); openDrawer(false); });
  $('#nx-avatar-backdrop').addEventListener('click', () => {
    if (!chatDrawer.hidden) closeChat();
    else closeDrawer();
  });
  $('#nx-assistant-customize')?.addEventListener('click', () => openDrawer(false));
  ['#nx-drawer-chat-form','#nx-page-chat-form'].forEach(selector => {
    $(selector)?.addEventListener('submit', event => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('textarea');
      sendMessage(input.value);
    });
  });
  controls.addEventListener('input', event => {
    if (event.target.name && Object.hasOwn(defaults, event.target.name)) {
      draft[event.target.name] = event.target.value;
      renderDraft();
    }
  });
  $('#nx-avatar-nickname').addEventListener('input', event => {
    draftNickname = event.target.value.replace(/\s+/g,' ').slice(0,24);
    const status = $('#nx-avatar-nickname-status');
    status.textContent = draftNickname.trim() ? 'This nickname will be safety-checked when you save.' : 'Optional — leave blank to use “Companion”.';
    status.className = '';
  });
  $('#nx-avatar-randomize').addEventListener('click', () => {
    Object.keys(defaults).forEach(key => {
      const values = choices[key].map(([value]) => value);
      draft[key] = values[Math.floor(Math.random() * values.length)];
    });
    renderDraft();
  });
  $('#nx-avatar-save').addEventListener('click', async () => {
    const button = $('#nx-avatar-save');
    const status = $('#nx-avatar-nickname-status');
    const nickname = draftNickname.normalize('NFKC').replace(/\s+/g,' ').trim();
    button.disabled = true;
    button.setAttribute('aria-busy','true');
    button.textContent = nickname ? 'Checking name…' : 'Saving…';
    if (nickname) {
      status.textContent = 'Checking this nickname across languages…';
      status.className = 'nx-checking';
      try {
        const response = await fetch('/api/avatar/nickname',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname})});
        const result = await response.json().catch(()=>({}));
        if (!response.ok) throw new Error(result.error || 'Nickname verification failed.');
        if (!result.allowed) {
          status.textContent = 'That nickname may be offensive. Please choose another one.';
          status.className = 'nx-rejected';
          return;
        }
        status.textContent = result.crossChecked ? 'Approved by Gemini and Groq.' : `Approved by ${result.providers?.join(' and ') || 'AI moderation'}.`;
        status.className = 'nx-approved';
      } catch (error) {
        status.textContent = error.message || 'Nickname verification is unavailable. Try again.';
        status.className = 'nx-rejected';
        return;
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.textContent = 'Save avatar';
      }
    } else {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = 'Save avatar';
    }
    saved = {...draft};
    savedNickname = nickname;
    const stored = storageSet(CONFIG_KEY, JSON.stringify(saved));
    if (savedNickname) storageSet(NICKNAME_KEY,savedNickname); else storageRemove(NICKNAME_KEY);
    storageSet(ONBOARDED_KEY, 'true');
    renderSavedAvatar();
    closeDrawer(false, true);
    if (typeof window.nexoraToast === 'function') window.nexoraToast(stored ? 'Avatar saved to this browser.' : 'Avatar saved for this visit.');
  });
  $('#nx-avatar-default').addEventListener('click', () => {
    saved = null;
    draft = {...defaults};
    savedNickname = '';
    draftNickname = '';
    storageRemove(CONFIG_KEY);
    storageRemove(NICKNAME_KEY);
    storageSet(ONBOARDED_KEY, 'true');
    renderSavedAvatar();
    closeDrawer(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!chatDrawer.hidden) closeChat();
    else if (!drawer.hidden) closeDrawer();
  });

  renderSavedAvatar();
  if (!saved && !storageGet(ONBOARDED_KEY)) {
    const nameDialog = $('#nx-name-dialog');
    if (nameDialog?.open) nameDialog.addEventListener('close', () => openDrawer(true), {once:true});
    else requestAnimationFrame(() => openDrawer(true));
  }
})();
