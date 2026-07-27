// ======================================================================
// Hi! Skip0s here. Code dive at will, we don't have secrets around here.
// Replicating is free, but kee´pm crediting me. 
// Github Profile: https://github.com/SkipOs
// ======================================================================

const CLIENT_ID = "4e38df9c3104484388e1420cb02fad85"; //PLEASE I beg you. don't place this anywhere everywhere, I don't want to keep resetting it. If you're going to put your own instance, make a new one.

const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPES = "user-read-private user-read-email user-top-read";

const els = {
  connState: document.getElementById('connectionState'),
  connectBtn: document.getElementById('connectBtn'),
  authError: document.getElementById('authError'),
  panelConnect: document.getElementById('panel-connect'),
  panelCustomize: document.getElementById('panel-customize'),
  contentTypeSelect: document.getElementById('contentTypeSelect'),
  titleInput: document.getElementById('titleInput'),
  timeRangeSelect: document.getElementById('timeRangeSelect'),
  countSlider: document.getElementById('countSlider'),
  countValue: document.getElementById('countValue'),
  bannerHeightSlider: document.getElementById('bannerHeightSlider'),
  bannerHeightValue: document.getElementById('bannerHeightValue'),
  bannerFocusSlider: document.getElementById('bannerFocusSlider'),
  bannerFocusValue: document.getElementById('bannerFocusValue'),
  titleFontSelect: document.getElementById('titleFontSelect'),
  titleSizeSlider: document.getElementById('titleSizeSlider'),
  titleSizeValue: document.getElementById('titleSizeValue'),
  labelFontSelect: document.getElementById('labelFontSelect'),
  labelSizeSlider: document.getElementById('labelSizeSlider'),
  labelSizeValue: document.getElementById('labelSizeValue'),
  shadowToggle: document.getElementById('shadowToggle'),
  downloadBtn: document.getElementById('downloadBtn'),
  bannerUpload: document.getElementById('bannerUpload'),
  previewEmpty: document.getElementById('previewEmpty'),
  canvas: document.getElementById('cardCanvas'),
};

// State Object, for creating the images and etecetera
const state = {
  accessToken: null,
  profile: null,
  pfpImg: null,
  items: [],              // unified list regardless of contentType: [{name, image, _img}]
  contentType: 'artists',  // 'artists' | 'tracks' | 'albums'
  count: 8,
  bannerImg: null,        // Image object or null
  bannerFill: 'preset:sunset',
  bannerHeight: 260,
  bannerFocusY: 0.5,
  titleFont: 'Space Grotesk',
  titleSize: 56,
  labelFont: 'Inter',
  labelSize: 20,
  shadows: true,
};

// PKCE helpers, bc OAuth and stuff. reference: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
function base64UrlEncode(buffer){
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function randomString(len=64){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i=0;i<len;i++) out += chars[arr[i] % chars.length];
  return out;
}
async function sha256(plain){
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

async function beginLogin(){
  if(!CLIENT_ID || CLIENT_ID === "CLIENT_ID"){
    els.authError.textContent = 'Site owner forgot to set CLIENT_ID at the top of app.js. Poke them about it.';
    return;
  }

  const verifier = randomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));
  localStorage.setItem('wc_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(code){
  const verifier = localStorage.getItem('wc_verifier');
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if(!res.ok){
    const t = await res.text();
    throw new Error('Token exchange failed: ' + t);
  }
  const data = await res.json();
  state.accessToken = data.access_token;
  sessionStorage.setItem('wc_access_token', data.access_token);
}

