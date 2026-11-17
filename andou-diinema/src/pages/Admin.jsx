import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, Plus, Save, Trash2, Send, BadgeCheck, Globe, EyeOff, RotateCcw, Upload, BarChart3, Mail, X, Search } from 'lucide-react'
import Seo from '../components/Seo'
import { Alert, Spinner, EmptyState } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useContent } from '../hooks/useContent'
import { supabase, frError , db } from '../services/supabase'
import { VERSETS, HADITHS, INVOCATIONS } from '../content/sources'
import { CATEGORIES, ARTICLES } from '../content/peches'
import { PROGRAMME } from '../content/programme'
import { matches } from '../lib/text'

// --------------------------------------------------------------------- configuration
const lines = { toForm: (v) => (v || []).join('\n'), fromForm: (s) => s.split('\n').map((x) => x.trim()).filter(Boolean) }
const csv = { toForm: (v) => (v || []).join(', '), fromForm: (s) => s.split(',').map((x) => x.trim()).filter(Boolean) }
const num = { toForm: (v) => (v ?? ''), fromForm: (s) => (s === '' ? null : Number(s)) }
const dt = { toForm: (v) => (v ? new Date(v).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)), fromForm: (s) => new Date(s).toISOString() }

const TABLES = {
  articles: {
    label: 'Articles', pk: 'id', title: (r) => r.titre, sub: (r) => r.slug, order: 'titre',
    fields: [
      ['slug', 'Identifiant (slug)', 'text', { required: true, hint: 'minuscules, chiffres et tirets' }], ['category_id', 'Catégorie', 'category'], ['titre', 'Titre', 'text', { required: true }],
      ['accroche', 'Accroche', 'text'], ['hukm', 'Statut religieux (obligation, interdiction, divergence…)', 'text'],
      ['intro', 'Introduction', 'textarea'], ['explication', 'Explication du comportement', 'textarea'], ['danger', 'Pourquoi est-ce dangereux', 'textarea'],
      ['verset_ids', 'Versets (identifiants séparés par des virgules)', 'text', csv], ['hadith_ids', 'Hadiths (identifiants séparés par des virgules)', 'text', csv],
      ['comprendre', 'Explication accessible', 'textarea'], ['installation', "Comment l'habitude s'installe", 'textarea'],
      ['consequences', 'Conséquences (une par ligne)', 'textarea', lines], ['signes', 'Comment la reconnaître (une par ligne)', 'textarea', lines],
      ['abandon', "Comment l'abandonner (une par ligne)", 'textarea', lines], ['plan', "Plan d'action (une étape par ligne)", 'textarea', lines],
      ['invocation_id', 'Invocation (identifiant)', 'text'], ['encouragement', "Message d'encouragement", 'textarea'],
    ],
  },
  categories: {
    label: 'Catégories', pk: 'id', title: (r) => r.titre, sub: (r) => `${r.lettre || ''} · ${r.id}`, order: 'position',
    fields: [['id', 'Identifiant', 'text', { required: true }], ['lettre', 'Lettre', 'text'], ['titre', 'Titre', 'text', { required: true }], ['resume', 'Résumé', 'textarea'], ['icon', 'Icône (Eye, HeartCrack, Smartphone, Shirt, MessageCircleWarning, BookOpen)', 'text'], ['position', 'Ordre', 'number', num]],
  },
  quran_verses: {
    label: 'Versets', pk: 'id', title: (r) => `${r.sourate} ${r.sourate_num}:${r.ayat}`, sub: (r) => r.id, order: 'sourate_num',
    fields: [['id', 'Identifiant', 'text', { required: true }], ['sourate', 'Nom de la sourate', 'text', { required: true }], ['sourate_num', 'Numéro de sourate (1-114)', 'number', { ...num, required: true }], ['ayat', 'Verset(s) (ex. 30 ou 23-24)', 'text', { required: true }], ['texte_ar', 'Texte arabe', 'textarea', { dir: 'rtl' }], ['traduction_fr', 'Traduction du sens', 'textarea', { required: true }]],
  },
  hadiths: {
    label: 'Hadiths', pk: 'id', title: (r) => r.reference, sub: (r) => r.id, order: 'id',
    fields: [['id', 'Identifiant', 'text', { required: true }], ['texte_fr', 'Traduction française', 'textarea', { required: true }], ['texte_ar', 'Texte arabe', 'textarea', { dir: 'rtl' }], ['reference', 'Référence (recueil et numéro)', 'text', { required: true }], ['grade', "Degré d'authenticité", 'text', { required: true }], ['contexte', 'Contexte et explication', 'textarea']],
  },
  invocations: {
    label: 'Invocations', pk: 'id', title: (r) => r.titre, sub: (r) => r.reference, order: 'titre',
    fields: [['id', 'Identifiant', 'text', { required: true }], ['titre', 'Titre', 'text', { required: true }], ['theme', 'Thème', 'text'], ['texte_ar', 'Texte arabe', 'textarea', { dir: 'rtl' }], ['translitteration', 'Phonétique', 'textarea'], ['traduction_fr', 'Traduction', 'textarea', { required: true }], ['reference', 'Source', 'text', { required: true }]],
  },
  daily_programs: {
    label: 'Programme 30 jours', pk: 'jour', title: (r) => `Jour ${r.jour} — ${r.mission}`, sub: (r) => `Phase ${r.phase}`, order: 'jour',
    fields: [['jour', 'Jour (1-30)', 'number', { ...num, required: true }], ['phase', 'Phase (1-6)', 'number', { ...num, required: true }], ['mission', 'Mission', 'text', { required: true }], ['enseignement', 'Enseignement', 'text'], ['verset_id', 'Verset (identifiant)', 'text'], ['hadith_id', 'Hadith (identifiant)', 'text'], ['explication', 'Explication', 'textarea'], ['action', 'Action concrète', 'textarea'], ['invocation_id', 'Invocation (identifiant)', 'text']],
  },
  notifications: {
    label: 'Rappels', pk: 'id', title: (r) => r.titre, sub: (r) => new Date(r.scheduled_at).toLocaleString('fr-FR'), order: 'scheduled_at', desc: true,
    fields: [['titre', 'Titre', 'text', { required: true }], ['message', 'Message', 'textarea', { required: true }], ['lien', 'Lien interne (ex. /programme)', 'text'], ['scheduled_at', 'Date de diffusion', 'datetime-local', dt]],
  },
}

