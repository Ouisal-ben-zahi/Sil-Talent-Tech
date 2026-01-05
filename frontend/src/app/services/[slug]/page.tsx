'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, Brain, Network, Briefcase, CheckCircle } from 'lucide-react'
import { ServiceCtaButtons } from '../ServiceCtaButtons'
import { SectorsCarouselSimple } from '../SectorsCarouselSimple'
import { useLanguage } from '@/context/LanguageContext'

const heroImagePath = '/assets/Images/hero.PNG'

const servicesData: Record<string, {
  icon: any
  title: string
  heroTitle: string
  heroDescription: string
  presentationTitle: string
  presentationBody: string
  seoTitle: string
  seoDescription: string
  problems: string[]
  sectors: string[]
  sectorsDetailed: Array<{ title: string; description: string }>
  deliverables: string[]
  advantages: string[]
}> = {
  'cybersecurite': {
    icon: Shield,
    title: 'Cybersécurité',
    heroTitle: 'Sécurisez votre organisation avec les meilleurs talents en cybersécurité',
    heroDescription:
      'Sil Talents Tech vous accompagne dans le recrutement de profils cybersécurité hautement qualifiés pour sécuriser vos systèmes, vos données sensibles et vos infrastructures critiques. Nous intervenons de la gouvernance aux opérations (SOC, pentest, incident response) en intégrant vos enjeux réglementaires, business et opérationnels. Notre objectif : renforcer durablement votre posture de sécurité avec des talents adaptés à votre culture et à votre niveau de maturité.',
    presentationTitle: 'Une approche cybersécurité orientée talents et résilience',
    presentationBody:
      'Nos équipes spécialisées en cybersécurité couvrent l’ensemble de la chaîne de valeur : gouvernance, architecture, opérations, détection, réponse à incident et conformité. Nous parlons le langage de vos équipes techniques et de vos directions métiers pour vous proposer des profils immédiatement opérationnels, capables de renforcer durablement votre posture de sécurité.',
    seoTitle: 'Recrutement en Cybersécurité | Experts Sécurité Informatique | Sil Talents Tech',
    seoDescription: 'Cabinet spécialisé en recrutement cybersécurité : SOC, pentest, gouvernance, conformité RGPD, DevSecOps et sécurité cloud. Trouvez des experts sécurité adaptés à vos enjeux stratégiques.',
    problems: [
      'Difficulté à identifier des profils cybersécurité certifiés (CISSP, CEH, OSCP, ISO 27001).',
      'Manque d\'experts capables de piloter la conformité (RGPD, NIS2, PCI-DSS) et la gestion des risques.',
      'Besoin de renforcer les équipes SOC, de détection d’incidents et de réponse à incident 24/7.',
      'Nouveaux défis liés à la sécurité cloud, au Zero Trust et aux approches DevSecOps.',
    ],
    sectors: [
      'Banque, assurance et services financiers.',
      'E-commerce, retail et plateformes digitales à forte volumétrie.',
      'Santé, pharma et structures manipulant des données sensibles.',
      'Industrie, énergie et opérateurs d\'importance vitale (OIV).',
      'Secteur public, collectivités et institutions.',
    ],
    sectorsDetailed: [
      {
        title: 'Banque, assurance et services financiers',
        description: 'Nous accompagnons les établissements financiers dans le recrutement de profils cybersécurité capables de sécuriser leurs systèmes critiques, de garantir la conformité réglementaire (RGPD, PCI-DSS, Bâle III) et de protéger les données clients. Nos experts comprennent les enjeux spécifiques du secteur financier : résilience opérationnelle, gestion des risques cyber et continuité d\'activité.',
      },
      {
        title: 'E-commerce, retail et plateformes digitales',
        description: 'Les plateformes e-commerce et retail à forte volumétrie nécessitent des équipes cybersécurité capables de protéger les transactions, les données clients et les infrastructures cloud. Nous recrutons des profils spécialisés en sécurité applicative, protection des paiements et gestion des incidents à grande échelle.',
      },
      {
        title: 'Santé, pharma et structures manipulant des données sensibles',
        description: 'Le secteur santé et pharma exige une approche cybersécurité rigoureuse pour protéger les données médicales sensibles et garantir la conformité (RGPD, HDS). Nous identifions des profils capables de sécuriser les systèmes d\'information hospitaliers, les plateformes de recherche clinique et les infrastructures pharmaceutiques.',
      },
      {
        title: 'Industrie, énergie et opérateurs d\'importance vitale (OIV)',
        description: 'Les OIV et les acteurs industriels nécessitent des équipes cybersécurité spécialisées dans la protection des systèmes industriels (OT/ICS), la gestion des risques cyber et la continuité d\'activité. Nous recrutons des profils expérimentés en cybersécurité industrielle et en conformité réglementaire.',
      },
      {
        title: 'Secteur public, collectivités et institutions',
        description: 'Nous accompagnons les organisations publiques dans le renforcement de leur posture cybersécurité, en respectant les contraintes budgétaires et réglementaires spécifiques. Nos profils comprennent les enjeux de la cybersécurité publique : protection des données citoyennes, conformité et modernisation des systèmes.',
      },
    ],
    deliverables: [
      'Architectes sécurité et responsables de la stratégie cybersécurité (CISO, RSSI).',
      'Analystes SOC, ingénieurs détection et réponse à incident (Blue Team, DFIR).',
      'Pentesteurs, Red Team et Ethical Hackers spécialisés sur applications, infra et cloud.',
      'Experts gouvernance, risque & conformité (GRC) et responsables privacy/RGPD.',
      'Consultants en gestion de crise cyber et continuité d’activité.',
    ],
    advantages: [
      'Accès à un vivier qualifié de talents cybersécurité (profils opérationnels, seniors et direction).',
      'Compréhension fine des frameworks et référentiels (ISO 27001, NIST, EBIOS, MITRE ATT&CK).',
      'Processus de sélection rigoureux, orienté compétences techniques et posture sécurité.',
      'Approche conseil pour aligner vos besoins en sécurité avec vos enjeux business et réglementaires.',
    ],
  },
  'intelligence-artificielle': {
    icon: Brain,
    title: 'Intelligence Artificielle',
    heroTitle: 'Accélérez vos projets data & IA avec des talents d’exception',
    heroDescription:
      'Nous recrutons des experts en Intelligence Artificielle, Machine Learning et Data Science pour concevoir, industrialiser et scaler vos produits et plateformes data-driven. De la définition des cas d’usage à la mise en production des modèles, nous constituons des équipes capables de créer de la valeur à partir de vos données tout en respectant vos contraintes de qualité, d’éthique et de performance.',
    presentationTitle: 'De la vision IA à la mise en production, avec les bons profils',
    presentationBody:
      'Sil Talents Tech accompagne les organisations qui souhaitent structurer ou renforcer leurs équipes IA et data. Nous identifions des profils capables de transformer vos données en leviers de performance : conception de modèles, industrialisation, gouvernance de la donnée et accompagnement des utilisateurs. Chaque mission est pensée pour aligner excellence technique et impact business.',
    seoTitle: 'Recrutement en Intelligence Artificielle & Data | Sil Talents Tech',
    seoDescription: 'Talents IA, Machine Learning, Data Science et MLOps pour vos projets de transformation digitale, innovation et produits data.',
    problems: [
      'Difficulté à attirer des Data Scientists expérimentés capables de comprendre vos enjeux métier.',
      'Besoin d\'équipes MLOps pour fiabiliser le passage en production des modèles IA.',
      'Recherche de profils R&D en IA pour des projets de pointe (NLP, computer vision, générative AI).',
      'Manque de gouvernance autour des données, de la qualité et de l’éthique de l’IA.',
    ],
    sectors: [
      'Tech, SaaS et plateformes digitales.',
      'Automobile, mobilité et véhicules connectés.',
      'Banque, assurance, fintech et insurtech.',
      'Retail, e-commerce et logistique.',
      'Santé, medtech et recherche clinique.',
    ],
    sectorsDetailed: [
      {
        title: 'Tech, SaaS et plateformes digitales',
        description: 'Nous recrutons des talents IA et data pour les entreprises tech et SaaS qui développent des produits innovants. Nos profils maîtrisent les enjeux de scalabilité, de performance et d\'industrialisation des modèles IA en environnement cloud, avec une approche orientée produit et expérience utilisateur.',
      },
      {
        title: 'Automobile, mobilité et véhicules connectés',
        description: 'Le secteur automobile et de la mobilité recrute massivement des experts en IA pour les véhicules autonomes, l\'analyse de données de conduite et l\'optimisation des chaînes de production. Nous identifions des profils spécialisés en computer vision, traitement de signaux et systèmes embarqués.',
      },
      {
        title: 'Banque, assurance, fintech et insurtech',
        description: 'Les acteurs financiers utilisent l\'IA pour la détection de fraude, le scoring, la gestion des risques et l\'automatisation des processus. Nous recrutons des data scientists et ML engineers capables de travailler dans un environnement réglementaire strict, avec une forte exigence de traçabilité et d\'explicabilité des modèles.',
      },
      {
        title: 'Retail, e-commerce et logistique',
        description: 'L\'IA transforme le retail et la logistique : recommandation produits, optimisation des stocks, prévision de la demande, automatisation des entrepôts. Nous identifions des profils capables de développer des solutions IA qui impactent directement le chiffre d\'affaires et l\'efficacité opérationnelle.',
      },
      {
        title: 'Santé, medtech et recherche clinique',
        description: 'Le secteur santé utilise l\'IA pour l\'aide au diagnostic, l\'analyse d\'images médicales, la recherche pharmaceutique et la personnalisation des traitements. Nous recrutons des profils spécialisés en IA médicale, avec une compréhension des enjeux réglementaires (CE marking, FDA) et éthiques.',
      },
    ],
    deliverables: [
      'Data Scientists, Machine Learning Engineers et Data Engineers.',
      'Research Scientists pour projets IA avancés ou collaboratifs (laboratoires, startups deeptech).',
      'MLOps Engineers et platform engineers pour sécuriser le cycle de vie des modèles.',
      'AI Product Managers et profils hybrides business/tech pour piloter vos produits IA.',
      'Experts en NLP, computer vision, recommandation et IA générative.',
    ],
    advantages: [
      'Accès à un réseau de profils IA seniors, PhD et experts issus d’écosystèmes variés (startup, scale-up, grands groupes).',
      'Maîtrise des principaux écosystèmes techniques (Python, TensorFlow, PyTorch, cloud data).',
      'Capacité à sourcer des talents rares à l’international.',
      'Approche orientée ROI : alignement des profils IA avec vos objectifs business et produit.',
    ],
  },
  'reseaux-telecom': {
    icon: Network,
    title: 'Réseaux & Télécom',
    heroTitle: 'Modernisez vos réseaux, télécoms et infrastructures cloud',
    heroDescription:
      'Sil Talents Tech recrute pour vous des experts réseaux, télécoms, cloud et DevOps pour moderniser vos infrastructures et garantir la performance de vos services numériques. Nous vous aidons à bâtir des environnements hautement disponibles, observables et sécurisés, capables de suivre la croissance de votre activité et les nouvelles attentes de vos utilisateurs.',
    presentationTitle: 'Des infrastructures fiables, scalables et sécurisées',
    presentationBody:
      'Nos spécialistes Réseaux & Télécom accompagnent vos projets de transformation d’infrastructure : modernisation des réseaux, migration vers le cloud, automatisation, observabilité et amélioration continue. Nous vous aidons à constituer des équipes capables de concilier exigences de performance, de disponibilité et de sécurité, dans des environnements souvent hybrides et distribués.',
    seoTitle: 'Recrutement Réseaux, Télécom & Cloud | Sil Talents Tech',
    seoDescription: 'Profils réseaux, télécoms, cloud, DevOps et SRE pour vos projets de transformation d’infrastructure, 5G et modernisation IT.',
    problems: [
      'Projets de migration ou d’hybridation vers le cloud (AWS, Azure, GCP) nécessitant des compétences pointues.',
      'Modernisation d’infrastructures legacy et rationalisation des environnements réseaux complexes.',
      'Besoin d\'équipes DevOps / SRE pour améliorer la fiabilité, l’observabilité et l’automatisation.',
      'Défis liés au déploiement de la 5G, SD-WAN, NFV et aux nouveaux usages télécoms.',
    ],
    sectors: [
      'Opérateurs télécoms et fournisseurs d\'accès.',
      'Cloud providers, hébergeurs et infogéreurs.',
      'Industrie, IoT et environnements connectés.',
      'ESN, intégrateurs et services IT managés.',
      'Commerce, e-commerce et plateformes à trafic élevé.',
    ],
    sectorsDetailed: [
      {
        title: 'Opérateurs télécoms et fournisseurs d\'accès',
        description: 'Nous accompagnons les opérateurs télécoms dans leurs projets de modernisation réseau, de déploiement 5G et de transformation cloud. Nos profils maîtrisent les technologies SDN/NFV, la virtualisation des fonctions réseau et les enjeux de performance et de disponibilité des infrastructures critiques.',
      },
      {
        title: 'Cloud providers, hébergeurs et infogéreurs',
        description: 'Les acteurs du cloud et de l\'hébergement recrutent des experts en infrastructure, DevOps et SRE pour garantir la fiabilité, la scalabilité et la sécurité de leurs plateformes. Nous identifions des profils capables de gérer des environnements distribués à très grande échelle.',
      },
      {
        title: 'Industrie, IoT et environnements connectés',
        description: 'L\'industrie 4.0 et l\'IoT nécessitent des équipes réseaux et cloud capables de connecter, sécuriser et monitorer des milliers d\'objets connectés. Nous recrutons des profils spécialisés en edge computing, réseaux industriels et intégration OT/IT.',
      },
      {
        title: 'ESN, intégrateurs et services IT managés',
        description: 'Les ESN et intégrateurs ont besoin d\'experts réseaux et cloud pour accompagner leurs clients dans leurs projets de transformation. Nous identifions des profils consultants capables d\'intervenir sur des contextes variés, avec une forte capacité d\'adaptation et de conseil.',
      },
      {
        title: 'Commerce, e-commerce et plateformes à trafic élevé',
        description: 'Les plateformes e-commerce et retail nécessitent des infrastructures cloud hautement performantes, scalables et résilientes. Nous recrutons des profils DevOps/SRE capables d\'optimiser la disponibilité, la latence et les coûts d\'infrastructure, en période de forte charge comme en temps normal.',
      },
    ],
    deliverables: [
      'Architectes réseaux, architectes cloud et responsables d’architecture IT.',
      'Ingénieurs réseau, sécurité réseau et ingénieurs télécom.',
      'DevOps Engineers, SRE et spécialistes CI/CD.',
      'Solutions Architects pour projets de transformation ou d’intégration.',
      'Experts en virtualisation, conteneurisation et infrastructure as code.',
    ],
    advantages: [
      'Réseau de profils certifiés (CCNA/CCNP, cloud, DevOps) et expérimentés.',
      'Compréhension des enjeux de disponibilité, performance et sécurité des infrastructures.',
      'Capacité à intervenir sur des contextes multi-cloud et hybrides.',
      'Accompagnement sur la durée : renfort ponctuel, recrutement permanent ou mission de conseil.',
    ],
  },
  'conseil-expertise': {
    icon: Briefcase,
    title: 'Conseil & Expertise IT',
    heroTitle: 'Conseil & expertise IT pour vos décisions stratégiques',
    heroDescription:
      'Nous mettons à votre disposition des consultants et experts IT à forte valeur ajoutée pour piloter vos transformations digitales, vos programmes stratégiques et vos décisions technologiques clés. Nos intervenants apportent une vision claire, structurent vos plans d’actions et sécurisent l’exécution, en lien direct avec vos enjeux business et vos équipes.',
    presentationTitle: 'Des experts IT au service de votre feuille de route digitale',
    presentationBody:
      'Sil Talents Tech intervient aux côtés des directions générales, DSI, CTO et CPO pour sécuriser les grandes décisions technologiques : choix d’architecture, trajectoires de transformation, organisation des équipes et gouvernance IT. Nous sélectionnons des profils capables d’apporter une vision, de structurer les programmes et de fédérer les équipes autour d’objectifs clairs et mesurables.',
    seoTitle: 'Conseil & Expertise IT | Direction Technique & Transformation Digitale',
    seoDescription: 'CTO, directeurs IT, consultants et experts techniques pour vos projets de transformation digitale, audit, gouvernance et stratégie IT.',
    problems: [
      'Besoin d\'expertise IT ponctuelle ou de renfort stratégique sur des projets critiques.',
      'Pilotage de programmes de transformation digitale complexes multi-équipes et multi-pays.',
      'Audit, rationalisation et optimisation de votre patrimoine applicatif et de vos coûts IT.',
      'Accompagnement d’un CTO, DSI ou direction produit dans ses décisions structurantes.',
    ],
    sectors: [
      'PME et ETI en forte croissance.',
      'Grandes entreprises et groupes internationaux.',
      'Startups et scale-ups technologiques.',
      'Organisations publiques et parapubliques.',
    ],
    sectorsDetailed: [
      {
        title: 'PME et ETI en forte croissance',
        description: 'Les PME et ETI en croissance ont besoin d\'experts IT capables de structurer leur direction technique, de moderniser leurs systèmes et d\'accompagner leur scaling. Nous identifions des profils CTO, directeurs IT et consultants capables de travailler dans des environnements agiles, avec des budgets contraints et des enjeux de rapidité d\'exécution.',
      },
      {
        title: 'Grandes entreprises et groupes internationaux',
        description: 'Les grands groupes nécessitent des experts IT stratégiques pour piloter des programmes de transformation digitale complexes, multi-pays et multi-équipes. Nous recrutons des profils de direction (CTO, DSI), des architectes d\'entreprise et des consultants capables de fédérer et d\'aligner des organisations importantes.',
      },
      {
        title: 'Startups et scale-ups technologiques',
        description: 'Les startups et scale-ups tech recrutent des CTO et tech leads capables de construire des produits innovants, de scaler les équipes techniques et de structurer la gouvernance IT. Nous identifions des profils entrepreneurs, avec une forte culture produit et une capacité à évoluer dans des environnements en forte croissance.',
      },
      {
        title: 'Organisations publiques et parapubliques',
        description: 'Les organisations publiques et parapubliques ont besoin d\'experts IT pour moderniser leurs systèmes, améliorer la qualité de service aux citoyens et optimiser les coûts. Nous recrutons des profils capables de travailler dans un contexte réglementaire spécifique, avec une approche orientée valeur publique et transparence.',
      },
    ],
    deliverables: [
      'CTO, DSI, directeurs techniques et directeurs de programmes.',
      'Architectes d’entreprise, architectes solutions et tech leads.',
      'Consultants en organisation, en gouvernance IT et en stratégie digitale.',
      'Experts en transformation agile, produit et delivery.',
      'Profils d’interim management pour des missions à fort enjeu.',
    ],
    advantages: [
      'Sélection de profils sur-mesure en fonction de votre contexte, de votre culture et de vos objectifs.',
      'Flexibilité des modes d’intervention : CDI, CDD, freelance, mission de conseil.',
      'Accès à un réseau d’experts indépendants et de dirigeants IT expérimentés.',
      'Approche orientée résultats : impact mesurable, accompagnement du cadrage jusqu’à l’exécution.',
    ],
  },
}

