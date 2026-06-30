'use client'

import { useState, useEffect } from 'react'
import { Crown, Star, Gift, TrendingUp, Award, CheckCircle } from 'lucide-react'

interface LoyaltyTier {
  level: string
  name: string
  pointsRequired: number
  benefits: string[]
  color: string
  icon: React.ReactNode
}

interface LoyaltyProgramProps {
  userId?: string
}

export default function LoyaltyProgram({ userId }: LoyaltyProgramProps) {
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [currentTier, setCurrentTier] = useState<string>('BRONZE')
  const [availableRewards, setAvailableRewards] = useState<Array<{
    id: string
    name: string
    description: string
    pointsCost: number
    type: 'discount' | 'upgrade' | 'service' | 'experience'
  }>>([])
  const [redeemedRewards, setRedeemedRewards] = useState<Array<{
    id: string
    name: string
    redeemedAt: string
  }>>([])
  const [pointsHistory, setPointsHistory] = useState<Array<{
    id: string
    points: number
    description: string
    date: string
    type: 'earned' | 'redeemed'
  }>>([])

  const tiers: LoyaltyTier[] = [
    {
      level: 'BRONZE',
      name: 'Bronze',
      pointsRequired: 0,
      benefits: [
        '1 point par 1€ dépensé',
        'Accès aux offres spéciales',
        'Support prioritaire par email',
      ],
      color: 'from-amber-600 to-amber-800',
      icon: <Award className="w-6 h-6" />,
    },
    {
      level: 'SILVER',
      name: 'Argent',
      pointsRequired: 1000,
      benefits: [
        '1.5 points par 1€ dépensé',
        '10% de réduction sur les réservations',
        'Check-in prioritaire',
        'Petit-déjeuner offert 1 fois par séjour',
        'Accès au salon VIP',
      ],
      color: 'from-gray-400 to-gray-600',
      icon: <Star className="w-6 h-6" />,
    },
    {
      level: 'GOLD',
      name: 'Or',
      pointsRequired: 5000,
      benefits: [
        '2 points par 1€ dépensé',
        '15% de réduction sur les réservations',
        'Upgrade de chambre gratuit (disponibilité)',
        'Check-in et check-out express',
        'Petit-déjeuner offert tous les jours',
        'Accès au spa gratuit',
        'Service de conciergerie',
      ],
      color: 'from-yellow-400 to-yellow-600',
      icon: <Crown className="w-6 h-6" />,
    },
    {
      level: 'PLATINUM',
      name: 'Platine',
      pointsRequired: 15000,
      benefits: [
        '3 points par 1€ dépensé',
        '20% de réduction sur les réservations',
        'Upgrade de chambre garanti',
        'Accès prioritaire à toutes les installations',
        'Service de navette gratuit',
        'Expériences exclusives',
        'Invitations aux événements VIP',
        'Gestionnaire de compte dédié',
      ],
      color: 'from-slate-300 to-slate-500',
      icon: <Crown className="w-6 h-6" />,
    },
  ]

  useEffect(() => {
    fetchLoyaltyData()
  }, [userId])

  const fetchLoyaltyData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/loyalty', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserPoints(data.points)
        setCurrentTier(data.currentTier)
        setAvailableRewards(data.availableRewards)
        setRedeemedRewards(data.redeemedRewards)
        setPointsHistory(data.pointsHistory)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de fidélité:', error)
    } finally {
      setLoading(false)
    }
  }

  const redeemReward = async (rewardId: string, pointsCost: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rewardId }),
      })

      if (response.ok) {
        setUserPoints(prev => prev - pointsCost)
        await fetchLoyaltyData()
      }
    } catch (error) {
      console.error('Erreur lors de l\'échange de récompense:', error)
    }
  }

  const getCurrentTierIndex = () => {
    return tiers.findIndex(tier => tier.level === currentTier)
  }

  const getNextTier = () => {
    const currentIndex = getCurrentTierIndex()
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  }

  const getProgressToNextTier = () => {
    const nextTier = getNextTier()
    if (!nextTier) return 100
    const currentTierData = tiers[getCurrentTierIndex()]
    const progress = ((userPoints - currentTierData.pointsRequired) / (nextTier.pointsRequired - currentTierData.pointsRequired)) * 100
    return Math.min(progress, 100)
  }

  const getPointsToNextTier = () => {
    const nextTier = getNextTier()
    if (!nextTier) return 0
    return nextTier.pointsRequired - userPoints
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Programme de fidélité</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const currentTierData = tiers[getCurrentTierIndex()]
  const nextTier = getNextTier()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Programme de fidélité</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques actuelles */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentTierData.icon}
              <div>
                <p className="text-sm opacity-90">Niveau actuel</p>
                <p className="text-2xl font-bold">{currentTierData.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Points</p>
              <p className="text-3xl font-bold">{userPoints}</p>
            </div>
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progression vers {nextTier.name}</span>
                <span>{getPointsToNextTier()} points restants</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all"
                  style={{ width: `${getProgressToNextTier()}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Niveaux de fidélité */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Niveaux de fidélité</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.level}
                className={`border-2 rounded-lg p-4 transition-all ${
                  tier.level === currentTier
                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-full bg-gradient-to-br ${tier.color} text-white`}>
                    {tier.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{tier.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tier.pointsRequired} points</p>
                  </div>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {tier.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                  {tier.benefits.length > 3 && (
                    <li className="text-gray-400">+{tier.benefits.length - 3} autres avantages</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Récompenses disponibles */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Récompenses disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRewards.map((reward) => (
              <div key={reward.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">{reward.name}</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{reward.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-white">{reward.pointsCost}</span>
                  </div>
                  <button
                    onClick={() => redeemReward(reward.id, reward.pointsCost)}
                    disabled={userPoints < reward.pointsCost}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Échanger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historique des points */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Historique des points</h4>
          <div className="space-y-2">
            {pointsHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    entry.type === 'earned' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {entry.type === 'earned' ? <TrendingUp className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  entry.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {entry.type === 'earned' ? '+' : '-'}{entry.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