const HAS_NOTE = ['articles', 'quran_verses', 'hadiths', 'invocations', 'daily_programs']

const STATUS = {
  draft: ['Brouillon', 'bg-slate-100 text-slate-700'],
  review: ['En relecture', 'bg-amber-100 text-amber-800'],
  validated: ['Validé', 'bg-sky-100 text-sky-800'],
  published: ['Publié', 'bg-emerald-100 text-emerald-800'],
  archived: ['Dépublié', 'bg-red-100 text-red-700'],
}
const StatusBadge = ({ s }) => <span className={`badge ${STATUS[s]?.[1]}`}>{STATUS[s]?.[0] || s}</span>

// --------------------------------------------------------------------- éditeur générique
function Editor({ cfg, table, row, onClose, onSaved, can, isAdmin, categories }) {
  const isNew = !row
  const [form, setForm] = useState(() => Object.fromEntries(cfg.fields.map(([k, , , o]) => [k, o?.toForm ? o.toForm(row?.[k]) : (row?.[k] ?? '')])))
  const [note, setNote] = useState(row?.review_note || '')
  const [state, setState] = useState({})
  const status = row?.status || 'draft'

  const payload = () => {
    const p = {}
    for (const [k, , , o] of cfg.fields) {
      const v = form[k]
      p[k] = o?.fromForm ? o.fromForm(String(v ?? '')) : (v === '' ? null : v)
    }
    if (!isNew && HAS_NOTE.includes(table)) p.review_note = note || null
    return p
  }
  const exec = async (fn, okMsg) => {
    setState({ busy: true })
    try { await fn(); setState({ ok: okMsg }); onSaved() } catch (e) { setState({ err: frError(e) }) }
  }
  const save = () => exec(async () => {
    const p = payload()
    const q = isNew ? db.from(table).insert({ ...p, status: 'draft' }) : db.from(table).update(p).eq(cfg.pk, row[cfg.pk])
    const { error } = await q
    if (error) throw error
    if (isNew) onClose()
  }, 'Enregistré.')
  const setStatus = (s, msg) => exec(async () => {
    const patch = HAS_NOTE.includes(table) ? { status: s, review_note: note || null } : { status: s }
    const { error } = await db.from(table).update(patch).eq(cfg.pk, row[cfg.pk])
    if (error) throw error
  }, msg)
  const remove = () => {
    if (!window.confirm('Supprimer définitivement ce contenu ?')) return
    exec(async () => { const { error } = await db.from(table).delete().eq(cfg.pk, row[cfg.pk]); if (error) throw error; onClose() }, 'Supprimé.')
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Éditer le contenu">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div><p className="text-xs text-slate-500">{cfg.label}</p><h2 className="font-semibold">{isNew ? 'Nouveau contenu' : cfg.title(row)}</h2></div>
          <div className="flex items-center gap-2">{!isNew && <StatusBadge s={status} />}<button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100" aria-label="Fermer"><X size={20} /></button></div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!isNew && status === 'published' && <Alert type="warning">Toute modification du texte renverra ce contenu en relecture et il ne sera plus affiché tant qu'il n'aura pas été validé à nouveau.</Alert>}
          {cfg.fields.map(([k, label, type, o]) => (
            <div key={k}>
              <label htmlFor={`f-${k}`} className="label">{label}{o?.required && <span className="text-red-600"> *</span>}</label>
              {type === 'textarea' ? <textarea id={`f-${k}`} dir={o?.dir} rows={k.includes('texte') || k === 'message' || o === lines ? 5 : 3} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`input ${o?.dir === 'rtl' ? 'font-arabic text-lg' : ''}`} />
                : type === 'category' ? <select id={`f-${k}`} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="input"><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}</select>
                : <input id={`f-${k}`} type={type === 'number' ? 'number' : type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="input" />}
              {o?.hint && <p className="mt-1 text-xs text-slate-500">{o.hint}</p>}
            </div>
          ))}
          {!isNew && HAS_NOTE.includes(table) && (
            <div><label htmlFor="f-note" className="label">Note de relecture (visible par l'équipe)</label><textarea id="f-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="Remarques du validateur, sources vérifiées…" /></div>
          )}
          {!isNew && row.validated_at && <p className="text-xs text-slate-500">Validé le {new Date(row.validated_at).toLocaleString('fr-FR')}</p>}
          {state.err && <Alert type="error">{state.err}</Alert>}
          {state.ok && <Alert type="success">{state.ok}</Alert>}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          {(can('editor') || can('reviewer')) && <button disabled={state.busy} onClick={save} className="btn-primary btn-sm"><Save size={16} />Enregistrer</button>}
          {!isNew && status === 'draft' && <button disabled={state.busy} onClick={() => setStatus('review', 'Soumis à la relecture.')} className="btn-ghost btn-sm"><Send size={16} />Soumettre à la relecture</button>}
          {!isNew && status === 'review' && can('reviewer') && <button disabled={state.busy} onClick={() => setStatus('validated', 'Contenu validé.')} className="btn-sm btn bg-sky-600 text-white"><BadgeCheck size={16} />Valider (personne qualifiée)</button>}
          {!isNew && status === 'review' && <button disabled={state.busy} onClick={() => setStatus('draft', 'Renvoyé en brouillon.')} className="btn-ghost btn-sm"><RotateCcw size={16} />Renvoyer en brouillon</button>}
          {!isNew && status === 'validated' && isAdmin && <button disabled={state.busy} onClick={() => setStatus('published', 'Publié.')} className="btn-sm btn bg-emerald-600 text-white"><Globe size={16} />Publier</button>}
          {!isNew && status === 'published' && isAdmin && <button disabled={state.busy} onClick={() => setStatus('archived', 'Dépublié : le contenu est masqué du site.')} className="btn-ghost btn-sm"><EyeOff size={16} />Dépublier</button>}
          {!isNew && status === 'archived' && <button disabled={state.busy} onClick={() => setStatus('review', 'Remis en relecture.')} className="btn-ghost btn-sm"><RotateCcw size={16} />Remettre en relecture</button>}
          {!isNew && isAdmin && <button disabled={state.busy} onClick={remove} className="btn-sm btn ml-auto text-red-600 hover:bg-red-50"><Trash2 size={16} />Supprimer</button>}
        </div>
      </div>
    </div>
  )
}

