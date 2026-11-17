import ThemePage from '../components/ThemePage'
import { Section } from '../components/ui'
import InvocationCard from '../components/InvocationCard'
import { THEMES } from '../content/themes'

export default function CoeurEndurci() {
  return (
    <ThemePage id="coeur" path="/coeur-endurci" eyebrow="Le cœur">
      {{ after: (
        <Section title="Remèdes pour adoucir le cœur">
          <ul className="space-y-2">{THEMES.coeur.remedes.map((r) => <li key={r} className="card p-3.5 text-[15px] text-slate-700">✦ {r}</li>)}</ul>
          <div className="mt-4"><InvocationCard id="coeur-ferme" /></div>
        </Section>
      ) }}
    </ThemePage>
  )
}
