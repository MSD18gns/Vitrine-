import VerseCard from './VerseCard'
import HadithCard from './HadithCard'

// Affiche une liste de références (versets puis hadiths)
export default function Sources({ versets = [], hadiths = [] }) {
  if (!versets.length && !hadiths.length) return null
  return (
    <div className="space-y-3">
      {versets.map((v) => <VerseCard key={v} id={v} />)}
      {hadiths.map((h) => <HadithCard key={h} id={h} />)}
    </div>
  )
}