function CrudTab({ table, can, isAdmin, categories }) {
  const cfg = TABLES[table]
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState(null)
  const [q, setQ] = useState('')
  const [st, setSt] = useState('all')
  const [edit, setEdit] = useState(undefined)
  const load = useCallback(async () => {
    const { data, error } = await db.from(table).select('*').order(cfg.order, { ascending: !cfg.desc }).limit(1000)
    if (error) setErr(frError(error)); else { setRows(data); setErr(null) }
  }, [table, cfg])
  useEffect(() => { setRows(null); load() }, [load])
  const list = useMemo(() => (rows || []).filter((r) => (st === 'all' || r.status === st) && matches(q, cfg.title(r), cfg.sub(r))), [rows, q, st, cfg])
  const counts = useMemo(() => Object.fromEntries(Object.keys(STATUS).map((s) => [s, (rows || []).filter((r) => r.status === s).length])), [rows])

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-10" placeholder={`Rechercher dans ${cfg.label.toLowerCase()}…`} aria-label="Rechercher" /></div>
        {can('editor') && <button onClick={() => setEdit(null)} className="btn-primary"><Plus size={18} />Ajouter</button>}
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <button onClick={() => setSt('all')} className={`chip ${st === 'all' ? 'chip-active' : ''}`}>Tous ({rows?.length || 0})</button>
        {Object.entries(STATUS).map(([s, [l]]) => <button key={s} onClick={() => setSt(s)} className={`chip ${st === s ? 'chip-active' : ''}`}>{l} ({counts[s] || 0})</button>)}
      </div>
      {err && <Alert type="error" className="mt-3">{err}</Alert>}
      {!rows ? <Spinner /> : (
        <ul className="mt-3 space-y-2">
          {list.map((r) => (
            <li key={r[cfg.pk]}><button onClick={() => setEdit(r)} className="card flex w-full items-center gap-3 p-3.5 text-left hover:shadow-lg">
              <span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-900">{cfg.title(r)}</span><span className="block truncate text-xs text-slate-500">{cfg.sub(r)}</span></span>
              <StatusBadge s={r.status} />
            </button></li>
          ))}
          {!list.length && <li className="py-8 text-center text-sm text-slate-500">Aucun élément. {rows.length === 0 && 'Utilise « Importer le contenu de base » dans l\'onglet Statistiques.'}</li>}
        </ul>
      )}
      {edit !== undefined && <Editor cfg={cfg} table={table} row={edit} can={can} isAdmin={isAdmin} categories={categories} onClose={() => setEdit(undefined)} onSaved={load} />}
    </div>
  )
}

