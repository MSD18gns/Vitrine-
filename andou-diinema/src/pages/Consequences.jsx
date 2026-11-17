import ThemePage from '../components/ThemePage'
import { Alert } from '../components/ui'

export default function Consequences() {
  return (
    <ThemePage id="consequences" path="/consequences" eyebrow="Responsabilité">
      {{ before: <Alert className="mt-8">Ces rappels ne visent pas à faire peur, mais à réveiller. Chaque avertissement du Coran s'accompagne de la porte du repentir et de l'immense miséricorde d'Allah.</Alert> }}
    </ThemePage>
  )
}
