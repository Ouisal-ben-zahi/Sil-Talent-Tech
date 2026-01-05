'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Users, FileText, CheckCircle, XCircle, Briefcase, ChevronDown, LogOut, Eye, ArrowUp, ArrowDown, Home, Download, BarChart3, Filter, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, FolderOpen, Settings, User, Mail, Phone, MapPin, Globe, LockKeyhole, EyeOff, X, Upload, Plus, Trash2, Calendar as CalendarIcon, Linkedin, ClipboardList, Brain, Menu, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMiniArrowsPointingOut } from 'react-icons/hi2'
import { MdOutlineCake, MdOutlineViewKanban } from 'react-icons/md'
import { FaRegFlag } from 'react-icons/fa'
import { IoMdMale } from 'react-icons/io'
import { PiStackSimpleLight } from 'react-icons/pi'
import { IoSchoolOutline } from 'react-icons/io5'
import { RiGalleryView2 } from 'react-icons/ri'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { clearAuthData } from '@/lib/auth'
// Dynamic import pour Recharts (lazy loading) - Réduit le bundle initial de ~200KB
import { AdminBarChart } from '@/components/charts/AdminBarChart'
import { AdminPieChart } from '@/components/charts/AdminPieChart'
import { AdminLineChart } from '@/components/charts/AdminLineChart'
import { useLanguage } from '@/context/LanguageContext'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  source: string
  createdAt: string
  jobTitle?: string | null
  typeDeMissionSouhaite?: string | null
  profilePhotoUrl?: string | null
  // Champs de profil détaillé (doivent correspondre au backend)
  dateOfBirth?: string | null
  nationality?: string | null
  maritalStatus?: string | null
  gender?: string | null
  professionalExperience?: string | null
  educationLevel?: string | null
  biography?: string | null
  country?: string | null
  city?: string | null
  cvHistories: Array<{
    id: string
    fileName: string
    crmSyncStatus: string
  }>
}

interface Stats {
  totalCandidates: number
  totalCvs: number
  syncedCvs: number
  failedSyncs: number
  successRate: number
}

interface Candidature {
  id: string
  candidateId: string
  datePostulation: string
  candidateSource: string
  candidateGender: string | null
  typeDeMission: string | null
  sentToCrm: boolean
}

const hero = '/assets/Images/hero.PNG'