// --------------------------------------------------------------------- statistiques & import
async function importBase(onProgress) {
  const sets = [
    ['categories', CATEGORIES.map((c, i) => ({ id: c.id, lettre: c.lettre, titre: c.titre, resume: c.resume, icon: c.icon, position: i, status: 'review' }))],
    ['quran_verses', Object.entries(VERSETS).map(([id, v]) => ({ id, sourate: v.sourate, sourate_num: v.s, ayat: v.a, texte_ar: v.ar || null, traduction_fr: v.fr, status: 'review' }))],
    ['hadiths', Object.entries(HADITHS).map(([id, h]) => ({ id, texte_fr: h.fr, texte_ar: h.ar || null, reference: h.ref, grade: h.grade, contexte: h.contexte, status: 'review' }))],
    ['invocations', Object.entries(INVOCATIONS).map(([id, d]) => ({ id, titre: d.titre, theme: d.theme, texte_ar: d.ar, translitteration: d.tr, traduction_fr: d.fr, reference: d.ref, status: 'review' }))],
    ['articles', ARTICLES.map((a) => ({ slug: a.slug, category_id: a.cat, titre: a.titre, accroche: a.accroche, hukm: a.hukm, intro: a.intro, explication: a.explication, danger: a.danger, comprendre: a.comprendre, installation: a.installation, consequences: a.consequences, signes: a.signes, abandon: a.abandon, plan: a.plan, verset_ids: a.versets, hadith_ids: a.hadiths, invocation_id: a.invocation, encouragement: a.encouragement, status: 'review' }))],
    ['sins', ARTICLES.map((a) => ({ id: a.slug, category_id: a.cat, nom: a.titre, hukm: a.hukm, article_slug: a.slug, status: 'review' }))],
    ['daily_programs', PROGRAMME.map((d) => ({ jour: d.jour, phase: d.phase, mission: d.mission, enseignement: d.enseignement, verset_id: d.verset, hadith_id: d.hadith, explication: d.explication, action: d.action, invocation_id: d.invocation, status: 'review' }))],
  ]
  const conflict = { articles: 'slug', daily_programs: 'jour' }
  for (const [t, rows] of sets) {
    onProgress(t)
    const { error } = await db.from(t).upsert(rows, { onConflict: conflict[t] || 'id', ignoreDuplicates: true })
    if (error) throw new Error(`${t} : ${frError(error)}`)
  }
}

