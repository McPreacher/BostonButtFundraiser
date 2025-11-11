import React, { useEffect, useMemo, useRef, useState } from 'react'

const styles = `
:root {
  --fg:#0f172a; --muted:#59627b; --line:#e2e8f0; --bg:#f8fafc;
  --accent:#2563eb; --accent-2:#0ea5e9; --warn:#f59e0b; --danger:#ef4444;
}
* { box-sizing: border-box; }
body { margin:0; font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif; color:var(--fg); background:#f8fafc; }

/* Header */
.header { background:linear-gradient(135deg,var(--accent) 0%, var(--accent-2) 100%); color:white; padding:1rem 0; margin-bottom:1.25rem; }
.header .container { display:flex; justify-content:space-between; align-items:center; }
.app-title { margin:0; font-weight:700; letter-spacing:.2px; }

/* Print header */
.print-header { display:none; text-align:center; margin-bottom:1rem; }
.print-header h2 { margin:0; }
.print-header p { margin:0; font-size:0.9rem; color:#444; }
@media print { .print-header { display:block; } }

/* Layout */
.container { max-width:1100px; margin:0 auto; padding:0 1rem; }
.card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:1rem; box-shadow:0 2px 6px rgba(0,0,0,.08); }
.stack { display:grid; gap:1rem; }
.grid { display:grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }

/* Inputs */
label { display:block; margin:.4rem 0; font-size:.9rem; color:var(--muted); }
input, select { border:1px solid var(--line); background:#fff; border-radius:10px; padding:.55rem .7rem; font-size:0.95rem; outline:none; }
input:focus, select:focus { border-color: var(--accent); box-shadow:0 0 0 3px rgba(37,99,235,.18); }
.q-input { width:90px; text-align:left; }

/* Buttons */
.btn { border-radius:30px; border:none; padding:.55rem 1.1rem; font-weight:600; cursor:pointer; transition:all .2s ease; box-shadow:0 2px 4px rgba(0,0,0,.1); }
.btn:hover { transform:translateY(-1px); box-shadow:0 4px 8px rgba(0,0,0,.15); }
.btn:active { transform:translateY(0); box-shadow:0 2px 4px rgba(0,0,0,.1); }
.btn:disabled { opacity:.55; cursor:not-allowed; }
.btn-primary { background:var(--accent); color:white; }
.btn-warn { background:var(--warn); color:white; }
.btn-danger { background:var(--danger); color:white; }

/* Day toggle pills */
.pills { display:inline-flex; border:1px solid var(--line); border-radius:20px; overflow:hidden; }
.pills button { border:none; background:transparent; padding:.45rem .9rem; cursor:pointer; font-weight:600; color:var(--muted); transition:background .2s ease; }
.pills button.active { background:var(--accent); color:white; }

/* Row actions */
.row-actions { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }

/* Table */
table { width:100%; border-collapse:collapse; }
th, td { padding:.55rem; border-bottom:1px solid var(--line); text-align:left; }
th { font-weight:600; }
.badge { display:inline-block; padding:.25rem .6rem; border-radius:999px; background:#eef2ff; border:1px solid #c7d2fe; font-size:.8rem; color:#3730a3; }

/* Utilities */
.hidden { display:none !important; }
@media print { .no-print, .actions-col { display:none !important; } }
`;

const KEY='bb_tracker_canvas_v9'
const load=()=>{try{const r=localStorage.getItem(KEY);if(!r)throw 0;return JSON.parse(r)}catch{return{students:[],settings:{schoolYear:'2025-26',price:35}}}}
const persist=(s)=>localStorage.setItem(KEY,JSON.stringify(s))

