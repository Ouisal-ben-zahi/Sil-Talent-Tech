"use client"

import { useState, useEffect, useRef } from 'react'
import { User, FileText, Upload, Settings, LogOut, CheckCircle, Clock, XCircle, Briefcase, Bell, X, Eye, EyeOff, Mail, Phone, MapPin, MoreHorizontal, Globe, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Brain, Plus, AlertCircle, Download, Trash2, Calendar as CalendarIcon, Linkedin, LockKeyhole, Menu, MessageSquare, Building } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearAuthData } from '@/lib/auth'
import { RiPsychotherapyLine } from "react-icons/ri";
import { PiUserList } from "react-icons/pi";
import { LuHistory } from "react-icons/lu";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import { TbSettingsExclamation } from "react-icons/tb";
import { useLanguage } from '@/context/LanguageContext'

// Même image de fond et ambiance que la page de connexion
const hero = '/assets/Images/hero.PNG'

interface Profile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  linkedin: string | null
  portfolio: string | null
  jobTitle: string | null
  expertiseLevel: string | null
  country: string | null
  city: string | null
  typeDeMissionSouhaite: string | null
  categoriePrincipaleId: string | null
  nationality: string | null
  dateOfBirth: string | null
  gender: string | null
  maritalStatus: string | null
  educationLevel: string | null
  professionalExperience: string | null
  biography: string | null
}

interface Categorie {
  id: string
  nom: string
  description: string | null
}

interface CvHistory {
  id: string
  fileName: string
  fileSize?: number | string | bigint
  uploadedAt: string
  crmSyncStatus: string
}

interface Candidature {
  id: string
  categorieId: string
  categorie?: {
    id: string
    nom: string
  }
  cvPath: string
  datePostulation: string
  statut: string
  typeDeMission: string | null
}

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

