import { useState } from "react";

const PHASE_COLORS = {
  "PHASE1":"#4fc3f7","PHASE2":"#29b6f6","PHASE3":"#0288d1",
  "PHASE4":"#01579b","EARLY_PHASE1":"#80deea","NA":"#90a4ae",
};
const STATUS_COLORS = {
  "RECRUITING":"#66bb6a","COMPLETED":"#42a5f5",
  "NOT_YET_RECRUITING":"#ffa726","ACTIVE_NOT_RECRUITING":"#ab47bc",
  "TERMINATED":"#ef5350","WITHDRAWN":"#bdbdbd","SUSPENDED":"#ff7043","UNKNOWN":"#90a4ae",
};
const SPONSOR_COLORS = {
  INDUSTRY:"#4fc3f7",NIH:"#66bb6a",FED:"#ffa726",
  OTHER:"#ab47bc",NETWORK:"#ef5350",INDIV:"#80deea",UNKNOWN:"#90a4ae"
};

const fmtPhase = p => ({PHASE1:"Phase I",PHASE2:"Phase II",PHASE3:"Phase III",PHASE4:"Phase IV",EARLY_PHASE1:"Early Ph I",NA:"N/A"}[p]||p||"N/A");
const fmtStatus = s => s ? s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()) : "Unknown";