export default function App(){
  const init=load()
  const [students,setStudents]=useState(init.students)
  const [settings,setSettings]=useState(init.settings)
  const [showSettings,setShowSettings]=useState(false)
  const [editingSettings,setEditingSettings]=useState(false)
  const [newName,setNewName]=useState('')
  const fileRef = useRef(null)
  useEffect(()=>{persist({students,settings})},[students,settings])

  // Alphabetize by name
  const sortedStudents = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name)), [students])

  const rows=useMemo(()=>sortedStudents.map(s=>({
    ...s,
    onHandMon:s.assignedMon-s.soldMon,
    onHandTue:s.assignedTue-s.soldTue
  })),[sortedStudents])

  const totals=useMemo(()=>{
    const mA=students.reduce((a,s)=>a+s.assignedMon,0), tA=students.reduce((a,s)=>a+s.assignedTue,0)
    const mS=students.reduce((a,s)=>a+s.soldMon,0),    tS=students.reduce((a,s)=>a+s.soldTue,0)
    const mH=students.reduce((a,s)=>a+(s.assignedMon-s.soldMon),0)
    const tH=students.reduce((a,s)=>a+(s.assignedTue-s.soldTue),0)
    const collected=students.reduce((a,s)=>a+s.collected,0)
    return {mA,tA,mS,tS,mH,tH,collected}
  },[students])

  const addStudent=()=>{
    if(!newName.trim()) return
    setStudents(s=>[...s,{
      id:crypto.randomUUID(),
      name:newName.trim(),
      assignedMon:0,assignedTue:0,soldMon:0,soldTue:0,collected:0
    }])
    setNewName('')
  }
  const removeStudent=(id)=>setStudents(s=>s.filter(x=>x.id!==id))

  const assign=(id,day,qty)=>{
    if(!qty) return
    setStudents(list=>list.map(s=>s.id===id ? (
      day==='Mon' ? {...s,assignedMon:s.assignedMon+qty} : {...s,assignedTue:s.assignedTue+qty}
    ) : s))
  }
  const sell=(id,day,qty)=>{
    if(!qty) return
    setStudents(list=>list.map(s=>{
      if(s.id!==id) return s
      const avail = day==='Mon' ? (s.assignedMon-s.soldMon) : (s.assignedTue-s.soldTue)
      if(qty>avail) return s
      return day==='Mon'
        ? {...s,soldMon:s.soldMon+qty,collected:s.collected+qty*settings.price}
        : {...s,soldTue:s.soldTue+qty,collected:s.collected+qty*settings.price}
    }))
  }
  const donate=(id,amt)=>{
    if(!Number.isFinite(amt)||amt<=0) return
    setStudents(l=>l.map(s=>s.id===id?{...s,collected:s.collected+Math.round(amt)}:s))
  }

  // Backup & Restore
  const exportBackup=()=>{
    try{
      const payload={version:1,exportedAt:new Date().toISOString(),settings,students}
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
      const y=(settings.schoolYear||'').replace(/[^0-9-]/g,'')||'data'
      const a=document.createElement('a')
      a.href=URL.createObjectURL(blob)
      a.download = 'bb-tracker-' + y + '.json'
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),1000)
    }catch(err){ alert('Export failed.'); console.error(err) }
  }

  const importBackupFromFile=async(file)=>{
    try{
      const text=await file.text()
      const data=JSON.parse(text)
      if(!data||typeof data!=='object') throw new Error('Invalid file')
      const ns=Array.isArray(data.students)?data.students.map(s=>({
        id:String(s.id||crypto.randomUUID()),
        name:String(s.name||'Unnamed'),
        assignedMon:Math.max(0,parseInt(s.assignedMon||0,10)),
        assignedTue:Math.max(0,parseInt(s.assignedTue||0,10)),
        soldMon:Math.max(0,parseInt(s.soldMon||0,10)),
        soldTue:Math.max(0,parseInt(s.soldTue||0,10)),
        collected:Math.max(0,parseInt(s.collected||0,10)),
      })) : null
      const st = data.settings && typeof data.settings==='object' ? {
        schoolYear:String(data.settings.schoolYear||settings.schoolYear||''),
        price:Math.max(0,parseInt(data.settings.price||settings.price||35,10))
      } : null
      if(!ns||!st) throw new Error('Missing required fields')
      if(!confirm('Importing will replace current data on this device. Continue?')) return
      setSettings(st); setStudents(ns)
    }catch(err){ alert('Import failed. Please check the file.'); console.error(err) }
  }
  const fileRefPick = useRef(null)
  const triggerImport=()=>fileRefPick.current?.click()
  const onFilePicked=(e)=>{ const f=e.target.files?.[0]; if(f) importBackupFromFile(f); e.target.value='' }

  const today=new Date().toLocaleDateString()

  return (
    <div>
      <style>{styles}</style>
      <div className="header no-print">
        <div className="container">
          <h1>Boston Butt Fundraiser Tracker</h1>
          <div>
            <button className="btn btn-primary" onClick={()=>setShowSettings(v=>!v)}>⚙️ Settings</button>
            <button className="btn btn-primary" onClick={()=>window.print()}>🖨️ Print</button>
          </div>
        </div>
      </div>

      <div className="print-header">
        <h2>Dillon Christian School</h2>
        <p>Boston Butt Fundraiser Report — {settings.schoolYear}</p>
        <p>Date: {today}</p>
      </div>

      <div className="container">
        {showSettings && (
          <div className="card no-print">
            <h3>Settings</h3>
            {!editingSettings
              ? <button className="btn btn-primary" onClick={()=>setEditingSettings(true)}>✏️ Edit</button>
              : <button className="btn btn-primary" onClick={()=>setEditingSettings(false)}>💾 Save</button>}
            <div className="grid">
              <div>
                <label>School Year</label>
                <input disabled={!editingSettings} value={settings.schoolYear} onChange={e=>setSettings({...settings,schoolYear:e.target.value})}/>
              </div>
              <div>
                <label>Ticket Price</label>
                <input disabled={!editingSettings} value={settings.price} onChange={e=>setSettings({...settings,price:parseInt(e.target.value||'0',10)})}/>
              </div>
            </div>
            <hr style={{margin:'1rem 0', border:'none', borderTop:'1px solid var(--line)'}}/>
            <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',alignItems:'center'}}>
              <button className="btn btn-primary" onClick={exportBackup}>⬇️ Export Backup (.json)</button>
              <button className="btn" onClick={triggerImport}>⬆️ Import Backup</button>
              <input ref={fileRefPick} type="file" accept="application/json" className="hidden" onChange={onFilePicked}/>
              <span style={{color:'var(--muted)',fontSize:'.9rem'}}>Backups save to your device. Import will replace current data on this device.</span>
            </div>
          </div>
        )}

        <div className="card no-print">
          <h3>Add Student</h3>
          <div className="row-actions">
            <input placeholder="Student name" value={newName} onChange={e=>setNewName(e.target.value)}/>
            <button className="btn btn-primary" onClick={addStudent}>Add</button>
          </div>
        </div>

        <div className="card">
          <h3>Students</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Assigned (Mon/Tue)</th>
                <th>Sold (Mon/Tue)</th>
                <th>On Hand (Mon/Tue)</th>
                <th>Collected $</th>
                <th className="actions-col no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>
                <StudentRow key={r.id} row={r} onAssign={assign} onSell={sell} onDonate={donate} onRemove={removeStudent} />
              )}
            </tbody>
            <tfoot>
              <tr>
                <td><b>Totals</b></td>
                <td>{totals.mA}/{totals.tA}</td>
                <td>{totals.mS}/{totals.tS}</td>
                <td>{totals.mH}/{totals.tH}</td>
                <td>${totals.collected}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