// Spotify data
async function spotifyGet(path){
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${state.accessToken}` }
  });
  if(!res.ok) throw new Error(`Spotify API error on ${path}: ${res.status}`);
  return res.json();
}

// Fetches whichever content type is selected. We always pull up to 50 so
// slider changes (2/4/6/8/10) never need a re-fetch — just a re-slice.
// "Top albums" isn't a real Spotify endpoint, so it's derived by deduping
// the albums off top tracks, in listening-rank order.
async function loadTopItems(){
  const timeRange = els.timeRangeSelect.value;

  if(state.contentType === 'artists'){
    const data = await spotifyGet(`/me/top/artists?limit=50&time_range=${timeRange}`);
    state.items = (data.items || []).map(a => ({
      name: a.name,
      image: a.images?.[0]?.url || null,
    }));
    return;
  }

  const data = await spotifyGet(`/me/top/tracks?limit=50&time_range=${timeRange}`);
  const tracks = data.items || [];

  if(state.contentType === 'tracks'){
    state.items = tracks.map(t => ({
      name: t.name,
      image: t.album?.images?.[0]?.url || null,
    }));
    return;
  }

  // albums, deduped by id, first-seen order = highest ranked track wins
  const seen = new Set();
  const albums = [];
  for(const t of tracks){
    const alb = t.album;
    if(alb && !seen.has(alb.id)){
      seen.add(alb.id);
      albums.push({ name: alb.name, image: alb.images?.[0]?.url || null });
    }
  }
  state.items = albums;
}

async function preloadItemImages(){
  // only the first 10 are ever shown (max slider value), no point loading more
  await Promise.all(state.items.slice(0, 10).map(async (item)=>{
    if(item.image){
      try{ item._img = await loadImage(item.image); }catch(e){ item._img = null; }
    }
  }));
}

async function refreshItems(){
  await loadTopItems();
  await preloadItemImages();
  renderCard();
}

// Fonts
const FONT_LIST = [
  'Space Grotesk','Inter','Playfair Display','Bebas Neue','Fraunces',
  'JetBrains Mono','DM Serif Display','Archivo Black','Caveat','Sora'
];
const loadedFonts = new Set();

function populateFontSelects(){
  [els.titleFontSelect, els.labelFontSelect].forEach(sel=>{
    FONT_LIST.forEach(f=>{
      const opt = document.createElement('option');
      opt.value = f; opt.textContent = f;
      sel.appendChild(opt);
    });
  });
  els.titleFontSelect.value = state.titleFont;
  els.labelFontSelect.value = state.labelFont;
}

function ensureFontLoaded(family){
  return new Promise((resolve)=>{
    if(loadedFonts.has(family)) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700;900&display=swap`;
    link.onload = async ()=>{
      try{ await document.fonts.load(`700 40px "${family}"`); }catch(e){}
      loadedFonts.add(family);
      resolve();
    };
    link.onerror = ()=> resolve(); // fail soft
    document.head.appendChild(link);
  });
}

// Banner presets
const PRESET_GRADIENTS = {
  'preset:sunset': ['#ff6a6a', '#ffb347'],
  'preset:violet': ['#5b247a', '#1bcedf'],
  'preset:mono':   ['#3a3a3a', '#0d0d0d'],
  'preset:matcha': ['#2d4a3e', '#a3c9a8'],
};

// Canvas rendering — width is fixed, height is computed per-render based
// on how many rows the grid needs, so nothing gets cramped or clipped.
const W = 900;
const ctx = els.canvas.getContext('2d');