function MiniBar({ data, colorMap, label }) {
  const max = Math.max(...data.map(d=>d.count),1);
  return (
    <div>
      {label&&<div style={{fontSize:10,color:"#78909c",fontFamily:"monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{label}</div>}
      {data.map((d,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <div style={{width:90,fontSize:10,color:"#b0bec5",textAlign:"right",flexShrink:0,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
          <div style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:3,height:15,overflow:"hidden"}}>
            <div style={{width:`${(d.count/max)*100}%`,background:colorMap?.[d.key]||"#4fc3f7",height:"100%",borderRadius:3,minWidth:4,display:"flex",alignItems:"center",paddingLeft:5}}>
              <span style={{fontSize:9,color:"#fff",fontFamily:"monospace",fontWeight:600}}>{d.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, colorMap }) {
  const size=130,cx=65,cy=65,r=48,ir=30;
  const total=data.reduce((s,d)=>s+d.count,0);
  if(!total) return <div style={{color:"#546e7a",textAlign:"center",padding:"30px 0",fontSize:12}}>No data</div>;
  let angle=-Math.PI/2;
  const slices=data.map(d=>{
    const frac=d.count/total,start=angle;
    angle+=frac*2*Math.PI;
    const end=angle,large=frac>0.5?1:0;
    const lx1=cx+r*Math.cos(start),ly1=cy+r*Math.sin(start);
    const lx2=cx+r*Math.cos(end),ly2=cy+r*Math.sin(end);
    const sx1=cx+ir*Math.cos(start),sy1=cy+ir*Math.sin(start);
    const sx2=cx+ir*Math.cos(end),sy2=cy+ir*Math.sin(end);
    return {path:`M${lx1} ${ly1}A${r} ${r} 0 ${large} 1 ${lx2} ${ly2}L${sx2} ${sy2}A${ir} ${ir} 0 ${large} 0 ${sx1} ${sy1}Z`,
      color:colorMap?.[d.key]||"#4fc3f7",name:d.name,pct:Math.round(frac*100)};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} opacity={0.9}/>)}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#eceff1" fontSize={13} fontWeight={700} fontFamily="monospace">{total}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fill="#78909c" fontSize={9} fontFamily="monospace">TRIALS</text>
      </svg>
      <div style={{flex:1}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
            <div style={{width:7,height:7,borderRadius:2,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:10,color:"#b0bec5",fontFamily:"monospace",flex:1}}>{s.name}</span>
            <span style={{fontSize:10,color:"#78909c",fontFamily:"monospace"}}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineChart({ data }) {
  if(!data?.length) return null;
  const max=Math.max(...data.map(d=>d.count),1);
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,minWidth:data.length*34,height:90,padding:"0 4px"}}>
        {data.map((d,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,minWidth:26}}>
            <div style={{fontSize:9,color:"#78909c",fontFamily:"monospace",marginBottom:2}}>{d.count}</div>
            <div style={{width:"100%",height:`${(d.count/max)*65}px`,background:"linear-gradient(180deg,#29b6f6,#0288d1)",borderRadius:"3px 3px 0 0",minHeight:4}}/>
            <div style={{fontSize:8,color:"#546e7a",fontFamily:"monospace",marginTop:4,transform:"rotate(-40deg)",whiteSpace:"nowrap",transformOrigin:"top center"}}>{d.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Safely extract JSON from a string that may have trailing garbage
function safeParseJSON(raw) {
  // Remove markdown fences
  let s = raw.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
  // Try direct parse first
  try { return JSON.parse(s); } catch(_) {}
  // Find first { and try to extract balanced object
  const start = s.indexOf("{");
  if(start===-1) throw new Error("No JSON object found");
  let depth=0, inStr=false, escape=false;
  for(let i=start;i<s.length;i++){
    const c=s[i];
    if(escape){escape=false;continue;}
    if(c==="\\"&&inStr){escape=true;continue;}
    if(c==='"'){inStr=!inStr;continue;}
    if(!inStr){
      if(c==="{")depth++;
      else if(c==="}"){depth--;if(depth===0){
        try{return JSON.parse(s.slice(start,i+1));}catch(_){}
      }}
    }
  }
  throw new Error("Could not extract valid JSON");
}

async function callClaude(disease) {
  const SYSTEM = `You are a clinical data API. Return ONLY a JSON object, no explanation, no markdown.
Schema: {"trials":[{"nctId":"NCTxxxxxxxx","title":"...","phase":"PHASE1|PHASE2|PHASE3|PHASE4|EARLY_PHASE1|NA","status":"RECRUITING|COMPLETED|NOT_YET_RECRUITING|ACTIVE_NOT_RECRUITING|TERMINATED|WITHDRAWN|SUSPENDED|UNKNOWN","startDate":"YYYY-MM","completionDate":"YYYY-MM","sponsor":"...","sponsorClass":"INDUSTRY|NIH|FED|OTHER|NETWORK|INDIV|UNKNOWN","drug":"...","inclusion":"max 120 chars","exclusion":"max 120 chars","primaryOutcome":"max 120 chars"}]}
Rules: Return exactly 25 trials. Keep ALL string values under 150 characters. No newlines inside strings. Valid JSON only.`;

  const USER = `Return 25 real clinical trials for disease: "${disease}". Mix phases I-IV, include recruiting and completed. Include industry and academic sponsors. Return ONLY the JSON object.`;

  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:6000,
      system: SYSTEM,
      messages:[{role:"user",content:USER}]
    })
  });
  if(!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  if(!text) throw new Error("Empty response from API");
  const parsed = safeParseJSON(text);
  if(!parsed.trials || !Array.isArray(parsed.trials)) throw new Error("Invalid data structure");
  return parsed.trials;
}

const card={background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:18};
const sec={fontSize:10,color:"#4fc3f7",fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",marginBottom:12,borderBottom:"1px solid rgba(79,195,247,0.15)",paddingBottom:7};

export default function App() {
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadStep,setLoadStep]=useState(0);
  const [trials,setTrials]=useState([]);
  const [error,setError]=useState(null);
  const [searched,setSearched]=useState(false);
  const [fPhase,setFPhase]=useState("ALL");
  const [fStatus,setFStatus]=useState("ALL");
  const [fSponsor,setFSponsor]=useState("ALL");
  const [sortCol,setSortCol]=useState("startDate");
  const [sortDir,setSortDir]=useState("desc");
  const [page,setPage]=useState(1);
  const [expanded,setExpanded]=useState(null);
  const PAGE=10;

  const STEPS=["Querying clinical trial database…","Parsing trial records…","Analyzing distributions…","Building dashboard…"];

  async function search(){
    if(!query.trim()) return;
    setLoading(true);setError(null);setTrials([]);
    setPage(1);setSearched(true);setExpanded(null);setLoadStep(0);
    const iv=setInterval(()=>setLoadStep(p=>(p+1)%STEPS.length),1800);
    try {
      const data = await callClaude(query.trim());
      setTrials(data);
    } catch(e) {
      setError(e.message);
    } finally {
      clearInterval(iv);setLoading(false);
    }
  }

  const phases=["ALL",...Array.from(new Set(trials.map(t=>t.phase))).filter(Boolean)];
  const statuses=["ALL",...Array.from(new Set(trials.map(t=>t.status))).filter(Boolean)];

  const filtered=trials.filter(t=>
    (fPhase==="ALL"||t.phase===fPhase)&&
    (fStatus==="ALL"||t.status===fStatus)&&
    (fSponsor==="ALL"||t.sponsorClass===fSponsor)
  );

  const sorted=[...filtered].sort((a,b)=>{
    const va=a[sortCol]||"",vb=b[sortCol]||"";
    return sortDir==="asc"?(va>vb?1:-1):(va<vb?1:-1);
  });
  const paginated=sorted.slice((page-1)*PAGE,page*PAGE);
  const totalPages=Math.ceil(sorted.length/PAGE);

  const tally=(arr,key)=>Object.entries(arr.reduce((a,t)=>{a[t[key]]=(a[t[key]]||0)+1;return a;},{}))
    .map(([k,v])=>({key:k,name:key==="phase"?fmtPhase(k):key==="status"?fmtStatus(k):k,count:v}))
    .sort((a,b)=>b.count-a.count);

  const phaseDist=tally(filtered,"phase");
  const statusDist=tally(filtered,"status");
  const sponsorDist=tally(filtered,"sponsorClass");
  const sponsorNameDist=Object.entries(filtered.reduce((a,t)=>{a[t.sponsor]=(a[t.sponsor]||0)+1;return a;},{}))
    .sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>({key:k,name:k.length>26?k.slice(0,26)+"…":k,count:v}));
  const drugDist=Object.entries(filtered.reduce((a,t)=>{
    (t.drug||"").split(/[,;]/).forEach(d=>{const dd=d.trim();if(dd&&dd!=="N/A")a[dd]=(a[dd]||0)+1;});return a;
  },{})).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>({key:k,name:k.length>26?k.slice(0,26)+"…":k,count:v}));
  const timelineDist=Object.entries(filtered.reduce((a,t)=>{
    const yr=(t.startDate||"").slice(0,4);if(yr>"2000")a[yr]=(a[yr]||0)+1;return a;
  },{})).sort((a,b)=>a[0]>b[0]?1:-1).map(([k,v])=>({year:k,count:v}));

  function exportCSV(){
    const h=["NCT ID","Title","Phase","Status","Start","End","Sponsor","Type","Drug","Outcome"];
    const rows=filtered.map(t=>[t.nctId,`"${t.title}"`,fmtPhase(t.phase),fmtStatus(t.status),t.startDate,t.completionDate,`"${t.sponsor}"`,t.sponsorClass,`"${t.drug}"`,`"${t.primaryOutcome}"`]);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([[h,...rows].map(r=>r.join(",")).join("\n")],{type:"text/csv"}));
    a.download=`trials_${query}.csv`;a.click();
  }

  function toggleSort(col){
    if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortCol(col);setSortDir("asc");}
  }

  const badge=(val,colorMap)=>({
    background:(colorMap[val]||"#90a4ae")+"22",
    color:colorMap[val]||"#90a4ae",
    border:`1px solid ${colorMap[val]||"#546e7a"}44`,
    borderRadius:4,padding:"2px 7px",fontSize:10,fontFamily:"monospace",whiteSpace:"nowrap"
  });

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0e1a 0%,#0d1b2a 50%,#0a1628 100%)",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#eceff1",paddingBottom:60}}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
        input::placeholder{color:#2e4057}
        select option{background:#0d1b2a}
        .tr:hover{background:rgba(79,195,247,0.06)!important}
        .tr{transition:background 0.15s;cursor:pointer}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      {/* Header */}
      <div style={{background:"rgba(10,14,26,0.96)",borderBottom:"1px solid rgba(79,195,247,0.12)",padding:"14px 24px",position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",gap:16,backdropFilter:"blur(12px)"}}>
        <div>
          <div style={{fontSize:9,fontFamily:"monospace",color:"#4fc3f7",letterSpacing:3,textTransform:"uppercase"}}>ClinicalTrials.gov</div>
          <div style={{fontSize:19,fontWeight:700,letterSpacing:-0.5,color:"#eceff1"}}>Trial Intelligence</div>
        </div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:8,maxWidth:520,width:"100%"}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()}
            placeholder="glaucoma · AMD · diabetic retinopathy · uveitis…"
            style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(79,195,247,0.3)",borderRadius:8,padding:"8px 14px",color:"#eceff1",fontSize:13,outline:"none"}}/>
          <button onClick={search} disabled={loading} style={{background:loading?"rgba(79,195,247,0.2)":"linear-gradient(135deg,#0288d1,#4fc3f7)",border:"none",borderRadius:8,padding:"8px 20px",color:"#fff",fontWeight:600,fontSize:13,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap",boxShadow:"0 2px 12px rgba(2,136,209,0.25)"}}>
            {loading?"…":"⌕ Analyze"}
          </button>
        </div>
      </div>

      {loading&&(
        <div style={{textAlign:"center",padding:"72px 0"}}>
          <div style={{width:34,height:34,border:"3px solid rgba(79,195,247,0.15)",borderTop:"3px solid #4fc3f7",borderRadius:"50%",margin:"0 auto 18px",animation:"spin 0.85s linear infinite"}}/>
          <div style={{fontSize:12,color:"#4fc3f7",fontFamily:"monospace",letterSpacing:2,animation:"pulse 2s infinite"}}>{STEPS[loadStep]}</div>
          <div style={{marginTop:8,fontSize:10,color:"#1e3a5f",fontFamily:"monospace"}}>AI-powered · ClinicalTrials.gov</div>
        </div>
      )}

      {error&&<div style={{margin:20,padding:14,background:"rgba(239,83,80,0.1)",border:"1px solid rgba(239,83,80,0.25)",borderRadius:8,color:"#ef9a9a",fontSize:13}}>⚠ {error}</div>}

      {searched&&!loading&&!error&&(
        <div style={{padding:"18px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{fontSize:14,fontWeight:600}}>
              <span style={{color:"#4fc3f7",fontFamily:"monospace"}}>{filtered.length}</span>
              <span style={{color:"#78909c",marginLeft:6,fontSize:12}}>/ {trials.length} trials</span>
              <span style={{color:"#546e7a",marginLeft:8,fontSize:12}}>for "{query}"</span>
            </div>
            <div style={{flex:1}}/>
            {filtered.length>0&&<button onClick={exportCSV} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"4px 14px",color:"#b0bec5",fontSize:11,cursor:"pointer",fontFamily:"monospace",letterSpacing:1}}>↓ Export CSV</button>}
          </div>

          {trials.length===0?(
            <div style={{textAlign:"center",padding:60,color:"#546e7a"}}>No trials found. Try a different term.</div>
          ):(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:12}}>
                <div style={card}><div style={sec}>Phase Distribution</div><MiniBar data={phaseDist} colorMap={PHASE_COLORS} label="by clinical phase"/></div>
                <div style={card}><div style={sec}>Recruitment Status</div><DonutChart data={statusDist.slice(0,6)} colorMap={STATUS_COLORS}/></div>
                <div style={card}><div style={sec}>Sponsor Type</div><DonutChart data={sponsorDist} colorMap={SPONSOR_COLORS}/></div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div style={card}><div style={sec}>Top Sponsors</div><MiniBar data={sponsorNameDist} label="by organization"/></div>
                <div style={card}><div style={sec}>Top Interventions</div><MiniBar data={drugDist} label="by drug / agent"/></div>
              </div>

              <div style={{...card,marginBottom:12}}>
                <div style={sec}>Trial Initiation Timeline</div>
                <TimelineChart data={timelineDist}/>
              </div>

              {/* Filters */}
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:"#546e7a",fontFamily:"monospace",letterSpacing:1}}>FILTER:</span>
                {[
                  {opts:phases,val:fPhase,set:v=>{setFPhase(v);setPage(1);},fmt:p=>p==="ALL"?"All Phases":fmtPhase(p)},
                  {opts:statuses,val:fStatus,set:v=>{setFStatus(v);setPage(1);},fmt:s=>s==="ALL"?"All Statuses":fmtStatus(s)},
                  {opts:["ALL","INDUSTRY","NIH","FED","INDIV","NETWORK","OTHER","UNKNOWN"],val:fSponsor,set:v=>{setFSponsor(v);setPage(1);},fmt:s=>s==="ALL"?"All Sponsors":s},
                ].map((f,i)=>(
                  <select key={i} value={f.val} onChange={e=>f.set(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"4px 10px",color:"#b0bec5",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>
                    {f.opts.map(o=><option key={o} value={o}>{f.fmt(o)}</option>)}
                  </select>
                ))}
              </div>

              {/* Table */}
              <div style={{...card,padding:0,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                      {[{col:"nctId",lbl:"NCT ID"},{col:"title",lbl:"Title"},{col:"phase",lbl:"Phase"},{col:"status",lbl:"Status"},{col:"drug",lbl:"Intervention"},{col:"sponsor",lbl:"Sponsor"},{col:"startDate",lbl:"Start"},{col:"completionDate",lbl:"Est. End"}]
                        .map(h=>(
                          <th key={h.col} onClick={()=>toggleSort(h.col)} style={{padding:"9px 12px",textAlign:"left",color:sortCol===h.col?"#4fc3f7":"#78909c",fontFamily:"monospace",fontWeight:500,fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>
                            {h.lbl}{sortCol===h.col?(sortDir==="asc"?" ↑":" ↓"):""}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t,i)=>(
                      <>
                        <tr key={t.nctId} className="tr"
                          onClick={()=>setExpanded(expanded===t.nctId?null:t.nctId)}
                          style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                          <td style={{padding:"8px 12px",whiteSpace:"nowrap"}}>
                            <a href={`https://clinicaltrials.gov/study/${t.nctId}`} target="_blank" rel="noreferrer"
                              onClick={e=>e.stopPropagation()} style={{color:"#4fc3f7",textDecoration:"none",fontFamily:"monospace",fontSize:11}}>{t.nctId}</a>
                          </td>
                          <td style={{padding:"8px 12px",maxWidth:220,color:"#cfd8dc"}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div></td>
                          <td style={{padding:"8px 12px"}}><span style={badge(t.phase,PHASE_COLORS)}>{fmtPhase(t.phase)}</span></td>
                          <td style={{padding:"8px 12px"}}><span style={badge(t.status,STATUS_COLORS)}>{fmtStatus(t.status)}</span></td>
                          <td style={{padding:"8px 12px",maxWidth:140,color:"#b0bec5"}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.drug}</div></td>
                          <td style={{padding:"8px 12px",maxWidth:150,color:"#b0bec5"}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.sponsor}</div></td>
                          <td style={{padding:"8px 12px",color:"#78909c",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{t.startDate}</td>
                          <td style={{padding:"8px 12px",color:"#78909c",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{t.completionDate}</td>
                        </tr>
                        {expanded===t.nctId&&(
                          <tr key={t.nctId+"_x"}>
                            <td colSpan={8} style={{padding:"0 12px 14px",background:"rgba(79,195,247,0.03)",borderBottom:"1px solid rgba(79,195,247,0.1)"}}>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,paddingTop:12}}>
                                <div>
                                  <div style={{fontSize:9,color:"#66bb6a",fontFamily:"monospace",letterSpacing:1,marginBottom:5}}>✓ INCLUSION</div>
                                  <div style={{fontSize:11,color:"#b0bec5",lineHeight:1.7}}>{t.inclusion||"—"}</div>
                                </div>
                                <div>
                                  <div style={{fontSize:9,color:"#ef5350",fontFamily:"monospace",letterSpacing:1,marginBottom:5}}>✗ EXCLUSION</div>
                                  <div style={{fontSize:11,color:"#b0bec5",lineHeight:1.7}}>{t.exclusion||"—"}</div>
                                </div>
                                <div>
                                  <div style={{fontSize:9,color:"#ffa726",fontFamily:"monospace",letterSpacing:1,marginBottom:5}}>◎ PRIMARY OUTCOME</div>
                                  <div style={{fontSize:11,color:"#b0bec5",lineHeight:1.7,marginBottom:10}}>{t.primaryOutcome}</div>
                                  <div style={{fontSize:9,color:"#4fc3f7",fontFamily:"monospace",letterSpacing:1,marginBottom:4}}>SPONSOR CLASS</div>
                                  <span style={badge(t.sponsorClass,SPONSOR_COLORS)}>{t.sponsorClass}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
                {totalPages>1&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",padding:"10px 0",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,color:"#78909c",padding:"3px 12px",cursor:page===1?"not-allowed":"pointer",fontSize:12}}>← Prev</button>
                    <span style={{fontSize:11,color:"#546e7a",fontFamily:"monospace"}}>Page {page} / {totalPages}</span>
                    <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,color:"#78909c",padding:"3px 12px",cursor:page===totalPages?"not-allowed":"pointer",fontSize:12}}>Next →</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {!searched&&!loading&&(
        <div style={{textAlign:"center",paddingTop:80}}>
          <div style={{fontSize:44,opacity:0.07,marginBottom:16}}>⬡</div>
          <div style={{fontSize:12,color:"#2e4057",fontFamily:"monospace",letterSpacing:2}}>ENTER A DISEASE NAME TO BEGIN</div>
          <div style={{marginTop:8,fontSize:10,color:"#1a2535",fontFamily:"monospace"}}>glaucoma · AMD · diabetic retinopathy · uveitis · dry eye</div>
        </div>
      )}
    </div>
  );
}
