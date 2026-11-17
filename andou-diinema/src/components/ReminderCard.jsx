import { Lightbulb } from 'lucide-react'
import { CONSEILS } from '../content/themes'
import { dayOfYear } from '../lib/dates'

export default function ReminderCard({ offset = 0 }) {
  const conseil = CONSEILS[(dayOfYear() + offset) % CONSEILS.length]
  return (
    <div className="card flex gap-3 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-deep"><Lightbulb size={21} /></span>
      <div>
        <p className="eyebrow mb-1">Conseil du jour</p>
        <p className="font-medium leading-snug text-slate-800">{conseil}</p>
      </div>
    </div>
  )
}