function Stats({ can, reload }) {
  const [s, setS] = useState(null)
  const [err, setErr] = useState(null)
  const [imp, setImp] = useState({})
  const load = useCallback(() => db.rpc('admin_stats').then(({ data, error }) => (error ? setErr(frError(error)) : setS(data))), [])
  useEffect(() => { load() }, [load])
  const run = async () => {
    setImp({ busy: true })
    try { await importBase((t) => setImp({ busy: true, step: t })); setImp({ ok: true }); load(); reload() } catch (e) { setImp({ err: e.message }) }
  }
  const tiles = s ? [['Utilisateurs', s.utilisateurs], ['Nouveaux (7 j)', s.nouveaux_7j], ['Actifs (7 j)', s.actifs_7j], ['Missions validées', s.missions_validees], ['Prières suivies', s.prieres_suivies], ['Bilans', s.bilans], ['Favoris', s.favoris], ['Lectures d\'articles', s.vues_totales], ['Messages non traités', s.messages_non_traites], ['Hadiths', s.hadiths], ['Versets', s.versets]] : []
  return (
    <div>
      {err && <Alert type="error">{err}</Alert>}
      {!s && !err ? <Spinner /> : s && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{tiles.map(([l, v]) => <div key={l} className="card p-4"><p className="text-xs text-slate-500">{l}</p><p className="text-2xl font-bold text-brand-deep">{v ?? 0}</p></div>)}</div>
          <div className="card mt-3 p-4"><p className="mb-2 text-sm font-medium">Articles par statut</p><div className="flex flex-wrap gap-2">{Object.entries(s.articles || {}).map(([k, v]) => <span key={k} className="flex items-center gap-1.5"><StatusBadge s={k} /><b>{v}</b></span>)}{!s.articles && <span className="text-sm text-slate-500">Aucun article en base.</span>}</div></div>
          <p className="mt-2 text-xs text-slate-500">Statistiques agrégées et anonymes uniquement : les réponses personnelles des utilisateurs ne sont jamais accessibles.</p>
        </>
      )}
      {can('editor') && (
        <div className="card mt-6 p-4">
          <h3 className="font-semibold">Importer le contenu de base</h3>
          <p className="mt-1 text-sm text-slate-600">Copie dans la base les 35 articles, versets, hadiths, invocations et le programme du site, avec le statut « En relecture ». Les éléments déjà présents ne sont pas modifiés.</p>
          {imp.err && <Alert type="error" className="mt-3">{imp.err}</Alert>}
          {imp.ok && <Alert type="success" className="mt-3">Import terminé. Les contenus attendent maintenant la validation d'une personne qualifiée.</Alert>}
          <button onClick={run} disabled={imp.busy} className="btn-secondary btn-sm mt-3"><Upload size={16} />{imp.busy ? `Import… (${imp.step || ''})` : 'Importer'}</button>
        </div>
      )}
    </div>
  )
}

