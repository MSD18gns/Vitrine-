import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('ANDOU DIINEMA :', error, info) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div className="max-w-sm">
          <img src="/logo.svg" alt="" className="mx-auto mb-4 h-16 w-16 rounded-2xl" />
          <h1 className="mb-2 text-xl font-bold text-brand-deep">Une erreur est survenue</h1>
          <p className="mb-6 text-slate-600">Cette page n'a pas pu s'afficher. Réessaie dans un instant.</p>
          <button className="btn-primary w-full" onClick={() => window.location.reload()}>Recharger la page</button>
          <a href="/" className="mt-3 block text-sm font-medium text-brand">Retour à l'accueil</a>
        </div>
      </div>
    )
  }
}