// Note: generateMetadata removed as this is now a client component
// Metadata should be handled via next/head or moved to a server component wrapper if needed

const translations = {
  FR: {
    keyPoints: [
      'Talents sélectionnés pour leur expertise métier et technique.',
      'Process de recrutement structuré, transparent et rapide.',
      'Accompagnement des entreprises et des talents sur la durée.',
    ],
    problemsTitle: 'Problématiques que nous résolvons',
    sectorsTitle: 'Secteurs adressés',
    sectorsDescription: 'Nous intervenons dans une large gamme de secteurs d\'activité, de l\'industrie traditionnelle aux entreprises technologiques les plus innovantes. Notre expertise nous permet d\'accompagner des organisations de toutes tailles, des startups aux grands groupes internationaux.',
    deliverablesTitle: 'Profils et livrables typiques',
    whyChooseTitle: 'Pourquoi choisir Sil Talents Tech pour ce service ?',
    whyChooseDescription: 'Au-delà de la simple mise en relation, nous construisons avec vous une relation de confiance, fondée sur la compréhension de votre environnement, de vos contraintes et de vos ambitions. Chaque mission est pilotée avec un objectif clair : sécuriser vos recrutements, fluidifier vos process et créer un cadre dans lequel les talents peuvent réellement s\'épanouir.',
    notFoundTitle: 'Service non trouvé | Sil Talents Tech',
    notFoundDescription: 'La page de service demandée est introuvable. Découvrez les expertises de Sil Talents Tech en recrutement IT et conseil technologique.',
  },
  EN: {
    keyPoints: [
      'Talents selected for their business and technical expertise.',
      'Structured, transparent and fast recruitment process.',
      'Long-term support for companies and talents.',
    ],
    problemsTitle: 'Problems we solve',
    sectorsTitle: 'Sectors we serve',
    sectorsDescription: 'We operate across a wide range of business sectors, from traditional industry to the most innovative technology companies. Our expertise allows us to support organizations of all sizes, from startups to large international groups.',
    deliverablesTitle: 'Typical profiles and deliverables',
    whyChooseTitle: 'Why choose Sil Talents Tech for this service?',
    whyChooseDescription: 'Beyond simple matching, we build a relationship of trust with you, based on understanding your environment, constraints and ambitions. Each mission is managed with a clear objective: secure your recruitment, streamline your processes and create a framework in which talents can truly thrive.',
    notFoundTitle: 'Service not found | Sil Talents Tech',
    notFoundDescription: 'The requested service page could not be found. Discover Sil Talents Tech\'s expertise in IT recruitment and technology consulting.',
  },
}

