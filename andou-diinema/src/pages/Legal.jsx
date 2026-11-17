import Seo from '../components/Seo'
import { PageHeader } from '../components/ui'

const PAGES = {
  confidentialite: {
    titre: 'Politique de confidentialité',
    blocs: [
      ['Notre principe', "Ce que tu confies à ANDOU DIINEMA (habitudes, difficultés, bilans, objectifs) est strictement privé. Ces informations ne sont jamais affichées publiquement, jamais vendues, et ne sont pas accessibles à l'équipe d'administration."],
      ['Données collectées', "Avec un compte : ton adresse e-mail, ton pseudo (facultatif), ta progression (missions, prières, dhikr, objectifs), tes bilans quotidiens, tes favoris et tes préférences de rappels. Sans compte : ces données restent uniquement dans le stockage de ton navigateur, sur ton appareil. Formulaire de contact : nom, e-mail et message."],
      ['Finalité', "Ces données servent uniquement à faire fonctionner ton espace personnel : afficher ta progression, tes favoris et tes rappels. L'administration ne voit que des statistiques globales anonymes (nombre d'utilisateurs, nombre de missions accomplies…)."],
      ['Sécurité', "Les données sont hébergées par Supabase (base PostgreSQL). L'accès est protégé par authentification et par des règles de sécurité au niveau de chaque ligne (RLS) : chaque utilisateur ne peut lire et modifier que ses propres données. Les connexions sont chiffrées (HTTPS)."],
      ['Tes droits', "Tu peux à tout moment télécharger tes données et les supprimer définitivement depuis la page Profil. La suppression efface immédiatement toute ta progression, tes bilans, objectifs et favoris. Pour fermer aussi ton identifiant de connexion, écris-nous via la page Contact. Pour toute question, utilise la page Contact."],
      ['Cookies et stockage', "Le site n'utilise pas de cookies publicitaires ni de traceurs tiers. Le stockage local du navigateur sert à garder ta session, tes préférences et, en mode invité, ta progression."],
    ],
  },
  conditions: {
    titre: "Conditions d'utilisation",
    blocs: [
      ['Objet', "ANDOU DIINEMA est une plateforme éducative islamique qui aide à prendre conscience des comportements qui éloignent d'Allah et propose des outils pour changer."],
      ['Nature des contenus', "Les contenus s'appuient sur le Coran et la Sunna authentique, avec leurs références. Ils sont relus par des personnes qualifiées avant validation. Ils ne remplacent pas l'avis personnalisé d'un savant pour une situation particulière. Lorsque les savants divergent, cela est indiqué."],
      ['Santé et accompagnement', "Les conseils proposés ne remplacent pas un accompagnement médical ou psychologique. En cas de détresse, de dépendance sévère ou de pensées dangereuses, contacte un professionnel de santé ou les services d'urgence de ton pays."],
      ['Compte', "Tu es responsable de la confidentialité de ton mot de passe. Un compte est personnel. Tu peux le supprimer à tout moment."],
      ['Respect', "Il est interdit d'utiliser le site pour nuire, harceler, ou tenter d'accéder aux données d'autrui. Toute tentative d'accès non autorisé pourra entraîner la suppression du compte."],
      ['Signalement', "Si tu constates une erreur dans une référence ou une traduction, signale-la via la page Contact : elle sera vérifiée en priorité."],
    ],
  },
}

export default function Legal({ page }) {
  const p = PAGES[page]
  return (
    <>
      <Seo title={p.titre} />
      <PageHeader emoji="📄" title={p.titre} />
      <div className="container-ad max-w-3xl">
        {p.blocs.map(([t, x]) => <section key={t} className="mt-8"><h2 className="mb-2 text-lg font-bold">{t}</h2><p className="leading-relaxed text-slate-700">{x}</p></section>)}
        <p className="mt-10 text-sm text-slate-500">Dernière mise à jour : {new Date(2026, 10, 17).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </>
  )
}
