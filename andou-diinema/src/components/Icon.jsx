import { Eye, HeartCrack, Smartphone, Shirt, MessageCircleWarning, BookOpen, HeartPulse, Flame, Scale, LifeBuoy, RefreshCw, Sprout, Sparkles } from 'lucide-react'
const MAP = { Eye, HeartCrack, Smartphone, Shirt, MessageCircleWarning, BookOpen, HeartPulse, Flame, Scale, LifeBuoy, RefreshCw, Sprout, Sparkles }
export default function Icon({ name, ...p }) {
  const C = MAP[name] || BookOpen
  return <C {...p} />
}