// English translations for services data
const servicesDataEN: Record<string, typeof servicesData[string]> = {
  'cybersecurite': {
    icon: Shield,
    title: 'Cybersecurity',
    heroTitle: 'Secure your organization with the best cybersecurity talent',
    heroDescription:
      'Sil Talents Tech supports you in recruiting highly qualified cybersecurity profiles to secure your systems, sensitive data and critical infrastructures. We operate from governance to operations (SOC, pentest, incident response) integrating your regulatory, business and operational challenges. Our goal: sustainably strengthen your security posture with talent adapted to your culture and maturity level.',
    presentationTitle: 'A cybersecurity approach focused on talent and resilience',
    presentationBody:
      'Our specialized cybersecurity teams cover the entire value chain: governance, architecture, operations, detection, incident response and compliance. We speak the language of your technical teams and business units to offer you immediately operational profiles, capable of sustainably strengthening your security posture.',
    seoTitle: 'Cybersecurity Recruitment | IT Security Experts | Sil Talents Tech',
    seoDescription: 'Specialized cybersecurity recruitment firm: SOC, pentest, governance, GDPR compliance, DevSecOps and cloud security. Find security experts adapted to your strategic challenges.',
    problems: [
      'Difficulty identifying certified cybersecurity profiles (CISSP, CEH, OSCP, ISO 27001).',
      'Lack of experts capable of managing compliance (GDPR, NIS2, PCI-DSS) and risk management.',
      'Need to strengthen SOC teams, incident detection and 24/7 incident response.',
      'New challenges related to cloud security, Zero Trust and DevSecOps approaches.',
    ],
    sectors: [
      'Banking, insurance and financial services.',
      'E-commerce, retail and high-volume digital platforms.',
      'Healthcare, pharma and structures handling sensitive data.',
      'Industry, energy and operators of vital importance (OIV).',
      'Public sector, local authorities and institutions.',
    ],
    sectorsDetailed: [
      {
        title: 'Banking, insurance and financial services',
        description: 'We support financial institutions in recruiting cybersecurity profiles capable of securing their critical systems, ensuring regulatory compliance (GDPR, PCI-DSS, Basel III) and protecting customer data. Our experts understand the specific challenges of the financial sector: operational resilience, cyber risk management and business continuity.',
      },
      {
        title: 'E-commerce, retail and digital platforms',
        description: 'High-volume e-commerce and retail platforms require cybersecurity teams capable of protecting transactions, customer data and cloud infrastructures. We recruit profiles specialized in application security, payment protection and large-scale incident management.',
      },
      {
        title: 'Healthcare, pharma and structures handling sensitive data',
        description: 'The healthcare and pharma sector requires a rigorous cybersecurity approach to protect sensitive medical data and ensure compliance (GDPR, HDS). We identify profiles capable of securing hospital information systems, clinical research platforms and pharmaceutical infrastructures.',
      },
      {
        title: 'Industry, energy and operators of vital importance (OIV)',
        description: 'OIVs and industrial players require cybersecurity teams specialized in protecting industrial systems (OT/ICS), cyber risk management and business continuity. We recruit experienced profiles in industrial cybersecurity and regulatory compliance.',
      },
      {
        title: 'Public sector, local authorities and institutions',
        description: 'We support public organizations in strengthening their cybersecurity posture, respecting specific budgetary and regulatory constraints. Our profiles understand the challenges of public cybersecurity: protection of citizen data, compliance and system modernization.',
      },
    ],
    deliverables: [
      'Security architects and cybersecurity strategy managers (CISO, RSSI).',
      'SOC analysts, detection and incident response engineers (Blue Team, DFIR).',
      'Pentesters, Red Team and Ethical Hackers specialized in applications, infrastructure and cloud.',
      'Governance, risk & compliance (GRC) experts and privacy/GDPR managers.',
      'Cyber crisis management and business continuity consultants.',
    ],
    advantages: [
      'Access to a qualified pool of cybersecurity talent (operational, senior and management profiles).',
      'Deep understanding of frameworks and standards (ISO 27001, NIST, EBIOS, MITRE ATT&CK).',
      'Rigorous selection process, focused on technical skills and security posture.',
      'Consulting approach to align your security needs with your business and regulatory challenges.',
    ],
  },
  'intelligence-artificielle': {
    icon: Brain,
    title: 'Artificial Intelligence',
    heroTitle: 'Accelerate your data & AI projects with exceptional talent',
    heroDescription:
      'We recruit experts in Artificial Intelligence, Machine Learning and Data Science to design, industrialize and scale your data-driven products and platforms. From use case definition to model production, we build teams capable of creating value from your data while respecting your quality, ethics and performance constraints.',
    presentationTitle: 'From AI vision to production, with the right profiles',
    presentationBody:
      'Sil Talents Tech supports organizations that want to structure or strengthen their AI and data teams. We identify profiles capable of transforming your data into performance levers: model design, industrialization, data governance and user support. Each mission is designed to align technical excellence and business impact.',
    seoTitle: 'Artificial Intelligence & Data Recruitment | Sil Talents Tech',
    seoDescription: 'AI, Machine Learning, Data Science and MLOps talent for your digital transformation, innovation and data product projects.',
    problems: [
      'Difficulty attracting experienced Data Scientists capable of understanding your business challenges.',
      'Need for MLOps teams to ensure reliable production deployment of AI models.',
      'Search for R&D profiles in AI for cutting-edge projects (NLP, computer vision, generative AI).',
      'Lack of governance around data, quality and AI ethics.',
    ],
    sectors: [
      'Tech, SaaS and digital platforms.',
      'Automotive, mobility and connected vehicles.',
      'Banking, insurance, fintech and insurtech.',
      'Retail, e-commerce and logistics.',
      'Healthcare, medtech and clinical research.',
    ],
    sectorsDetailed: [
      {
        title: 'Tech, SaaS and digital platforms',
        description: 'We recruit AI and data talent for tech and SaaS companies developing innovative products. Our profiles master the challenges of scalability, performance and industrialization of AI models in cloud environments, with a product and user experience-oriented approach.',
      },
      {
        title: 'Automotive, mobility and connected vehicles',
        description: 'The automotive and mobility sector is massively recruiting AI experts for autonomous vehicles, driving data analysis and production chain optimization. We identify profiles specialized in computer vision, signal processing and embedded systems.',
      },
      {
        title: 'Banking, insurance, fintech and insurtech',
        description: 'Financial players use AI for fraud detection, scoring, risk management and process automation. We recruit data scientists and ML engineers capable of working in a strict regulatory environment, with strong requirements for model traceability and explainability.',
      },
      {
        title: 'Retail, e-commerce and logistics',
        description: 'AI is transforming retail and logistics: product recommendation, inventory optimization, demand forecasting, warehouse automation. We identify profiles capable of developing AI solutions that directly impact revenue and operational efficiency.',
      },
      {
        title: 'Healthcare, medtech and clinical research',
        description: 'The healthcare sector uses AI for diagnostic assistance, medical image analysis, pharmaceutical research and treatment personalization. We recruit profiles specialized in medical AI, with an understanding of regulatory (CE marking, FDA) and ethical challenges.',
      },
    ],
    deliverables: [
      'Data Scientists, Machine Learning Engineers and Data Engineers.',
      'Research Scientists for advanced or collaborative AI projects (laboratories, deeptech startups).',
      'MLOps Engineers and platform engineers to secure the model lifecycle.',
      'AI Product Managers and hybrid business/tech profiles to drive your AI products.',
      'Experts in NLP, computer vision, recommendation and generative AI.',
    ],
    advantages: [
      'Access to a network of senior AI profiles, PhDs and experts from diverse ecosystems (startup, scale-up, large groups).',
      'Mastery of major technical ecosystems (Python, TensorFlow, PyTorch, cloud data).',
      'Ability to source rare talent internationally.',
      'ROI-oriented approach: alignment of AI profiles with your business and product objectives.',
    ],
  },
  'reseaux-telecom': {
    icon: Network,
    title: 'Networks & Telecom',
    heroTitle: 'Modernize your networks, telecoms and cloud infrastructures',
    heroDescription:
      'Sil Talents Tech recruits network, telecom, cloud and DevOps experts for you to modernize your infrastructures and guarantee the performance of your digital services. We help you build highly available, observable and secure environments, capable of following the growth of your business and the new expectations of your users.',
    presentationTitle: 'Reliable, scalable and secure infrastructures',
    presentationBody:
      'Our Networks & Telecom specialists support your infrastructure transformation projects: network modernization, cloud migration, automation, observability and continuous improvement. We help you build teams capable of reconciling performance, availability and security requirements, in often hybrid and distributed environments.',
    seoTitle: 'Networks, Telecom & Cloud Recruitment | Sil Talents Tech',
    seoDescription: 'Network, telecom, cloud, DevOps and SRE profiles for your infrastructure transformation, 5G and IT modernization projects.',
    problems: [
      'Migration or hybridization projects to the cloud (AWS, Azure, GCP) requiring advanced skills.',
      'Modernization of legacy infrastructures and rationalization of complex network environments.',
      'Need for DevOps / SRE teams to improve reliability, observability and automation.',
      'Challenges related to 5G deployment, SD-WAN, NFV and new telecom uses.',
    ],
    sectors: [
      'Telecom operators and internet service providers.',
      'Cloud providers, hosting and managed IT services.',
      'Industry, IoT and connected environments.',
      'ESN, integrators and managed IT services.',
      'Commerce, e-commerce and high-traffic platforms.',
    ],
    sectorsDetailed: [
      {
        title: 'Telecom operators and internet service providers',
        description: 'We support telecom operators in their network modernization, 5G deployment and cloud transformation projects. Our profiles master SDN/NFV technologies, network function virtualization and the challenges of performance and availability of critical infrastructures.',
      },
      {
        title: 'Cloud providers, hosting and managed IT services',
        description: 'Cloud and hosting players recruit infrastructure, DevOps and SRE experts to guarantee the reliability, scalability and security of their platforms. We identify profiles capable of managing distributed environments at very large scale.',
      },
      {
        title: 'Industry, IoT and connected environments',
        description: 'Industry 4.0 and IoT require network and cloud teams capable of connecting, securing and monitoring thousands of connected objects. We recruit profiles specialized in edge computing, industrial networks and OT/IT integration.',
      },
      {
        title: 'ESN, integrators and managed IT services',
        description: 'ESNs and integrators need network and cloud experts to support their clients in their transformation projects. We identify consultant profiles capable of intervening in varied contexts, with strong adaptability and consulting capabilities.',
      },
      {
        title: 'Commerce, e-commerce and high-traffic platforms',
        description: 'E-commerce and retail platforms require highly performing, scalable and resilient cloud infrastructures. We recruit DevOps/SRE profiles capable of optimizing availability, latency and infrastructure costs, both during peak periods and normal times.',
      },
    ],
    deliverables: [
      'Network architects, cloud architects and IT architecture managers.',
      'Network engineers, network security engineers and telecom engineers.',
      'DevOps Engineers, SRE and CI/CD specialists.',
      'Solutions Architects for transformation or integration projects.',
      'Experts in virtualization, containerization and infrastructure as code.',
    ],
    advantages: [
      'Network of certified (CCNA/CCNP, cloud, DevOps) and experienced profiles.',
      'Understanding of infrastructure availability, performance and security challenges.',
      'Ability to intervene in multi-cloud and hybrid contexts.',
      'Long-term support: temporary reinforcement, permanent recruitment or consulting mission.',
    ],
  },
  'conseil-expertise': {
    icon: Briefcase,
    title: 'IT Consulting & Expertise',
    heroTitle: 'IT consulting & expertise for your strategic decisions',
    heroDescription:
      'We provide you with high-value IT consultants and experts to drive your digital transformations, strategic programs and key technology decisions. Our consultants bring clear vision, structure your action plans and secure execution, in direct connection with your business challenges and teams.',
    presentationTitle: 'IT experts at the service of your digital roadmap',
    presentationBody:
      'Sil Talents Tech works alongside general management, IT departments, CTOs and CPOs to secure major technology decisions: architecture choices, transformation trajectories, team organization and IT governance. We select profiles capable of bringing vision, structuring programs and federating teams around clear and measurable objectives.',
    seoTitle: 'IT Consulting & Expertise | Technical Direction & Digital Transformation',
    seoDescription: 'CTO, IT directors, consultants and technical experts for your digital transformation, audit, governance and IT strategy projects.',
    problems: [
      'Need for occasional IT expertise or strategic reinforcement on critical projects.',
      'Management of complex multi-team and multi-country digital transformation programs.',
      'Audit, rationalization and optimization of your application portfolio and IT costs.',
      'Support for a CTO, IT director or product management in their structuring decisions.',
    ],
    sectors: [
      'SMEs and mid-size companies in strong growth.',
      'Large companies and international groups.',
      'Technology startups and scale-ups.',
      'Public and parapublic organizations.',
    ],
    sectorsDetailed: [
      {
        title: 'SMEs and mid-size companies in strong growth',
        description: 'Growing SMEs and mid-size companies need IT experts capable of structuring their technical direction, modernizing their systems and supporting their scaling. We identify CTO, IT director and consultant profiles capable of working in agile environments, with constrained budgets and rapid execution challenges.',
      },
      {
        title: 'Large companies and international groups',
        description: 'Large groups require strategic IT experts to manage complex, multi-country and multi-team digital transformation programs. We recruit management profiles (CTO, IT director), enterprise architects and consultants capable of federating and aligning large organizations.',
      },
      {
        title: 'Technology startups and scale-ups',
        description: 'Tech startups and scale-ups recruit CTOs and tech leads capable of building innovative products, scaling technical teams and structuring IT governance. We identify entrepreneurial profiles, with strong product culture and ability to evolve in high-growth environments.',
      },
      {
        title: 'Public and parapublic organizations',
        description: 'Public and parapublic organizations need IT experts to modernize their systems, improve service quality for citizens and optimize costs. We recruit profiles capable of working in a specific regulatory context, with an approach oriented towards public value and transparency.',
      },
    ],
    deliverables: [
      'CTO, IT director, technical directors and program directors.',
      'Enterprise architects, solutions architects and tech leads.',
      'Organization, IT governance and digital strategy consultants.',
      'Experts in agile transformation, product and delivery.',
      'Interim management profiles for high-stakes missions.',
    ],
    advantages: [
      'Selection of tailor-made profiles according to your context, culture and objectives.',
      'Flexibility of intervention modes: permanent contract, fixed-term contract, freelance, consulting mission.',
      'Access to a network of independent experts and experienced IT executives.',
      'Results-oriented approach: measurable impact, support from framing to execution.',
    ],
  },
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { lang } = useLanguage()
  const t = translations[lang]
  
  // Get service data based on language
  const getServiceData = () => {
    const baseService = servicesData[params.slug]
    if (!baseService) return null
    
    if (lang === 'EN') {
      const enService = servicesDataEN[params.slug]
      return enService || baseService
    }
    
    return baseService
  }
  
  const service = getServiceData()

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-sil-dark relative pt-24">
      {/* Hero avec image de fond et overlay sombre */}
      <section
        className="relative w-full min-h-screen overflow-hidden flex items-center"
        style={{
          backgroundImage: `url(${heroImagePath})`,
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

        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto py-16 md:py-24 text-left flex items-center">
          <div className="max-w-3xl">
            <h1
              className="mb-4 md:mb-6"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: '#FFFFFF',
                lineHeight: '1.1',
              }}
            >
              {service.heroTitle}
            </h1>
            <p
              style={{
                fontFamily: 'Inter',
                fontWeight: 200,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#D9D9D9',
              }}
            >
              {service.heroDescription}
            </p>

            {/* Petits points clés pour enrichir la 1ʳᵉ section */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {t.keyPoints.map((point, index) => (
                <div key={index} className="bg-black/40 border border-white/10 px-4 py-3">
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#D9D9D9',
                    }}
                  >
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA principal directement dans la première section */}
            <div className="mt-6">
              <ServiceCtaButtons />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : contenu structuré sur fond sombre simple */}
      <section className="bg-[#1A1A1A] py-16 md:py-20 text-white">
        <div className="w-[90%] max-w-[1200px] mx-auto space-y-16 md:space-y-20">
          {/* Présentation du service */}
          <div>
            <h2
              className="mb-4 md:mb-5"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 30px)',
                color: '#FFFFFF',
              }}
            >
              {service.presentationTitle}
            </h2>
            <p
              style={{
                fontFamily: 'Inter',
                fontWeight: 300,
                fontSize: '16px',
                lineHeight: '26px',
                color: '#D9D9D9',
              }}
            >
              {service.presentationBody}
            </p>
          </div>

          {/* Problématiques */}
          <div>
            <h2
              className="mb-6 md:mb-8"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#FFFFFF',
              }}
            >
              {t.problemsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.problems.map((problem, index) => (
                <div
                  key={index}
                  className="group relative bg-black/40 border-l-4 border-[#297BFF] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-black/60 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3),0_0_20px_rgba(41,123,255,0.2)]"
                >
                  {/* Numéro stylisé */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#297BFF]/20 border-2 border-[#297BFF]/50 flex items-center justify-center group-hover:bg-[#297BFF]/30 group-hover:border-[#297BFF] transition-all duration-300">
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 600,
                          fontSize: '18px',
                          color: '#297BFF',
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <p
                      className="flex-1"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '26px',
                        color: '#D9D9D9',
                      }}
                    >
                      {problem}
                    </p>
                  </div>
                  {/* Ligne de fond animée au hover */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-300 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Section 3 : fond image type hero + Secteurs + Profils/Livrables + avantages + CTA */}
      <section className="relative text-white overflow-hidden py-20 md:py-24">
        {/* Background Image - Full Width (identique au hero de la home) */}
        <div className="absolute inset-0 z-0 w-full">
          <Image
            src="/assets/Images/ImgHero.jpg"
            alt="Fond services Sil Talents Tech"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay pour la lisibilité */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
        </div>
        {/* Gradient top et bottom : 20% de la hauteur, gris foncé -> transparent */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{
            height: '20%',
            background: 'linear-gradient(to bottom, #1A1A1A, transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: '20%',
            background: 'linear-gradient(to top, #1A1A1A, transparent)',
          }}
        />

        {/* Content Container - Centered, 90% width, max 1200px (identique au hero) */}
        <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto space-y-14">
          {/* Secteurs adressés */}
          <div>
            <div className="mb-8">
              <h2
                className="mb-4"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  color: '#FFFFFF',
                }}
              >
                {t.sectorsTitle}
              </h2>
              <p
                className="max-w-3xl"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '16px',
                  lineHeight: '26px',
                  color: '#999999',
                }}
              >
                {t.sectorsDescription}
              </p>
            </div>
            <SectorsCarouselSimple sectors={service.sectorsDetailed} />
          </div>

          {/* Profils et livrables - Timeline Design */}
          <div>
            <h2
              className="mb-8 md:mb-10"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#FFFFFF',
                textAlign :'center'
              }}
            >
              {t.deliverablesTitle}
            </h2>
            <div className="relative">
              {/* Ligne verticale centrée - visible sur mobile et desktop */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#297BFF]/20 via-[#297BFF]/40 to-[#297BFF]/20" />

              {/* Liste des profils/livrables avec alternance */}
              <div className="space-y-8 md:space-y-12">
                {service.deliverables.map((deliverable, index) => {
                  const isEven = index % 2 === 0
                  return (
                    <div
                      key={index}
                      className="group relative flex items-start"
                    >
                      {/* Contenu à gauche (index pair) ou droite (index impair) */}
                      <div
                        className={`flex-1 transition-all duration-500 ${
                          isEven
                            ? 'pr-[calc(50%+1.5rem)] md:pr-[calc(50%+2.5rem)] text-right'
                            : 'pl-[calc(50%+1.5rem)] md:pl-[calc(50%+2.5rem)] text-left'
                        }`}
                      >
                        <div className="relative p-4 md:p-6 transition-all duration-500 hover:translate-x-2 md:hover:translate-x-0 md:hover:translate-y-[-4px]">
                          {/* Ligne de connexion vers le marqueur */}
                          <div className="absolute top-1/2 w-6 md:w-8 h-0.5 bg-[#297BFF]/20 transition-all duration-500 group-hover:bg-[#297BFF]/60 group-hover:w-8 md:group-hover:w-12"
                            style={{
                              [isEven ? 'right' : 'left']: '-1.5rem',
                              transform: 'translateY(-50%)',
                            }}
                          />
                          
                          {/* Texte avec effet hover */}
                          <p
                            className="relative transition-all duration-500 group-hover:text-[#297BFF] whitespace-normal break-words"
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontSize: '15px',
                              lineHeight: '24px',
                              color: '#D9D9D9',
                            }}
                          >
                            {deliverable}
                          </p>
                          
                          {/* Ligne de soulignement animée au hover */}
                          <div 
                            className="absolute bottom-0 h-0.5 w-0 bg-[#297BFF] transition-all duration-500 group-hover:w-full"
                            style={{
                              [isEven ? 'right' : 'left']: '0',
                            }}
                          />
                        </div>
                      </div>

                      {/* Marqueur circulaire au centre avec animation - visible sur mobile et desktop */}
                      <div className="absolute left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
                        <div className="relative">
                          <div className="w-4 h-4 md:w-5 md:h-5 bg-[#297BFF] border-4 border-[#1A1A1A] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(41,123,255,0.8)] md:group-hover:shadow-[0_0_20px_rgba(41,123,255,0.8)]" />
                          {/* Cercle externe animé au hover */}
                          <div className="absolute inset-0 w-4 h-4 md:w-5 md:h-5 border-2 border-[#297BFF]/0 rounded-full transition-all duration-500 group-hover:border-[#297BFF]/50 group-hover:scale-150" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pourquoi nous choisir + avantages */}
          <div>
            <h2
              className="mb-4 md:mb-5"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#FFFFFF',
              }}
            >
              {t.whyChooseTitle}
            </h2>
            <p
              className="mb-12 max-w-3xl"
              style={{
                fontFamily: 'Inter',
                fontWeight: 300,
                fontSize: '16px',
                lineHeight: '26px',
                color: '#D9D9D9',
              }}
            >
              {t.whyChooseDescription}
            </p>

            {/* Design épuré et moderne pour site tech */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {service.advantages.map((advantage, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  {/* Ligne d'accent verticale à gauche */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#297BFF]/20 group-hover:bg-[#297BFF] transition-all duration-500" />
                  
                  {/* Contenu */}
                  <div className="pl-6 md:pl-8 py-4">
                    {/* Texte principal */}
                    <p
                      className="transition-all duration-500 group-hover:text-white"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontSize: '16px',
                        lineHeight: '26px',
                        color: '#D9D9D9',
                      }}
                    >
                      {advantage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}



