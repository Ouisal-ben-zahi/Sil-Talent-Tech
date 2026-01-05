"use client"

import { memo } from 'react'
// import dynamic from 'next/dynamic'

// Lazy load des composants de tabs pour réduire le bundle initial
// TODO: Create tab components in ./tabs/ directory
// const ProfileTab = dynamic(() => import('./tabs/ProfileTab'), {
//   loading: () => <div className="flex items-center justify-center p-8">Chargement...</div>,
//   ssr: false,
// })

// const CvHistoryTab = dynamic(() => import('./tabs/CvHistoryTab'), {
//   loading: () => <div className="flex items-center justify-center p-8">Chargement...</div>,
//   ssr: false,
// })

// const ContactTab = dynamic(() => import('./tabs/ContactTab'), {
//   loading: () => <div className="flex items-center justify-center p-8">Chargement...</div>,
//   ssr: false,
// })

// const SettingsTab = dynamic(() => import('./tabs/SettingsTab'), {
//   loading: () => <div className="flex items-center justify-center p-8">Chargement...</div>,
//   ssr: false,
// })

interface CandidateDashboardTabsProps {
  activeTab: string
  [key: string]: any // Pour passer toutes les props nécessaires
}

// Wrapper pour les tabs avec lazy loading
export const CandidateDashboardTabs = memo(function CandidateDashboardTabs({
  activeTab,
  ...props
}: CandidateDashboardTabsProps) {
  // TODO: Implement tab components
  return <div className="flex items-center justify-center p-8">Tabs component not yet implemented</div>
  // switch (activeTab) {
  //   case 'profile':
  //     return <ProfileTab {...props} />
  //   case 'cv':
  //     return <CvHistoryTab {...props} />
  //   case 'contact':
  //     return <ContactTab {...props} />
  //   case 'settings':
  //     return <SettingsTab {...props} />
  //   default:
  //     return <ProfileTab {...props} />
  // }
})