function drawRoundedImageCover(image, x, y, w, h, radius=0, focusX=0.5, focusY=0.5){
  ctx.save();
  if(radius){
    roundRectPath(x,y,w,h,radius);
    ctx.clip();
  }
  const ir = image.width / image.height;
  const r = w / h;
  let sx, sy, sw, sh;
  if(ir > r){
    sh = image.height; sw = sh * r;
    sx = (image.width - sw) * focusX;
    sy = 0;
  } else {
    sw = image.width; sh = sw / r;
    sx = 0;
    sy = (image.height - sh) * focusY;
  }
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function roundRectPath(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

async function loadImage(src, crossOrigin=true){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    if(crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = ()=>resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clearShadow(){
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Truncates text with an ellipsis to fit maxWidth, assuming ctx.font is
// already set to the font/size it'll be drawn with.
function truncateText(text, maxWidth){
  if(ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while(truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth){
    truncated = truncated.slice(0, -1);
  }
  return truncated.trimEnd() + '…';
}

function setShadow(blur=18, offsetY=8, alpha=0.5){
  if(!state.shadows){ clearShadow(); return; }
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offsetY;
}

async function renderCard(){
  if(!state.profile) return;

  els.previewEmpty.classList.add('hidden');
  els.canvas.classList.remove('hidden');

  const bannerH = state.bannerHeight;
  const items = state.items.slice(0, state.count);

  // grid geometry — 1 row for a count of 2, otherwise 2 rows, columns
  // stretch to fit. Canvas height grows to match so nothing overlaps.
  const rows = items.length <= 2 ? 1 : 2;
  const cols = Math.max(1, Math.ceil(items.length / rows));
  const gridMargin = 40;
  const gap = 20;
  const cellW = (W - gridMargin*2 - gap*(cols-1)) / cols;
  const cellH = cellW;
  const labelH = 34;
  const gridTop = bannerH + 130;
  const gridBottom = gridTop + rows * (cellH + labelH + gap) - gap;
  const canvasH = Math.max(gridBottom + 40, bannerH + 260);

  if(els.canvas.height !== canvasH) els.canvas.height = canvasH;
  if(els.canvas.width !== W) els.canvas.width = W;

  ctx.clearRect(0,0,W,canvasH);

  // background
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0,0,W,canvasH);

  // banner
  if(state.bannerImg){
    drawRoundedImageCover(state.bannerImg, 0, 0, W, bannerH, 0, 0.5, state.bannerFocusY);
  } else {
    const [c1,c2] = PRESET_GRADIENTS[state.bannerFill] || PRESET_GRADIENTS['preset:sunset'];
    const g = ctx.createLinearGradient(0,0,W,bannerH);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,bannerH);
  }

  // dark card body below banner
  ctx.fillStyle = '#232323';
  ctx.fillRect(0, bannerH, W, canvasH - bannerH);

  // pfp circle, overlapping banner/body seam — shadow goes on the backing
  // disc, drawn before the clipped image so it reads as "lifted"
  const pfpR = 90;
  const pfpX = 40 + pfpR;
  const pfpY = bannerH;

  ctx.save();
  setShadow(20, 10, 0.55);
  ctx.beginPath();
  ctx.arc(pfpX, pfpY, pfpR, 0, Math.PI*2);
  ctx.fillStyle = '#1e1e1e';
  ctx.fill();
  ctx.restore();

  if(state.pfpImg){
    ctx.save();
    ctx.beginPath();
    ctx.arc(pfpX, pfpY, pfpR, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    drawRoundedImageCover(state.pfpImg, pfpX-pfpR, pfpY-pfpR, pfpR*2, pfpR*2);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(pfpX, pfpY, pfpR, 0, Math.PI*2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#232323';
  ctx.stroke();

  // title text — auto-shrinks to fit the space next to the pfp so long
  // names never run off the edge of the card. Sits a bit below the pfp's
  // vertical center, instead of dead-centered on the banner/body seam.
  await ensureFontLoaded(state.titleFont);
  const titleText = els.titleInput.value.trim() || state.profile.display_name || 'Untitled';
  const titleX = pfpX + pfpR + 30;
  const titleY = pfpY + Math.round(pfpR * 0.45);
  const availableWidth = W - titleX - 40;
  let titleSize = state.titleSize;
  ctx.font = `700 ${titleSize}px "${state.titleFont}"`;
  while(ctx.measureText(titleText).width > availableWidth && titleSize > 18){
    titleSize -= 2;
    ctx.font = `700 ${titleSize}px "${state.titleFont}"`;
  }
  ctx.save();
  setShadow(10, 4, 0.4);
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleText, titleX, titleY);
  ctx.restore();

  // item grid — artists, tracks, or albums depending on state.contentType
  await ensureFontLoaded(state.labelFont);

  for(let i=0;i<items.length;i++){
    const item = items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gridMargin + col * (cellW + gap);
    const y = gridTop + row * (cellH + labelH + gap);

    ctx.save();
    setShadow(16, 8, 0.45);
    if(item._img){
      drawRoundedImageCover(item._img, x, y, cellW, cellH, 12);
    } else {
      ctx.fillStyle = '#3a3a3a';
      roundRectPath(x,y,cellW,cellH,12);
      ctx.fill();
    }
    ctx.restore();

    ctx.font = `500 ${state.labelSize}px "${state.labelFont}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const label = truncateText(item.name, cellW - 4);

    ctx.save();
    setShadow(6, 2, 0.55);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x + cellW/2, y + cellH + labelH - 8);
    ctx.restore();

    ctx.textAlign = 'left';
  }

  clearShadow();
}

// UI wiring
function selectSwatch(el){
  document.querySelectorAll('.swatch-btn').forEach(b=>b.classList.remove('selected'));
  el.classList.add('selected');
}

document.querySelectorAll('[data-banner]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    state.bannerFill = btn.dataset.banner;
    state.bannerImg = null;
    selectSwatch(btn);
    renderCard();
  });
});

els.bannerUpload.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  state.bannerImg = await loadImage(url, false);
  selectSwatch(els.bannerUpload.closest('.swatch-btn'));
  renderCard();
});

els.titleInput.addEventListener('input', renderCard);

els.contentTypeSelect.addEventListener('change', ()=>{
  state.contentType = els.contentTypeSelect.value;
  refreshItems();
});

els.timeRangeSelect.addEventListener('change', refreshItems);

els.countSlider.addEventListener('input', ()=>{
  state.count = Number(els.countSlider.value);
  els.countValue.textContent = state.count;
  renderCard();
});

els.bannerHeightSlider.addEventListener('input', ()=>{
  state.bannerHeight = Number(els.bannerHeightSlider.value);
  els.bannerHeightValue.textContent = `${state.bannerHeight}px`;
  renderCard();
});

els.bannerFocusSlider.addEventListener('input', ()=>{
  state.bannerFocusY = Number(els.bannerFocusSlider.value) / 100;
  els.bannerFocusValue.textContent = `${els.bannerFocusSlider.value}%`;
  renderCard();
});

els.titleFontSelect.addEventListener('change', ()=>{ state.titleFont = els.titleFontSelect.value; renderCard(); });
els.titleSizeSlider.addEventListener('input', ()=>{
  state.titleSize = Number(els.titleSizeSlider.value);
  els.titleSizeValue.textContent = `${state.titleSize}px`;
  renderCard();
});

els.labelFontSelect.addEventListener('change', ()=>{ state.labelFont = els.labelFontSelect.value; renderCard(); });
els.labelSizeSlider.addEventListener('input', ()=>{
  state.labelSize = Number(els.labelSizeSlider.value);
  els.labelSizeValue.textContent = `${state.labelSize}px`;
  renderCard();
});

els.shadowToggle.addEventListener('change', ()=>{
  state.shadows = els.shadowToggle.checked;
  renderCard();
});

els.downloadBtn.addEventListener('click', ()=>{
  const link = document.createElement('a');
  link.download = `${(state.profile?.display_name || 'wrapped-card').replace(/\s+/g,'-')}.png`;
  link.href = els.canvas.toDataURL('image/png');
  link.click();
});

els.connectBtn.addEventListener('click', beginLogin);

// Pain in the ass boot sequence
async function afterAuthReady(){
  els.connState.textContent = 'connected';
  els.connState.classList.add('conn-on');
  els.connState.classList.remove('conn-off');
  els.panelConnect.classList.add('hidden');
  els.panelCustomize.classList.remove('hidden');

  state.profile = await spotifyGet('/me');

  if(state.profile.images?.[0]?.url){
    try{ state.pfpImg = await loadImage(state.profile.images[0].url); }catch(e){ state.pfpImg = null; }
  }

  await refreshItems();

  els.titleInput.value = state.profile.display_name || '';
  document.querySelector('[data-banner="preset:sunset"]')?.classList.add('selected');
}

async function boot(){
  populateFontSelects();

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const errorParam = urlParams.get('error');

  if(errorParam){
    els.authError.textContent = `Spotify said: ${errorParam}`;
    return;
  }

  if(code){
    window.history.replaceState({}, document.title, window.location.pathname); // clean the URL so refresh doesn't retry the same code
    try{
      await exchangeCodeForToken(code);
      await afterAuthReady();
    }catch(err){
      console.error(err);
      els.authError.textContent = 'Login failed. Ping the site owner — Client ID or Redirect URI is probably misconfigured.'; // For debug, hopefully you won't see this shit
    }
    return;
  }

  const savedToken = sessionStorage.getItem('wc_access_token');
  if(savedToken){
    state.accessToken = savedToken;
    try{
      await afterAuthReady();
    }catch(err){
      sessionStorage.removeItem('wc_access_token');       // if I am here token likely expired. It happened TWICE already
    }
  }
}

boot();