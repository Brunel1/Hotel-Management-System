'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, Filter, Camera, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  travelType: 'family' | 'business' | 'couple' | 'solo' | 'friends'
  roomType: string
  date: Date
  helpful: number
  notHelpful: number
  hotelResponse?: {
    text: string
    date: Date
    author: string
  }
}

interface ReviewSystemProps {
  roomId?: string
  showWriteReview?: boolean
}

export default function ReviewSystem({ roomId, showWriteReview = true }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'family' | 'business' | 'couple' | 'solo' | 'friends'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'rating-high' | 'rating-low' | 'helpful'>('recent')
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchReviews()
  }, [roomId])

  const fetchReviews = async () => {
    try {
      const url = roomId ? `/api/reviews?roomId=${roomId}` : '/api/reviews'
      const response = await fetch(url)
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error('Erreur lors du chargement des reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews
    .filter(review => filter === 'all' || review.travelType === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'rating-high':
          return b.rating - a.rating
        case 'rating-low':
          return a.rating - b.rating
        case 'helpful':
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0
  }))

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful })
      })
      fetchReviews()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating}</div>
            <div className="flex gap-1 justify-center mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= parseFloat(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {reviews.length} avis
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{star}</span>
                </div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">Tous les voyageurs</option>
            <option value="family">Familles</option>
            <option value="business">Business</option>
            <option value="couple">Couples</option>
            <option value="solo">Voyageurs seuls</option>
            <option value="friends">Amis</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="recent">Plus récents</option>
            <option value="rating-high">Note élevée</option>
            <option value="rating-low">Note basse</option>
            <option value="helpful">Plus utiles</option>
          </select>
        </div>
        {showWriteReview && (
          <button
            onClick={() => setShowWriteForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Écrire un avis
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{review.userName}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(review.date).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span className="capitalize">{review.travelType}</span>
                    <span>•</span>
                    <span>{review.roomType}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</h4>
            <p className={`text-gray-600 dark:text-gray-400 ${!expandedReviews.has(review.id) && review.comment.length > 200 ? 'line-clamp-3' : ''}`}>
              {review.comment}
            </p>
            {review.comment.length > 200 && (
              <button
                onClick={() => toggleExpand(review.id)}
                className="text-indigo-600 dark:text-indigo-400 text-sm mt-2 hover:underline flex items-center gap-1"
              >
                {expandedReviews.has(review.id) ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Voir plus
                  </>
                )}
              </button>
            )}

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {review.hotelResponse && (
              <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">H</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Réponse de l'hôtel
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.hotelResponse.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{review.hotelResponse.text}</p>
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleHelpful(review.id, true)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Utile ({review.helpful})
              </button>
              <button
                onClick={() => handleHelpful(review.id, false)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                Pas utile ({review.notHelpful})
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteForm && <WriteReviewForm onClose={() => setShowWriteForm(false)} onSuccess={fetchReviews} roomId={roomId} />}
    </div>
  )
}

function WriteReviewForm({ onClose, onSuccess, roomId }: { onClose: () => void; onSuccess: () => void; roomId?: string }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [travelType, setTravelType] = useState<'family' | 'business' | 'couple' | 'solo' | 'friends'>('couple')
  const [roomType, setRoomType] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0 || !title || !comment) return

    setSubmitting(true)
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title,
          comment,
          travelType,
          roomType,
          images,
          roomId
        })
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Écrire un avis</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note globale
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre de votre avis
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Résumez votre expérience"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Votre avis détaillé
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Décrivez votre séjour..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            < div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de voyage
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="family">Famille</option>
                <option value="business">Business</option>
                <option value="couple">Couple</option>
                <option value="solo">Voyageur seul</option>
                <option value="friends">Amis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de chambre
              </label>
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Standard, Suite..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (optionnel)
            </label>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Ajouter des photos
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publier l'avis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
