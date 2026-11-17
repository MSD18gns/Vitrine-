import ThemePage from '../components/ThemePage'
import { Section } from '../components/ui'
import InvocationCard from '../components/InvocationCard'
import { THEMES } from '../content/themes'

export default function PiegesShaytan() {
  return (
    <ThemePage id="pieges" path="/pieges-shaytan" eyebrow="Se protéger">
      {{ after: (
        <Section title="Les moyens de protection">
          <ul className="space-y-2">{THEMES.pieges.protections.map((r) => <li key={r} className="card p-3.5 text-[15px] text-slate-700">🛡️ {r}</li>)}</ul>
          <div className="mt-4"><InvocationCard id="taawudh" /></div>
        </Section>
      ) }}
    </ThemePage>
  )
}