function StudentRow({row,onAssign,onSell,onDonate,onRemove}){
  const [day,setDay]=useState('Mon')
  const [qty,setQty]=useState('1')
  const [don,setDon]=useState('')
  const [action,setAction]=useState('assign')

  const qtyNum=parseInt(qty||'0',10)
  const donNum=parseInt(don||'0',10)

  const disableQty=!Number.isFinite(qtyNum)||qtyNum<=0
  const disableDon=!Number.isFinite(donNum)||donNum<=0

  const onHandDay = day==='Mon' ? row.onHandMon : row.onHandTue
  const submitDisabled = action==='assign' ? disableQty : (disableQty || qtyNum>onHandDay)

  function submit(){
    if(action==='assign' && !disableQty){ onAssign(row.id,day,qtyNum); setQty('') }
    if(action==='sellcollect'){
      if(disableQty) return
      if(qtyNum>onHandDay){ alert('Not enough tickets on hand.'); return }
      onSell(row.id,day,qtyNum); setQty('')
    }
  }

  return (
    <tr>
      <td>{row.name}</td>
      <td>{row.assignedMon}/{row.assignedTue}</td>
      <td>{row.soldMon}/{row.soldTue}</td>
      <td>{row.onHandMon}/{row.onHandTue}</td>
      <td>${row.collected}</td>
      <td className="actions-col no-print">
        <div className="row-actions">
          <div className="pills">
            <button className={day==='Mon'?'active':''} onClick={()=>setDay('Mon')}>Mon</button>
            <button className={day==='Tue'?'active':''} onClick={()=>setDay('Tue')}>Tue</button>
          </div>
          <input className="q-input" type="number" min={1} step={1} value={qty} onChange={e=>setQty(e.target.value)}/>
          <select className="q-input" value={action} onChange={e=>setAction(e.target.value)}>
            <option value="assign">Assign</option>
            <option value="sellcollect">Sell + Collect</option>
          </select>
          <button className="btn btn-primary" disabled={submitDisabled} onClick={submit}>Submit</button>
          <input className="q-input" type="number" min={1} step={1} placeholder="Donate" value={don} onChange={e=>setDon(e.target.value)}/>
          <button className="btn btn-warn" disabled={disableDon} onClick={()=>{onDonate(row.id,donNum); setDon('')}}>Add Donation</button>
          <button className="btn btn-danger" onClick={()=>onRemove(row.id)}>Remove</button>
        </div>
      </td>
    </tr>
  )
}