const translations = {
  FR: {
    tabs: {
      dashboard: 'Bienvenue',
      candidates: 'Liste candidats',
      statistics: 'Statistiques',
      companyMessages: 'Messages Entreprises',
      settings: 'Paramètres',
    },
    logout: 'Déconnexion',
    closeMenu: 'Fermer le menu',
    admin: 'Administrateur',
    dashboardTitle: 'TABLEAU DE BORD',
    greeting: (name: string) => `Bonjour ${name},`,
    stats: {
      totalCandidates: 'Total candidats',
      totalCvs: 'Fichiers CV',
      syncedCvs: 'Synchronisations réussies',
      pendingRequests: 'Demandes en attente',
    },
    messages: {
      passwordUpdated: 'Mot de passe mis à jour avec succès',
      logoutSuccess: 'Déconnexion réussie',
      cvDownloaded: 'CV téléchargé avec succès',
      sessionExpired: 'Session expirée. Veuillez vous reconnecter.',
      mustBeLoggedIn: 'Vous devez être connecté pour accéder à cette page',
      passwordMinLength: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
    },
    dashboard: {
      statisticsTitle: 'Statistiques de candidatures',
      monthly: 'Mensuelle',
      weekly: 'Hebdomadaire',
      thisWeek: 'Cette semaine',
      applications: 'Candidatures',
      contactMessages: 'Messages de contact',
      applicationsSummary: 'Résumé des candidatures',
    },
    settings: {
      title: 'Paramètres',
      changePassword: 'Modifier Mon Mot De Passe',
      currentPassword: 'Votre mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmez votre nouveau mot de passe',
      saving: 'Enregistrement...',
      save: 'Enregistrer Les Modifications',
    },
    candidates: {
      title: 'Liste Candidats',
      filter: 'Filtrer',
      sort: 'Trier',
      sortTitle: 'TRIER LES CANDIDATURES',
      sortRecent: 'Plus récentes',
      sortOldest: 'Plus anciennes',
      experience: (years: number) => `${years} ${years > 1 ? 'ans' : 'an'} d'expérience`,
      missionType: 'Type de mission souhaité:',
      missionTypeNotSpecified: 'Non spécifié',
      date: 'Date:',
      downloadCv: 'Télécharger le CV',
      noCandidates: 'Aucun candidat trouvé',
      previous: 'Précédent',
      next: 'Suivant',
      pagination: (start: number, end: number, total: number) => `Affichage de ${start} à ${end} sur ${total} candidats`,
      applications: 'Candidatures',
      noApplications: 'Aucune candidature disponible',
      advancedFilter: 'Filtres avancés',
      filterBy: 'Filtrer par',
      searchName: 'Rechercher par nom ',
      sourceLabels: {
        portal_registration: 'portail',
        quick_application: 'rapide',
      },
      source: 'Source',
      missionTypeFilter: 'Type de mission',
      gender: 'Genre',
      all: 'Tous',
      resetFilters: 'Réinitialiser',
      applyFilters: 'Appliquer',
    },
    candidateDetails: {
      close: 'Fermer la fiche candidat',
      call: 'Appeler',
      sendEmail: 'Envoyer email',
      biography: 'Biographie',
      biographyDefault: (jobTitle: string | null, source: string | null) => 
        jobTitle
          ? `Professionnel(le) ${jobTitle.toLowerCase()} inscrit(e) sur la plateforme SIL TALENTS TECH. Ce profil a été créé via la source ${source || 'non renseignée'}.`
          : `Candidat(e) inscrit(e) sur la plateforme SIL TALENTS TECH. Ce profil a été créé via la source ${source || 'non renseignée'}.`,
      dateOfBirth: 'Date de naissance',
      nationality: 'Nationalité',
      maritalStatus: 'Statut marital',
      gender: 'Genre',
      experience: 'Expérience',
      education: 'Études',
      notSpecified: 'Non renseigné',
      notSpecifiedF: 'Non renseignée',
      noCv: 'Aucun CV disponible pour ce candidat.',
      website: 'Site web',
      location: 'Localisation',
      phone: 'Téléphone',
      email: 'Email',
    },
  },
  EN: {
    tabs: {
      dashboard: 'Welcome',
      candidates: 'Candidates List',
      statistics: 'Statistics',
      companyMessages: 'Company Messages',
      settings: 'Settings',
    },
    logout: 'Logout',
    closeMenu: 'Close menu',
    admin: 'Administrator',
    dashboardTitle: 'DASHBOARD',
    greeting: (name: string) => `Hello ${name},`,
    stats: {
      totalCandidates: 'Total Candidates',
      totalCvs: 'CV Files',
      syncedCvs: 'Successful Syncs',
      pendingRequests: 'Pending Requests',
    },
    messages: {
      passwordUpdated: 'Password updated successfully',
      logoutSuccess: 'Logout successful',
      cvDownloaded: 'CV downloaded successfully',
      sessionExpired: 'Session expired. Please log in again.',
      mustBeLoggedIn: 'You must be logged in to access this page',
      passwordMinLength: 'The new password must contain at least 8 characters',
    },
    dashboard: {
      statisticsTitle: 'Application Statistics',
      monthly: 'Monthly',
      weekly: 'Weekly',
      thisWeek: 'This week',
      applications: 'Applications',
      contactMessages: 'Contact Messages',
      applicationsSummary: 'Applications Summary',
    },
    settings: {
      title: 'Settings',
      changePassword: 'Change My Password',
      currentPassword: 'Your current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm your new password',
      saving: 'Saving...',
      save: 'Save Changes',
    },
    candidates: {
      title: 'Candidates List',
      filter: 'Filter',
      sort: 'Sort',
      sortTitle: 'SORT APPLICATIONS',
      sortRecent: 'Most recent',
      sortOldest: 'Oldest',
      experience: (years: number) => `${years} ${years > 1 ? 'years' : 'year'} of experience`,
      missionType: 'Desired mission type:',
      missionTypeNotSpecified: 'Not specified',
      date: 'Date:',
      downloadCv: 'Download CV',
      noCandidates: 'No candidates found',
      previous: 'Previous',
      next: 'Next',
      pagination: (start: number, end: number, total: number) => `Showing ${start} to ${end} of ${total} candidates`,
      applications: 'Applications',
      noApplications: 'No applications available',
      advancedFilter: 'Advanced Filters',
      filterBy: 'Filter by',
      searchName: 'Search by full name',
      source: 'Source',
      missionTypeFilter: 'Mission Type',
      gender: 'Gender',
      all: 'All',
      resetFilters: 'Reset',
      applyFilters: 'Apply',
      sourceLabels: {
        portal_registration: 'Portal Registration',
        quick_application: 'Quick Application',
      },
    },
    candidateDetails: {
      close: 'Close candidate details',
      call: 'Call',
      sendEmail: 'Send email',
      biography: 'Biography',
      biographyDefault: (jobTitle: string | null, source: string | null) => 
        jobTitle
          ? `${jobTitle} professional registered on the SIL TALENTS TECH platform. This profile was created via source ${source || 'not specified'}.`
          : `Candidate registered on the SIL TALENTS TECH platform. This profile was created via source ${source || 'not specified'}.`,
      dateOfBirth: 'Date of birth',
      nationality: 'Nationality',
      maritalStatus: 'Marital status',
      gender: 'Gender',
      experience: 'Experience',
      education: 'Education',
      notSpecified: 'Not specified',
      notSpecifiedF: 'Not specified',
      noCv: 'No CV available for this candidate.',
      website: 'Website',
      location: 'Location',
      phone: 'Phone',
      email: 'Email',
    },
  },
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang]
  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'statistics' | 'companyMessages' | 'settings'>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalCandidates: 0,
    totalCvs: 0,
    syncedCvs: 0,
    failedSyncs: 0,
    successRate: 0,
  })
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showCandidateDetails, setShowCandidateDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [adminName, setAdminName] = useState<string | null>(null)
  const [totalApplications, setTotalApplications] = useState<number>(0)
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [chartPeriod, setChartPeriod] = useState<'mensuelle' | 'hebdomadaire'>('mensuelle')
  const [contactMessagesCount, setContactMessagesCount] = useState<number>(0)
  const [contactMessages, setContactMessages] = useState<Array<{ id: string; createdAt: string }>>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalCandidates, setTotalCandidates] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const candidatesPerPage = 10
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState({
    searchName: '',
    source: '',
    missionType: '',
    gender: '',
  })
  const [filterOptions, setFilterOptions] = useState({
    sources: [] as string[],
    genders: [] as string[],
  })
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false)
  const [isMissionTypeDropdownOpen, setIsMissionTypeDropdownOpen] = useState(false)
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false)
  const [advancedStats, setAdvancedStats] = useState<any>(null)
  const [isLoadingAdvancedStats, setIsLoadingAdvancedStats] = useState(false)
  const [companyRequests, setCompanyRequests] = useState<Array<{
    id: string
    contactPerson: string
    email: string
    phone: string
    company: string
    companySize: string
    sector: string
    position: string | null
    location: string | null
    urgency: string
    message: string
    status: string
    createdAt: string
  }>>([])
  const [isLoadingCompanyRequests, setIsLoadingCompanyRequests] = useState(false)
  const [selectedCompanyRequest, setSelectedCompanyRequest] = useState<{
    id: string
    contactPerson: string
    email: string
    phone: string
    company: string
    companySize: string
    sector: string
    position: string | null
    location: string | null
    urgency: string
    message: string
    status: string
    createdAt: string
  } | null>(null)
  const [showCompanyRequestDetails, setShowCompanyRequestDetails] = useState(false)
  const [companyRequestFilters, setCompanyRequestFilters] = useState({
    company: '',
    email: '',
    urgency: '',
  })

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Veuillez remplir tous les champs de mot de passe')
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('La confirmation du mot de passe ne correspond pas')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(t.messages.passwordMinLength)
      return
    }

    try {
      setIsSavingPassword(true)
      await api.post('/auth/admin/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      toast.success(t.messages.passwordUpdated)
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Erreur lors de la mise à jour du mot de passe'
      toast.error(msg)
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleLogout = () => {
    clearAuthData()
    toast.success(t.messages.logoutSuccess)
    router.push('/admin/login')
  }

  const handleDownloadCv = async (fileName: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://168.231.82.55:3001/api'
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`${apiUrl}/admin/cvs/${encodeURIComponent(fileName)}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du CV')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(t.messages.cvDownloaded)
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du CV:', error)
      toast.error(error.message || 'Erreur lors du téléchargement du CV')
    }
  }

  const handleViewCandidateDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowCandidateDetails(true)
  }

  const handleCloseCandidateDetails = () => {
    setShowCandidateDetails(false)
    setSelectedCandidate(null)
  }

  const fetchCandidatures = async () => {
    try {
      const response = await api.get('/admin/candidatures')
      console.log('📡 Réponse API candidatures:', response)
      const payload = response.data?.data ?? response.data
      const list = Array.isArray(payload) ? payload : []
      console.log('📊 Candidatures récupérées:', list.length)
      console.log('📊 Détails des candidatures:', list.map((c: Candidature) => ({
        id: c.id,
        datePostulation: c.datePostulation,
        candidateGender: c.candidateGender,
        candidateSource: c.candidateSource,
        typeDeMission: c.typeDeMission
      })))
      setCandidatures(list)
    } catch (error: any) {
      console.error('Erreur lors du chargement des candidatures:', error)
      setCandidatures([])
    }
  }

  const fetchContactMessagesCount = async () => {
    try {
      const response = await api.get('/admin/contact-messages/count')
      console.log('📧 Réponse complète de l\'API:', response.data)
      
      // Extraire le nombre correctement
      let count = 0
      if (typeof response.data === 'number') {
        count = response.data
      } else if (response.data?.count !== undefined) {
        count = typeof response.data.count === 'number' ? response.data.count : parseInt(response.data.count) || 0
      } else if (response.data?.data?.count !== undefined) {
        count = typeof response.data.data.count === 'number' ? response.data.data.count : parseInt(response.data.data.count) || 0
      }
      
      console.log('📧 Nombre de messages de contact extrait:', count)
      setContactMessagesCount(count)
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages de contact:', error)
      setContactMessagesCount(0)
    }
  }

  const fetchContactMessages = async () => {
    try {
      const response = await api.get('/admin/contact-messages')
      const messages = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      console.log('📧 Messages de contact récupérés:', messages.length)
      console.log('📧 Exemple de message:', messages[0])
      console.log('📧 Tous les messages:', messages)
      setContactMessages(messages)
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages de contact:', error)
      setContactMessages([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/statistics')
      setStats(response.data.data || response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        router.push('/admin/login')
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors du chargement des statistiques')
      }
    }
  }

  const fetchFilterValues = async () => {
    try {
      console.log('🔍 Récupération des valeurs de filtrage depuis l\'API...')
      const response = await api.get('/admin/filter-values')
      console.log('✅ Réponse API filter-values complète:', response)
      console.log('✅ Réponse API filter-values data:', response.data)
      
      // Gérer les réponses encapsulées comme pour les autres endpoints
      const payload = response.data?.data ?? response.data
      
      const filterData = {
        sources: Array.isArray(payload?.sources) ? payload.sources : [],
        genders: Array.isArray(payload?.genders) ? payload.genders : [],
      }
      
      console.log('📊 Valeurs de filtrage extraites:', {
        sources: filterData.sources.length,
        genders: filterData.genders.length,
      })
      console.log('📋 Détails des valeurs:', filterData)
      
      if (filterData.sources.length === 0 && filterData.genders.length === 0) {
        console.warn('⚠️ Aucune valeur de filtrage récupérée. Vérifiez que la base de données contient des données.')
      }
      
      setFilterOptions(filterData)
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des valeurs de filtrage:', error)
      console.error('❌ Détails de l\'erreur:', error.response?.data || error.message)
      // En cas d'erreur, on garde les tableaux vides
      setFilterOptions({
        sources: [],
        genders: [],
      })
    }
  }

  const fetchCandidates = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const params: any = {
        page,
        limit: candidatesPerPage,
      }
      
      // Ajouter les filtres aux paramètres de la requête
      if (filters.source) {
        params.source = filters.source
      }
      if (filters.gender) {
        params.gender = filters.gender
      }
      if (filters.searchName) {
        params.search = filters.searchName
      }
      
      console.log('📡 Appel API avec paramètres:', params)
      
      const response = await api.get('/admin/candidates', { params })
      const payload = response.data?.data ?? response.data
      const list = payload?.data ?? payload
      const total = payload?.total ?? 0
      const totalPagesCount = payload?.totalPages ?? Math.ceil(total / candidatesPerPage)
      
      console.log('✅ Candidats récupérés:', {
        total,
        count: Array.isArray(list) ? list.length : 0,
        sources: Array.from(new Set((Array.isArray(list) ? list : []).map((c: any) => c.source))),
      })
      
      // Les photos de profil sont maintenant incluses dans la réponse depuis le backend
      setCandidates(Array.isArray(list) ? list : [])
      setTotalCandidates(total)
      setTotalPages(totalPagesCount)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        router.push('/admin/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStatisticsFromData = () => {
    console.log('📊 Calcul des statistiques avec:', { 
      candidatures: candidatures.length, 
      candidates: candidates.length 
    })
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    today.setHours(0, 0, 0, 0)
    
    const thisWeek = new Date(today)
    thisWeek.setDate(today.getDate() - 7)
    thisWeek.setHours(0, 0, 0, 0)
    
    const thisMonth = new Date(today)
    thisMonth.setMonth(today.getMonth() - 1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(today.getMonth() - 6)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // Candidatures par période
    const candidaturesToday = candidatures.filter(c => {
      if (!c.datePostulation) return false
      const date = new Date(c.datePostulation)
      date.setHours(0, 0, 0, 0)
      return date.getTime() >= today.getTime()
    }).length

    const candidaturesThisWeek = candidatures.filter(c => {
      if (!c.datePostulation) return false
      const date = new Date(c.datePostulation)
      date.setHours(0, 0, 0, 0)
      return date.getTime() >= thisWeek.getTime()
    }).length

    const candidaturesThisMonth = candidatures.filter(c => {
      if (!c.datePostulation) return false
      const date = new Date(c.datePostulation)
      date.setHours(0, 0, 0, 0)
      return date.getTime() >= thisMonth.getTime()
    }).length

    console.log('📅 Candidatures par période:', {
      today: candidaturesToday,
      thisWeek: candidaturesThisWeek,
      thisMonth: candidaturesThisMonth,
      total: candidatures.length
    })

    // Statistiques par catégorie (type de mission)
    const candidaturesByCategory: Record<string, number> = {}
    candidatures.forEach(c => {
      const category = c.typeDeMission || 'Non spécifié'
      candidaturesByCategory[category] = (candidaturesByCategory[category] || 0) + 1
    })

    const categoryStats = Object.entries(candidaturesByCategory).map(([name, count]) => ({
      name,
      count,
      percentage: candidatures.length > 0 
        ? Math.round((count / candidatures.length) * 100 * 100) / 100 
        : 0,
    }))

    // Candidatures par heure - créer un tableau pour toutes les heures (0-23)
    const candidaturesByHour: Record<number, number> = {}
    // Initialiser toutes les heures à 0
    for (let i = 0; i < 24; i++) {
      candidaturesByHour[i] = 0
    }
    candidatures.forEach(c => {
      if (c.datePostulation) {
        const date = new Date(c.datePostulation)
        const hour = date.getHours()
        candidaturesByHour[hour] = (candidaturesByHour[hour] || 0) + 1
      }
    })

    // Nouveaux vs anciens candidats
    const newCandidates = candidates.filter(c => {
      if (!c.createdAt) return false
      const date = new Date(c.createdAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime() >= sixMonthsAgo.getTime()
    }).length
    const oldCandidates = candidates.length - newCandidates

    console.log('👥 Candidats:', {
      total: candidates.length,
      nouveaux: newCandidates,
      anciens: oldCandidates
    })

    // Statistiques par statut (si disponible dans candidatures)
    const candidaturesByStatus: Record<string, number> = {}
    candidatures.forEach(c => {
      // Note: Le type Candidature n'a pas de champ statut dans l'interface actuelle
      // On peut utiliser un champ par défaut ou essayer de le récupérer
      const status = 'en_attente' // Par défaut
      candidaturesByStatus[status] = (candidaturesByStatus[status] || 0) + 1
    })

    const statusStats = Object.entries(candidaturesByStatus).map(([status, count]) => ({
      status,
      count,
      percentage: candidatures.length > 0 
        ? Math.round((count / candidatures.length) * 100 * 100) / 100 
        : 0,
    }))

    // Statistiques par localisation
    const candidaturesByLocation: Record<string, number> = {}
    candidates.forEach(c => {
      const location = c.country || 'Non spécifié'
      candidaturesByLocation[location] = (candidaturesByLocation[location] || 0) + 1
    })

    return {
      global: {
        totalCandidates: candidates.length,
        totalCategories: 4, // Les 4 catégories par défaut
        candidaturesByPeriod: {
          today: candidaturesToday,
          thisWeek: candidaturesThisWeek,
          thisMonth: candidaturesThisMonth,
        },
      },
      byCategory: categoryStats,
      activity: {
        recentCandidatures: candidaturesThisWeek,
        candidaturesByHour: Object.entries(candidaturesByHour).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        })).sort((a, b) => a.hour - b.hour),
        newVsOldCandidates: {
          new: newCandidates,
          old: oldCandidates,
        },
      },
      tracking: {
        byStatus: statusStats,
        avgProcessingTimeDays: 0, // Calculé côté serveur si nécessaire
      },
      location: Object.entries(candidaturesByLocation).map(([location, count]) => ({
        location,
        count,
      })),
    }
  }

  const fetchAdvancedStatistics = async () => {
    setIsLoadingAdvancedStats(true)
    try {
      console.log('🔍 Chargement des statistiques avancées...')
      console.log('📊 Données disponibles localement:', {
        candidatures: candidatures.length,
        candidates: candidates.length
      })
      
      // Essayer d'abord l'API, sinon utiliser les données locales
      try {
        const response = await api.get('/admin/statistics/advanced')
        console.log('✅ Réponse complète de l\'API:', response)
        console.log('✅ Statistiques avancées reçues depuis API:', JSON.stringify(response.data, null, 2))
        
        // Vérifier si les données sont dans response.data.data ou response.data
        const statsData = response.data?.data || response.data
        
        if (statsData && Object.keys(statsData).length > 0) {
          console.log('✅ Utilisation des données de l\'API')
          setAdvancedStats(statsData)
        } else {
          // Utiliser les données locales si l'API ne retourne rien
          console.log('⚠️ API retourne des données vides, utilisation des données locales')
          const localStats = calculateStatisticsFromData()
          console.log('✅ Statistiques calculées depuis données locales:', localStats)
          setAdvancedStats(localStats)
        }
      } catch (apiError: any) {
        console.warn('⚠️ Erreur API, utilisation des données locales:', apiError)
        console.warn('⚠️ Détails de l\'erreur:', apiError.response?.data || apiError.message)
        // Utiliser les données déjà chargées
        const localStats = calculateStatisticsFromData()
        console.log('✅ Statistiques calculées depuis données locales:', localStats)
        setAdvancedStats(localStats)
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des statistiques avancées:', error)
      // En cas d'erreur, utiliser les données locales
      const localStats = calculateStatisticsFromData()
      console.log('✅ Statistiques calculées depuis données locales (fallback):', localStats)
      setAdvancedStats(localStats)
    } finally {
      setIsLoadingAdvancedStats(false)
    }
  }

  useEffect(() => {
    const storedName = localStorage.getItem('adminName')
    if (storedName) {
      setAdminName(storedName)
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast.error(t.messages.mustBeLoggedIn)
      router.push('/admin/login')
      return
    }
    
    fetchStats()
    fetchCandidates(currentPage)
    fetchCandidatures()
    fetchContactMessagesCount()
    fetchContactMessages()
    fetchFilterValues()
  }, [router, currentPage])

  const fetchCompanyRequests = async () => {
    setIsLoadingCompanyRequests(true)
    try {
      console.log('📧 Chargement des messages entreprise...')
      const response = await api.get('/admin/company-requests')
      console.log('✅ Réponse API company-requests:', response)
      console.log('✅ Données reçues:', response.data)
      
      // Gérer les réponses encapsulées comme pour les autres endpoints
      const data = response.data?.data ?? response.data
      
      if (Array.isArray(data)) {
        console.log(`✅ ${data.length} messages entreprise récupérés`)
        setCompanyRequests(data)
      } else {
        console.warn('⚠️ Format de réponse inattendu:', data)
        setCompanyRequests([])
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des messages entreprise:', error)
      console.error('❌ Détails de l\'erreur:', error.response?.data || error.message)
      toast.error('Erreur lors du chargement des messages entreprise')
      setCompanyRequests([])
    } finally {
      setIsLoadingCompanyRequests(false)
    }
  }

  useEffect(() => {
    console.log('🔄 activeTab changé:', activeTab)
    if (activeTab === 'statistics') {
      console.log('📊 Chargement des statistiques...')
      console.log('📊 Données disponibles:', { candidatures: candidatures.length, candidates: candidates.length })
      
      // Toujours calculer depuis les données locales d'abord
      const localStats = calculateStatisticsFromData()
      console.log('📊 Statistiques calculées localement:', localStats)
      setAdvancedStats(localStats)
      setIsLoadingAdvancedStats(false)
      
      // Essayer aussi l'API en arrière-plan pour des données plus complètes
      fetchAdvancedStatistics()
    }
    if (activeTab === 'companyMessages') {
      console.log('📧 Chargement des messages entreprise...')
      fetchCompanyRequests()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])
  
  // Recalculer les statistiques quand les données changent
  useEffect(() => {
    if (activeTab === 'statistics' && (candidatures.length > 0 || candidates.length > 0)) {
      console.log('🔄 Recalcul des statistiques avec nouvelles données')
      const localStats = calculateStatisticsFromData()
      setAdvancedStats(localStats)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatures, candidates])

  // Recharger les candidats quand les filtres source ou gender changent
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    
    // Ne recharger que si on change de filtre source ou gender (pas au premier chargement)
    if (filters.source || filters.gender) {
      setCurrentPage(1) // Réinitialiser à la première page
      // Utiliser une fonction async immédiate pour éviter les dépendances circulaires
      ;(async () => {
        setIsLoading(true)
        try {
          const params: any = {
            page: 1,
            limit: candidatesPerPage,
          }
          
          if (filters.source) {
            params.source = filters.source
          }
          if (filters.gender) {
            params.gender = filters.gender
          }
          if (filters.searchName) {
            params.search = filters.searchName
          }
          
          const response = await api.get('/admin/candidates', { params })
          const payload = response.data?.data ?? response.data
          const list = payload?.data ?? payload
          const total = payload?.total ?? 0
          const totalPagesCount = payload?.totalPages ?? Math.ceil(total / candidatesPerPage)
          
          setCandidates(Array.isArray(list) ? list : [])
          setTotalCandidates(total)
          setTotalPages(totalPagesCount)
        } catch (error: any) {
          if (error.response?.status === 401) {
            toast.error('Session expirée. Veuillez vous reconnecter.')
            router.push('/admin/login')
          }
        } finally {
          setIsLoading(false)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.source, filters.gender])

  // Fermer le menu de tri quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showSortMenu && !target.closest('.sort-menu-container')) {
        setShowSortMenu(false)
      }
      // Fermer les dropdowns de filtrage
      if (isSourceDropdownOpen && !target.closest('.source-dropdown')) {
        setIsSourceDropdownOpen(false)
      }
      if (isMissionTypeDropdownOpen && !target.closest('.mission-type-dropdown')) {
        setIsMissionTypeDropdownOpen(false)
      }
      if (isGenderDropdownOpen && !target.closest('.gender-dropdown')) {
        setIsGenderDropdownOpen(false)
      }
    }

    if (showSortMenu || isSourceDropdownOpen || isMissionTypeDropdownOpen || isGenderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortMenu, isSourceDropdownOpen, isMissionTypeDropdownOpen, isGenderDropdownOpen])

  // Filtrer et trier les candidats selon les critères sélectionnés
  // Note: Le filtrage par source et gender se fait maintenant côté serveur
  const sortedCandidates = useMemo(() => {
    let filtered = [...candidates]
    
    // Recherche par nom complet (côté client pour une recherche instantanée)
    if (filters.searchName) {
      const searchTerm = filters.searchName.toLowerCase().trim()
      filtered = filtered.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
        return fullName.includes(searchTerm)
      })
    }
    
    // Filtrage par type de mission (côté client car pas encore supporté côté serveur)
    if (filters.missionType) {
      filtered = filtered.filter(c => c.typeDeMissionSouhaite === filters.missionType)
    }
    
    // Trier selon l'ordre sélectionné
    if (sortOrder === 'recent') {
      return filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA // Plus récent en premier
      })
    } else {
      return filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateA - dateB // Plus ancien en premier
      })
    }
  }, [candidates, sortOrder, filters.searchName, filters.missionType])

  useEffect(() => {
    const applicationsCount = candidates.filter(c => c.cvHistories && c.cvHistories.length > 0).length
    setTotalApplications(applicationsCount)
  }, [candidates])

  const normalApplicationsCount = useMemo(() => {
    return candidatures.filter(c => c.candidateSource === 'portal_registration').length
  }, [candidatures])

  // S'assurer que candidatures est toujours un tableau
  const candidaturesArray = Array.isArray(candidatures) ? candidatures : []

  // Préparation des données pour le graphique Recharts
  const chartData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const daysData: Array<{ date: Date; dateKey: string; label: string; femme: number; homme: number; total: number }> = []
    
    if (chartPeriod === 'mensuelle') {
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day, 0, 0, 0, 0)
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        daysData.push({
          date,
          dateKey,
          label: day.toString(),
          femme: 0,
          homme: 0,
          total: 0
        })
      }
      } else {
      for (let i = 9; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split('T')[0]
        const dayNumber = date.getDate()
        daysData.push({
          date,
          dateKey,
          label: dayNumber.toString(),
          femme: 0,
          homme: 0,
          total: 0
        })
      }
    }
    
    // Traiter les candidatures
    candidaturesArray.forEach((candidature) => {
      if (!candidature.datePostulation) return
      
      let dateValue: string
      if (typeof candidature.datePostulation === 'string') {
        dateValue = candidature.datePostulation
      } else if (candidature.datePostulation && typeof candidature.datePostulation === 'object' && 'toISOString' in candidature.datePostulation) {
        dateValue = (candidature.datePostulation as Date).toISOString()
      } else {
        return
      }
      
      const candidatureDate = new Date(dateValue)
      if (isNaN(candidatureDate.getTime())) return
      
      const year = candidatureDate.getFullYear()
      const month = candidatureDate.getMonth()
      const day = candidatureDate.getDate()
      const candidatureDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      if (chartPeriod === 'mensuelle') {
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        if (month !== currentMonth || year !== currentYear) return
      }
      
      const dayData = daysData.find(d => d.dateKey === candidatureDateKey)
      if (dayData) {
        dayData.total += 1
        const gender = candidature.candidateGender?.toLowerCase().trim() || ''
        if (gender === 'femme' || gender === 'female' || gender === 'f') {
          dayData.femme += 1
        } else if (gender === 'homme' || gender === 'male' || gender === 'm' || gender === 'masculin') {
          dayData.homme += 1
        }
      }
    })
    
    return daysData.map(day => ({
      name: day.label,
      date: day.dateKey,
      Femme: day.femme,
      Homme: day.homme,
      total: day.total
    }))
  }, [candidaturesArray, chartPeriod])

  // Fonction utilitaire pour calculer les statistiques hebdomadaires (partagée entre candidatures et messages)
  const calculateWeeklyStats = useMemo(() => {
    return (items: Array<{ datePostulation?: string; createdAt?: string }>, dateField: 'datePostulation' | 'createdAt') => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Début de cette semaine (lundi)
      const startOfThisWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Lundi = 0
      startOfThisWeek.setDate(today.getDate() - diff)
      startOfThisWeek.setHours(0, 0, 0, 0)
      
      // Fin de cette semaine (dimanche)
      const endOfThisWeek = new Date(startOfThisWeek)
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6)
      endOfThisWeek.setHours(23, 59, 59, 999)
      
      // Début de la semaine précédente
      const startOfLastWeek = new Date(startOfThisWeek)
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)
      
      // Fin de la semaine précédente
      const endOfLastWeek = new Date(startOfThisWeek)
      endOfLastWeek.setDate(startOfThisWeek.getDate() - 1)
      endOfLastWeek.setHours(23, 59, 59, 999)
      
      const thisWeekCount = items.filter((item) => {
        const dateValue = dateField === 'datePostulation' ? item.datePostulation : item.createdAt
        if (!dateValue) return false
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return false
        return date >= startOfThisWeek && date <= endOfThisWeek
      }).length
      
      const lastWeekCount = items.filter((item) => {
        const dateValue = dateField === 'datePostulation' ? item.datePostulation : item.createdAt
        if (!dateValue) return false
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return false
        return date >= startOfLastWeek && date <= endOfLastWeek
      }).length
      
      // Logs pour déboguer
      if (dateField === 'createdAt') {
        console.log('📧 Calcul stats messages:', {
          totalItems: items.length,
          thisWeekCount,
          lastWeekCount,
          startOfThisWeek: startOfThisWeek.toISOString(),
          endOfThisWeek: endOfThisWeek.toISOString(),
          startOfLastWeek: startOfLastWeek.toISOString(),
          endOfLastWeek: endOfLastWeek.toISOString(),
        })
      }
      
      let variation = 0
      let isPositive = true
      
      if (lastWeekCount > 0) {
        // Calcul normal : (cette semaine - semaine dernière) / semaine dernière * 100
        variation = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
        isPositive = variation >= 0
      } else if (thisWeekCount > 0 && lastWeekCount === 0) {
        // Si la semaine dernière était à 0 et cette semaine > 0, c'est une augmentation de 100%
        variation = 100
        isPositive = true
      } else if (thisWeekCount === 0 && lastWeekCount > 0) {
        // Si cette semaine est à 0 et la semaine dernière > 0, c'est une baisse de 100%
        variation = -100
        isPositive = false
      } else {
        // Les deux semaines sont à 0, pas de variation
        variation = 0
        isPositive = true
      }
      
      // Formater avec le signe : positif avec +, négatif avec -
      const variationText = variation > 0 
        ? `+${variation.toFixed(1)}` 
        : variation < 0 
        ? `${variation.toFixed(1)}` 
        : '0.0'
      
      return {
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        variation: variationText,
        isPositive: isPositive,
      }
    }
  }, [])

  // Calcul des candidatures de cette semaine et variation
  const weeklyStats = useMemo(() => {
    return calculateWeeklyStats(candidaturesArray, 'datePostulation')
  }, [candidaturesArray, calculateWeeklyStats])

  // Calcul des messages de contact de cette semaine et variation
  const contactMessagesWeeklyStats = useMemo(() => {
    const stats = calculateWeeklyStats(contactMessages, 'createdAt')
    console.log('📧 Stats messages calculées:', stats)
    return stats
  }, [contactMessages, calculateWeeklyStats])

  return (
    <div className="min-h-screen bg-sil-dark relative">
      <section
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage: `url(${hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A1A1A]" />

        <div
          className="relative z-10 w-[90%] max-w-[1200px] mx-auto pt-20 pb-20"
        >
          <div className="max-w-6xl mx-auto">
            {/* Header + barre de titre "TABLEAU DE BORD" + profil à droite */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ marginTop: '100px' }}
            >
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Bouton Menu Hamburger Mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 bg-[#297BFF]/20 backdrop-blur-sm rounded border border-[#297BFF]/30 text-white hover:bg-[#297BFF]/30 transition-all duration-300 flex-shrink-0"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" strokeWidth={1} />
                </button>
                <h1
                  className="text-sil-white text-2xl md:text-[32px]"
                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 'clamp(24px, 5vw, 32px)', letterSpacing: '0.08em' }}
                >
                  {t.dashboardTitle}
                </h1>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right hidden sm:block">
                  <p
                    className="text-sil-white"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {adminName || 'SIL TALENTS TECH'}
                  </p>
                  <p
                    style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '12px', color: '#999999' }}
                  >
                    {t.admin}
                  </p>
                </div>
                <div className="hidden md:flex w-10 h-10 rounded-full bg-[#D9D9D9] items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src="/assets/Images/LogoAdmin.jpg"
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-0 min-h-screen relative">
              {/* Overlay pour mobile */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                )}
              </AnimatePresence>

              {/* Sidebar */}
              <motion.div
                initial={false}
                animate={{
                  x: isMobileMenuOpen ? 0 : -280,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed lg:static w-[260px] flex-shrink-0 z-40 h-full lg:h-auto lg:translate-x-0 lg:!translate-x-0"
              >
                <div className="bg-black/90 backdrop-blur-sm rounded-none shadow-lg pt-20 px-4 pr-0 space-y-2 border border-white/10 flex flex-col h-full relative pb-20">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'dashboard'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <RiGalleryView2 className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} />
                    <span>{t.tabs.dashboard}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('candidates')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'candidates'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <Users className={`w-5 h-5 ${activeTab === 'candidates' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} strokeWidth={1} />
                    <span>{t.tabs.candidates}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('statistics')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'statistics'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <BarChart3 className={`w-5 h-5 ${activeTab === 'statistics' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} strokeWidth={1} />
                    <span>{t.tabs.statistics}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('companyMessages')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'companyMessages'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <Briefcase className={`w-5 h-5 ${activeTab === 'companyMessages' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} strokeWidth={1} />
                    <span>{t.tabs.companyMessages}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('settings')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'settings'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} strokeWidth={1} />
                    <span>{t.tabs.settings}</span>
                  </button>
                  
                  {/* Bouton de déconnexion - dans le flux sur mobile, position absolue sur desktop */}
                  <button
                    onClick={handleLogout}
                    className="lg:hidden w-full flex items-center space-x-3 px-4 py-3 rounded-none text-[#999999] hover:bg-black/60 transition-colors"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <LogOut className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                    <span>{t.logout}</span>
                  </button>
                  
                  {/* Bouton de déconnexion desktop - position absolue */}
                  <div className="hidden lg:block absolute left-0 right-0 bottom-20 pt-4 px-4 pr-0">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-none text-[#999999] hover:bg-black/60 transition-colors"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                    >
                      <LogOut className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                  
                  {/* Bouton fermer sur mobile */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded transition-colors"
                    aria-label={t.closeMenu}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* Content principal */}
              <div className="flex-1 min-w-0 p-4 lg:p-6 min-h-screen bg-black/30 lg:ml-0 ml-0">
                <AnimatePresence mode="wait">
                  {/* Dashboard - Affiché quand "Tableau de bord" est sélectionné */}
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 pt-20 pb-20"
                    >
                    {/* Message de bienvenue */}
                    <h2
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: 'clamp(24px, 3vw, 32px)',
                        lineHeight: '1.2',
                        marginBottom: '20px',
                      }}
                    >
                      {t.greeting(adminName || 'SIL TALENTS TECH')}
                    </h2>

                    {/* Cartes de statistiques */}
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                      <div className="p-3 md:p-6 border border-[#99999924] rounded-none text-white flex items-center justify-between gap-2" style={{ backgroundColor: '#0000006B', minHeight: 'clamp(100px, 20vh, 120px)' }}>
                        <div className="flex flex-col items-start justify-center flex-1 min-w-0">
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              fontStyle: 'normal',
                              fontSize: 'clamp(20px, 6vw, 32px)',
                              textTransform: 'capitalize',
                              color: '#FFFFFF',
                              marginBottom: '4px',
                            }}
                          >
                            {stats.totalCandidates.toLocaleString()}
                          </p>
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontStyle: 'normal',
                              fontSize: 'clamp(12px, 3vw, 20px)',
                              color: '#999999',
                            }}
                          >
                            {t.stats.totalCandidates}
                          </p>
                        </div>
                        <Users className="flex-shrink-0" style={{ width: 'clamp(24px, 5vw, 36px)', height: 'clamp(24px, 5vw, 36px)', color: '#297BFF' }} strokeWidth={1} />
            </div>

                      <div className="p-3 md:p-6 border border-[#99999924] rounded-none text-white flex items-center justify-between gap-2" style={{ backgroundColor: '#0000006B', minHeight: 'clamp(100px, 20vh, 120px)' }}>
                        <div className="flex flex-col items-start justify-center flex-1 min-w-0">
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              fontStyle: 'normal',
                              fontSize: 'clamp(20px, 6vw, 32px)',
                              textTransform: 'capitalize',
                              color: '#FFFFFF',
                              marginBottom: '4px',
                            }}
                          >
                            {stats.totalCvs.toLocaleString()}
                          </p>
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontStyle: 'normal',
                              fontSize: 'clamp(12px, 3vw, 20px)',
                              color: '#999999',
                            }}
                          >
                            {t.stats.totalCvs}
                          </p>
                        </div>
                        <FolderOpen className="flex-shrink-0" style={{ width: 'clamp(24px, 5vw, 36px)', height: 'clamp(24px, 5vw, 36px)', color: '#297BFF' }} strokeWidth={1} />
              </div>

                      <div className="p-3 md:p-6 border border-[#99999924] rounded-none text-white flex items-center justify-between gap-2" style={{ backgroundColor: '#0000006B', minHeight: 'clamp(100px, 20vh, 120px)' }}>
                        <div className="flex flex-col items-start justify-center flex-1 min-w-0">
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              fontStyle: 'normal',
                              fontSize: 'clamp(20px, 6vw, 32px)',
                              textTransform: 'capitalize',
                              color: '#FFFFFF',
                              marginBottom: '4px',
                            }}
                          >
                            {stats.syncedCvs.toLocaleString()}
                          </p>
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontStyle: 'normal',
                              fontSize: 'clamp(12px, 3vw, 20px)',
                              color: '#999999',
                            }}
                          >
                            {t.stats.syncedCvs}
                          </p>
                        </div>
                        <RefreshCw className="flex-shrink-0" style={{ width: 'clamp(24px, 5vw, 36px)', height: 'clamp(24px, 5vw, 36px)', color: '#297BFF' }} strokeWidth={1} />
            </div>

                      <div className="p-3 md:p-6 border border-[#99999924] rounded-none text-white flex items-center justify-between gap-2" style={{ backgroundColor: '#0000006B', minHeight: 'clamp(100px, 20vh, 120px)' }}>
                        <div className="flex flex-col items-start justify-center flex-1 min-w-0">
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              fontStyle: 'normal',
                              fontSize: 'clamp(20px, 6vw, 32px)',
                              textTransform: 'capitalize',
                              color: '#FFFFFF',
                              marginBottom: '4px',
                            }}
                          >
                            {stats.failedSyncs.toLocaleString()}
                          </p>
                          <p
                            className="truncate w-full"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontStyle: 'normal',
                              fontSize: 'clamp(12px, 3vw, 20px)',
                              color: '#999999',
                            }}
                          >
                            {t.stats.pendingRequests}
                          </p>
                        </div>
                        <AlertCircle className="flex-shrink-0" style={{ width: 'clamp(24px, 5vw, 36px)', height: 'clamp(24px, 5vw, 36px)', color: '#297BFF' }} strokeWidth={1} />
              </div>
            </div>

                    {/* Section Graphique + Cartes de résumé */}
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch">
                      {/* Graphique en ligne - 70% de la largeur */}
                      <div className="w-full lg:w-[70%] p-4 md:p-5 border border-[#99999924] rounded-none text-white flex flex-col" style={{ backgroundColor: '#0000006B', minHeight: 'clamp(280px, 50vh, 380px)' }}>
            <div className="flex items-center justify-between mb-3">
                          <div>
                            <h2
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px', marginBottom: '2px' }}
                            >
                              {t.dashboard.statisticsTitle}
                            </h2>
                            <p
                              style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '12px', color: '#D9D9D9' }}
                            >
                              
                            </p>
                </div>
                <div className="relative">
                            <button
                              onClick={() => setChartPeriod(chartPeriod === 'mensuelle' ? 'hebdomadaire' : 'mensuelle')}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-black/60 hover:border-white/30 transition-all duration-200"
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px',color:'#999999' }}
                            >
                              {chartPeriod === 'mensuelle' ? t.dashboard.monthly : t.dashboard.weekly}
                              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1} />
                            </button>
            </div>
          </div>

                        {/* Graphique en ligne avec Recharts - Lazy loaded */}
                        <div className="flex-1 flex flex-col min-h-0 w-full" style={{ minHeight: '280px', height: '280px' }}>
                          <AdminLineChart 
                            data={chartData.map(item => ({ name: item.name, value: item.total }))} 
                            color="#297BFF"
                          />
                        </div>
              </div>

                      {/* Cartes de résumé - 30% de la largeur */}
                      <div className="lg:w-[30%] grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3 lg:space-y-3 lg:flex lg:flex-col">
                        {/* Carte 1: Vues d'emploi / Candidatures cette semaine */}
                        <div className="p-2.5 md:p-4 lg:p-5 border border-[#99999924] rounded-none text-white flex flex-col justify-between" style={{ backgroundColor: '#0000006B' }}>
                          {/* Titre et icône sur la même ligne */}
                          <div className="flex items-center justify-between mb-1.5 md:mb-3">
                            <p
                              className="truncate pr-2"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontStyle: 'normal',
                                fontSize: 'clamp(14px, 3vw, 20px)',
                                color: '#FFFFFF',
                              }}
                            >
                              {t.dashboard.applications}
                            </p>
                            <Eye className="flex-shrink-0" style={{ width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)', color: '#297BFF' }} strokeWidth={1} />
                          </div>

                          {/* Nombre en dessous */}
                          <p
                            className="truncate"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              fontStyle: 'normal',
                              fontSize: 'clamp(18px, 4vw, 28px)',
                              color: '#297BFF',
                              marginBottom: '4px',
                            }}
                          >
                            {weeklyStats.thisWeek.toLocaleString()}
                          </p>
                          
                          {/* Cette semaine et taux en bas */}
                          <div className="flex items-center justify-between gap-1 md:gap-2">
                            <span
                              className="truncate"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: 'clamp(12px, 3vw, 18px)',
                                color: '#999999',
                              }}
                            >
                              {t.dashboard.thisWeek}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: 'clamp(11px, 2.5vw, 13px)',
                                  color: weeklyStats.isPositive ? '#10B981' : '#EF4444',
                                }}
                              >
                                {weeklyStats.variation}%
                              </span>
                              {weeklyStats.isPositive ? (
                                <ArrowUp className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" style={{ color: '#10B981' }} strokeWidth={1} />
                              ) : (
                                <ArrowDown className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" style={{ color: '#EF4444' }} strokeWidth={1} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Carte 2: Messages de contact */}
                        <div className="p-2.5 md:p-4 lg:p-5 border border-[#99999924] rounded-none text-white flex flex-col justify-between" style={{ backgroundColor: '#0000006B' }}>
                          {/* Titre et icône sur la même ligne */}
                          <div className="flex items-center justify-between mb-1.5 md:mb-3">
                            <p
                              className="truncate pr-2"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontStyle: 'normal',
                                fontSize: 'clamp(14px, 3vw, 20px)',
                                color: '#FFFFFF',
                              }}
                            >
                              {t.dashboard.contactMessages}
                            </p>
                            <Briefcase className="flex-shrink-0" style={{ width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)', color: '#EC4899' }} strokeWidth={1} />
                          </div>
                          
                          {/* Nombre de messages de la semaine actuelle */}
                          <p
                            className="truncate"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              fontStyle: 'normal',
                              fontSize: 'clamp(18px, 4vw, 28px)',
                              color: '#EC4899',
                              marginBottom: '4px',
                            }}
                          >
                            {contactMessagesWeeklyStats.thisWeek.toLocaleString()}
                          </p>
                          
                          {/* Taux d'évolution en bas */}
                          <div className="flex items-center justify-between gap-1 md:gap-2">
                            <span
                              className="truncate"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: 'clamp(12px, 3vw, 18px)',
                                color: '#999999',
                              }}
                            >
                              Cette semaine
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: 'clamp(11px, 2.5vw, 13px)',
                                  color: contactMessagesWeeklyStats.isPositive ? '#10B981' : '#EF4444',
                                }}
                              >
                                {contactMessagesWeeklyStats.variation}%
                              </span>
                              {contactMessagesWeeklyStats.isPositive ? (
                                <ArrowUp className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" style={{ color: '#10B981' }} strokeWidth={1} />
                              ) : (
                                <ArrowDown className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" style={{ color: '#EF4444' }} strokeWidth={1} />
                              )}
                            </div>
                          </div>
                        </div>
              </div>
            </div>

                    {/* Barre de progression des candidatures */}
                    <div className="mt-8 p-6 border border-[#99999924] rounded-none" style={{ backgroundColor: '#0000006B' }}>
                      <h3 
                        className="mb-4 text-white"
                        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px' }}
                      >
                        {t.dashboard.applicationsSummary}
                      </h3>
                      
                      {/* Total */}
                      <div className="mb-6">
                        <span 
                          className="text-white"
                          style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '48px' }}
                        >
                          {candidatures.length.toLocaleString()}
                          </span>
                        <span 
                          className="ml-2 text-gray-400"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px' }}
                        >
                          {t.candidates.applications}
                          </span>
                      </div>

                      {/* Barre de progression */}
                      {(() => {
                        // Calculer les statistiques par type de mission
                        // Les valeurs dans la base sont : 'CDI', 'CDD', 'stage', 'freelance', 'autre'
                        const missionStats: Record<string, { count: number; label: string; color: string }> = {
                          'CDI': { count: 0, label: 'À temps plein', color: '#9333EA' }, // Violet
                          'CDD': { count: 0, label: 'À temps partiel', color: '#14B8A6' }, // Turquoise
                          'FREELANCE': { count: 0, label: 'À distance', color: '#297BFF' }, // Bleu
                          'STAGE': { count: 0, label: 'Stage', color: '#F97316' }, // Orange
                          'AUTRE': { count: 0, label: 'Contrat', color: '#EF4444' }, // Rouge-orange
                        }

                        // Compter les candidatures par type de mission
                        candidatures.forEach((candidature) => {
                          const type = candidature.typeDeMission
                          
                          if (type) {
                            // Normaliser le type (gérer majuscules et minuscules)
                            const normalizedType = type.trim().toUpperCase()
                            
                            // Mapper les valeurs de la base vers les clés unifiées
                            let mappedType = 'AUTRE'
                            if (normalizedType === 'CDI') {
                              mappedType = 'CDI'
                            } else if (normalizedType === 'CDD') {
                              mappedType = 'CDD'
                            } else if (normalizedType === 'FREELANCE') {
                              mappedType = 'FREELANCE'
                            } else if (normalizedType === 'STAGE') {
                              mappedType = 'STAGE'
                            } else {
                              // Type inconnu, ajouter à AUTRE
                              console.warn('⚠️ Type de mission inconnu:', normalizedType, 'ajouté à AUTRE')
                              mappedType = 'AUTRE'
                            }
                            
                            missionStats[mappedType].count++
                          } else {
                            // Pas de type défini, ajouter à AUTRE
                            console.log('⚠️ Candidature sans type de mission, ajoutée à AUTRE:', candidature.id)
                            missionStats['AUTRE'].count++
                          }
                        })

                        const total = candidatures.length
                        
                        // Créer le tableau final avec les statistiques (uniquement ceux qui ont des candidatures)
                        const statsArray = [
                          { key: 'CDI', stat: missionStats['CDI'] },
                          { key: 'CDD', stat: missionStats['CDD'] },
                          { key: 'FREELANCE', stat: missionStats['FREELANCE'] },
                          { key: 'STAGE', stat: missionStats['STAGE'] },
                          { key: 'AUTRE', stat: missionStats['AUTRE'] },
                        ].filter(({ stat }) => stat.count > 0)
                        
                        console.log('📊 Statistiques par type de mission:', {
                          totalCandidatures: total,
                          stats: statsArray.map(({ key, stat }) => ({ 
                            type: key, 
                            count: stat.count, 
                            label: stat.label,
                            percentage: total > 0 ? ((stat.count / total) * 100).toFixed(1) + '%' : '0%'
                          }))
                        })

                        if (total === 0) {
                          return (
                            <div className="text-center py-8">
                              <p className="text-gray-400" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}>
                                {t.candidates.noApplications}
                              </p>
                            </div>
                          )
                        }

                        return (
                          <div>
                            {/* Barre de progression */}
                            <div className="w-full rounded-none overflow-hidden flex mb-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', height: '10px' }}>
                              {statsArray.map(({ key, stat }) => {
                                const percentage = total > 0 ? (stat.count / total) * 100 : 0
                                return (
                                  <div
                                    key={key}
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: stat.color,
                                    }}
                                    className="h-full transition-all duration-300 hover:opacity-90"
                                  />
                                )
                              })}
                            </div>

                            {/* Légende */}
                            <div className="flex flex-wrap gap-6">
                              {statsArray.map(({ key, stat }) => (
                                <div key={key} className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-none"
                                    style={{ backgroundColor: stat.color }}
                                  />
                                  <span
                                    className="text-white"
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                  >
                                    {stat.label} : {stat.count}
                          </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                        </motion.div>
                  )}

                  {/* Liste Candidats */}
                  {activeTab === 'candidates' && (
                  <motion.div
                    key="candidates"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-20 pb-20"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h2
                        className="text-white"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: 'clamp(24px, 3vw, 32px)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {t.candidates.title}
                      </h2>
                      <div className="flex items-center gap-4">
                          <button
                          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                          className="flex items-center gap-2 text-white hover:text-[#297BFF] transition-colors"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                          >
                          {t.candidates.filter}
                          <Filter className={`w-4 h-4 transition-transform ${showAdvancedFilter ? 'rotate-180' : ''}`} />
                          </button>
                              <div className="relative sort-menu-container">
                              <button
                          onClick={() => setShowSortMenu(!showSortMenu)}
                          className="flex items-center gap-2 text-white hover:text-[#297BFF] transition-colors"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                              >
                          {t.candidates.sort}
                          <Filter className="w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                              </button>
                              
                              {/* Menu de tri */}
                              {showSortMenu && (
                                <div 
                                  className="absolute right-0 top-full mt-2 bg-black border border-[#297BFF] rounded-lg shadow-lg z-50 min-w-[250px] overflow-hidden"
                                  style={{ 
                                    backgroundColor: '#000000',
                                    borderTop: '2px solid #297BFF',
                                  }}
                                >
                                  {/* Titre */}
                                  <div className="px-4 py-3 border-b border-[#297BFF]/30">
                                    <h3
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                      }}
                                    >
                                      {t.candidates.sortTitle}
                                    </h3>
                                  </div>
                                  
                                  {/* Options */}
                                  <div className="py-2">
                                    {/* Option 1: Plus récentes */}
                                    <label
                                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/60 transition-colors"
                                      onClick={() => {
                                        setSortOrder('recent')
                                        setShowSortMenu(false)
                                      }}
                                    >
                                      <div className="relative">
                                        <input
                                          type="radio"
                                          name="sortOrder"
                                          value="recent"
                                          checked={sortOrder === 'recent'}
                                          onChange={() => {
                                            setSortOrder('recent')
                                            setShowSortMenu(false)
                                          }}
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            sortOrder === 'recent'
                                              ? 'border-[#297BFF] bg-[#297BFF]'
                                              : 'border-white'
                                          }`}
                                        >
                                          {sortOrder === 'recent' && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                          )}
                                        </div>
                                      </div>
                                      <span
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#FFFFFF',
                                        }}
                                      >
                                        {t.candidates.sortRecent}
                                      </span>
                                    </label>
                                    
                                    {/* Option 2: Plus anciennes */}
                                    <label
                                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/60 transition-colors"
                                      onClick={() => {
                                        setSortOrder('oldest')
                                        setShowSortMenu(false)
                                      }}
                                    >
                                      <div className="relative">
                                        <input
                                          type="radio"
                                          name="sortOrder"
                                          value="oldest"
                                          checked={sortOrder === 'oldest'}
                                          onChange={() => {
                                            setSortOrder('oldest')
                                            setShowSortMenu(false)
                                          }}
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            sortOrder === 'oldest'
                                              ? 'border-[#297BFF] bg-[#297BFF]'
                                              : 'border-white'
                                          }`}
                                        >
                                          {sortOrder === 'oldest' && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                          )}
                                        </div>
                                      </div>
                                      <span
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#FFFFFF',
                                        }}
                                      >
                                        {t.candidates.sortOldest}
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              )}
                              </div>
                        </div>
                    </div>

                    {/* Zone de filtrage avancée */}
                    <AnimatePresence>
                      {showAdvancedFilter && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-visible"
                        >
                          <div className="p-6 border border-[#99999924] rounded-none text-white mt-6 relative" style={{ backgroundColor: '#0000006B' }}>
                            
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Recherche par nom complet */}
                              <div>
                                <label
                                  className="block text-white mb-2"
                                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                >
                                  {t.candidates.searchName}
                                </label>
                                <div className="relative">
                                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                  <input
                                    type="text"
                                    value={filters.searchName}
                                    onChange={(e) => setFilters({ ...filters, searchName: e.target.value })}
                                    placeholder={t.candidates.searchName}
                                    className="w-full pl-12 pr-4 py-4 bg-black/50 focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all rounded-none placeholder:text-gray-500"
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.searchName ? '#FFFFFF' : '#999999' }}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                                </div>
                              </div>

                              {/* Filtre Source */}
                              <div>
                                <label
                                  className="block text-white mb-2"
                                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                >
                                  {t.candidates.source}
                                </label>
                                <div className="relative source-dropdown">
                                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                  <div
                                    onClick={() => {
                                      setIsSourceDropdownOpen(!isSourceDropdownOpen)
                                      setIsMissionTypeDropdownOpen(false)
                                      setIsGenderDropdownOpen(false)
                                    }}
                                    className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                      isSourceDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                    } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.source ? '#FFFFFF' : '#999999' }}
                                  >
                                    <span className="block">
                                      {filters.source ? (t.candidates.sourceLabels?.[filters.source as keyof typeof t.candidates.sourceLabels] || filters.source) : t.candidates.all}
                                    </span>
                                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isSourceDropdownOpen ? 'rotate-180' : ''}`} />
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                                  </div>
                                  
                                  {isSourceDropdownOpen && (
                                    <div className="absolute z-[100] w-full mt-0 bg-[#1A1A1A]  shadow-xl max-h-[300px] overflow-y-auto">
                                      <div className="px-4 py-2">
                                        <div
                                          onClick={() => {
                                            setFilters({ ...filters, source: '' })
                                            setIsSourceDropdownOpen(false)
                                          }}
                                          className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                            filters.source === '' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                                          }`}
                                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.source === '' ? '#297BFF' : '#999999' }}
                                        >
                                          {t.candidates.all}
                                        </div>
                                      </div>
                                      {filterOptions.sources.map((source) => (
                                        <div key={source} className="px-4 py-2">
                                          <div
                                            onClick={() => {
                                              setFilters({ ...filters, source })
                                              setIsSourceDropdownOpen(false)
                                            }}
                                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                              filters.source === source ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                                            }`}
                                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.source === source ? '#297BFF' : '#999999' }}
                                          >
                                            {t.candidates.sourceLabels?.[source as keyof typeof t.candidates.sourceLabels] || source}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Filtre Type de mission */}
                              <div>
                                <label
                                  className="block text-white mb-2"
                                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                >
                                  {t.candidates.missionTypeFilter}
                                </label>
                                <div className="relative mission-type-dropdown">
                                  <ClipboardList className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                  <div
                                    onClick={() => {
                                      setIsMissionTypeDropdownOpen(!isMissionTypeDropdownOpen)
                                      setIsSourceDropdownOpen(false)
                                      setIsGenderDropdownOpen(false)
                                    }}
                                    className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                      isMissionTypeDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                    } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.missionType ? '#FFFFFF' : '#999999' }}
                                  >
                                    <span className="block">
                                      {filters.missionType || t.candidates.all}
                                    </span>
                                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isMissionTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                                  </div>
                                  
                                  {isMissionTypeDropdownOpen && (
                                    <div className="absolute z-[100] w-full mt-0 bg-[#1A1A1A]  shadow-xl max-h-[300px] overflow-y-auto">
                                      <div className="px-4 py-2">
                                        <div
                                          onClick={() => {
                                            setFilters({ ...filters, missionType: '' })
                                            setIsMissionTypeDropdownOpen(false)
                                          }}
                                          className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                            filters.missionType === '' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                                          }`}
                                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.missionType === '' ? '#297BFF' : '#999999' }}
                                        >
                                          {t.candidates.all}
                                        </div>
                                      </div>
                                      {Array.from(new Set(candidates.map(c => c.typeDeMissionSouhaite).filter((v): v is string => Boolean(v)))).map((type) => (
                                        <div key={type} className="px-4 py-2">
                                          <div
                                            onClick={() => {
                                              setFilters({ ...filters, missionType: type })
                                              setIsMissionTypeDropdownOpen(false)
                                            }}
                                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                              filters.missionType === type ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                                            }`}
                                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.missionType === type ? '#297BFF' : '#999999' }}
                                          >
                                            {type}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Filtre Genre */}
                              <div>
                                <label
                                  className="block text-white mb-2"
                                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                >
                                  {t.candidates.gender}
                                </label>
                                <div className="relative gender-dropdown">
                                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                  <div
                                    onClick={() => {
                                      setIsGenderDropdownOpen(!isGenderDropdownOpen)
                                      setIsSourceDropdownOpen(false)
                                      setIsMissionTypeDropdownOpen(false)
                                    }}
                                    className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                      isGenderDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                    } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.gender ? '#FFFFFF' : '#999999' }}
                                  >
                                    <span className="block">
                                      {filters.gender || t.candidates.all}
                                    </span>
                                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${isGenderDropdownOpen ? 'rotate-180' : ''}`} />
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]"></div>
                                  </div>
                                  
                                  {isGenderDropdownOpen && (
                                    <div className="absolute z-[100] w-full mt-0 bg-[#1A1A1A]  shadow-xl max-h-[300px] overflow-y-auto">
                                      <div className="px-4 py-2">
                                        <div
                                          onClick={() => {
                                            setFilters({ ...filters, gender: '' })
                                            setIsGenderDropdownOpen(false)
                                          }}
                                          className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                            filters.gender === '' ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                                          }`}
                                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.gender === '' ? '#297BFF' : '#999999' }}
                                        >
                                          {t.candidates.all}
                                        </div>
                                      </div>
                                      {filterOptions.genders.map((gender) => (
                                        <div key={gender} className="px-4 py-2">
                                          <div
                                            onClick={() => {
                                              setFilters({ ...filters, gender })
                                              setIsGenderDropdownOpen(false)
                                            }}
                                            className={`px-4 py-3 cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02] ${
                                              filters.gender === gender ? 'bg-[#297BFF]/20 text-[#297BFF]' : 'bg-[#2A2A2A]'
                                            }`}
                                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: filters.gender === gender ? '#297BFF' : '#999999' }}
                                          >
                                            {gender}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex items-center gap-4 mt-6">
                              <button
                                onClick={async () => {
                                  setFilters({
                                    searchName: '',
                                    source: '',
                                    missionType: '',
                                    gender: '',
                                  })
                                  setIsSourceDropdownOpen(false)
                                  setIsMissionTypeDropdownOpen(false)
                                  setIsGenderDropdownOpen(false)
                                  
                                  // Recharger tous les candidats sans filtres
                                  setIsLoading(true)
                                  try {
                                    const response = await api.get('/admin/candidates', {
                                      params: {
                                        page: 1,
                                        limit: candidatesPerPage,
                                      },
                                    })
                                    const payload = response.data?.data ?? response.data
                                    const list = payload?.data ?? payload
                                    const total = payload?.total ?? 0
                                    const totalPagesCount = payload?.totalPages ?? Math.ceil(total / candidatesPerPage)
                                    
                                    setCandidates(Array.isArray(list) ? list : [])
                                    setTotalCandidates(total)
                                    setTotalPages(totalPagesCount)
                                    setCurrentPage(1)
                                  } catch (error: any) {
                                    if (error.response?.status === 401) {
                                      toast.error('Session expirée. Veuillez vous reconnecter.')
                                      router.push('/admin/login')
                                    }
                                  } finally {
                                    setIsLoading(false)
                                  }
                                }}
                                className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 transition-colors"
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                              >
                                {t.candidates.resetFilters}
                              </button>
                              <button
                                onClick={() => setShowAdvancedFilter(false)}
                                className="px-6 py-2 bg-[#297BFF] text-white hover:bg-[#1f63d6] transition-colors"
                                style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}
                              >
                                {t.candidates.applyFilters}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Grille de candidats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sortedCandidates.map((candidate) => {
                        // Récupérer le dernier CV (le plus récent)
                        const latestCv = candidate.cvHistories && candidate.cvHistories.length > 0 
                          ? candidate.cvHistories[candidate.cvHistories.length - 1]
                          : null
                        const experienceYears = candidate.cvHistories?.length || 0
                        const createdAt = new Date(candidate.createdAt)
                        const formattedDate = createdAt.toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })

                        return (
                          <div
                            key={candidate.id}
                            className="p-6 border border-[#99999924] rounded-none text-white"
                            style={{ backgroundColor: '#0000006B' }}
                          >
                            {/* Header de la carte */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                {/* Photo de profil */}
                                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: candidate.profilePhotoUrl ? 'transparent' : '#D9D9D9' }}>
                                  {candidate.profilePhotoUrl ? (
                                    <img
                                      src={candidate.profilePhotoUrl}
                                      alt={`${candidate.firstName} ${candidate.lastName}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      {candidate.firstName ? (
                                        <span
                                          style={{
                                            fontFamily: 'Inter',
                                            fontWeight: 600,
                                            fontSize: '24px',
                                            color: '#2A2A2A',
                                          }}
                                        >
                                          {candidate.firstName.charAt(0).toUpperCase()}
                                          {candidate.lastName?.charAt(0).toUpperCase() || ''}
                          </span>
                                      ) : (
                                        <Users className="w-8 h-8 text-[#2A2A2A]" />
                                      )}
            </div>
                                  )}
          </div>
                                
                                {/* Séparateur vertical */}
                                
                                
                                {/* Nom et jobTitle */}
                                <div className="flex-1">
                                  <h3
                                    className="text-white mb-1"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 500,
                                      fontStyle: 'normal',
                                      fontSize: '20px',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {candidate.firstName} {candidate.lastName}
                                  </h3>
                                  {candidate.jobTitle && (
                                    <p
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontStyle: 'normal',
                                        fontSize: '16px',
                                        color: '#A9ACB4',
                                      }}
                                    >
                                      {candidate.jobTitle}
                                    </p>
                                  )}
        </div>
                              </div>
                              <button
                                onClick={() => handleViewCandidateDetails(candidate)}
                                className="text-[#297BFF] hover:text-[#1f63d6] transition-colors flex items-center justify-center"
                              >
                                <HiMiniArrowsPointingOut style={{ width: '28px', height: '28px' }} />
                              </button>
                            </div>

                            {/* Séparateur horizontal */}
                            <div className="h-px bg-[#99999924] mb-4" />

                            {/* Informations en liste */}
                            <ul className="space-y-2 mb-6 list-none">
                              <li className="flex items-center">
                                <span className="text-[#999999] mr-2 flex-shrink-0" style={{ fontSize: '8px', lineHeight: '14px' }}>•</span>
                                <p
                                  className="text-white"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                    lineHeight: '14px',
                                  }}
                                >
                                  {t.candidates.experience(experienceYears)}
                                </p>
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#999999] mr-2 flex-shrink-0" style={{ fontSize: '8px', lineHeight: '14px' }}>•</span>
                                <p
                                  className="text-white"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                    lineHeight: '14px',
                                  }}
                                >
                                  {t.candidates.missionType} {candidate.typeDeMissionSouhaite || t.candidates.missionTypeNotSpecified}
                                </p>
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#999999] mr-2 flex-shrink-0" style={{ fontSize: '8px', lineHeight: '14px' }}>•</span>
                                <p
                                  className="text-white"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                    lineHeight: '14px',
                                  }}
                                >
                                  {t.candidates.date} {formattedDate}
                                </p>
                              </li>
                            </ul>

                            {/* Bouton télécharger CV */}
                            {latestCv && (
                              <button
                                onClick={() => handleDownloadCv(latestCv.fileName)}
                                className="flex items-center gap-2 text-[#297BFF] hover:text-[#1f63d6] transition-colors"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 500,
                                  fontStyle: 'normal',
                                  fontSize: '18px',
                                  color: '#297BFF',
                                }}
                              >
                                <Download className="w-4 h-4" strokeWidth={1} />
                                {t.candidates.downloadCv}
                              </button>
                            )}
    </div>
  )
                      })}
                        </div>

                    {candidates.length === 0 && !isLoading && (
                      <div className="text-center py-12">
                        <p
                          className="text-gray-400"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '16px',
                          }}
                        >
                          {t.candidates.noCandidates}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                          onClick={() => {
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1)
                            }
                          }}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-2 px-4 py-2 rounded-none transition-colors ${
                            currentPage === 1
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-white hover:text-[#297BFF] hover:bg-black/60'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          <ChevronLeft className="w-4 h-4" strokeWidth={1} />
                          {t.candidates.previous}
                        </button>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Afficher seulement les pages proches de la page actuelle
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1 rounded-none transition-colors ${
                                    currentPage === page
                                      ? 'bg-[#297BFF] text-white'
                                      : 'text-white hover:bg-black/60'
                                  }`}
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                  }}
                                >
                                  {page}
                                </button>
                              )
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span
                                  key={page}
                                  className="text-white"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                  }}
                                >
                                  ...
                                </span>
                              )
                            }
                            return null
                          })}
            </div>

                        <button
                          onClick={() => {
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1)
                            }
                          }}
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-2 px-4 py-2 rounded-none transition-colors ${
                            currentPage === totalPages
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-white hover:text-[#297BFF] hover:bg-black/60'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          {t.candidates.next}
                          <ChevronRight className="w-4 h-4" strokeWidth={1} />
                        </button>
          </div>
                    )}

                    {/* Info pagination */}
                    {totalCandidates > 0 && (
                      <div className="text-center mt-4">
                        <p
                          className="text-gray-400"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          {t.candidates.pagination(((currentPage - 1) * candidatesPerPage) + 1, Math.min(currentPage * candidatesPerPage, totalCandidates), totalCandidates)}
                        </p>
        </div>
                    )}
    </motion.div>
                )}

                {/* Section Statistiques Avancées */}
                {activeTab === 'statistics' && (
                  <motion.div
                    key="statistics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-20 pb-20"
                  >
                    {/* Titre de la section */}
                    <h2
                      className="text-white mb-6"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: 'clamp(24px, 3vw, 32px)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {t.tabs.statistics}
                    </h2>

                    {isLoadingAdvancedStats ? (
                      <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-[#297BFF] animate-spin" strokeWidth={1} />
                      </div>
                    ) : advancedStats ? (
                      <>
                        {/* 1. Statistiques Globales */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                          <div className="p-4 md:p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                              <h3 className="text-white truncate pr-2" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 'clamp(12px, 2.5vw, 16px)' }}>
                                Total Candidats
                              </h3>
                              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#297BFF] flex-shrink-0" strokeWidth={1} />
                            </div>
                            <p className="text-[#297BFF] truncate" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(20px, 5vw, 32px)' }}>
                              {advancedStats.global?.totalCandidates?.toLocaleString() || 0}
                            </p>
                          </div>

                          <div className="p-4 md:p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                              <h3 className="text-white truncate pr-2" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 'clamp(12px, 2.5vw, 16px)' }}>
                                Catégories Disponibles
                              </h3>
                              <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-[#EC4899] flex-shrink-0" strokeWidth={1} />
                            </div>
                            <p className="text-[#EC4899] truncate" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(20px, 5vw, 32px)' }}>
                              {advancedStats.global?.totalCategories || 0}
                            </p>
                          </div>

                          <div className="p-4 md:p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                              <h3 className="text-white truncate pr-2" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 'clamp(12px, 2.5vw, 16px)' }}>
                                Candidatures Aujourd&apos;hui
                              </h3>
                              <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#10B981] flex-shrink-0" strokeWidth={1} />
                            </div>
                            <p className="text-[#10B981] truncate" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(20px, 5vw, 32px)' }}>
                              {advancedStats.global?.candidaturesByPeriod?.today || 0}
                            </p>
                          </div>

                          <div className="p-4 md:p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                              <h3 className="text-white truncate pr-2" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 'clamp(12px, 2.5vw, 16px)' }}>
                                Candidatures Ce Mois
                              </h3>
                              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-[#F97316] flex-shrink-0" strokeWidth={1} />
                            </div>
                            <p className="text-[#F97316] truncate" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(20px, 5vw, 32px)' }}>
                              {advancedStats.global?.candidaturesByPeriod?.thisMonth || 0}
                            </p>
                          </div>
                        </div>

                        {/* 2. Statistiques par Catégorie */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                          <div className="p-4 md:p-6 border border-[#99999924] rounded-none text-white overflow-hidden" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-3 md:mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(16px, 3vw, 20px)' }}>
                              Candidatures par Catégorie
                            </h3>
                            {advancedStats.byCategory && advancedStats.byCategory.length > 0 && advancedStats.byCategory.some((cat: any) => cat.count > 0) ? (
                              <div className="w-full overflow-hidden">
                                <AdminPieChart 
                                  data={advancedStats.byCategory
                                    .filter((cat: any) => cat.count > 0)
                                    .map((cat: any, index: number) => ({
                                      name: cat.name,
                                      value: cat.count,
                                      color: ['#297BFF', '#EC4899', '#10B981', '#F97316', '#9333EA', '#EF4444'][index % 6]
                                    }))} 
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                <BarChart3 className="w-16 h-16 mb-4 opacity-50" strokeWidth={1} />
                                <p className="text-sm md:text-base">Aucune candidature par catégorie</p>
                                <p className="text-xs md:text-sm mt-2 text-center px-2">Les données apparaîtront ici une fois des candidatures enregistrées</p>
                              </div>
                            )}
                          </div>

                          <div className="p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                              Pourcentage par Catégorie
                            </h3>
                            <div className="space-y-3">
                              {advancedStats.byCategory && advancedStats.byCategory.length > 0 ? (
                                advancedStats.byCategory.map((cat: any, index: number) => (
                                  <div key={cat.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                        {cat.name}
                                      </span>
                                      <span className="text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px' }}>
                                        {cat.percentage}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                      <div 
                                        className="h-2 rounded-full transition-all"
                                        style={{ 
                                          width: `${Math.max(cat.percentage, 0)}%`,
                                          backgroundColor: ['#297BFF', '#EC4899', '#10B981', '#F97316'][index % 4]
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                  <p>Aucune catégorie disponible</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. Statistiques d'Activité */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                              Candidatures par Heure
                            </h3>
                            {advancedStats.activity?.candidaturesByHour && advancedStats.activity.candidaturesByHour.length > 0 && advancedStats.activity.candidaturesByHour.some((item: any) => item.count > 0) ? (
                              <AdminLineChart 
                                data={advancedStats.activity.candidaturesByHour.map((item: any) => ({
                                  name: `${item.hour}h`,
                                  value: item.count
                                }))}
                                color="#297BFF"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                <BarChart3 className="w-16 h-16 mb-4 opacity-50" strokeWidth={1} />
                                <p>Aucune activité par heure</p>
                                <p className="text-sm mt-2 text-center">Les données apparaîtront ici une fois des candidatures enregistrées</p>
                              </div>
                            )}
                          </div>

                          <div className="p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                              Nouveaux vs Anciens Candidats
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-[#297BFF]/10 rounded">
                                <span className="text-white" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                                  Nouveaux (6 derniers mois)
                                </span>
                                <span className="text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '24px' }}>
                                  {advancedStats.activity?.newVsOldCandidates?.new || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-[#EC4899]/10 rounded">
                                <span className="text-white" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                                  Anciens
                                </span>
                                <span className="text-[#EC4899]" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '24px' }}>
                                  {advancedStats.activity?.newVsOldCandidates?.old || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. Statistiques de Suivi */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                              Statut des Candidatures
                            </h3>
                            {advancedStats.tracking?.byStatus && advancedStats.tracking.byStatus.length > 0 && advancedStats.tracking.byStatus.some((status: any) => status.count > 0) ? (
                              <AdminPieChart 
                                data={advancedStats.tracking.byStatus
                                  .filter((status: any) => status.count > 0)
                                  .map((status: any, index: number) => ({
                                    name: status.status === 'en_attente' ? 'En attente' :
                                          status.status === 'en_cours' ? 'En cours' :
                                          status.status === 'accepte' ? 'Accepté' :
                                          status.status === 'refuse' ? 'Refusé' : status.status,
                                    value: status.count,
                                    color: status.status === 'accepte' ? '#10B981' :
                                           status.status === 'refuse' ? '#EF4444' :
                                           status.status === 'en_cours' ? '#297BFF' : '#999999'
                                  }))} 
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                <CheckCircle className="w-16 h-16 mb-4 opacity-50" strokeWidth={1} />
                                <p>Aucun statut de candidature</p>
                                <p className="text-sm mt-2 text-center">Les données apparaîtront ici une fois des candidatures traitées</p>
                              </div>
                            )}
                          </div>

                          <div className="p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                              Temps Moyen de Traitement
                            </h3>
                            <div className="flex items-center justify-center h-[300px]">
                              <div className="text-center">
                                <p className="text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '48px' }}>
                                  {advancedStats.tracking?.avgProcessingTimeDays || 0}
                                </p>
                                <p className="text-gray-400 mt-2" style={{ fontFamily: 'Inter', fontSize: '18px' }}>
                                  jours
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 5. Statistiques par Localisation */}
                        {advancedStats.location && advancedStats.location.length > 0 && (
                          <div className="p-6 border border-[#99999924] rounded-none text-white" style={{ backgroundColor: '#0000006B' }}>
                            <h3 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                              Candidatures par Localisation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {advancedStats.location.map((loc: any, index: number) => (
                                <div key={loc.location} className="p-4 bg-black/50 rounded">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                    <span className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                      {loc.location}
                                    </span>
                                  </div>
                                  <p className="text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '20px' }}>
                                    {loc.count}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                          Aucune statistique disponible
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Section Messages Entreprises */}
                {activeTab === 'companyMessages' && (
                  <motion.div
                    key="companyMessages"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-20 pb-20"
                  >
                    {/* Titre */}
                    <h2
                      className="text-white mb-6"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: 'clamp(24px, 3vw, 32px)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {t.tabs.companyMessages}
                    </h2>

                    {isLoadingCompanyRequests ? (
                      <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-[#297BFF] animate-spin" strokeWidth={1} />
                      </div>
                    ) : companyRequests.length === 0 ? (
                      <div className="text-center py-20">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                          Aucun message entreprise pour le moment
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Zone de filtres */}
                        <div className="p-6 border border-[#99999924] rounded-none text-white mb-6" style={{ backgroundColor: '#0000006B' }}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Filtre Nom entreprise */}
                            <div>
                              
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                <input
                                  type="text"
                                  value={companyRequestFilters.company}
                                  onChange={(e) => setCompanyRequestFilters({ ...companyRequestFilters, company: e.target.value })}
                                  placeholder="Rechercher par entreprise..."
                                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#99999924] focus:outline-none focus:ring-2 focus:ring-[#297BFF] text-white rounded-none"
                                  style={{ fontFamily: 'Inter', fontSize: '14px' }}
                                />
                              </div>
                            </div>

                            {/* Filtre Email */}
                            <div>
                              
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                <input
                                  type="text"
                                  value={companyRequestFilters.email}
                                  onChange={(e) => setCompanyRequestFilters({ ...companyRequestFilters, email: e.target.value })}
                                  placeholder="Rechercher par email..."
                                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#99999924] focus:outline-none focus:ring-2 focus:ring-[#297BFF] text-white rounded-none"
                                  style={{ fontFamily: 'Inter', fontSize: '14px' }}
                                />
                              </div>
                            </div>

                            {/* Filtre Urgence */}
                            <div>
                             
                              <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                <select
                                  value={companyRequestFilters.urgency}
                                  onChange={(e) => setCompanyRequestFilters({ ...companyRequestFilters, urgency: e.target.value })}
                                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#99999924] focus:outline-none focus:ring-2 focus:ring-[#297BFF] text-white rounded-none appearance-none cursor-pointer"
                                  style={{ fontFamily: 'Inter', fontSize: '14px' }}
                                >
                                  <option value="">Toutes les urgences</option>
                                  <option value="low">Faible</option>
                                  <option value="medium">Moyenne</option>
                                  <option value="high">Élevée</option>
                                  <option value="urgent">Urgente</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Bouton Réinitialiser */}
                          {(companyRequestFilters.company || companyRequestFilters.email || companyRequestFilters.urgency) && (
                            <div className="mt-4">
                              <button
                                onClick={() => setCompanyRequestFilters({ company: '', email: '', urgency: '' })}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded-none"
                                style={{ fontFamily: 'Inter', fontSize: '14px' }}
                              >
                                Réinitialiser les filtres
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Tableau des messages */}
                        <div className="border border-[#99999924] rounded-none overflow-hidden" style={{ backgroundColor: '#0000006B' }}>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-[#99999924]">
                                  <th className="px-4 py-3 text-left text-gray-400" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                                    Contact
                                  </th>
                                  <th className="px-4 py-3 text-left text-gray-400" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                                    Email
                                  </th>
                                  <th className="px-4 py-3 text-left text-gray-400" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                                    Entreprise
                                  </th>
                                  <th className="px-4 py-3 text-left text-gray-400" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                                    Urgence
                                  </th>
                                  <th className="px-4 py-3 text-left text-gray-400" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const filteredRequests = companyRequests.filter((request) => {
                                    const matchesCompany = !companyRequestFilters.company || 
                                      request.company.toLowerCase().includes(companyRequestFilters.company.toLowerCase())
                                    const matchesEmail = !companyRequestFilters.email || 
                                      request.email.toLowerCase().includes(companyRequestFilters.email.toLowerCase())
                                    const matchesUrgency = !companyRequestFilters.urgency || 
                                      request.urgency === companyRequestFilters.urgency
                                    return matchesCompany && matchesEmail && matchesUrgency
                                  })
                                  
                                  return filteredRequests.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                        Aucun message ne correspond aux filtres
                                      </td>
                                    </tr>
                                  ) : (
                                    filteredRequests.map((request) => (
                                      <motion.tr
                                        key={request.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => {
                                          setSelectedCompanyRequest(request)
                                          setShowCompanyRequestDetails(true)
                                        }}
                                        className="border-b border-[#99999924] hover:bg-[#297BFF]/10 cursor-pointer transition-colors"
                                      >
                                        <td className="px-4 py-3 text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                          {request.contactPerson}
                                        </td>
                                        <td className="px-4 py-3 text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                          {request.email}
                                        </td>
                                        <td className="px-4 py-3 text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                          {request.company}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`${
                                            request.urgency === 'urgent' ? 'text-red-400' :
                                            request.urgency === 'high' ? 'text-orange-400' :
                                            request.urgency === 'medium' ? 'text-yellow-400' : 'text-green-400'
                                          }`} style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                                            {request.urgency === 'low' ? 'Faible' :
                                             request.urgency === 'medium' ? 'Moyenne' :
                                             request.urgency === 'high' ? 'Élevée' : 'Urgente'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                                          {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          })}
                                        </td>
                                      </motion.tr>
                                    ))
                                  )
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Section Paramètres */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8 pt-20 pb-20"
                    style={{ width: '90%', margin: '0 auto' }}
                  >
                    {/* Titre */}
                    <h2 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: 'clamp(24px, 3vw, 32px)',
                        lineHeight: '1.2',
                      }}
                    >
                      {t.settings.title}
                    </h2>

                    {/* Section modifier mon mot de passe */}
                    <div className="space-y-4">
                      <h3
                        className="text-white"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 600,
                          fontSize: '18px',
                        }}
                      >
                        {t.settings.changePassword}
                      </h3>

                      {/* Mot de passe actuel */}
                      <div className="relative">
                        <LockKeyhole className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                        <input
                          type={passwordVisibility.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          className="w-full pl-12 pr-12 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                          placeholder={t.settings.currentPassword}
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, current: !prev.current }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          {passwordVisibility.current ? (
                            <EyeOff className="w-5 h-5" strokeWidth={1} />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Nouveau mot de passe */}
                      <div className="relative">
                        <LockKeyhole className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                        <input
                          type={passwordVisibility.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          }
                          className="w-full pl-12 pr-12 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                          placeholder={t.settings.newPassword}
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, new: !prev.new }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          {passwordVisibility.new ? (
                            <EyeOff className="w-5 h-5" strokeWidth={1} />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Confirmer le mot de passe */}
                      <div className="relative">
                        <LockKeyhole className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                        <input
                          type={passwordVisibility.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          }
                          className="w-full pl-12 pr-12 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                          placeholder={t.settings.confirmPassword}
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          {passwordVisibility.confirm ? (
                            <EyeOff className="w-5 h-5" strokeWidth={1} />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isSavingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="mt-2 w-full md:w-auto bg-[#297BFF] text-white py-3 px-8 hover:bg-[#297BFF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '14px',
                        }}
                      >
                        {isSavingPassword ? t.settings.saving : t.settings.save}
                      </button>
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popup détails message entreprise */}
      <AnimatePresence>
        {showCompanyRequestDetails && selectedCompanyRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4"
            onClick={() => {
              setShowCompanyRequestDetails(false)
              setSelectedCompanyRequest(null)
            }}
          >
            <button
              onClick={() => {
                setShowCompanyRequestDetails(false)
                setSelectedCompanyRequest(null)
              }}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-[#297BFF] bg-[#1A1A1A] flex items-center justify-center hover:bg-[#297BFF] hover:border-[#297BFF] transition-colors z-20"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-[#297BFF]" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative border border-[#297BFF]/30 rounded-none shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col my-auto"
              style={{ backgroundColor: '#1A1A1A' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête */}
              <div className="p-6 border-b border-[#99999924]" style={{ backgroundColor: '#0000006B' }}>
                <h3 className="text-white mb-2" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '24px' }}>
                  Détails du message entreprise
                </h3>
                <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                  {selectedCompanyRequest.company}
                </p>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Informations de contact */}
                <div>
                  <h4 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px' }}>
                    Informations de contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Contact</p>
                        <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{selectedCompanyRequest.contactPerson}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#297BFF]" />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Email</p>
                        <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{selectedCompanyRequest.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Téléphone</p>
                        <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{selectedCompanyRequest.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations entreprise */}
                <div>
                  <h4 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px' }}>
                    Informations entreprise
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#297BFF]" />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Entreprise</p>
                        <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{selectedCompanyRequest.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#297BFF]" />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Taille</p>
                        <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                          {selectedCompanyRequest.companySize === 'small' ? '1-10 employés' :
                           selectedCompanyRequest.companySize === 'medium' ? '11-50 employés' :
                           selectedCompanyRequest.companySize === 'large' ? '51-200 employés' :
                           selectedCompanyRequest.companySize === 'enterprise' ? '200+ employés' : selectedCompanyRequest.companySize}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-[#297BFF]" />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Secteur</p>
                        <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
                          {selectedCompanyRequest.sector === 'tech' ? (lang === 'FR' ? 'Technologie' : 'Technology') :
                           selectedCompanyRequest.sector === 'finance' ? (lang === 'FR' ? 'Finance' : 'Finance') :
                           selectedCompanyRequest.sector === 'healthcare' ? (lang === 'FR' ? 'Santé' : 'Healthcare') :
                           selectedCompanyRequest.sector === 'retail' ? (lang === 'FR' ? 'Commerce de détail' : 'Retail') :
                           selectedCompanyRequest.sector === 'manufacturing' ? (lang === 'FR' ? 'Industrie' : 'Manufacturing') :
                           selectedCompanyRequest.sector === 'consulting' ? (lang === 'FR' ? 'Conseil' : 'Consulting') :
                           selectedCompanyRequest.sector === 'other' ? (lang === 'FR' ? 'Autre' : 'Other') : selectedCompanyRequest.sector}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-[#297BFF]" />
                      <div>
                        <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Urgence</p>
                        <p className={`${
                          selectedCompanyRequest.urgency === 'urgent' ? 'text-red-400' :
                          selectedCompanyRequest.urgency === 'high' ? 'text-orange-400' :
                          selectedCompanyRequest.urgency === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`} style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                          {selectedCompanyRequest.urgency === 'low' ? 'Faible' :
                           selectedCompanyRequest.urgency === 'medium' ? 'Moyenne' :
                           selectedCompanyRequest.urgency === 'high' ? 'Élevée' : 'Urgente'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                {(selectedCompanyRequest.position || selectedCompanyRequest.location) && (
                  <div>
                    <h4 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px' }}>
                      Informations supplémentaires
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCompanyRequest.position && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-[#297BFF]" />
                          <div>
                            <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Poste recherché</p>
                            <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{selectedCompanyRequest.position}</p>
                          </div>
                        </div>
                      )}
                      {selectedCompanyRequest.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-[#297BFF]" />
                          <div>
                            <p className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Localisation</p>
                            <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{selectedCompanyRequest.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <h4 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px' }}>
                    Message
                  </h4>
                  <div className="p-4 bg-black/30 rounded-none">
                    <p className="text-white" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '1.6' }}>
                      {selectedCompanyRequest.message}
                    </p>
                  </div>
                </div>

                {/* Statut et date */}
                <div className="flex items-center justify-between pt-4 border-t border-[#99999924]">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Statut:</span>
                    <span className={`px-3 py-1 rounded ${
                      selectedCompanyRequest.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                      selectedCompanyRequest.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                      selectedCompanyRequest.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`} style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 500 }}>
                      {selectedCompanyRequest.status === 'new' ? 'Nouveau' :
                       selectedCompanyRequest.status === 'in_progress' ? 'En cours' :
                       selectedCompanyRequest.status === 'contacted' ? 'Contacté' :
                       selectedCompanyRequest.status === 'closed' ? 'Fermé' : selectedCompanyRequest.status}
                    </span>
                  </div>
                  <span className="text-gray-400" style={{ fontFamily: 'Inter', fontSize: '12px' }}>
                    {new Date(selectedCompanyRequest.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup fiche candidat (détails) */}
      <AnimatePresence>
        {showCandidateDetails && selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4"
            onClick={handleCloseCandidateDetails}
          >
            {/* Bouton de fermeture rond à l'extérieur en haut à droite */}
            <button
              onClick={handleCloseCandidateDetails}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-[#297BFF] bg-[#1A1A1A] flex items-center justify-center hover:bg-[#297BFF] hover:border-[#297BFF] transition-colors z-20"
              aria-label={t.candidateDetails.close}
            >
              <X className="w-4 h-4 text-[#297BFF]" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative border border-[#297BFF]/30 rounded-none shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col my-auto"
              style={{
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(41, 123, 255, 0.2), 0 0 60px rgba(41, 123, 255, 0.3)',
                backgroundColor: '#1A1A1A',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de la popup */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-[#111827] relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#297BFF] to-transparent opacity-60" />
                <div className="flex items-center gap-4 md:gap-5">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: selectedCandidate.profilePhotoUrl ? 'transparent' : '#1F2933' }}
                  >
                    {selectedCandidate.profilePhotoUrl ? (
                      <img
                        src={selectedCandidate.profilePhotoUrl}
                        alt={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {selectedCandidate.firstName ? (
                          <span
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '20px',
                              color: '#E5E7EB',
                            }}
                          >
                            {selectedCandidate.firstName.charAt(0).toUpperCase()}
                            {selectedCandidate.lastName?.charAt(0).toUpperCase() || ''}
                          </span>
                        ) : (
                          <User className="w-7 h-7 text-[#E5E7EB]" />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: '22px',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </h3>
                    {selectedCandidate.jobTitle && (
                      <p
                        className="text-white/70"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '14px',
                        }}
                      >
                        {selectedCandidate.jobTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {selectedCandidate.phone && (
                    <a
                      href={`tel:${selectedCandidate.phone}`}
                      className="flex items-center gap-2 px-3 py-2 bg-[#297BFF] text-white text-xs md:text-sm hover:bg-[#1D4ED8] transition-colors rounded-none"
                      style={{ fontFamily: 'Inter', fontWeight: 500 }}
                    >
                      <Phone className="w-4 h-4" strokeWidth={1} />
                      {t.candidateDetails.call}
                    </a>
                  )}
                  {selectedCandidate.email && (
                    <a
                      href={`mailto:${selectedCandidate.email}`}
                      className="flex items-center gap-2 px-3 py-2 bg-[#297BFF] text-white text-xs md:text-sm hover:bg-[#1D4ED8] transition-colors rounded-none"
                      style={{ fontFamily: 'Inter', fontWeight: 500 }}
                    >
                      <Mail className="w-4 h-4" />
                      {t.candidateDetails.sendEmail}
                    </a>
                  )}
                </div>
              </div>

              {/* Contenu de la popup */}
              <div className="p-4 md:p-6 overflow-y-auto flex-1" style={{ backgroundColor: '#111827' }}>
                {/* Layout principal : Bio à gauche (~55%), Profil + CV à droite (~45%) */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Biographie */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-none py-4 md:py-6 md:w-[55%]"
                  >
                    <h4
                      className="text-white mb-3 capitalize"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontStyle: 'normal',
                        fontSize: '32px',
                        lineHeight: '23.29px',
                        letterSpacing: '0%',
                        textTransform: 'capitalize',
                      }}
                    >
                      {t.candidateDetails.biography}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        color: '#999999',
                      }}
                    >
                      {selectedCandidate.biography ||
                        t.candidateDetails.biographyDefault(selectedCandidate.jobTitle ?? null, selectedCandidate.source ?? null)}
                    </p>
                  </motion.div>

                  {/* Colonne droite (~45%) : PROFIL + CV empilés */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col gap-4 md:w-[45%]"
                  >
                    {/* PROFIL */}
                    <div
                      className="border border-white/10 rounded-none p-4 md:p-6 flex flex-col gap-3"
                      style={{ backgroundColor: '#0000006B' }}
                    >
                      {/* Grille 2 x 3 : icône en haut, titre, puis résultat */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-sm">
                        {/* Date de naissance */}
                        <div className="flex flex-col gap-1.5">
                          <MdOutlineCake className="w-6 h-6 text-[#297BFF]" />
                          <span className="text-white/60 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter' }}>{t.candidateDetails.dateOfBirth}</span>
                          <p className="text-white text-sm" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                            {selectedCandidate.dateOfBirth
                              ? new Date(selectedCandidate.dateOfBirth).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US')
                              : t.candidateDetails.notSpecifiedF}
                          </p>
                        </div>
                        {/* Nationalité */}
                        <div className="flex flex-col gap-1.5">
                          <FaRegFlag className="w-6 h-6 text-[#297BFF]" />
                          <span className="text-white/60 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter' }}>{t.candidateDetails.nationality}</span>
                          <p className="text-white text-sm" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                            {selectedCandidate.nationality || t.candidateDetails.notSpecifiedF}
                          </p>
                        </div>
                        {/* Statut marital */}
                        <div className="flex flex-col gap-1.5">
                          <MdOutlineViewKanban className="w-6 h-6 text-[#297BFF]" />
                          <span className="text-white/60 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter' }}>{t.candidateDetails.maritalStatus}</span>
                          <p className="text-white text-sm" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                            {selectedCandidate.maritalStatus || t.candidateDetails.notSpecified}
                          </p>
                        </div>
                        {/* Genre */}
                        <div className="flex flex-col gap-1.5">
                          <IoMdMale className="w-6 h-6 text-[#297BFF]" />
                          <span className="text-white/60 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter' }}>{t.candidateDetails.gender}</span>
                          <p className="text-white text-sm" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                            {selectedCandidate.gender || t.candidateDetails.notSpecified}
                          </p>
                        </div>
                        {/* Expérience */}
                        <div className="flex flex-col gap-1.5">
                          <PiStackSimpleLight className="w-6 h-6 text-[#297BFF]" />
                          <span className="text-white/60 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter' }}>{t.candidateDetails.experience}</span>
                          <p className="text-white text-sm" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                            {selectedCandidate.professionalExperience || t.candidateDetails.notSpecifiedF}
                          </p>
                        </div>
                        {/* Études / niveau */}
                        <div className="flex flex-col gap-1.5">
                          <IoSchoolOutline className="w-6 h-6 text-[#297BFF]" />
                          <span className="text-white/60 text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter' }}>{t.candidateDetails.education}</span>
                          <p className="text-white text-sm" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
                            {selectedCandidate.educationLevel || t.candidateDetails.notSpecified}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CV DU CANDIDAT */}
                    <div
                      className="rounded-none flex flex-col"
                      style={{ backgroundColor: '#0000006B' }}
                    >
                      {selectedCandidate.cvHistories && selectedCandidate.cvHistories.length > 0 ? (
                        (() => {
                          const latestCv =
                            selectedCandidate.cvHistories[selectedCandidate.cvHistories.length - 1]
                          return (
                            (() => {
                              const fileLabel = latestCv.fileName?.split('/').pop() || latestCv.fileName
                              return (
                                <>
                                  <button
                                    onClick={() => handleDownloadCv(latestCv.fileName)}
                                    className="flex items-center justify-between w-full px-4 py-3 text-white text-sm hover:bg-black/40 transition-colors rounded-none m-0"
                                    style={{ fontFamily: 'Inter', fontWeight: 500, backgroundColor: 'transparent', margin: 0 }}
                                  >
                                    <span className="flex items-center gap-3 flex-1 min-w-0">
                                      <FileText className="w-7 h-7 text-[#297BFF] flex-shrink-0" />
                                      <span className="break-words">{fileLabel}</span>
                                    </span>
                                    <Download className="w-7 h-7 text-[#297BFF] flex-shrink-0 ml-3" />
                                  </button>
                                </>
                              )
                            })()
                          )
                        })()
                      ) : (
                        <p
                          className="text-white/60 text-sm p-4 md:p-6"
                          style={{ fontFamily: 'Inter', fontWeight: 400 }}
                        >
                          {t.candidateDetails.noCv}
                        </p>
                      )}
                      
                    </div>

                    {/* INFORMATIONS DE CONTACT en bas de la colonne droite */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="border border-white/10 rounded-none p-4 md:p-6 flex flex-col"
                      style={{ backgroundColor: '#0000006B' }}
                    >
                      <div className="flex flex-col text-sm" style={{ fontFamily: 'Inter' }}>
                        {/* Site web */}
                        <div className="flex items-start gap-3 pb-3 border-b border-white/20">
                          <Globe className="w-5 h-5 text-[#297BFF] flex-shrink-0 mt-0.5" strokeWidth={1} />
                          <div className="flex-1">
                            <div className="text-white/60 text-[11px] uppercase tracking-[0.12em] mb-1">{t.candidateDetails.website}</div>
                            <div className="text-white/80 text-sm text-left">
                              {t.candidateDetails.notSpecified}
                            </div>
                          </div>
                        </div>

                        {/* Localisation */}
                        <div className="flex items-start gap-3 py-3 border-b border-white/20">
                          <MapPin className="w-5 h-5 text-[#297BFF] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-white/60 text-[11px] uppercase tracking-[0.12em] mb-1">{t.candidateDetails.location}</div>
                            <div className="text-white/80 text-sm text-left">
                              {selectedCandidate.city || selectedCandidate.country
                                ? `${selectedCandidate.city || ''}${selectedCandidate.city && selectedCandidate.country ? ', ' : ''}${selectedCandidate.country || ''}`
                                : t.candidateDetails.notSpecifiedF}
                            </div>
                          </div>
                        </div>

                        {/* Téléphone */}
                        <div className="flex items-start gap-3 py-3 border-b border-white/20">
                          <Phone className="w-5 h-5 text-[#297BFF] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-white/60 text-[11px] uppercase tracking-[0.12em] mb-1">{t.candidateDetails.phone}</div>
                            <div className="text-white/80 text-sm text-left">
                              {selectedCandidate.phone || t.candidateDetails.notSpecified}
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-3 pt-3">
                          <Mail className="w-5 h-5 text-[#297BFF] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-white/60 text-[11px] uppercase tracking-[0.12em] mb-1">{t.candidateDetails.email}</div>
                            <div className="text-white/80 text-sm text-left">
                              {selectedCandidate.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}