const translations = {
  FR: {
    tabs: {
      profile: 'Profil utilisateur',
      cv: 'Historique candidatures',
      contact: 'Historique de contact',
      settings: 'Paramètres',
    },
    logout: 'Déconnexion',
    closeMenu: 'Fermer le menu',
    closeBanner: 'Fermer la bannière',
    greeting: (firstName: string, lastName: string) => `Bonjour ${firstName} ${lastName},`,
    stats: {
      applications: 'Dossiers appliqués',
      contactHistory: 'Historique de contact',
    },
    profileBanner: {
      complete: 'Félicitations, votre profil est maintenant complet !',
      incomplete: 'Votre profil est incomplet. Complétez-le et créez votre CV personnalisé.',
    },
    cv: {
      title: 'Historique Candidatures',
      noApplications: 'Aucune candidature pour le moment',
      service: 'Service',
      date: 'Date',
      status: 'Statut',
      action: 'Action',
      viewDetails: 'Voir détails',
      viewDetailsFull: 'Voir les détails',
      unknownCategory: 'Catégorie inconnue',
      statuses: {
        en_attente: 'En attente',
        en_cours: 'En cours',
        accepte: 'Accepté',
        refuse: 'Refusé',
        archive: 'Archivé',
        actif: 'Actif',
      },
      details: {
        title: 'Détails de la candidature',
        close: 'Fermer',
        category: 'Catégorie',
        applicationDate: 'Date de postulation',
        status: 'Statut',
        missionType: 'Type de mission',
        downloadCv: 'Télécharger le CV',
      },
    },
    contact: {
      title: 'Historique de contact',
      noMessages: 'Aucun message de contact pour le moment',
      emailSearched: 'Email recherché:',
      subject: 'Sujet',
      date: 'Date',
      status: 'Statut',
      action: 'Action',
      viewDetails: 'Voir détails',
      statuses: {
        new: 'Nouveau',
        read: 'Lu',
        replied: 'Répondu',
        archived: 'Archivé',
      },
      details: {
        title: 'Détails du message',
        close: 'Fermer',
        name: 'Nom et Prénom',
        email: 'Email',
        subject: 'Sujet',
        date: 'Date',
        phone: 'Téléphone',
        company: 'Entreprise',
        message: 'Message',
      },
    },
    settings: {
      title: 'Paramètres',
      subTabs: {
        personnel: 'Personnel',
        profil: 'Profil',
        social: 'Social',
        account: 'Compte',
        socialLinks: 'Liens sociaux',
        accountSettings: 'Paramètres du compte',
      },
      personnel: {
        basicInfo: 'Informations De Base',
        profilePhoto: 'Photo de profil',
        choosePhoto: 'Choisissez un photo ou',
        dragDrop: 'glissez-déposez-le ici',
        photoFormats: 'Formats JPEG, PNG, Une photo de',
        photoQuality: 'plus de 400 mégapixels donne de',
        photoSize: 'meilleurs résultats. jusqu\'à 50 Mo',
        browseFile: 'Parcourir le fichier',
        fullName: 'Nom complet',
        phone: 'Numéro de téléphone',
        city: 'Ville / Localisation',
        mainSkill: 'Compétence principale',
        missionType: 'Type de mission souhaitée',
        saveChanges: 'Enregistrer Les Modifications',
        saving: 'Enregistrement...',
        yourCv: 'Votre CV',
        downloadCv: 'Télécharger le CV',
        deleteCv: 'Supprimer le CV',
        addCv: 'Ajoutez CV',
        cvInstructions: 'Choisissez un document ou glissez-déposez-le ici, Format PDF',
        noCategory: 'Aucune catégorie disponible',
        missionTypes: {
          CDI: 'CDI',
          CDD: 'CDD',
          stage: 'Stage',
          freelance: 'Freelance',
          autre: 'Autre',
        },
      },
      profil: {
        title: 'Profil',
        nationality: 'Nationalité',
        dateOfBirth: 'Date de naissance',
        gender: 'Genre',
        maritalStatus: 'État civil',
        educationLevel: 'Niveau d\'éducation',
        professionalExperience: 'Expérience professionnelle',
        biography: 'Biographie',
        nationalities: {
          marocaine: 'Marocaine',
          francaise: 'Française',
          autre: 'Autre',
        },
        genders: {
          homme: 'Homme',
          femme: 'Femme',
          autre: 'Autre',
        },
        maritalStatuses: {
          celibataire: 'Célibataire',
          marie: 'Marié(e)',
          divorce: 'Divorcé(e)',
          veuf: 'Veuf(ve)',
        },
        educationLevels: {
          bac: 'Bac',
          'bac+2': 'Bac+2',
          'bac+3': 'Bac+3',
          'bac+5': 'Bac+5',
          autre: 'Autre',
        },
        experiences: {
          '0-1': '0-1 an',
          '1-3': '1-3 ans',
          '3-5': '3-5 ans',
          '5+': '5 ans et plus',
        },
        months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        weekDays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
        save: 'Enregistrer',
        saving: 'Enregistrement...',
      },
      social: {
        linkedin: 'LinkedIn',
        portfolio: 'Portfolio',
        addLinkedin: 'Ajouter LinkedIn',
        addPortfolio: 'Ajouter Portfolio',
        save: 'Enregistrer',
        saving: 'Enregistrement...',
      },
      account: {
        changePassword: 'Changer le mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        show: 'Afficher',
        hide: 'Masquer',
        save: 'Enregistrer',
        saving: 'Enregistrement...',
      },
    },
    messages: {
      profileUpdated: 'Profil mis à jour avec succès',
      photoUploaded: 'Photo uploadée avec succès',
      cvUploaded: 'CV uploadé avec succès',
      cvDeleted: 'CV supprimé avec succès',
      passwordUpdated: 'Mot de passe mis à jour avec succès',
      logoutSuccess: 'Déconnexion réussie',
      error: 'Erreur lors de la mise à jour',
      cvDeleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce CV ?',
      mustKeepOneCv: 'Vous devez conserver au moins un CV',
      socialLinksUpdated: 'Liens sociaux mis à jour avec succès',
      profileDetailsUpdated: 'Détails du profil mis à jour avec succès',
    },
  },
  EN: {
    tabs: {
      profile: 'User Profile',
      cv: 'Application History',
      contact: 'Contact History',
      settings: 'Settings',
    },
    logout: 'Logout',
    closeMenu: 'Close menu',
    closeBanner: 'Close banner',
    greeting: (firstName: string, lastName: string) => `Hello ${firstName} ${lastName},`,
    stats: {
      applications: 'Applications',
      contactHistory: 'Contact History',
    },
    profileBanner: {
      complete: 'Congratulations, your profile is now complete!',
      incomplete: 'Your profile is incomplete. Complete it and create your personalized CV.',
    },
    cv: {
      title: 'Application History',
      noApplications: 'No applications yet',
      service: 'Service',
      date: 'Date',
      status: 'Status',
      action: 'Action',
      viewDetails: 'View details',
      viewDetailsFull: 'View details',
      unknownCategory: 'Unknown category',
      statuses: {
        en_attente: 'Pending',
        en_cours: 'In Progress',
        accepte: 'Accepted',
        refuse: 'Rejected',
        archive: 'Archived',
        actif: 'Active',
      },
      details: {
        title: 'Application Details',
        close: 'Close',
        category: 'Category',
        applicationDate: 'Application Date',
        status: 'Status',
        missionType: 'Mission Type',
        downloadCv: 'Download CV',
      },
    },
    contact: {
      title: 'Contact History',
      noMessages: 'No contact messages yet',
      emailSearched: 'Email searched:',
      subject: 'Subject',
      date: 'Date',
      status: 'Status',
      action: 'Action',
      viewDetails: 'View details',
      statuses: {
        new: 'New',
        read: 'Read',
        replied: 'Replied',
        archived: 'Archived',
      },
      details: {
        title: 'Message Details',
        close: 'Close',
        name: 'Full Name',
        email: 'Email',
        subject: 'Subject',
        date: 'Date',
        phone: 'Phone',
        company: 'Company',
        message: 'Message',
      },
    },
    settings: {
      title: 'Settings',
      subTabs: {
        personnel: 'Personal',
        profil: 'Profile',
        social: 'Social',
        account: 'Account',
        socialLinks: 'Social Links',
        accountSettings: 'Account Settings',
      },
      personnel: {
        basicInfo: 'Basic Information',
        profilePhoto: 'Profile Photo',
        choosePhoto: 'Choose a photo or',
        dragDrop: 'drag and drop it here',
        photoFormats: 'JPEG, PNG formats. A photo of',
        photoQuality: 'more than 400 megapixels gives',
        photoSize: 'better results. Up to 50 MB',
        browseFile: 'Browse File',
        fullName: 'Full Name',
        phone: 'Phone Number',
        city: 'City / Location',
        mainSkill: 'Main Skill',
        missionType: 'Desired Mission Type',
        saveChanges: 'Save Changes',
        saving: 'Saving...',
        yourCv: 'Your CV',
        downloadCv: 'Download CV',
        deleteCv: 'Delete CV',
        addCv: 'Add CV',
        cvInstructions: 'Choose a document or drag and drop it here, PDF Format',
        noCategory: 'No category available',
        missionTypes: {
          CDI: 'CDI',
          CDD: 'CDD',
          stage: 'Internship',
          freelance: 'Freelance',
          autre: 'Other',
        },
      },
      profil: {
        title: 'Profile',
        nationality: 'Nationality',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        maritalStatus: 'Marital Status',
        educationLevel: 'Education Level',
        professionalExperience: 'Professional Experience',
        biography: 'Biography',
        nationalities: {
          marocaine: 'Moroccan',
          francaise: 'French',
          autre: 'Other',
        },
        genders: {
          homme: 'Male',
          femme: 'Female',
          autre: 'Other',
        },
        maritalStatuses: {
          celibataire: 'Single',
          marie: 'Married',
          divorce: 'Divorced',
          veuf: 'Widowed',
        },
        educationLevels: {
          bac: 'High School',
          'bac+2': 'Associate Degree',
          'bac+3': 'Bachelor\'s Degree',
          'bac+5': 'Master\'s Degree',
          autre: 'Other',
        },
        experiences: {
          '0-1': '0-1 year',
          '1-3': '1-3 years',
          '3-5': '3-5 years',
          '5+': '5+ years',
        },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        save: 'Save',
        saving: 'Saving...',
      },
      social: {
        linkedin: 'LinkedIn',
        portfolio: 'Portfolio',
        addLinkedin: 'Add LinkedIn',
        addPortfolio: 'Add Portfolio',
        save: 'Save',
        saving: 'Saving...',
      },
      account: {
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        show: 'Show',
        hide: 'Hide',
        save: 'Save',
        saving: 'Saving...',
      },
    },
    messages: {
      profileUpdated: 'Profile updated successfully',
      photoUploaded: 'Photo uploaded successfully',
      cvUploaded: 'CV uploaded successfully',
      cvDeleted: 'CV deleted successfully',
      passwordUpdated: 'Password updated successfully',
      logoutSuccess: 'Logout successful',
      error: 'Error updating',
      cvDeleteConfirm: 'Are you sure you want to delete this CV?',
      mustKeepOneCv: 'You must keep at least one CV',
      socialLinksUpdated: 'Social links updated successfully',
      profileDetailsUpdated: 'Profile details updated successfully',
    },
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang]
  const [activeTab, setActiveTab] = useState<'profile' | 'cv' | 'contact' | 'settings'>('profile')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cvHistory, setCvHistory] = useState<CvHistory[]>([])
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [applicationsCount, setApplicationsCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showProfileBanner, setShowProfileBanner] = useState(true)
  const [selectedContactMessage, setSelectedContactMessage] = useState<ContactMessage | null>(null)
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null)
  const [showCandidatureDetails, setShowCandidatureDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settingsSubTab, setSettingsSubTab] = useState<'personnel' | 'profil' | 'social' | 'account'>('personnel')
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState(false)
  const [isCategorieDropdownOpen, setIsCategorieDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [initialPhotoPreview, setInitialPhotoPreview] = useState<string | null>(null)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const cvUploadInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    mainSkill: '',
    missionType: ''
  })
  const [initialFormData, setInitialFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    mainSkill: '',
    missionType: ''
  })
  const [profileFormData, setProfileFormData] = useState({
    nationality: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    educationLevel: '',
    professionalExperience: '',
    biography: '',
  })
  const [initialProfileFormData, setInitialProfileFormData] = useState({
    nationality: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    educationLevel: '',
    professionalExperience: '',
    biography: '',
  })
  const [openProfileSelect, setOpenProfileSelect] = useState<string | null>(null)
  const [isDobPickerOpen, setIsDobPickerOpen] = useState(false)
  const today = new Date()
  const [dobYear, setDobYear] = useState<number>(today.getFullYear())
  const [dobMonth, setDobMonth] = useState<number>(today.getMonth()) // 0-11
  const [socialFormData, setSocialFormData] = useState({
    linkedin: '',
    portfolio: '',
  })
  const [initialSocialFormData, setInitialSocialFormData] = useState({
    linkedin: '',
    portfolio: '',
  })
  const [isSavingSocial, setIsSavingSocial] = useState(false)
  const [showLinkedinRow, setShowLinkedinRow] = useState(true)
  const [showPortfolioRow, setShowPortfolioRow] = useState(true)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const phoneCountryOptions = [
    {
      id: 'ma',
      label: 'Maroc',
      dial: '+212',
      flag: '🇲🇦',
      minLength: 9,
      maxLength: 9,
    },
    {
      id: 'fr',
      label: 'France',
      dial: '+33',
      flag: '🇫🇷',
      minLength: 9,
      maxLength: 9,
    },
    {
      id: 'uk',
      label: 'Royaume-Uni',
      dial: '+44',
      flag: '🇬🇧',
      minLength: 9,
      maxLength: 10,
    },
    {
      id: 'es',
      label: 'Espagne',
      dial: '+34',
      flag: '🇪🇸',
      minLength: 9,
      maxLength: 9,
    },
    {
      id: 'de',
      label: 'Allemagne',
      dial: '+49',
      flag: '🇩🇪',
      minLength: 10,
      maxLength: 11,
    },
  ]
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(phoneCountryOptions[0])
  const [isPhoneCountryDropdownOpen, setIsPhoneCountryDropdownOpen] = useState(false)
  const [phoneLocal, setPhoneLocal] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [cvMenuOpenId, setCvMenuOpenId] = useState<string | null>(null)

  const formatFileSize = (size?: number | string | bigint) => {
    if (size === undefined || size === null) return ''
    const numeric =
      typeof size === 'bigint'
        ? Number(size)
        : typeof size === 'string'
        ? parseInt(size, 10)
        : size
    if (!numeric || Number.isNaN(numeric)) return ''
    const mb = numeric / (1024 * 1024)
    return `${mb.toFixed(1).replace('.', ',')} Mo`
  }

  // Charger les données de manière séquentielle pour éviter le rate limiting
  useEffect(() => {
    const loadDataSequentially = async () => {
      try {
        // 1. Charger le profil d'abord
        await fetchProfile()
        
        // 2. Attendre un peu avant les autres appels
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 3. Charger candidatures (qui met aussi à jour le count)
        await fetchCandidatures()
        
        // 4. Attendre avant le prochain appel
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // 5. Charger l'historique CV
        await fetchCvHistory()
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }
    
    loadDataSequentially()
  }, [])

  // Récupérer les messages de contact une fois que le profil est chargé (avec délai)
  useEffect(() => {
    if (profile?.email) {
      // Ajouter un délai pour éviter le rate limiting
      const timer = setTimeout(() => {
        fetchContactMessages()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [profile?.email])

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await api.get('/categories')
      let categoriesData = null
      
      if (Array.isArray(response.data)) {
        categoriesData = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data
      } else if (response.data.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories
      } else {
        categoriesData = []
      }
      
      setCategories(categoriesData || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error)
      setCategories([])
    } finally {
      setIsLoadingCategories(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'settings') {
      // Ajouter un délai pour éviter le rate limiting
      const timer = setTimeout(() => {
        fetchCategories()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [activeTab])

  // Pré-remplir le formulaire des paramètres quand on ouvre l'onglet
  useEffect(() => {
    if (profile && activeTab === 'settings') {
      const initialData = {
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        email: profile.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        mainSkill: profile.categoriePrincipaleId || '',
        missionType: profile.typeDeMissionSouhaite || ''
      }
      setFormData(initialData)
      setInitialFormData(initialData)

      const initialProfileData = {
        nationality: profile.nationality || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender || '',
        maritalStatus: profile.maritalStatus || '',
        educationLevel: profile.educationLevel || '',
        professionalExperience: profile.professionalExperience || '',
        biography: profile.biography || '',
      }
      setProfileFormData(initialProfileData)
      setInitialProfileFormData(initialProfileData)

      // Initialiser dobYear et dobMonth à partir de la date de naissance si elle existe
      if (profile.dateOfBirth) {
        const dobDate = new Date(profile.dateOfBirth)
        if (!isNaN(dobDate.getTime())) {
          setDobYear(dobDate.getFullYear())
          setDobMonth(dobDate.getMonth()) // getMonth() retourne 0-11
        }
      }

      const initialSocialData = {
        linkedin: profile.linkedin || '',
        portfolio: profile.portfolio || '',
      }
      setSocialFormData(initialSocialData)
      setInitialSocialFormData(initialSocialData)
      setShowLinkedinRow(!!profile.linkedin)
      setShowPortfolioRow(!!profile.portfolio)

      // Initialiser le pays / téléphone à partir du numéro existant
      let initialCountry = phoneCountryOptions[0]
      let initialLocal = profile.phone || ''

      if (profile.phone) {
        const matched = phoneCountryOptions.find((opt) =>
          profile.phone?.startsWith(opt.dial),
        )
        if (matched) {
          initialCountry = matched
          initialLocal = profile.phone.replace(matched.dial, '').trim()
        }
      }

      setSelectedPhoneCountry(initialCountry)
      setPhoneLocal(initialLocal)
    }
  }, [profile, activeTab])
      
  // Charger la dernière photo de profil dès que le profil est disponible
  useEffect(() => {
    if (profile) {
      fetchLatestPhoto()
    }
  }, [profile])

  const fetchLatestPhoto = async () => {
    try {
      const response = await api.get('/candidates/photo-history')
      const photos = response.data.data || response.data || []
      if (photos.length > 0) {
        const latestPhoto = photos[0]
        // Télécharger la photo via l'API sécurisée et créer une URL locale (blob)
        try {
          const photoResponse = await api.get(`/candidates/photo/${latestPhoto.id}/file`, {
            responseType: 'blob',
          } as any)
          const blob = photoResponse.data as Blob
          const objectUrl = URL.createObjectURL(blob)
          setProfilePhotoPreview(objectUrl)
          setInitialPhotoPreview(objectUrl)
        } catch (error) {
          console.log('Impossible de récupérer la photo de profil', error)
          setInitialPhotoPreview(null)
        }
      } else {
        setInitialPhotoPreview(null)
      }
    } catch (error: any) {
      // Pas de photo existante, c'est normal
      setInitialPhotoPreview(null)
    }
  }

  // Vérifier si le formulaire a été modifié (y compris la photo)
  const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData)
  const hasPhotoChanges = profilePhotoPreview !== initialPhotoPreview || (profilePhotoFile !== null && !initialPhotoPreview)
  const hasChanges = hasFormChanges || hasPhotoChanges
  const hasProfileChanges = JSON.stringify(profileFormData) !== JSON.stringify(initialProfileFormData)
  const hasSocialChanges = JSON.stringify(socialFormData) !== JSON.stringify(initialSocialFormData)
  const hasPasswordChanges =
    !!passwordForm.currentPassword || !!passwordForm.newPassword || !!passwordForm.confirmPassword

  const validatePhoneLocal = (value: string, country = selectedPhoneCountry) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) {
      setPhoneError(null)
      return
    }
    const min = country.minLength
    const max = country.maxLength
    if (digits.length < min || digits.length > max) {
      setPhoneError(`Numéro invalide pour ${country.label}`)
    } else {
      setPhoneError(null)
    }
  }

  const formatDobForDisplay = (value: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfWeek = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ...
    const day = new Date(year, month, 1).getDay()
    // Convert to Monday-first (0 = Monday)
    return (day + 6) % 7
  }

  const handleSelectDobDay = (day: number) => {
    const month = dobMonth + 1
    const monthStr = month < 10 ? `0${month}` : String(month)
    const dayStr = day < 10 ? `0${day}` : String(day)
    const value = `${dobYear}-${monthStr}-${dayStr}`
    setProfileFormData((prev) => ({ ...prev, dateOfBirth: value }))
    setIsDobPickerOpen(false)
  }

  const fetchProfile = async () => {
    try {
      const response = await api.get('/candidates/profile')
      // Le TransformInterceptor encapsule dans data.data
      const profileData = response.data.data || response.data
      setProfile(profileData)
    } catch (error: any) {
      console.error('Erreur complète lors du chargement du profil:', error)
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
      
      if (error.response?.status === 401) {
        router.push('/candidat/login')
      } else {
        // Extraire le message d'erreur de différentes façons possibles
        let errorMessage = 'Erreur lors du chargement du profil'
        
        if (error.response?.data) {
          const data = error.response.data
          // Le TransformInterceptor encapsule dans data.data
          const actualData = data.data || data
          errorMessage = actualData.message || actualData.error || data.message || data.error || errorMessage
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCvHistory = async () => {
    try {
      const response = await api.get('/candidates/cv-history')
      setCvHistory(response.data.data)
    } catch (error: any) {
      // Silently fail, user might not have CVs yet
    }
  }

  const fetchApplicationsCount = async () => {
    try {
      const response = await api.get('/candidatures/me')
      const applications = response.data.data || response.data || []
      setApplicationsCount(Array.isArray(applications) ? applications.length : 0)
    } catch (error: any) {
      // Silently fail, user might not have applications yet
      setApplicationsCount(0)
    }
  }

  const fetchCandidatures = async () => {
    try {
      const response = await api.get('/candidatures/me')
      const candidaturesData = response.data.data || response.data || []
      
      // Mettre à jour aussi le count pour éviter un appel séparé
      setApplicationsCount(Array.isArray(candidaturesData) ? candidaturesData.length : 0)
      
      // Récupérer toutes les catégories en une seule fois pour éviter les appels multiples
      let categoriesMap = new Map<string, Categorie>()
      try {
        const categoriesResponse = await api.get('/categories')
        const categoriesList = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : (categoriesResponse.data?.data || categoriesResponse.data?.categories || [])
        
        categoriesList.forEach((cat: Categorie) => {
          categoriesMap.set(cat.id, cat)
        })
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
      }
      
      // Mapper les candidatures avec leurs catégories depuis le cache
      const candidaturesWithCategories = (Array.isArray(candidaturesData) ? candidaturesData : []).map((candidature: Candidature) => {
        const categorie = candidature.categorieId ? categoriesMap.get(candidature.categorieId) : null
        return {
          ...candidature,
          categorie: categorie || undefined
        }
      })
      
      setCandidatures(candidaturesWithCategories)
    } catch (error: any) {
      console.error('Erreur lors du chargement des candidatures:', error)
      setCandidatures([])
    }
  }

  const handleViewCv = (cvPath: string) => {
    // Extraire le nom du fichier depuis le chemin
    const fileName = cvPath.split('/').pop() || cvPath
    // Télécharger ou afficher le CV
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sil-talents.ma/api'
    const cvUrl = `${apiUrl}/admin/cvs/${encodeURIComponent(fileName)}/download`
    window.open(cvUrl, '_blank')
  }

  const handleDownloadCvFromCandidature = async (cvPath: string) => {
    try {
      // Extraire le nom du fichier depuis le chemin
      const fileName = cvPath.split('/').pop() || cvPath
      
      // Utiliser l'endpoint candidat qui vérifie que le CV appartient au candidat connecté
      const response = await api.get(`/candidates/cv/file/${encodeURIComponent(fileName)}/download`, {
        responseType: 'blob',
      } as any)
      
      const blob = response.data as Blob
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('CV téléchargé avec succès')
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du CV:', error)
      console.error('Détails complets:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
      })
      
      // Message d'erreur plus détaillé
      let message = 'Erreur lors du téléchargement du CV'
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        message = 'Vous n\'avez pas l\'autorisation de télécharger ce CV'
      } else if (error?.response?.status === 404) {
        message = 'CV non trouvé. Le fichier peut avoir été supprimé.'
      } else if (error?.response?.data?.message) {
        message = error.response.data.message
      } else if (error?.message) {
        message = error.message
      }
      
      toast.error(message)
    }
  }

  const handleViewCandidatureDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature)
    setShowCandidatureDetails(true)
  }

  const handleCloseCandidatureDetails = () => {
    setShowCandidatureDetails(false)
    setSelectedCandidature(null)
  }

  const handleViewContactDetails = (message: ContactMessage) => {
    setSelectedContactMessage(message)
    setShowContactDetails(true)
  }

  const handleCloseContactDetails = () => {
    setShowContactDetails(false)
    setSelectedContactMessage(null)
  }

  const fetchContactMessages = async () => {
    try {
      if (!profile?.email) {
        console.log('⚠️ Pas d\'email de profil, impossible de récupérer les messages')
        return
      }
      
      console.log('📧 Récupération des messages de contact pour:', profile.email)
      
      // Récupérer les messages de contact par email du candidat (l'email est récupéré automatiquement depuis le token JWT)
      const response = await api.get(`/contact/messages`)
      console.log('📨 Réponse API messages de contact:', response.data)
      
      const messages = response.data.data || response.data || []
      console.log('✅ Messages récupérés:', messages.length, 'messages')
      
      setContactMessages(Array.isArray(messages) ? messages : [])
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des messages de contact:', error)
      console.error('Détails:', error.response?.data || error.message)
      setContactMessages([])
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    // Validation téléphone si rempli
    if (phoneError) {
      toast.error(phoneError)
      return
    }
    
    setIsSaving(true)
    try {
      // Upload de la photo si une nouvelle photo a été sélectionnée
      if (profilePhotoFile) {
        await handleUploadPhoto(profilePhotoFile)
        // Réinitialiser après upload
        setProfilePhotoFile(null)
        if (profilePhotoInputRef.current) {
          profilePhotoInputRef.current.value = ''
        }
      }

      // Séparer le nom complet en prénom et nom
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0] || profile.firstName
      const lastName = nameParts.slice(1).join(' ') || profile.lastName

      const updatedProfile = {
        firstName,
        lastName,
        phone: formData.phone || profile.phone,
        city: formData.city || profile.city,
        jobTitle: formData.mainSkill || profile.jobTitle,
        typeDeMissionSouhaite: formData.missionType || null,
        categoriePrincipaleId: formData.mainSkill || null,
        // champs de profil avancé non gérés ici (onglet Personnel uniquement)
      }

      const response = await api.put('/candidates/profile', updatedProfile)
      
      // Mettre à jour le profil local avec la réponse
      const updatedData = response.data.data || response.data
      setProfile(updatedData)
      
      // Mettre à jour les données initiales pour désactiver le bouton
      const newInitialData = {
        fullName: `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim(),
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        city: updatedData.city || '',
        mainSkill: updatedData.categoriePrincipaleId || '',
        missionType: updatedData.typeDeMissionSouhaite || ''
      }
      setInitialFormData(newInitialData)
      setFormData(newInitialData)
      
      // Mettre à jour la photo initiale si une nouvelle photo a été uploadée
      if (profilePhotoPreview) {
        setInitialPhotoPreview(profilePhotoPreview)
        setProfilePhotoFile(null)
      }
      
      toast.success(t.messages.profileUpdated)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.messages.error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadPhoto = async (file: File) => {
    if (!file) return

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Seuls les fichiers JPEG et PNG sont acceptés')
      return
    }

    // Validation de la taille (50 Mo max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Le fichier ne doit pas dépasser 50 Mo')
      return
    }

    const formData = new FormData()
    formData.append('photo', file)

    try {
      await api.post('/candidates/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success(t.messages.photoUploaded)
      // Recharger le profil pour obtenir la nouvelle photo (avec délai pour éviter rate limiting)
      setTimeout(() => {
        fetchProfile()
      }, 500)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload de la photo')
    }
  }

  const handleUploadCv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 10 Mo)')
      return
    }

    const uploadFormData = new FormData()
    uploadFormData.append('cv', file)

    try {
      await api.post('/candidates/cv', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success(t.messages.cvUploaded)
      // Recharger l'historique CV avec délai pour éviter rate limiting
      setTimeout(() => {
        fetchCvHistory()
      }, 500)
      if (cvUploadInputRef.current) {
        cvUploadInputRef.current.value = ''
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload')
    }
  }

  const handleDownloadCvFromHistory = async (cvId: string) => {
    const cv = cvHistory.find((item) => item.id === cvId)
    try {
      const response = await api.get(`/candidates/cv/${cvId}/download`, {
        responseType: 'blob',
      } as any)
      const blob = response.data as Blob
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = cv?.fileName || 'cv.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du CV:', error)
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Erreur lors du téléchargement du CV'
      toast.error(message)
    } finally {
      setCvMenuOpenId(null)
    }
  }

  const handleDeleteCvFromHistory = async (cvId: string) => {
    if (cvHistory.length <= 1) {
      toast.error(t.messages.mustKeepOneCv)
      return
    }

    if (!confirm(t.messages.cvDeleteConfirm)) {
      return
    }

    try {
      await api.delete(`/candidates/cv/${cvId}`)
      setCvHistory((prev) => prev.filter((cv) => cv.id !== cvId))
      toast.success(t.messages.cvDeleted)
    } catch (error: any) {
      console.error('Erreur lors de la suppression du CV:', error)
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression du CV')
    } finally {
      setCvMenuOpenId(null)
    }
  }

  const handleSaveSocialLinks = async () => {
    try {
      setIsSavingSocial(true)
      const payload = {
        linkedin: socialFormData.linkedin || null,
        portfolio: socialFormData.portfolio || null,
      }

      const response = await api.put('/candidates/profile', payload)
      const updated = response.data.data || response.data

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              linkedin: updated.linkedin,
              portfolio: updated.portfolio,
            }
          : prev
      )

      const newInitial = {
        linkedin: updated.linkedin || '',
        portfolio: updated.portfolio || '',
      }

      setInitialSocialFormData(newInitial)
      setSocialFormData(newInitial)

      toast.success('Liens sociaux mis à jour avec succès')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour des liens sociaux')
    } finally {
      setIsSavingSocial(false)
    }
  }

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
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }

    try {
      setIsSavingPassword(true)
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      toast.success('Mot de passe mis à jour avec succès')
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
    router.push('/')
  }

  const handleDeleteProfile = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.')) {
      return
    }

    try {
      await api.delete('/candidates/profile')
      clearAuthData()
      toast.success('Profil supprimé')
      router.push('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const profileCompletion = (() => {
    if (!profile) return 0
    let filled = 0
    let total = 6
    if (profile.phone) filled++
    if (profile.linkedin) filled++
    if (profile.portfolio) filled++
    if (profile.jobTitle) filled++
    if (profile.country) filled++
    if (profile.city) filled++
    return Math.max(0, Math.min(100, Math.round((filled / total) * 100)))
  })()

  if (isLoading || !profile) {
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

          <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#D9D9D9]" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '18px' }}>
                Chargement...
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sil-dark relative">
      {/* Section avec BG Photo + overlay + gradient bas (comme Connexion) */}
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
                  TABLEAU DE BORD
                </h1>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right hidden sm:block">
                  <p
                    className="text-sil-white"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                  >
                    {profile.firstName} {profile.lastName}
                  </p>
                  {profile.jobTitle && (
                    <p
                      style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '12px', color: '#999999' }}
                    >
                      {profile.jobTitle}
                    </p>
                  )}
                </div>
                <div className="hidden md:flex w-10 h-10 rounded-full bg-[#D9D9D9] items-center justify-center overflow-hidden flex-shrink-0">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                  <span
                    style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#111111' }}
                  >
                    {(profile.firstName?.[0] || 'U').toUpperCase()}
                  </span>
                  )}
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
                      setActiveTab('profile')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'profile'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <PiUserList className={`w-5 h-5 ${activeTab === 'profile' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} />
                    <span>{t.tabs.profile}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('cv')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'cv'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <LuHistory className={`w-5 h-5 ${activeTab === 'cv' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} />
                    <span>{t.tabs.cv}</span>
                  </button>
                  {/* Historique de contact */}
                  <button
                    onClick={() => {
                      setActiveTab('contact')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
                      activeTab === 'contact'
                        ? 'bg-[#297BFF]/20 text-white border-l-[3px] border-[#297BFF]'
                        : 'text-[#999999] hover:bg-black/60'
                    }`}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    <MdOutlinePermContactCalendar className="w-5 h-5 text-[#297BFF]" />
                    <span>{t.tabs.contact}</span>
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
                    <TbSettingsExclamation className={`w-5 h-5 ${activeTab === 'settings' ? 'text-[#297BFF]' : 'text-[#297BFF]'}`} />
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
                    <X className="w-5 h-5" strokeWidth={1} />
                  </button>
                </div>
              </motion.div>

              {/* Content principal */}
              <div className="flex-1 min-w-0 p-4 lg:p-6 min-h-screen bg-black/30 lg:ml-0 ml-0">
                <AnimatePresence mode="wait">
                  {/* Dashboard - Affiché quand "Profil utilisateur" est sélectionné */}
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
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
                      }}
                    >
                      {t.greeting(profile.firstName || '', profile.lastName || '')}
                    </h2>

                    {/* Deux cartes statistiques */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      {/* Carte 1 : Dossiers appliqués */}
                      <div className="bg-black/80 p-6" style={{ border: '1px solid #99999924' }}>
                        <div className="flex items-center justify-between mb-3">
                          <p
                            className="text-white"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '36px',
                            }}
                          >
                            {applicationsCount}
                          </p>
                          <Briefcase className="w-8 h-8 text-[#297BFF]" strokeWidth={1} />
                        </div>
                        <p
                          className="text-white"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          {t.stats.applications}
                        </p>
                      </div>

                      {/* Carte 2 : Historique de contact */}
                      <div className="bg-black/80 p-6" style={{ border: '1px solid #99999924' }}>
                        <div className="flex items-center justify-between mb-3">
                          <p
                            className="text-white"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '36px',
                            }}
                          >
                            {contactMessages.length}
                          </p>
                          <Bell className="w-8 h-8 text-[#297BFF]" strokeWidth={1} />
                        </div>
                        <p
                          className="text-white"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          {t.stats.contactHistory}
                        </p>
                      </div>
                    </div>

                    {/* Bannière de complétion de profil avec barre de progression */}
                    {showProfileBanner && (
                      <div
                        className={`relative p-4 transition-all duration-300 ${
                          profileCompletion < 50
                            ? 'bg-red-500/20'
                            : profileCompletion >= 50 && profileCompletion < 100
                            ? 'bg-orange-500/30'
                            : 'bg-green-500'
                        }`}
                      >
                        {/* Bouton fermer en haut à droite */}
                        <button
                          onClick={() => setShowProfileBanner(false)}
                          className="absolute top-3 right-3 text-white hover:text-[#999999] transition-colors z-10"
                          aria-label={t.closeBanner}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Structure avec Avatar, Pourcentage, Barre et Texte */}
                        <div className="flex pr-6 items-center gap-4">
                          {/* Avatar - centré verticalement */}
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-[#D9D9D9] flex items-center justify-center overflow-hidden border border-white flex-shrink-0">
                              {profilePhotoPreview ? (
                                <img
                                  src={profilePhotoPreview}
                                  alt="Photo de profil"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 600,
                                  fontSize: '18px',
                                  color: '#111111',
                                }}
                              >
                                {(profile.firstName?.[0] || 'U').toUpperCase()}
                              </span>
                              )}
                            </div>
                          </div>

                          {/* Pourcentage - centré verticalement */}
                          <div className="flex items-center justify-center">
                            <span
                              className="text-white flex-shrink-0"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: '24px',
                              }}
                            >
                              {profileCompletion}%
                            </span>
                          </div>
                          
                          {/* Colonne avec Barre de progression et Texte */}
                          <div className="flex-1 flex flex-col" style={{ gap: '0px', rowGap: '0px' }}>
                            {/* Barre de progression - toujours bleue */}
                            <div className="w-full h-2 bg-black/30 overflow-hidden">
                              <div
                                className="h-full bg-[#297BFF] transition-all duration-300"
                                style={{ width: `${profileCompletion}%` }}
                              />
                            </div>
                            
                            {/* Texte descriptif - sans espacement avec la barre */}
                            <p
                              className="text-white"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: '13px',
                                lineHeight: '1.2',
                                marginTop: '4px',
                                marginBottom: '2px',
                                paddingTop: '0px',
                                paddingBottom: '0px',
                              }}
                            >
                              {profileCompletion === 100
                                ? t.profileBanner.complete
                                : t.profileBanner.incomplete}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Contenu détaillé (onglets) */}
                {activeTab === 'cv' && (
                  <motion.div
                    key="cv"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 md:p-8 pt-20 pb-20"
                  >
                    <h2 
                      className="text-2xl font-display font-bold text-white mb-6"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: '24px',
                      }}
                    >
                      {t.cv.title}
                    </h2>
                    
                    {candidatures.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-12 text-white/70"
                      >
                        <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
                        <p>{t.cv.noApplications}</p>
                      </motion.div>
                    ) : (
                      <div className="overflow-x-auto -mx-4 md:mx-0">
                        {/* En-têtes du tableau - cachés sur mobile */}
                        <div className="hidden md:grid grid-cols-4 gap-6 px-4 md:px-0 pb-4 border-b border-white/10 mb-4">
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.cv.service}
                            </span>
                          </div>
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.cv.date}
                            </span>
                          </div>
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.cv.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.cv.action}
                            </span>
                          </div>
                        </div>

                        {/* Lignes du tableau */}
                        <div className="space-y-4 md:space-y-6">
                          {candidatures.map((candidature, index) => (
                            <motion.div
                              key={candidature.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                              className="bg-black/30 md:bg-transparent rounded-lg md:rounded-none p-4 md:p-0 border border-white/10 md:border-none md:border-b md:border-white/5 hover:bg-white/5 transition-all duration-300"
                            >
                              {/* Mobile: Affichage en cartes */}
                              <div className="md:hidden space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 
                                      className="text-white mb-1"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                      }}
                                    >
                                      {candidature.categorie?.nom || t.cv.unknownCategory}
                                    </h3>
                                    {profile?.city && (
                                      <p 
                                        className="text-white/60 mb-2"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '12px',
                                        }}
                                      >
                                        {profile.city}
                                      </p>
                                    )}
                                  </div>
                                  <span 
                                    className="px-3 py-1 rounded bg-[#297BFF]/20 text-[#297BFF] text-xs"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {candidature.statut === 'en_attente' ? t.cv.statuses.en_attente :
                                     candidature.statut === 'en_cours' ? t.cv.statuses.en_cours :
                                     candidature.statut === 'accepte' ? t.cv.statuses.accepte :
                                     candidature.statut === 'refuse' ? t.cv.statuses.refuse :
                                     candidature.statut === 'archive' ? t.cv.statuses.archive : t.cv.statuses.actif}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                  <p 
                                    className="text-white/70 text-sm"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                    }}
                                  >
                                    {new Date(candidature.datePostulation).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  <button
                                    onClick={() => handleViewCandidatureDetails(candidature)}
                                    className="text-[#297BFF] hover:text-[#297BFF]/80 underline transition-colors text-sm"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                    }}
                                  >
                                    {t.cv.viewDetails}
                                  </button>
                                </div>
                              </div>

                              {/* Desktop: Affichage en grille */}
                              <div className="hidden md:grid grid-cols-4 gap-6 items-center py-4">
                                {/* Colonne Poste */}
                                <div>
                                  <h3 
                                    className="text-white mb-1"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 500,
                                      fontSize: '14px',
                                    }}
                                  >
                                    {candidature.categorie?.nom || 'Catégorie inconnue'}
                                  </h3>
                                  {profile?.city && (
                                    <p 
                                      className="text-white/60"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontSize: '12px',
                                      }}
                                    >
                                      {profile.city}
                                    </p>
                                  )}
                                </div>

                                {/* Colonne Date */}
                                <div>
                                  <p 
                                    className="text-white"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                      fontSize: '14px',
                                    }}
                                  >
                                    {new Date(candidature.datePostulation).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}, {new Date(candidature.datePostulation).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>

                                {/* Colonne Statut */}
                                <div>
                                  <span 
                                    className="text-[#297BFF]"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                      fontSize: '14px',
                                    }}
                                  >
                                    {candidature.statut === 'en_attente' ? t.cv.statuses.en_attente :
                                     candidature.statut === 'en_cours' ? t.cv.statuses.en_cours :
                                     candidature.statut === 'accepte' ? t.cv.statuses.accepte :
                                     candidature.statut === 'refuse' ? t.cv.statuses.refuse :
                                     candidature.statut === 'archive' ? t.cv.statuses.archive : t.cv.statuses.actif}
                                  </span>
                                </div>

                                {/* Colonne Action */}
                                <div>
                                  <button
                                    onClick={() => handleViewCandidatureDetails(candidature)}
                                    className="text-[#297BFF] hover:text-[#297BFF]/80 underline transition-colors"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                      fontSize: '14px',
                                    }}
                                  >
                                    {t.cv.viewDetailsFull}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Onglet Historique de contact */}
                {activeTab === 'contact' && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 md:p-8 pt-20 pb-20"
                  >
                    <h2 
                      className="text-2xl font-display font-bold text-white mb-6"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: '24px',
                      }}
                    >
                      {t.contact.title}
                    </h2>
                    
                    {contactMessages.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-12 text-white/70"
                      >
                        <Bell className="w-16 h-16 mx-auto mb-4 text-white/30" />
                        <p>{t.contact.noMessages}</p>
                        {profile?.email && (
                          <p className="text-sm text-white/50 mt-2">
                            {t.contact.emailSearched} {profile.email}
                          </p>
                        )}
                      </motion.div>
                    ) : (
                      <div className="overflow-x-auto -mx-4 md:mx-0">
                        {/* En-têtes du tableau - cachés sur mobile */}
                        <div className="hidden md:grid grid-cols-4 gap-6 px-4 md:px-0 pb-4 border-b border-white/10 mb-4">
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.contact.subject}
                            </span>
                          </div>
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.contact.date}
                            </span>
                          </div>
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.contact.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px' }}>
                              {t.contact.action}
                            </span>
                          </div>
                        </div>

                        {/* Lignes du tableau */}
                        <div className="space-y-4 md:space-y-6 px-4 md:px-0">
                          {contactMessages.map((message, index) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                              className="bg-black/40 md:bg-transparent rounded-lg md:rounded-none p-4 md:p-0 border border-white/10 md:border-none md:border-b md:border-white/5 hover:bg-white/5 transition-all duration-300 shadow-lg md:shadow-none"
                            >
                              {/* Mobile: Affichage en cartes */}
                              <div className="md:hidden space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 
                                      className="text-white mb-2"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                      }}
                                    >
                                      {message.subject}
                                    </h3>
                                  </div>
                                  <span 
                                    className="px-3 py-1 rounded bg-[#297BFF]/20 text-[#297BFF] text-xs"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {message.status === 'new' ? t.contact.statuses.new :
                                     message.status === 'read' ? t.contact.statuses.read :
                                     message.status === 'replied' ? t.contact.statuses.replied :
                                     message.status === 'archived' ? t.contact.statuses.archived : message.status}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                  <p 
                                    className="text-white/70 text-sm"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                    }}
                                  >
                                    {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  <button
                                    onClick={() => handleViewContactDetails(message)}
                                    className="text-[#297BFF] hover:text-[#297BFF]/80 underline transition-colors text-sm"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                    }}
                                  >
                                    {t.cv.viewDetails}
                                  </button>
                                </div>
                              </div>

                              {/* Desktop: Affichage en grille */}
                              <div className="hidden md:grid grid-cols-4 gap-6 items-center py-4">
                              {/* Colonne Sujet */}
                              <div>
                                <h3 
                                  className="text-white"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                  }}
                                >
                                  {message.subject}
                                </h3>
                              </div>

                              {/* Colonne Date */}
                              <div>
                                <p 
                                  className="text-white"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                  }}
                                >
                                  {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}, {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>

                              {/* Colonne Statut */}
                              <div>
                                <span 
                                  className="text-[#297BFF]"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                  }}
                                >
                                  {message.status === 'new' ? 'Nouveau' :
                                   message.status === 'read' ? 'Lu' :
                                   message.status === 'replied' ? 'Répondu' :
                                   message.status === 'archived' ? 'Archivé' : message.status}
                                </span>
                              </div>

                              {/* Colonne Action */}
                              <div>
                                <button
                                  onClick={() => handleViewContactDetails(message)}
                                  className="text-[#297BFF] hover:text-[#297BFF]/80 underline transition-colors"
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                  }}
                                >
                                  Voir détails
                                </button>
                              </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8 pt-20 pb-20"
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

                    {/* Sous-navigation */}
                    <div className="border-b border-white/10">
                      {/* Mobile: Grid 2x2 */}
                      <div className="grid grid-cols-2 md:hidden gap-2">
                        {/* Personnel */}
                        <button
                          onClick={() => setSettingsSubTab('personnel')}
                          className={`flex items-center justify-center gap-1.5 px-2 py-2.5 border-b-2 transition-colors ${
                            settingsSubTab === 'personnel'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '12px',
                          }}
                        >
                          <User className="w-4 h-4 text-[#297BFF] flex-shrink-0" strokeWidth={1} />
                          <span>{t.settings.subTabs.personnel}</span>
                        </button>

                        {/* Profil */}
                        <button
                          onClick={() => setSettingsSubTab('profil')}
                          className={`flex items-center justify-center gap-1.5 px-2 py-2.5 border-b-2 transition-colors ${
                            settingsSubTab === 'profil'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '12px',
                          }}
                        >
                          <div className="w-4 h-4 rounded-full border border-[#297BFF] flex items-center justify-center flex-shrink-0">
                            <User className="w-2.5 h-2.5 text-[#297BFF]" strokeWidth={1} />
                          </div>
                          <span>{t.settings.subTabs.profil}</span>
                        </button>

                        {/* Liens sociaux */}
                        <button
                          onClick={() => setSettingsSubTab('social')}
                          className={`flex items-center justify-center gap-1.5 px-2 py-2.5 border-b-2 transition-colors ${
                            settingsSubTab === 'social'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '12px',
                          }}
                        >
                          <Globe className="w-4 h-4 text-[#297BFF] flex-shrink-0" strokeWidth={1} />
                          <span>{t.settings.subTabs.social}</span>
                        </button>

                        {/* Paramètres du compte */}
                        <button
                          onClick={() => setSettingsSubTab('account')}
                          className={`flex items-center justify-center gap-1.5 px-2 py-2.5 border-b-2 transition-colors ${
                            settingsSubTab === 'account'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '12px',
                          }}
                        >
                          <div className="relative w-4 h-4 flex-shrink-0">
                            <Settings className="w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                            <AlertCircle className="w-2.5 h-2.5 text-[#297BFF] absolute -top-0.5 -right-0.5 bg-sil-dark rounded-full" strokeWidth={1} />
                          </div>
                          <span>{t.settings.subTabs.account}</span>
                        </button>
                      </div>

                      {/* Desktop: Flex horizontal */}
                      <div className="hidden md:flex items-center gap-6">
                        {/* Personnel */}
                        <button
                          onClick={() => setSettingsSubTab('personnel')}
                          className={`flex items-center gap-2 px-4 pt-2 pb-3 border-b-2 transition-colors ${
                            settingsSubTab === 'personnel'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          <User className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                          {t.settings.subTabs.personnel}
                        </button>

                        {/* Profil */}
                        <button
                          onClick={() => setSettingsSubTab('profil')}
                          className={`flex items-center gap-2 px-4 pt-2 pb-3 border-b-2 transition-colors ${
                            settingsSubTab === 'profil'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          <div className="w-6 h-6 rounded-full border border-[#297BFF] flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#297BFF]" strokeWidth={1} />
                          </div>
                          {t.settings.subTabs.profil}
                        </button>

                        {/* Liens sociaux */}
                        <button
                          onClick={() => setSettingsSubTab('social')}
                          className={`flex items-center gap-2 px-4 pt-2 pb-3 border-b-2 transition-colors ${
                            settingsSubTab === 'social'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          <Globe className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                          {t.settings.subTabs.socialLinks}
                        </button>

                        {/* Paramètres du compte */}
                        <button
                          onClick={() => setSettingsSubTab('account')}
                          className={`flex items-center gap-2 px-4 pt-2 pb-3 border-b-2 transition-colors ${
                            settingsSubTab === 'account'
                              ? 'text-[#297BFF] border-[#297BFF]'
                              : 'text-white/60 border-transparent hover:text-white'
                          }`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                        >
                          <div className="relative w-5 h-5">
                            <Settings className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                            <AlertCircle className="w-3 h-3 text-[#297BFF] absolute -top-1 -right-1 bg-sil-dark rounded-full" strokeWidth={1} />
                          </div>
                          {t.settings.subTabs.accountSettings}
                        </button>
                      </div>
                    </div>

                    {/* Contenu selon l'onglet actif */}
                    {settingsSubTab === 'personnel' && (
                      <div className="space-y-8 pt-20 pb-20">
                        {/* Section Informations De Base */}
                        <div>
                          <h3 
                            className="text-white mb-6"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '20px',
                            }}
                          >
                            {t.settings.personnel.basicInfo}
                          </h3>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Colonne gauche - Photo de profil */}
                            <div>
                              <label 
                                className="text-white/60 mb-4 block"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                }}
                              >
                                {t.settings.personnel.profilePhoto}
                              </label>
                              
                              {/* Zone d'upload */}
                              <div 
                                className="border-2 border-dashed border-white/20 p-8 text-center cursor-pointer hover:border-[#297BFF]/50 transition-colors"
                                onClick={() => profilePhotoInputRef.current?.click()}
                              >
                                {profilePhotoPreview ? (
                                  <div className="relative">
                                    <img 
                                      src={profilePhotoPreview} 
                                      alt="Preview" 
                                      className="w-full h-64 object-cover mb-4"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setProfilePhotoPreview(null)
                                        setProfilePhotoFile(null)
                                        if (profilePhotoInputRef.current) {
                                          profilePhotoInputRef.current.value = ''
                                        }
                                      }}
                                      className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full hover:bg-black"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-12 h-12 text-[#297BFF] mx-auto mb-4" strokeWidth={1} />
                                    <p 
                                      className="text-white mb-1"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontSize: '14px',
                                      }}
                                    >
                                      {t.settings.personnel.choosePhoto}
                                    </p>
                                    <p 
                                      className="text-white mb-4"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontSize: '14px',
                                      }}
                                    >
                                      {t.settings.personnel.dragDrop}
                                    </p>
                                    <p 
                                      className="text-white/60 text-xs"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontSize: '12px',
                                      }}
                                    >
                                      {t.settings.personnel.photoFormats}
                                    </p>
                                    <p 
                                      className="text-white/60 text-xs"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontSize: '12px',
                                      }}
                                    >
                                      {t.settings.personnel.photoQuality}
                                    </p>
                                    <p 
                                      className="text-white/60 text-xs mb-4"
                                      style={{
                                        fontFamily: 'Inter',
                                        fontWeight: 400,
                                        fontSize: '12px',
                                      }}
                                    >
                                      {t.settings.personnel.photoSize}
                                    </p>
                                  </>
                                )}
                                <input
                                  ref={profilePhotoInputRef}
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setProfilePhotoFile(file)
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        setProfilePhotoPreview(reader.result as string)
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                />
                                <button
                                onClick={() => profilePhotoInputRef.current?.click()}
                                className="mt-4 w-full bg-[#297BFF] text-white py-3 px-4 hover:bg-[#297BFF]/80 transition-colors"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                }}
                              >
                                {t.settings.personnel.browseFile}
                              </button>
                              </div>
                              
                              
                            </div>

                            {/* Colonne droite - Formulaire */}
                            <div className="space-y-4">
                              {/* Nom complet */}
                              <div>
                                <div className="relative">
                                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                                  <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder-transparent"
                                    placeholder=" "
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                                  />
                                  {!formData.fullName && (
                                    <span
                                      className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                                    >
                                      {t.settings.personnel.fullName}<span className="text-[#297BFF]">*</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Email */}
                              <div>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                                  <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/10 text-white/60 cursor-not-allowed"
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                                  />
                                </div>
                              </div>

                              {/* Téléphone */}
                              <div>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                                  <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder-transparent"
                                    placeholder=" "
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                                  />
                                  {!formData.phone && (
                                    <span
                                      className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[#999999]"
                                      style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                                    >
                                      {t.settings.personnel.phone}<span className="text-[#297BFF]">*</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Ville / Localisation */}
                              <div>
                                <div className="relative">
                                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                                  <select
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full pl-12 pr-10 py-4 bg-black/50 border border-white/10 text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all duration-300 appearance-none cursor-pointer hover:bg-[#2A2A2A] hover:shadow-lg"
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px' }}
                                  >
                                    <option value="">{t.settings.personnel.city}</option>
                                    <option value="Casablanca">Casablanca</option>
                                    <option value="Rabat">Rabat</option>
                                    <option value="Marrakech">Marrakech</option>
                                    <option value="Fès">Fès</option>
                                    <option value="Tanger">Tanger</option>
                                    <option value="Agadir">Agadir</option>
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none" />
                                </div>
                              </div>

                              {/* Compétence principale */}
                              <div>
                                <div className="relative">
                                  <RiPsychotherapyLine className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" />
                                  <div
                                    onClick={() => {
                                      setIsCategorieDropdownOpen(!isCategorieDropdownOpen)
                                      setIsMissionDropdownOpen(false)
                                    }}
                                    className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none border border-white/10 ${
                                      isCategorieDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                    } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                                  >
                                    <span className="block">
                                      {formData.mainSkill
                                        ? categories.find((c) => c.id === formData.mainSkill)?.nom || t.settings.personnel.mainSkill
                                        : t.settings.personnel.mainSkill}
                                    </span>
                                    <ChevronDown
                                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                        isCategorieDropdownOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>

                                  {isCategorieDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl max-h-60 overflow-y-auto">
                                      {categories.length === 0 ? (
                                        <div className="px-4 py-3 text-white/60 text-center">{t.settings.personnel.noCategory}</div>
                                      ) : (
                                        categories.map((categorie) => (
                                          <div key={categorie.id} className="px-4 py-2">
                                            <div
                                              onClick={() => {
                                                setFormData({ ...formData, mainSkill: categorie.id })
                                                setIsCategorieDropdownOpen(false)
                                              }}
                                              className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                                            >
                                              {categorie.nom}
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Type de mission souhaitée */}
                              <div>
                                <div className="relative">
                                  <ClipboardList className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                  <div
                                    onClick={() => {
                                      setIsMissionDropdownOpen(!isMissionDropdownOpen)
                                      setIsCategorieDropdownOpen(false)
                                    }}
                                    className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none border border-white/10 ${
                                      isMissionDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                    } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                                  >
                                    <span className="block">
                                      {formData.missionType === 'CDI'
                                        ? 'CDI'
                                        : formData.missionType === 'CDD'
                                        ? 'CDD'
                                        : formData.missionType === 'stage'
                                        ? 'Stage'
                                        : formData.missionType === 'freelance'
                                        ? 'Freelance'
                                        : formData.missionType === 'autre'
                                        ? t.settings.personnel.missionTypes.autre
                                        : t.settings.personnel.missionType}
                                    </span>
                                    <ChevronDown
                                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                        isMissionDropdownOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>

                                  {isMissionDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                      {['CDI', 'CDD', 'stage', 'freelance', 'autre'].map((value) => (
                                        <div key={value} className="px-4 py-2">
                                          <div
                                            onClick={() => {
                                              setFormData({ ...formData, missionType: value })
                                              setIsMissionDropdownOpen(false)
                                            }}
                                            className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '16px', color: '#999999' }}
                                          >
                                            {value === 'stage' ? 'Stage' : value === 'autre' ? 'Autre' : value}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Bouton Enregistrer */}
                              <button
                                onClick={handleSaveProfile}
                                disabled={isSaving || !hasChanges}
                                className="w-full bg-[#297BFF] text-white py-3 px-4 hover:bg-[#297BFF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '16px',
                                }}
                              >
                                {isSaving ? t.settings.personnel.saving : t.settings.personnel.saveChanges}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Section Votre CV */}
                        <div>
                          <h3 
                            className="text-white mb-6"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '20px',
                            }}
                          >
                            {t.settings.personnel.yourCv}
                          </h3>

                          {/* CV existants */}
                          {cvHistory.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              {cvHistory.map((cv) => (
                                <div 
                                  key={cv.id}
                                  className="bg-black/50 border border-white/10 p-4 flex items-center justify-between hover:bg-black/60 transition-colors relative"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-[#297BFF]" strokeWidth={1} />
                                    <div>
                                      <p 
                                        className="text-white"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 500,
                                          fontSize: '14px',
                                        }}
                                      >
                                        {cv.fileName}
                                      </p>
                                      <p 
                                        className="text-white/60 text-xs"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '12px',
                                        }}
                                      >
                                        {formatFileSize(cv.fileSize)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setCvMenuOpenId((current) => (current === cv.id ? null : cv.id))
                                      }}
                                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                  <MoreHorizontal className="w-5 h-5 text-white/60" />
                                    </button>

                                    {cvMenuOpenId === cv.id && (
                                      <div className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-white/10 shadow-xl z-20">
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadCvFromHistory(cv.id)}
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors text-left"
                                        >
                                          <Download className="w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                          <span>{t.settings.personnel.downloadCv}</span>
                                        </button>
                                        {cvHistory.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteCvFromHistory(cv.id)}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            <span>{t.settings.personnel.deleteCv}</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Zone d'upload CV */}
                          <div className="flex justify-start">
                          <div 
                              className="w-full lg:w-[55%] border-2 border-dashed border-white/20 p-6 cursor-pointer hover:border-[#297BFF]/50 transition-colors"
                            onClick={() => cvUploadInputRef.current?.click()}
                          >
                              <div className="flex items-start gap-4">
                                {/* Icône + dans un cercle bleu */}
                                <div className="w-8 h-8 rounded-full border border-[#297BFF] flex items-center justify-center">
                                  <Plus className="w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                </div>
                                <div>
                                  <p 
                                    className="text-white mb-1"
                                    style={{
                                      fontFamily: 'Inter',
                                      fontWeight: 400,
                                      fontSize: '14px',
                                    }}
                                  >
                                    {t.settings.personnel.addCv}
                                  </p>
                            <p 
                              className="text-white/60"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: '14px',
                              }}
                            >
                              {t.settings.personnel.cvInstructions}
                            </p>
                                </div>
                              </div>
                            <input
                              ref={cvUploadInputRef}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={handleUploadCv}
                            />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Autres onglets (à implémenter si nécessaire) */}
                    {settingsSubTab === 'profil' && (
                      <div className="space-y-8 pt-20 pb-20">
                        <h3
                          className="text-white mb-6"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 600,
                            fontSize: '20px',
                          }}
                        >
                          {t.settings.profil.title}
                        </h3>

                        {/* Grille des champs principaux */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nationalité */}
                          <div>
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                              <div
                                onClick={() =>
                                  setOpenProfileSelect(openProfileSelect === 'nationality' ? null : 'nationality')
                                }
                                className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                  openProfileSelect === 'nationality' ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#999999',
                                }}
                              >
                                <span className="block">
                                  {profileFormData.nationality === 'marocaine'
                                    ? 'Marocaine'
                                    : profileFormData.nationality === 'francaise'
                                    ? 'Française'
                                    : profileFormData.nationality === 'autre'
                                    ? 'Autre'
                                    : t.settings.profil.nationality}
                                </span>
                                <ChevronDown
                                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                    openProfileSelect === 'nationality' ? 'rotate-180' : ''
                                  }`}
                                />

                                {/* Ligne bleue en bas comme les selects d'inscription */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>

                              {openProfileSelect === 'nationality' && (
                                <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                  {[
                                    { value: 'marocaine', label: t.settings.profil.nationalities.marocaine },
                                    { value: 'francaise', label: t.settings.profil.nationalities.francaise },
                                    { value: 'autre', label: t.settings.profil.nationalities.autre },
                                  ].map((option) => (
                                    <div key={option.value} className="px-4 py-2">
                                      <div
                                        onClick={() => {
                                          setProfileFormData({ ...profileFormData, nationality: option.value })
                                          setOpenProfileSelect(null)
                                        }}
                                        className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#999999',
                                        }}
                                      >
                                        {option.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date de naissance */}
                          <div>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsDobPickerOpen((open) => !open)}
                                className={`w-full pl-12 pr-10 py-4 text-left text-[#999999] focus:outline-none transition-all duration-300 relative rounded-none ${
                                  isDobPickerOpen ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                              >
                                <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                                <span className="block">
                                  {profileFormData.dateOfBirth
                                    ? formatDobForDisplay(profileFormData.dateOfBirth)
                                    : t.settings.profil.dateOfBirth}
                                </span>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none" />

                                {/* Ligne bleue en bas comme sur les selects du formulaire d'inscription */}
                                <div className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </button>

                              {isDobPickerOpen && (
                                <div className="absolute z-50 mt-1 w-full bg-[#0F0F10] shadow-2xl">
                                  {/* Header mois / année */}
                                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newMonth = dobMonth - 1
                                        if (newMonth < 0) {
                                          setDobMonth(11)
                                          setDobYear((y) => y - 1)
                                        } else {
                                          setDobMonth(newMonth)
                                        }
                                      }}
                                      className="p-1 rounded-full hover:bg-white/10 text-white"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>

                                  <div className="flex items-center gap-3">
                                      <select
                                        value={dobMonth}
                                        onChange={(e) => setDobMonth(Number(e.target.value))}
                                        className="min-w-[110px] bg-[#2A2A2A] text-[#D9D9D9] text-xs px-3 py-1.5 focus:outline-none"
                                      >
                                        {t.settings.profil.months.map(
                                          (label, index) => (
                                            <option key={label} value={index}>
                                              {label}
                                            </option>
                                          )
                                        )}
                                      </select>
                                      <select
                                        value={dobYear}
                                        onChange={(e) => setDobYear(Number(e.target.value))}
                                        className="min-w-[90px] bg-[#2A2A2A] text-[#D9D9D9] text-xs px-3 py-1.5 focus:outline-none"
                                      >
                                        {Array.from({ length: 80 }).map((_, i) => {
                                          const year = today.getFullYear() - i
                                          return (
                                            <option key={year} value={year}>
                                              {year}
                                            </option>
                                          )
                                        })}
                                      </select>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newMonth = dobMonth + 1
                                        if (newMonth > 11) {
                                          setDobMonth(0)
                                          setDobYear((y) => y + 1)
                                        } else {
                                          setDobMonth(newMonth)
                                        }
                                      }}
                                      className="p-1 rounded-full hover:bg-white/10 text-white"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Jours de la semaine (lundi en premier) - 90% de la largeur */}
                                  <div className="grid grid-cols-7 gap-1 px-4 pt-3 text-[10px] text-white/60 w-[90%] mx-auto">
                                    {t.settings.profil.weekDays.map((d) => (
                                      <div key={d} className="text-center">
                                        {d}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Jours du mois (zone centrée à 90% de la largeur) */}
                                  <div className="grid grid-cols-7 gap-1 px-4 pb-4 pt-1 text-xs w-[90%] mx-auto">
                                    {Array.from({ length: getFirstDayOfWeek(dobYear, dobMonth) }).map((_, index) => (
                                      <div key={`empty-${index}`} />
                                    ))}
                                    {Array.from({ length: getDaysInMonth(dobYear, dobMonth) }).map((_, index) => {
                                      const day = index + 1
                                      const month = dobMonth + 1
                                      const monthStr = month < 10 ? `0${month}` : String(month)
                                      const dayStr = day < 10 ? `0${day}` : String(day)
                                      const value = `${dobYear}-${monthStr}-${dayStr}`
                                      const isSelected = profileFormData.dateOfBirth === value
                                      return (
                                        <button
                                          key={day}
                                          type="button"
                                          onClick={() => handleSelectDobDay(day)}
                                          className={`w-8 h-8 flex items-center justify-center rounded-none ${
                                            isSelected
                                              ? 'bg-[#297BFF] text-white'
                                              : 'text-white hover:bg-white/10'
                                          }`}
                                        >
                                          {day}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Genre */}
                          <div>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                              <div
                                onClick={() =>
                                  setOpenProfileSelect(openProfileSelect === 'gender' ? null : 'gender')
                                }
                                className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                  openProfileSelect === 'gender' ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#999999',
                                }}
                              >
                                <span className="block">
                                  {profileFormData.gender === 'homme'
                                    ? t.settings.profil.genders.homme
                                    : profileFormData.gender === 'femme'
                                    ? t.settings.profil.genders.femme
                                    : profileFormData.gender === 'autre'
                                    ? t.settings.profil.genders.autre
                                    : t.settings.profil.gender}
                                </span>
                                <ChevronDown
                                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                    openProfileSelect === 'gender' ? 'rotate-180' : ''
                                  }`}
                                />

                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>

                              {openProfileSelect === 'gender' && (
                                <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                  {[
                                    { value: 'homme', label: t.settings.profil.genders.homme },
                                    { value: 'femme', label: t.settings.profil.genders.femme },
                                    { value: 'autre', label: t.settings.profil.genders.autre },
                                  ].map((option) => (
                                    <div key={option.value} className="px-4 py-2">
                                      <div
                                        onClick={() => {
                                          setProfileFormData({ ...profileFormData, gender: option.value })
                                          setOpenProfileSelect(null)
                                        }}
                                        className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#999999',
                                        }}
                                      >
                                        {option.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* État civil */}
                          <div>
                            <div className="relative">
                              <ClipboardList className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                              <div
                                onClick={() =>
                                  setOpenProfileSelect(openProfileSelect === 'maritalStatus' ? null : 'maritalStatus')
                                }
                                className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                  openProfileSelect === 'maritalStatus' ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#999999',
                                }}
                              >
                                <span className="block">
                                  {profileFormData.maritalStatus === 'celibataire'
                                    ? t.settings.profil.maritalStatuses.celibataire
                                    : profileFormData.maritalStatus === 'marie'
                                    ? t.settings.profil.maritalStatuses.marie
                                    : profileFormData.maritalStatus === 'divorce'
                                    ? t.settings.profil.maritalStatuses.divorce
                                    : profileFormData.maritalStatus === 'veuf'
                                    ? t.settings.profil.maritalStatuses.veuf
                                    : t.settings.profil.maritalStatus}
                                </span>
                                <ChevronDown
                                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                    openProfileSelect === 'maritalStatus' ? 'rotate-180' : ''
                                  }`}
                                />

                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>

                              {openProfileSelect === 'maritalStatus' && (
                                <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                  {[
                                    { value: 'celibataire', label: t.settings.profil.maritalStatuses.celibataire },
                                    { value: 'marie', label: t.settings.profil.maritalStatuses.marie },
                                    { value: 'divorce', label: t.settings.profil.maritalStatuses.divorce },
                                    { value: 'veuf', label: t.settings.profil.maritalStatuses.veuf },
                                  ].map((option) => (
                                    <div key={option.value} className="px-4 py-2">
                                      <div
                                        onClick={() => {
                                          setProfileFormData({ ...profileFormData, maritalStatus: option.value })
                                          setOpenProfileSelect(null)
                                        }}
                                        className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#999999',
                                        }}
                                      >
                                        {option.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Niveau d'éducation */}
                          <div>
                            <div className="relative">
                              <Brain className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                              <div
                                onClick={() =>
                                  setOpenProfileSelect(openProfileSelect === 'educationLevel' ? null : 'educationLevel')
                                }
                                className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                  openProfileSelect === 'educationLevel' ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#999999',
                                }}
                              >
                                <span className="block">
                                  {profileFormData.educationLevel === 'bac'
                                    ? t.settings.profil.educationLevels.bac
                                    : profileFormData.educationLevel === 'bac+2'
                                    ? t.settings.profil.educationLevels['bac+2']
                                    : profileFormData.educationLevel === 'bac+3'
                                    ? t.settings.profil.educationLevels['bac+3']
                                    : profileFormData.educationLevel === 'bac+5'
                                    ? t.settings.profil.educationLevels['bac+5']
                                    : profileFormData.educationLevel === 'autre'
                                    ? t.settings.profil.educationLevels.autre
                                    : t.settings.profil.educationLevel}
                                </span>
                                <ChevronDown
                                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                    openProfileSelect === 'educationLevel' ? 'rotate-180' : ''
                                  }`}
                                />

                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>

                              {openProfileSelect === 'educationLevel' && (
                                <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                  {[
                                    { value: 'bac', label: t.settings.profil.educationLevels.bac },
                                    { value: 'bac+2', label: t.settings.profil.educationLevels['bac+2'] },
                                    { value: 'bac+3', label: t.settings.profil.educationLevels['bac+3'] },
                                    { value: 'bac+5', label: t.settings.profil.educationLevels['bac+5'] },
                                    { value: 'autre', label: t.settings.profil.educationLevels.autre },
                                  ].map((option) => (
                                    <div key={option.value} className="px-4 py-2">
                                      <div
                                        onClick={() => {
                                          setProfileFormData({ ...profileFormData, educationLevel: option.value })
                                          setOpenProfileSelect(null)
                                        }}
                                        className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#999999',
                                        }}
                                      >
                                        {option.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expérience professionnelle */}
                          <div>
                            <div className="relative">
                              <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF] pointer-events-none z-10" strokeWidth={1} />
                              <div
                                onClick={() =>
                                  setOpenProfileSelect(
                                    openProfileSelect === 'professionalExperience' ? null : 'professionalExperience'
                                  )
                                }
                                className={`w-full pl-12 pr-12 py-4 cursor-pointer focus:outline-none transition-all duration-300 relative rounded-none ${
                                  openProfileSelect === 'professionalExperience' ? 'bg-[#1A1A1A]' : 'bg-black/50'
                                } hover:bg-[#2A2A2A] hover:shadow-lg`}
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#999999',
                                }}
                              >
                                <span className="block">
                                  {profileFormData.professionalExperience === '0-1'
                                    ? t.settings.profil.experiences['0-1']
                                    : profileFormData.professionalExperience === '1-3'
                                    ? t.settings.profil.experiences['1-3']
                                    : profileFormData.professionalExperience === '3-5'
                                    ? t.settings.profil.experiences['3-5']
                                    : profileFormData.professionalExperience === '5+'
                                    ? t.settings.profil.experiences['5+']
                                    : t.settings.profil.professionalExperience}
                                </span>
                                <ChevronDown
                                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999] pointer-events-none transition-transform ${
                                    openProfileSelect === 'professionalExperience' ? 'rotate-180' : ''
                                  }`}
                                />

                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>

                              {openProfileSelect === 'professionalExperience' && (
                                <div className="absolute z-50 w-full mt-0 bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                  {[
                                    { value: '0-1', label: t.settings.profil.experiences['0-1'] },
                                    { value: '1-3', label: t.settings.profil.experiences['1-3'] },
                                    { value: '3-5', label: t.settings.profil.experiences['3-5'] },
                                    { value: '5+', label: t.settings.profil.experiences['5+'] },
                                  ].map((option) => (
                                    <div key={option.value} className="px-4 py-2">
                                      <div
                                        onClick={() => {
                                          setProfileFormData({
                                            ...profileFormData,
                                            professionalExperience: option.value,
                                          })
                                          setOpenProfileSelect(null)
                                        }}
                                        className="px-4 py-3 bg-[#2A2A2A] cursor-pointer rounded-none transition-all duration-300 hover:bg-[#297BFF]/20 hover:text-[#297BFF] hover:shadow-md hover:scale-[1.02]"
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '14px',
                                          color: '#999999',
                                        }}
                                      >
                                        {option.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Biographie */}
                        <div>
                          <textarea
                            value={profileFormData.biography}
                            onChange={(e) =>
                              setProfileFormData({ ...profileFormData, biography: e.target.value })
                            }
                            className="w-full min-h-[180px] px-4 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all resize-none"
                            placeholder={t.settings.profil.biography}
                            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                          />
                        </div>

                        {/* Bouton enregistrer */}
                        <div>
                          <button
                            onClick={async () => {
                              try {
                                const payload = {
                                  nationality: profileFormData.nationality || null,
                                  dateOfBirth: profileFormData.dateOfBirth || null,
                                  gender: profileFormData.gender || null,
                                  maritalStatus: profileFormData.maritalStatus || null,
                                  educationLevel: profileFormData.educationLevel || null,
                                  professionalExperience: profileFormData.professionalExperience || null,
                                  biography: profileFormData.biography || null,
                                }

                                const response = await api.put('/candidates/profile', payload)
                                const updated = response.data.data || response.data

                                // Mettre à jour le profil local avec la réponse
                                const updatedProfileData = {
                                  nationality: updated.nationality || '',
                                  dateOfBirth: updated.dateOfBirth
                                    ? updated.dateOfBirth.split('T')[0]
                                    : profileFormData.dateOfBirth,
                                  gender: updated.gender || '',
                                  maritalStatus: updated.maritalStatus || '',
                                  educationLevel: updated.educationLevel || '',
                                  professionalExperience: updated.professionalExperience || '',
                                  biography: updated.biography || '',
                                }

                                setProfile((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        nationality: updated.nationality,
                                        dateOfBirth: updated.dateOfBirth,
                                        gender: updated.gender,
                                        maritalStatus: updated.maritalStatus,
                                        educationLevel: updated.educationLevel,
                                        professionalExperience: updated.professionalExperience,
                                        biography: updated.biography,
                                      }
                                    : prev
                                )

                                setInitialProfileFormData(updatedProfileData)
                                setProfileFormData(updatedProfileData)
                                toast.success(t.messages.profileDetailsUpdated)
                              } catch (error: any) {
                                toast.error(
                                  error?.response?.data?.message || 'Erreur lors de la mise à jour du profil'
                                )
                              }
                            }}
                            disabled={!hasProfileChanges}
                            className="w-full md:w-auto bg-[#297BFF] text-white py-3 px-8 hover:bg-[#297BFF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontSize: '16px',
                            }}
                          >
                            {isSaving ? t.settings.profil.saving : t.settings.profil.save}
                          </button>
                        </div>
                      </div>
                    )}
                    {settingsSubTab === 'social' && (
                      <div className="space-y-6 pt-20 pb-20">
                        <h3
                          className="text-white mb-2"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 600,
                            fontSize: '20px',
                          }}
                        >
                          {t.settings.subTabs.socialLinks}
                        </h3>

                        {/* Ligne LinkedIn */}
                        {showLinkedinRow && (
                          <div className="bg-black/40 border border-white/10 py-3 px-4 flex items-center gap-4">
                            {/* Sélecteur réseau (fixe LinkedIn) */}
                            <div className="relative w-full md:w-1/3">
                              <div
                                className="w-full pl-10 pr-10 py-3 cursor-default bg-[#1A1A1A] hover:bg-[#1E1E1E] transition-colors relative"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#D9D9D9',
                                }}
                              >
                                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                <span>{t.settings.social.linkedin}</span>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999999]" />
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>
                            </div>

                            {/* Input URL */}
                            <div className="relative flex-1">
                              <input
                                type="url"
                                value={socialFormData.linkedin}
                                onChange={(e) =>
                                  setSocialFormData({
                                    ...socialFormData,
                                    linkedin: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                                placeholder={t.settings.social.linkedin + ' / URL ...'}
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                              />
                            </div>

                            {/* Bouton supprimer (supprime la ligne) */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowLinkedinRow(false)
                                setSocialFormData((prev) => ({ ...prev, linkedin: '' }))
                              }}
                              className="ml-2 text-[#FF4B4B] hover:text-[#FF8282] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Ligne Portfolio */}
                        {showPortfolioRow && (
                          <div className="bg-black/40 border border-white/10 py-3 px-4 flex items-center gap-4">
                            {/* Sélecteur réseau (fixe Portfolio) */}
                            <div className="relative w-full md:w-1/3">
                              <div
                                className="w-full pl-10 pr-10 py-3 cursor-default bg-[#1A1A1A] hover:bg-[#1E1E1E] transition-colors relative"
                                style={{
                                  fontFamily: 'Inter',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: '#D9D9D9',
                                }}
                              >
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#297BFF]" strokeWidth={1} />
                                <span>{t.settings.social.portfolio}</span>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999999]" />
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#297BFF]" />
                              </div>
                            </div>

                            {/* Input URL */}
                            <div className="relative flex-1">
                              <input
                                type="url"
                                value={socialFormData.portfolio}
                                onChange={(e) =>
                                  setSocialFormData({
                                    ...socialFormData,
                                    portfolio: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                                placeholder={t.settings.social.linkedin + ' / URL ...'}
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                              />
                            </div>

                            {/* Bouton supprimer (supprime la ligne) */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowPortfolioRow(false)
                                setSocialFormData((prev) => ({ ...prev, portfolio: '' }))
                              }}
                              className="ml-2 text-[#FF4B4B] hover:text-[#FF8282] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Bouton "Ajouter un nouveau lien social" */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!showLinkedinRow) {
                              setShowLinkedinRow(true)
                            } else if (!showPortfolioRow) {
                              setShowPortfolioRow(true)
                            }
                          }}
                          className="w-full bg-[#3A3A3A] text-[#D9D9D9] py-3 px-4 text-center hover:bg-[#4A4A4A] transition-colors"
                          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                        >
                          {!showLinkedinRow ? t.settings.social.addLinkedin : !showPortfolioRow ? t.settings.social.addPortfolio : ''}
                        </button>

                        {/* Bouton sauvegarde */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleSaveSocialLinks}
                            disabled={isSavingSocial || !hasSocialChanges}
                            className="w-full md:w-auto bg-[#297BFF] text-white py-3 px-8 hover:bg-[#297BFF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontSize: '16px',
                            }}
                          >
                            {isSavingSocial ? t.settings.social.saving : t.settings.social.save}
                          </button>
                        </div>
                      </div>
                    )}
                    {settingsSubTab === 'account' && (
                      <div className="space-y-10 pt-20 pb-20">
                        {/* Section localisation / téléphone simplifiée */}
                        <div className="space-y-4">
                          <h3
                            className="text-white"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '18px',
                            }}
                          >
                            {t.settings.personnel.city}
                          </h3>
                          <div className="space-y-3">
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                              <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                                placeholder={t.settings.personnel.city}
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                              />
                            </div>
                            {phoneError && (
                              <p
                                className="text-red-500 text-xs mt-1"
                                style={{ fontFamily: 'Inter', fontWeight: 400 }}
                              >
                                {phoneError}
                              </p>
                            )}
                            {/* Ligne téléphone avec select pays + code */}
                            <div className="flex items-center gap-3">
                              {/* Select pays / code */}
                              <div className="relative w-[40%] md:w-[30%]">
                                <div
                                  onClick={() => setIsPhoneCountryDropdownOpen((open) => !open)}
                                  className={`w-full pl-12 pr-8 py-4 cursor-pointer bg-black/60 transition-colors relative ${
                                    isPhoneCountryDropdownOpen ? 'bg-[#1A1A1A]' : 'bg-black/60'
                                  } hover:bg-[#2A2A2A]`}
                                  style={{
                                    fontFamily: 'Inter',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                    color: '#D9D9D9',
                                  }}
                                >
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="text-base leading-none">{selectedPhoneCountry.flag}</span>
                                  </div>
                                  <span className="ml-7">{selectedPhoneCountry.dial}</span>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                                </div>
                                {isPhoneCountryDropdownOpen && (
                                  <div className="absolute z-50 mt-1 w-full bg-[#1A1A1A] border border-[#D9D9D9]/20 shadow-xl">
                                    {phoneCountryOptions.map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#297BFF]/20 hover:text-[#297BFF] transition-colors"
                                        onClick={() => {
                                          setSelectedPhoneCountry(opt)
                                          setIsPhoneCountryDropdownOpen(false)
                                          const combined = `${opt.dial} ${phoneLocal}`.trim()
                                          setFormData((prev) => ({ ...prev, phone: combined }))
                                          validatePhoneLocal(phoneLocal, opt)
                                        }}
                                        style={{
                                          fontFamily: 'Inter',
                                          fontWeight: 400,
                                          fontSize: '13px',
                                          color: '#D9D9D9',
                                        }}
                                      >
                                        <span className="text-base leading-none">{opt.flag}</span>
                                        <div className="flex flex-col ml-1">
                                          <span className="text-sm text-white">{opt.dial}</span>
                                          <span className="text-[11px] text-[#999999]">{opt.label}</span>
                                        </div>
                                      </div>
                                    ))}
                  </div>
                )}
              </div>

                              {/* Input numéro */}
                              <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                                <input
                                  type="tel"
                                  value={phoneLocal}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setPhoneLocal(value)
                                    const combined = `${selectedPhoneCountry.dial} ${value}`.trim()
                                    setFormData((prev) => ({ ...prev, phone: combined }))
                                    validatePhoneLocal(value, selectedPhoneCountry)
                                  }}
                                  className="w-full pl-10 pr-4 py-4 bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#297BFF] transition-all placeholder:text-[#666666]"
                                  placeholder={t.settings.personnel.phone}
                                  style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                />
            </div>
          </div>

                            {/* Adresse email (lecture seule) */}
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                              <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 text-white/70 cursor-not-allowed"
                                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                                placeholder={formData.email || t.settings.personnel.fullName}
                              />
        </div>
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              disabled={isSaving || !hasChanges}
                              className="mt-2 w-full md:w-auto bg-[#297BFF] text-white py-3 px-8 hover:bg-[#297BFF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: '14px',
                              }}
                            >
                              {isSaving ? t.settings.profil.saving : t.settings.profil.save}
                            </button>
    </div>
                        </div>

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
                            {t.settings.account.changePassword}
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
                              placeholder={t.settings.account.currentPassword}
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPasswordVisibility((prev) => ({ ...prev, current: !prev.current }))
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            >
                              {passwordVisibility.current ? (
                                <EyeOff className="w-5 h-5" strokeWidth={1} />
                              ) : (
                                <Eye className="w-5 h-5" strokeWidth={1} />
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
                              placeholder={t.settings.account.newPassword}
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPasswordVisibility((prev) => ({ ...prev, new: !prev.new }))
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            >
                              {passwordVisibility.new ? (
                                <EyeOff className="w-5 h-5" strokeWidth={1} />
                              ) : (
                                <Eye className="w-5 h-5" strokeWidth={1} />
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
                              placeholder={t.settings.account.confirmPassword}
                              style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px' }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPasswordVisibility((prev) => ({ ...prev, confirm: !prev.confirm }))
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            >
                              {passwordVisibility.confirm ? (
                                <EyeOff className="w-5 h-5" strokeWidth={1} />
                              ) : (
                                <Eye className="w-5 h-5" strokeWidth={1} />
                              )}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isSavingPassword || !hasPasswordChanges}
                            className="mt-2 w-full md:w-auto bg-[#297BFF] text-white py-3 px-8 hover:bg-[#297BFF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontSize: '14px',
                            }}
                          >
                            {isSavingPassword ? t.settings.account.saving : t.settings.account.save}
                          </button>
                        </div>

                        {/* Supprimer le compte */}
                        <div className="pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={handleDeleteProfile}
                            className="mt-8 inline-flex items-center gap-3 text-[#FF4B4B] hover:text-[#FF4B4B] transition-colors"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 500,
                              fontSize: '18px',
                            }}
                          >
                            <XCircle className="w-6 h-6" />
                            <span>Supprimer Mon Compte</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popup Modal pour les détails du message */}
      <AnimatePresence>
        {showContactDetails && selectedContactMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4"
            onClick={handleCloseContactDetails}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Bouton de fermeture rond à l'extérieur en haut à droite */}
            <button
              onClick={handleCloseContactDetails}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-9 md:h-9 rounded-full border border-[#297BFF]/60 bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#297BFF] hover:border-[#297BFF] transition-colors z-20"
              aria-label={t.contact.details.close}
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-[#1A1A1A] border border-[#297BFF]/30 shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col my-auto"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(41, 123, 255, 0.1), 0 0 40px rgba(41, 123, 255, 0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de la popup avec bordure bleue */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#297BFF]/20 bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A] relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#297BFF] to-transparent opacity-50"></div>
                <div className="flex items-center gap-3">
                  <h3 
                    className="text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '22px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {t.contact.details.title}
                  </h3>
                </div>
              </div>

              {/* Contenu de la popup avec scroll */}
              <div className="p-4 md:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom et Prénom */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.contact.details.name}
                      </label>
                    </div>
                    <p 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '16px',
                      }}
                    >
                      {selectedContactMessage.name}
                    </p>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.contact.details.email}
                      </label>
                    </div>
                    <p 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '16px',
                      }}
                    >
                      {selectedContactMessage.email}
                    </p>
                  </motion.div>

                  {/* Sujet */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.contact.details.subject}
                      </label>
                    </div>
                    <p 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '16px',
                      }}
                    >
                      {selectedContactMessage.subject}
                    </p>
                  </motion.div>

                  {/* Date */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CalendarIcon className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.contact.details.date}
                      </label>
                    </div>
                    <p 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '16px',
                      }}
                    >
                      {new Date(selectedContactMessage.created_at).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p 
                      className="text-white/70 mt-1"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                    >
                      {new Date(selectedContactMessage.created_at).toLocaleTimeString(lang === 'FR' ? 'fr-FR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </motion.div>

                  {/* Téléphone */}
                  {selectedContactMessage.phone && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                        <label 
                          className="text-white/60"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {t.contact.details.phone}
                        </label>
                      </div>
                      <p 
                        className="text-white"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '16px',
                        }}
                      >
                        {selectedContactMessage.phone}
                      </p>
                    </motion.div>
                  )}

                  {/* Entreprise */}
                  {selectedContactMessage.company && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                        <label 
                          className="text-white/60"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {t.contact.details.company}
                        </label>
                      </div>
                      <p 
                        className="text-white"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '16px',
                        }}
                      >
                        {selectedContactMessage.company}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                    <label 
                      className="text-white/60"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {t.contact.details.message}
                    </label>
                  </div>
                  <div 
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 text-white/90"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '1.6',
                      minHeight: '100px',
                    }}
                  >
                    {selectedContactMessage.message}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Modal pour les détails de candidature */}
      <AnimatePresence>
        {showCandidatureDetails && selectedCandidature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4"
            onClick={handleCloseCandidatureDetails}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-[#1A1A1A] border border-[#297BFF]/30 shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col my-auto"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(41, 123, 255, 0.1), 0 0 40px rgba(41, 123, 255, 0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de la popup avec bordure bleue */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#297BFF]/20 bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A] relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#297BFF] to-transparent opacity-50"></div>
                <div className="flex items-center gap-3">
                  <h3 
                    className="text-white"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '22px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {t.cv.details.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseCandidatureDetails}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-none p-2 transition-all duration-200"
                  aria-label={t.cv.details.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu de la popup avec scroll */}
              <div className="p-4 md:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Catégorie */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <RiPsychotherapyLine className="w-5 h-5 text-[#297BFF]" />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.cv.details.category}
                      </label>
                    </div>
                    <p 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '16px',
                      }}
                    >
                      {selectedCandidature.categorie?.nom || t.cv.unknownCategory}
                    </p>
                  </motion.div>

                  {/* Date de postulation */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CalendarIcon className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.cv.details.applicationDate}
                      </label>
                    </div>
                    <p 
                      className="text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '16px',
                      }}
                    >
                      {new Date(selectedCandidature.datePostulation).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p 
                      className="text-white/70 mt-1"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                    >
                      {new Date(selectedCandidature.datePostulation).toLocaleTimeString(lang === 'FR' ? 'fr-FR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </motion.div>

                  {/* Statut */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                      <label 
                        className="text-white/60"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {t.cv.details.status}
                      </label>
                    </div>
                    {(() => {
                      const statutConfig: Record<string, { label: string; bg: string; text: string }> = {
                        'en_attente': { label: t.cv.statuses.en_attente, bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
                        'en_cours': { label: t.cv.statuses.en_cours, bg: 'bg-blue-500/20', text: 'text-blue-400' },
                        'accepte': { label: t.cv.statuses.accepte, bg: 'bg-green-500/20', text: 'text-green-400' },
                        'refuse': { label: t.cv.statuses.refuse, bg: 'bg-red-500/20', text: 'text-red-400' },
                        'archive': { label: t.cv.statuses.archive, bg: 'bg-gray-500/20', text: 'text-gray-400' },
                      }
                      const config = statutConfig[selectedCandidature.statut] || { label: t.cv.statuses.actif, bg: 'bg-[#297BFF]/20', text: 'text-[#297BFF]' }
                      return (
                        <span 
                          className={`inline-flex items-center px-3 py-1.5 rounded-none ${config.bg} ${config.text}`}
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '14px',
                          }}
                        >
                          {config.label}
                        </span>
                      )
                    })()}
                  </motion.div>

                  {/* Type de mission */}
                  {selectedCandidature.typeDeMission && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-none p-4 hover:border-[#297BFF]/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <ClipboardList className="w-5 h-5 text-[#297BFF]" strokeWidth={1} />
                        <label 
                          className="text-white/60"
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {t.cv.details.missionType}
                        </label>
                      </div>
                      <p 
                        className="text-white"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '16px',
                        }}
                      >
                        {selectedCandidature.typeDeMission}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Bouton pour télécharger le CV */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <button
                    onClick={async () => {
                      await handleDownloadCvFromCandidature(selectedCandidature.cvPath)
                      handleCloseCandidatureDetails()
                    }}
                    className="w-full bg-gradient-to-r from-[#297BFF] to-[#1E5FD9] text-white py-4 px-6 hover:from-[#297BFF]/90 hover:to-[#1E5FD9]/90 transition-all duration-300 flex items-center justify-center gap-3 rounded-none shadow-lg shadow-[#297BFF]/20 hover:shadow-[#297BFF]/30 hover:scale-[1.02] active:scale-[0.98] border border-[#297BFF]/30"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '16px',
                      letterSpacing: '0.01em',
                    }}
                  >
                    <Download className="w-5 h-5" />
                    {t.cv.details.downloadCv}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}