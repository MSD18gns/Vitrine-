import ThemePage from '../components/ThemePage'
import { Section } from '../components/ui'
import InvocationCard from '../components/InvocationCard'
import { THEMES } from '../content/themes'

export default function Repentir() {
  return (
    <ThemePage id="repentir" path="/repentir" eyebrow="Tawbah">
      {{
        before: (
          <Section title="Les conditions du repentir sincère">
            <ol className="grid gap-3 sm:grid-cols-2">
              {THEMES.repentir.conditions.map((c, i) => (
                <li key={c.titre} className="card flex gap-3 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-deep font-bold text-white">{i + 1}</span><span><span className="block font-semibold text-slate-900">{c.titre}</span><span className="text-sm text-slate-600">{c.texte}</span></span></li>
              ))}
            </ol>
          </Section>
        ),
        after: (
          <Section title="Invocations du repentir">
            <div className="space-y-3"><InvocationCard id="sayyid-istighfar" /><InvocationCard id="adam" /><InvocationCard id="astaghfirullah" /></div>
          </Section>
        ),
      }}
    </ThemePage>
  )
}
