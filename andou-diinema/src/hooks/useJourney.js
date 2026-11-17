import { useMemo } from 'react'
import { useProgress, useProgressData } from './useProgress'
import { computeStats, etatDesEtapes, DEFAULT_GOAL } from '../services/gamification'

// Rassemble toutes les données de progression et calcule XP, niveau, série, badges…
export function useJourney() {
  const { api, bump, isGuest } = useProgress()
  const { data, loading, error } = useProgressData(async (a) => {
    const [lessons, prog, prayers, reviews, dhikr, prefs] = await Promise.all([
      a.lessons(), a.programme(), a.prayers(), a.listReviews(1000), a.dhikr(), a.gamePrefs(),
    ])
    return { lessons, programme: prog.historique, prog, prayers, reviews, dhikr, prefs }
  })
  const value = useMemo(() => {
    const prefs = data?.prefs || { objectif: DEFAULT_GOAL, sobre: false }
    const stats = computeStats(data || {}, prefs.objectif)
    const { etats, courante } = etatDesEtapes(stats.faites)
    return { stats, etats, courante, prefs, prog: data?.prog }
  }, [data])
  return { ...value, loading: loading && !data, error, api, bump, isGuest }
}