function Messages() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState(null)
  const load = useCallback(() => db.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200).then(({ data, error }) => (error ? setErr(frError(error)) : setRows(data))), [])
  useEffect(() => { load() }, [load])
  const act = async (q) => { const { error } = await q; if (error) setErr(frError(error)); load() }
  if (err) return <Alert type="error">{err}</Alert>
  if (!rows) return <Spinner />
  if (!rows.length) return <EmptyState icon={Mail} title="Aucun message" />
  return (
    <ul className="space-y-2">{rows.map((m) => (
      <li key={m.id} className={`card p-4 ${m.traite ? 'opacity-60' : ''}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-semibold">{m.nom} <a href={`mailto:${m.email}`} className="text-sm font-normal text-brand">{m.email}</a></p><span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString('fr-FR')}</span></div>
        <p className="mt-2 whitespace-pre-line text-[15px] text-slate-700">{m.message}</p>
        <div className="mt-3 flex gap-2"><button onClick={() => act(db.from('contact_messages').update({ traite: !m.traite }).eq('id', m.id))} className="btn-ghost btn-sm">{m.traite ? 'Marquer non traité' : 'Marquer traité'}</button><button onClick={() => window.confirm('Supprimer ce message ?') && act(db.from('contact_messages').delete().eq('id', m.id))} className="btn-sm btn text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></div>
      </li>
    ))}</ul>
  )
}

// --------------------------------------------------------------------- page
const TABS = [['stats', 'Statistiques'], ['articles', 'Articles'], ['categories', 'Catégories'], ['quran_verses', 'Versets'], ['hadiths', 'Hadiths'], ['invocations', 'Invocations'], ['daily_programs', 'Programme'], ['notifications', 'Rappels'], ['messages', 'Messages']]

export default function Admin() {
  const { user, loading, isStaff, isAdmin, can, roles, configured } = useAuth()
  const { categories, reload } = useContent()
  const [tab, setTab] = useState('stats')
  if (loading) return <Spinner />
  if (!configured || !user || !isStaff) {
    return (
      <div className="container-ad max-w-md py-12">
        <Seo title="Administration" noindex />
        <h1 className="sr-only">Administration</h1>
        <EmptyState icon={ShieldAlert} title="Accès réservé" text={!configured ? "La base de données n'est pas encore configurée." : !user ? "Connecte-toi avec un compte autorisé pour accéder à l'administration." : "Ton compte n'a pas de rôle d'administration. Les rôles sont attribués par un administrateur."} action={!user && configured ? <Link to="/connexion" className="btn-primary">Se connecter</Link> : <Link to="/" className="btn-ghost">Accueil</Link>} />
      </div>
    )
  }
  return (
    <div className="container-ad py-6">
      <Seo title="Administration" noindex />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h1 className="flex items-center gap-2 text-2xl font-bold"><BarChart3 className="text-brand" />Administration</h1><span className="badge bg-brand-light text-brand-deep">Rôle : {roles.join(', ')}</span></div>
      <Alert className="mb-4">Circuit de validation : <b>Brouillon → En relecture → Validé</b> (par une personne qualifiée) <b>→ Publié</b> (par un administrateur). Un contenu publié remplace la version intégrée et affiche le badge « Validé par le comité ». Un contenu dépublié est masqué du site.</Alert>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
        {TABS.filter(([k]) => k !== 'messages' || isAdmin).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`chip ${tab === k ? 'chip-active' : ''}`}>{l}</button>)}
      </div>
      {tab === 'stats' ? <Stats can={can} reload={reload} /> : tab === 'messages' ? <Messages /> : <CrudTab key={tab} table={tab} can={can} isAdmin={isAdmin} categories={categories} onChanged={reload} />}
    </div>
  )
}
