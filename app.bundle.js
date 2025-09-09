// CarbonKrishi single-file bundle (no imports, works via file://)
// Minimal global namespace: CK
(function(){
  const CK = (window.CK = {});

  // i18n
  CK.langs = {
    en: {
      app: { name: 'CarbonKrishi', tagline: 'Agricultural Carbon Credits for Indian Farmers' },
      nav: { dashboard:'Dashboard', calculator:'Calculator', profile:'Profile', monitoring:'Monitoring', marketplace:'Marketplace', analytics:'Analytics', admin:'Admin' },
      profile: { title:'Farmer Profile & Farm Setup', name:'Full Name', location:'Location (Village, District, State)', area:'Total Farm Area (hectares)', soil:'Soil Type', water:'Water Source', crops:'Crops (comma separated)', save:'Save Profile' },
      calc: { title:'Carbon Credit Calculator', rice:'Rice (Methane Reduction)', wheatMaize:'Wheat/Maize (SOC, N2O, Fuel)', area:'Area (ha)', cultivationDays:'Cultivation Days', water:'Water Management', flood:'Flood', other:'Other', awd:'AWD Adoption', straw:'Straw Incorporation', organic:'Organic Inputs Level', low:'Low', medium:'Medium', high:'High', baselineN:'Baseline Nitrogen (kg N/ha)', fertRed:'Fertilizer Reduction (%)', opsReduced:'Tillage Operations Reduced (count)', price:'Price (₹/tCO2e)', compute:'Compute Credits', results:'Results', credits:'Credits (tCO2e)', revenue:'Estimated Revenue (₹)' },
      dashboard: { summary:'Carbon Credits Summary', total:'Total Earned', pending:'Pending', revenue:'Revenue', quick:'Quick Actions', calc:'Calculate Credits', enterData:'Enter Data', viewMarket:'View Marketplace', support:'Get Support' },
      monitoring: { title:'Monitoring & Verification', status:'Verification Status', satellite:'Satellite Practice Verification', next:'Next Milestone' },
      market: { title:'Carbon Credit Marketplace', list:'List Credits for Sale', yourListings:'Your Listings', volume:'Volume (tCO2e)', price:'Price (₹/tCO2e)', create:'Create Listing' },
      misc: { save:'Save', continue:'Continue', back:'Back', yes:'Yes', no:'No' }
    },
    hi: {
      app: { name: 'कार्बनकृषि', tagline: 'भारतीय किसानों के लिए कार्बन क्रेडिट' },
      nav: { dashboard:'डैशबोर्ड', calculator:'कैलकुलेटर', profile:'प्रोफ़ाइल', monitoring:'मॉनिटरिंग', marketplace:'मार्केटप्लेस', analytics:'एनालिटिक्स', admin:'एडमिन' },
      profile: { title:'किसान प्रोफ़ाइल और खेत सेटअप', name:'पूरा नाम', location:'स्थान (गाँव, ज़िला, राज्य)', area:'कुल खेत क्षेत्र (हेक्टेयर)', soil:'मृदा प्रकार', water:'जल स्रोत', crops:'फसलें (अल्पविराम से अलग)', save:'प्रोफ़ाइल सहेजें' },
      calc: { title:'कार्बन क्रेडिट कैलकुलेटर', rice:'धान (मीथेन कमी)', wheatMaize:'गेहूँ/मक्का (एसओसी, N2O, ईंधन)', area:'क्षेत्र (हेक्टेयर)', cultivationDays:'खेती के दिन', water:'जल प्रबंधन', flood:'बाढ़', other:'अन्य', awd:'एडब्ल्यूडी अपनाया', straw:'पराली मिलाना', organic:'जैविक इनपुट स्तर', low:'कम', medium:'मध्यम', high:'उच्च', baselineN:'आधार नाइट्रोजन (किग्रा N/हेक्टेयर)', fertRed:'उर्वरक कमी (%)', opsReduced:'जुताई ऑपरेशन कम (गिनती)', price:'कीमत (₹/tCO2e)', compute:'क्रेडिट निकालें', results:'परिणाम', credits:'क्रेडिट (tCO2e)', revenue:'आय अनुमान (₹)' },
      dashboard: { summary:'कार्बन क्रेडिट सारांश', total:'कुल अर्जित', pending:'लंबित', revenue:'राजस्व', quick:'त्वरित क्रियाएँ', calc:'क्रेडिट निकालें', enterData:'डेटा दर्ज करें', viewMarket:'मार्केटप्लेस देखें', support:'सहायता लें' },
      monitoring: { title:'मॉनिटरिंग और सत्यापन', status:'सत्यापन स्थिति', satellite:'उपग्रह प्रैक्टिस सत्यापन', next:'अगला माइलस्टोन' },
      market: { title:'कार्बन क्रेडिट मार्केटप्लेस', list:'क्रेडिट बिक्री के लिए सूचीबद्ध करें', yourListings:'आपकी लिस्टिंग', volume:'मात्रा (tCO2e)', price:'कीमत (₹/tCO2e)', create:'लिस्टिंग बनाएं' },
      misc: { save:'सहेजें', continue:'जारी रखें', back:'पीछे', yes:'हाँ', no:'नहीं' }
    }
  };

  // storage
  const NS='ck_';
  CK.save=(k,v)=>{try{localStorage.setItem(NS+k,JSON.stringify(v));}catch{}};
  CK.load=(k,f=null)=>{try{const v=localStorage.getItem(NS+k);return v?JSON.parse(v):f;}catch{return f}};
  CK.remove=(k)=>{try{localStorage.removeItem(NS+k);}catch{}};

  // constants + calculations
  const C = CK.C = {
    RICE_BASELINE_CH4_KG_PER_HA_DAY: 1.30,
    RICE_DEFAULT_CULTIVATION_DAYS: 120,
    WATER_FACTOR_FLOOD: 1.2,
    AWD_REDUCTION: 0.48,
    STRAW_INC_REDUCTION: 0.15,
    GWP_CH4: 25,
    SOC_TONNES_C_PER_HA_YEAR: 0.47,
    C_TO_CO2: 44/12,
    N2O_EF_DIRECT: 0.0068,
    DIESEL_KG_CO2_PER_L: 2.68,
  };
  CK.calculateRice = (p)=>{
    const areaHa = +p.areaHa||0;
    const days = +p.cultivationDays||C.RICE_DEFAULT_CULTIVATION_DAYS;
    const waterFactor = p.waterManagement==='flood'? C.WATER_FACTOR_FLOOD: 1.0;
    const organicFactor = p.organicFactor||1.0;
    const base = areaHa*days*C.RICE_BASELINE_CH4_KG_PER_HA_DAY*waterFactor*organicFactor;
    const project = base*(1-(p.awdAdoption?C.AWD_REDUCTION:0))*(1-(p.strawIncorporation?C.STRAW_INC_REDUCTION:0));
    const ch4RedKg = Math.max(0, base-project);
    const tCO2e = ch4RedKg*C.GWP_CH4/1000;
    const price = +p.pricePerTonne||1500;
    return { creditVolume:tCO2e, revenue:tCO2e*price, methodology:'VM0042' };
  };
  CK.calculateWM = (p)=>{
    const areaHa = +p.areaHa||0;
    const soc_tC = p.noTillAdoption? areaHa*C.SOC_TONNES_C_PER_HA_YEAR: 0;
    const soc_tCO2e = soc_tC*C.C_TO_CO2;
    const reducedNkg = (+p.baselineNkgPerHa||0) * (Math.max(0,Math.min(100,+p.fertilizerReductionPct||0))/100) * areaHa;
    const n2o_tCO2e = (reducedNkg*C.N2O_EF_DIRECT*298)/1000;
    const litersSaved = (+p.tillageOperationsReduced||0) * (+p.litersPerOpPerHa||25) * areaHa;
    const fuel_tCO2e = (litersSaved*C.DIESEL_KG_CO2_PER_L)/1000;
    const total = soc_tCO2e+n2o_tCO2e+fuel_tCO2e;
    const price = +p.pricePerTonne||1200;
    return { creditVolume: total, revenue: total*price, breakdown:{soilCarbon:soc_tCO2e,n2oReduction:n2o_tCO2e,fuelSavings:fuel_tCO2e} };
  };
  CK.validatePrice = (tCO2e, price)=>{
    const e=[]; if (tCO2e<1) e.push('Minimum credit volume for listing is 1 tCO2e'); if (price<800||price>2500) e.push('Price must be between ₹800 and ₹2500 per tCO2e'); return e;
  };

  // state
  CK.state = {
    lang: CK.load('lang','en'),
  };
  CK.t = ()=> CK.langs[CK.state.lang] || CK.langs.en;

  // UI helpers
  const el = (tag,cls,text)=>{const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e;};
  const fieldInput = (label,name,value,type='text')=>{const w=el('div','field'); w.appendChild(el('label','',label)); const i=el('input'); i.name=name; i.type=type; i.value=value??''; w.appendChild(i); return w;};

  // Header
  CK.Header = ()=>{
    const t=CK.t(); const top=el('header','topbar'); const inner=el('div','topbar-inner');
    const left=el('div','brand'); left.innerHTML='<span class="logo">🌾</span><span>'+t.app.name+'</span>';
    const right=el('div','nav');
    [['#/dashboard',t.nav.dashboard],['#/calculator',t.nav.calculator],['#/profile',t.nav.profile],['#/monitoring',t.nav.monitoring],['#/marketplace',t.nav.marketplace]].forEach(([h,l])=>{const a=el('a','',l); a.href=h; if(location.hash===h)a.classList.add('active'); right.appendChild(a);});
    const sel=el('select','btn ghost'); [['en','EN'],['hi','हिं']].forEach(([v,L])=>{const o=el('option');o.value=v;o.textContent=L;if(CK.state.lang===v)o.selected=true; sel.appendChild(o);});
    sel.onchange=()=>{CK.state.lang=sel.value; CK.save('lang',CK.state.lang); CK.route();};
    inner.appendChild(left); inner.appendChild(right); right.appendChild(sel); top.appendChild(inner); return top;
  };

  // Footer
  CK.Footer = ()=>{ const f=el('footer','footer','© 2025 CarbonKrishi — Demo build for agricultural carbon credits.'); return f; };

  // Profile
  CK.Profile = ()=>{
    const t=CK.t(); const wrap=el('div','grid'); const card=el('div','card'); card.appendChild(el('h2','',t.profile.title));
    const profile=CK.load('profile',{ name:'', location:'', totalArea:'', soilType:'alluvial', waterSource:'tube_well', crops:'rice,wheat' });
    const form=el('div','grid grid-2');
    form.appendChild(fieldInput(t.profile.name,'name',profile.name));
    form.appendChild(fieldInput(t.profile.location,'location',profile.location));
    form.appendChild(fieldInput(t.profile.area,'totalArea',profile.totalArea,'number'));
    // soil
    const soil=el('div','field'); soil.appendChild(el('label','',t.profile.soil)); const ss=el('select'); ['clay','loamy','sandy','black_cotton','red','alluvial'].forEach(v=>{const o=el('option');o.value=v;o.textContent=v.replace('_',' '); if(profile.soilType===v)o.selected=true; ss.appendChild(o);}); soil.appendChild(ss); form.appendChild(soil);
    // water
    const water=el('div','field'); water.appendChild(el('label','',t.profile.water)); const ws=el('select'); ['tube_well','canal','rain_fed','river'].forEach(v=>{const o=el('option');o.value=v;o.textContent=v.replace('_',' '); if(profile.waterSource===v)o.selected=true; ws.appendChild(o);}); water.appendChild(ws); form.appendChild(water);
    form.appendChild(fieldInput(t.profile.crops,'crops',profile.crops));
    const saveBtn=el('button','btn',t.profile.save); saveBtn.onclick=()=>{ const p={ name:form.querySelector('[name=name]').value.trim(), location:form.querySelector('[name=location]').value.trim(), totalArea:parseFloat(form.querySelector('[name=totalArea]').value||'0')||0, soilType:ss.value, waterSource:ws.value, crops:form.querySelector('[name=crops]').value.trim() }; CK.save('profile',p); alert('Profile saved'); };
    card.appendChild(form); card.appendChild(saveBtn); wrap.appendChild(card);
    const helper=el('div','banner','Tip: Complete your profile to unlock calculators and marketplace.'); wrap.appendChild(helper);
    return wrap;
  };

  // Dashboard
  CK.Dashboard = ()=>{
    const t=CK.t(); const wrap=el('div','grid'); const profile=CK.load('profile',null); const hist=CK.load('creditsHistory',[]);
    const total=hist.reduce((s,x)=>s+(x.creditVolume||0),0); const pending=CK.load('pendingCredits',0)||0; const revenue=hist.reduce((s,x)=>s+(x.revenue||0),0);
    const card=el('div','card'); card.appendChild(el('h2','',t.dashboard.summary));
    const stats=el('div','grid grid-3'); stats.appendChild(stat(t.dashboard.total, total.toFixed(1)+' tCO2e')); stats.appendChild(stat(t.dashboard.pending, pending.toFixed(1)+' tCO2e')); stats.appendChild(stat(t.dashboard.revenue, '₹'+Math.round(revenue).toLocaleString('en-IN'))); card.appendChild(stats);
    const quick=el('div','card'); quick.appendChild(el('h3','',t.dashboard.quick)); const acts=el('div','grid grid-2'); acts.appendChild(linkBtn(t.dashboard.calc,'#/calculator')); acts.appendChild(linkBtn(t.dashboard.enterData,'#/profile')); acts.appendChild(linkBtn(t.dashboard.viewMarket,'#/marketplace')); acts.appendChild(linkBtn(t.dashboard.support,'#/monitoring')); quick.appendChild(acts);
    wrap.appendChild(card); wrap.appendChild(quick);
    const banner=el('div','banner', profile? `Welcome ${profile.name||'farmer'} — area ${profile.totalArea||0} ha, crops: ${profile.crops||'-'}`: 'Complete your profile to get started.'); wrap.appendChild(banner);
    return wrap;
  };
  function stat(label,value){ const c=el('div','card'); const v=el('div','kpi',value); const l=el('div','muted',label); c.appendChild(v); c.appendChild(l); return c; }
  function linkBtn(text,href){ const a=el('a','btn ghost',text); a.href=href; return a; }

  // Calculator
  CK.Calculator = ()=>{
    const t=CK.t(); const wrap=el('div','grid'); const card=el('div','card'); card.appendChild(el('h2','',t.calc.title));
    const tabs=el('div','grid grid-2'); const btnRice=el('button','btn',t.calc.rice); const btnWM=el('button','btn ghost',t.calc.wheatMaize); tabs.appendChild(btnRice); tabs.appendChild(btnWM); card.appendChild(tabs);
    const rice=RiceForm(); const wm=WMForm(); wm.style.display='none'; card.appendChild(rice); card.appendChild(wm);
    btnRice.onclick=()=>{btnRice.className='btn'; btnWM.className='btn ghost'; rice.style.display='block'; wm.style.display='none';};
    btnWM.onclick=()=>{btnWM.className='btn'; btnRice.className='btn ghost'; rice.style.display='none'; wm.style.display='block';};
    wrap.appendChild(card); return wrap;
  };
  function RiceForm(){ const t=CK.t(); const elw=el('div','grid'); const profile=CK.load('profile',{}); const s=Object.assign({ area:profile.totalArea||1, days:120, water:'flood', awd:true, straw:true, organic:'medium', price:1500 }, CK.load('calc_rice',{})); const form=el('div','grid grid-2');
    form.appendChild(fieldInput(t.calc.area,'area',s.area,'number')); form.appendChild(fieldInput(t.calc.cultivationDays,'days',s.days,'number'));
    const water=select(t.calc.water,'water',s.water,[['flood',t.calc.flood],['other',t.calc.other]]); form.appendChild(water.wrap);
    const awd=checkbox(t.calc.awd,'awd',s.awd); const straw=checkbox(t.calc.straw,'straw',s.straw); form.appendChild(awd.wrap); form.appendChild(straw.wrap);
    const organic=select(t.calc.organic,'organic',s.organic,[['low',t.calc.low],['medium',t.calc.medium],['high',t.calc.high]]); form.appendChild(organic.wrap);
    form.appendChild(fieldInput(t.calc.price,'price',s.price,'number'));
    const compute=el('button','btn accent',t.calc.compute); const add=el('button','btn ghost','Add to History'); add.style.marginLeft='8px';
    const results=el('div','card'); results.appendChild(el('h3','',t.calc.results)); const rs=el('div'); results.appendChild(rs);
    const update=()=>{ const st={ areaHa:+form.querySelector('[name=area]').value||0, cultivationDays:+form.querySelector('[name=days]').value||120, waterManagement:water.select.value, awdAdoption:awd.input.checked, strawIncorporation:straw.input.checked, organicFactor:{low:0.9,medium:1.0,high:1.1}[organic.select.value]||1.0, pricePerTonne:+form.querySelector('[name=price]').value||1500}; CK.save('calc_rice',{area:st.areaHa,days:st.cultivationDays,water:st.waterManagement,awd:st.awdAdoption,straw:st.strawIncorporation,organic:organic.select.value,price:st.pricePerTonne}); const out=CK.calculateRice(st); rs.innerHTML = `<div class="grid grid-3"><div><div class="muted">${t.calc.credits}</div><div class="kpi">${out.creditVolume.toFixed(2)}</div></div><div><div class="muted">${t.calc.revenue}</div><div class="kpi">₹${Math.round(out.revenue).toLocaleString('en-IN')}</div></div><div><div class="muted">Methodology</div><div class="kpi">${out.methodology}</div></div></div>`; };
    compute.onclick=update; update();
    add.onclick=()=>{ const st={ areaHa:+form.querySelector('[name=area]').value||0, cultivationDays:+form.querySelector('[name=days]').value||120, waterManagement:water.select.value, awdAdoption:awd.input.checked, strawIncorporation:straw.input.checked, organicFactor:{low:0.9,medium:1.0,high:1.1}[organic.select.value]||1.0, pricePerTonne:+form.querySelector('[name=price]').value||1500}; const out=CK.calculateRice(st); const hist=CK.load('creditsHistory',[]); hist.push({ creditVolume:out.creditVolume, revenue:out.revenue, crop:'rice', date:new Date().toISOString() }); CK.save('creditsHistory',hist); alert('Saved to history.'); };
    const actions=el('div'); actions.appendChild(compute); actions.appendChild(add); elw.appendChild(form); elw.appendChild(actions); elw.appendChild(results); return elw; }
  function WMForm(){ const t=CK.t(); const elw=el('div','grid'); const profile=CK.load('profile',{}); const s=Object.assign({ area:profile.totalArea||1, noTill:true, baselineN:150, fertRed:10, opsReduced:1, price:1200 }, CK.load('calc_wm',{})); const form=el('div','grid grid-2');
    form.appendChild(fieldInput(t.calc.area,'area',s.area,'number')); form.appendChild(checkbox('No-till Adoption','noTill',s.noTill).wrap); form.appendChild(fieldInput(t.calc.baselineN,'baselineN',s.baselineN,'number')); form.appendChild(fieldInput(t.calc.fertRed,'fertRed',s.fertRed,'number')); form.appendChild(fieldInput(t.calc.opsReduced,'opsReduced',s.opsReduced,'number')); form.appendChild(fieldInput(t.calc.price,'price',s.price,'number'));
    const compute=el('button','btn accent',t.calc.compute); const add=el('button','btn ghost','Add to History'); add.style.marginLeft='8px';
    const results=el('div','card'); results.appendChild(el('h3','',t.calc.results)); const rs=el('div'); results.appendChild(rs);
    const update=()=>{ const st={ areaHa:+form.querySelector('[name=area]').value||0, noTillAdoption:form.querySelector('[name=noTill]').checked, baselineNkgPerHa:+form.querySelector('[name=baselineN]').value||0, fertilizerReductionPct:+form.querySelector('[name=fertRed]').value||0, tillageOperationsReduced:+form.querySelector('[name=opsReduced]').value||0, pricePerTonne:+form.querySelector('[name=price]').value||1200 }; CK.save('calc_wm',{area:st.areaHa,noTill:st.noTillAdoption,baselineN:st.baselineNkgPerHa,fertRed:st.fertilizerReductionPct,opsReduced:st.tillageOperationsReduced,price:st.pricePerTonne}); const out=CK.calculateWM(st); rs.innerHTML = `<div class="grid grid-3"><div><div class="muted">${t.calc.credits}</div><div class="kpi">${out.creditVolume.toFixed(2)}</div></div><div><div class="muted">${t.calc.revenue}</div><div class="kpi">₹${Math.round(out.revenue).toLocaleString('en-IN')}</div></div><div><div class="muted">Breakdown</div><div class="help">SOC: ${out.breakdown.soilCarbon.toFixed(2)} | N2O: ${out.breakdown.n2oReduction.toFixed(2)} | Fuel: ${out.breakdown.fuelSavings.toFixed(2)}</div></div></div>`; };
    compute.onclick=update; update();
    add.onclick=()=>{ const st={ areaHa:+form.querySelector('[name=area]').value||0, noTillAdoption:form.querySelector('[name=noTill]').checked, baselineNkgPerHa:+form.querySelector('[name=baselineN]').value||0, fertilizerReductionPct:+form.querySelector('[name=fertRed]').value||0, tillageOperationsReduced:+form.querySelector('[name=opsReduced]').value||0, pricePerTonne:+form.querySelector('[name=price]').value||1200 }; const out=CK.calculateWM(st); const hist=CK.load('creditsHistory',[]); hist.push({ creditVolume:out.creditVolume, revenue:out.revenue, crop:'wheat_maize', date:new Date().toISOString() }); CK.save('creditsHistory',hist); alert('Saved to history.'); };
    const actions=el('div'); actions.appendChild(compute); actions.appendChild(add); elw.appendChild(form); elw.appendChild(actions); elw.appendChild(results); return elw; }
  function select(label,name,value,options){ const wrap=el('div','field'); wrap.appendChild(el('label','',label)); const s=el('select'); s.name=name; options.forEach(([v,txt])=>{const o=el('option');o.value=v;o.textContent=txt; if(v===value)o.selected=true; s.appendChild(o);}); wrap.appendChild(s); return {wrap,select:s}; }
  function checkbox(label,name,checked){ const wrap=el('div','field'); wrap.appendChild(el('label','',label)); const i=el('input'); i.type='checkbox'; i.name=name; i.checked=!!checked; wrap.appendChild(i); return {wrap,input:i}; }

  // Monitoring
  CK.Monitoring = ()=>{ const t=CK.t(); const wrap=el('div','grid'); const card=el('div','card'); card.appendChild(el('h2','',t.monitoring.title)); const status=el('div','grid grid-3'); const v=el('div'); v.innerHTML=`<div class="muted">${t.monitoring.status}</div><div class="status ok">in_progress</div>`; const n=el('div'); n.innerHTML=`<div class="muted">${t.monitoring.next}</div><div class="kpi">soil_sampling_due</div>`; const c=el('div'); c.innerHTML=`<div class="muted">Confidence</div><div class="kpi">High</div>`; status.appendChild(v); status.appendChild(n); status.appendChild(c); card.appendChild(status); const sat=el('div','card'); sat.appendChild(el('h3','',t.monitoring.satellite)); const profile=CK.load('profile',{}); const area=profile.totalArea||1; sat.innerHTML += `<div class="help">Farm area: ${area} ha — Sentinel-2 mock analysis (no-till: 75%, AWD events: 4)</div><div class="chartbar"><span style="width:75%"></span></div>`; wrap.appendChild(card); wrap.appendChild(sat); return wrap; };

  // Marketplace
  CK.Marketplace = ()=>{ const t=CK.t(); const wrap=el('div','grid'); const card=el('div','card'); card.appendChild(el('h2','',t.market.title)); const listCard=el('div','card'); listCard.appendChild(el('h3','',t.market.list)); const form=el('div','grid grid-3'); const vol=fieldInput(t.market.volume,'volume',2,'number'); const price=fieldInput(t.market.price,'price',1500,'number'); const btn=el('button','btn accent',t.market.create); form.appendChild(vol); form.appendChild(price); form.appendChild(btn); const msg=el('div','help'); listCard.appendChild(form); listCard.appendChild(msg);
    const listingsCard=el('div','card'); listingsCard.appendChild(el('h3','',t.market.yourListings)); const table=el('table','table'); table.innerHTML='<thead><tr><th>ID</th><th>Volume (tCO2e)</th><th>Price (₹/tCO2e)</th><th>Status</th></tr></thead><tbody></tbody>'; const tbody=table.querySelector('tbody');
    const render=()=>{ const listings=CK.load('listings',[]); tbody.innerHTML=''; listings.forEach(l=>{ const tr=el('tr'); tr.innerHTML=`<td>${l.id}</td><td>${l.volume.toFixed(2)}</td><td>₹${l.price}</td><td><span class="status ok">active</span></td>`; tbody.appendChild(tr); }); };
    render(); btn.onclick=()=>{ const v=parseFloat(form.querySelector('[name=volume]').value)||0; const p=parseFloat(form.querySelector('[name=price]').value)||0; const errors=CK.validatePrice(v,p); if(errors.length){ msg.textContent=errors.join(' • '); return; } const listings=CK.load('listings',[]); const id='CCR_'+Math.random().toString(36).slice(2,10); listings.push({id,volume:v,price:p,status:'active',createdAt:new Date().toISOString()}); CK.save('listings',listings); msg.textContent='Listing created.'; render(); };
    wrap.appendChild(card); wrap.appendChild(listCard); listingsCard.appendChild(table); wrap.appendChild(listingsCard); return wrap; };

  // Analytics
  CK.Analytics = ()=>{ const wrap=el('div','grid'); const card=el('div','card'); card.appendChild(el('h2','',CK.t().nav.analytics)); const listings=CK.load('listings',[]); const hist=CK.load('creditsHistory',[]); const total=hist.reduce((s,x)=>s+(x.creditVolume||0),0); const avg = listings.length? listings.reduce((s,x)=>s+x.price,0)/listings.length: 0; const grid=el('div','grid grid-3'); grid.appendChild(stat('Total Credits',`${total.toFixed(1)} tCO2e`)); grid.appendChild(stat('Listings',`${listings.length}`)); grid.appendChild(stat('Avg Listing Price',`₹${Math.round(avg)}`)); card.appendChild(grid); wrap.appendChild(card); return wrap; };

  // Admin
  CK.Admin = ()=>{ const wrap=el('div','grid'); const card=el('div','card'); card.appendChild(el('h2','',CK.t().nav.admin)); const p=el('div','help','Admin utilities for demo: reset data, seed examples.'); card.appendChild(p); const row=el('div','grid grid-2'); const reset=el('button','btn','Reset Demo Data'); reset.onclick=()=>{ ['profile','listings','creditsHistory','calc_rice','calc_wm','pendingCredits'].forEach(k=>CK.remove(k)); alert('Data cleared. Reloading.'); location.reload();}; const seed=el('button','btn secondary','Seed Sample Credits'); seed.onclick=()=>{ const samples=[{creditVolume:7.8,revenue:11700},{creditVolume:4.2,revenue:5040}]; CK.save('creditsHistory',samples); alert('Seeded sample credit history.'); }; row.appendChild(reset); row.appendChild(seed); card.appendChild(row); wrap.appendChild(card); return wrap; };

  // Layout + routing
  CK.sidebar = ()=>{ const t=CK.t(); const elS=el('aside','sidebar'); const card=el('div','card'); const ul=el('div','grid'); [ ['#/dashboard',t.nav.dashboard], ['#/calculator',t.nav.calculator], ['#/profile',t.nav.profile], ['#/monitoring',t.nav.monitoring], ['#/marketplace',t.nav.marketplace], ['#/analytics',t.nav.analytics], ['#/admin',t.nav.admin] ].forEach(([href,label])=>{ const a=el('a','btn ghost',label); a.href=href; ul.appendChild(a); }); card.appendChild(ul); elS.appendChild(card); return elS; };
  CK.route = ()=>{ const app=document.getElementById('app'); const root=el('div'); const layout=el('div','container'); const header=CK.Header(); root.appendChild(header); const main=el('div','content'); const hash=location.hash||'#/dashboard'; const path=hash.replace('#',''); let content; switch(path){ case '/profile':content=CK.Profile();break; case '/dashboard':content=CK.Dashboard();break; case '/calculator':content=CK.Calculator();break; case '/monitoring':content=CK.Monitoring();break; case '/marketplace':content=CK.Marketplace();break; case '/analytics':content=CK.Analytics();break; case '/admin':content=CK.Admin();break; default: content=CK.Dashboard(); }
    layout.appendChild(CK.sidebar()); main.appendChild(content); layout.appendChild(main); root.appendChild(layout); root.appendChild(CK.Footer()); app.innerHTML=''; app.appendChild(root); };

  window.addEventListener('hashchange', CK.route);
  window.addEventListener('load', ()=>{ if(!location.hash) location.hash = '#/dashboard'; CK.route(); });
})();

