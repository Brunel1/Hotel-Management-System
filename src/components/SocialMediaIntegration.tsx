'use client'

import { useState, useEffect } from 'react'
import { Share2, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Heart, TrendingUp, Users, Eye } from 'lucide-react'

interface SocialPost {
  id: string
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin'
  content: string
  imageUrl?: string
  publishedAt: string
  metrics: {
    likes: number
    shares: number
    comments: number
    views: number
    clicks: number
  }
  status: 'scheduled' | 'published' | 'draft'
}

interface SocialMediaIntegrationProps {
  userId?: string
}

export default function SocialMediaIntegration({ userId }: SocialMediaIntegrationProps) {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'twitter' | 'instagram' | 'linkedin'>('facebook')

  useEffect(() => {
    fetchSocialPosts()
  }, [])

  const fetchSocialPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/social-media', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts sociaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData: Partial<SocialPost>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        await fetchSocialPosts()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création du post:', error)
    }
  }

  const deletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/social-media/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchSocialPosts()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="w-5 h-5" />
      case 'twitter':
        return <Twitter className="w-5 h-5" />
      case 'instagram':
        return <Instagram className="w-5 h-5" />
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />
      default:
        return <Share2 className="w-5 h-5" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'twitter':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
      case 'instagram':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
      case 'linkedin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const calculateTotalEngagement = () => {
    return posts.reduce((sum, post) => sum + post.metrics.likes + post.metrics.shares + post.metrics.comments, 0)
  }

  const calculateTotalViews = () => {
    return posts.reduce((sum, post) => sum + post.metrics.views, 0)
  }

  const calculateTotalClicks = () => {
    return posts.reduce((sum, post) => sum + post.metrics.clicks, 0)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Réseaux sociaux</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Réseaux sociaux</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Share2 className="w-5 h-5" />
            Nouveau post
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Engagement total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalEngagement().toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Vues totales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalViews().toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Clics totaux</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateTotalClicks().toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Posts publiés</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {posts.filter(p => p.status === 'published').length}
            </p>
          </div>
        </div>

        {/* Sélection de plateforme */}
        <div className="flex gap-2 mb-6">
          {(['facebook', 'twitter', 'instagram', 'linkedin'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPlatform === platform
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getPlatformIcon(platform)}
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>

        {/* Liste des posts */}
        <div className="space-y-4">
          {posts.filter(p => p.platform === selectedPlatform).map((post) => (
            <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${getPlatformColor(post.platform)}`}>
                      {getPlatformIcon(post.platform)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status === 'published' ? 'Publié' : post.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {post.content}
                  </p>

                  {post.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.metrics.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.metrics.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      <span>{post.metrics.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.metrics.views}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Supprimer"
                >
                  <Share2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.filter(p => p.platform === selectedPlatform).length === 0 && (
          <div className="text-center py-12">
            <Share2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun post sur cette plateforme</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Créer un post
            </button>
          </div>
        )}
      </div>

      {/* Modal de création (simplifié) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau post social</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le formulaire de création de post sera implémenté avec les champs nécessaires.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  createPost({
                    platform: selectedPlatform,
                    content: 'Nouveau post social',
                    publishedAt: new Date().toISOString(),
                    metrics: {
                      likes: 0,
                      shares: 0,
                      comments: 0,
                      views: 0,
                      clicks: 0,
                    },
                    status: 'draft',
                  })
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
