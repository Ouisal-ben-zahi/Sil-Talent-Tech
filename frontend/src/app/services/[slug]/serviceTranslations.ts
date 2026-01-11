import { Shield, Brain, Network, Briefcase } from 'lucide-react'

interface ServiceData {
  icon: any
  title: string
  heroTitle: string
  heroDescription: string
  presentationTitle: string
  presentationBody: string
  problems: string[]
  sectors: string[]
  sectorsDetailed: Array<{ title: string; description: string }>
  deliverables: string[]
  advantages: string[]
}

// Traductions EN pour chaque service
const serviceTranslationsEN: Record<string, Partial<ServiceData>> = {
  'cybersecurite': {
    heroTitle: 'Secure your organization with the best cybersecurity talents',
    heroDescription:
      'Sil Talents Tech supports you in recruiting highly qualified cybersecurity profiles to secure your systems, sensitive data, and critical infrastructures. We intervene from governance to operations (SOC, pentest, incident response) integrating your regulatory, business, and operational challenges. Our goal: sustainably strengthen your security posture with talents adapted to your culture and maturity level.',
    presentationTitle: 'A cybersecurity approach focused on talent and resilience',
    presentationBody:
      'Our specialized cybersecurity teams cover the entire value chain: governance, architecture, operations, detection, incident response, and compliance. We speak the language of your technical teams and business departments to offer immediately operational profiles, capable of sustainably strengthening your security posture.',
    problems: [
      'Difficulty identifying certified cybersecurity profiles (CISSP, CEH, OSCP, ISO 27001).',
      'Lack of experts capable of managing compliance (GDPR, NIS2, PCI-DSS) and risk management.',
      'Need to strengthen SOC teams, incident detection, and 24/7 incident response.',
      'New challenges related to cloud security, Zero Trust, and DevSecOps approaches.',
    ],
    sectorsDetailed: [
      {
        title: 'Banking, insurance, and financial services',
        description: 'We support financial institutions in recruiting cybersecurity profiles capable of securing their critical systems, ensuring regulatory compliance (GDPR, PCI-DSS, Basel III), and protecting customer data. Our experts understand the specific challenges of the financial sector: operational resilience, cyber risk management, and business continuity.',
      },
      {
        title: 'E-commerce, retail, and high-volume digital platforms',
        description: 'High-volume e-commerce and retail platforms require cybersecurity teams capable of protecting transactions, customer data, and cloud infrastructures. We recruit profiles specialized in application security, payment protection, and large-scale incident management.',
      },
      {
        title: 'Healthcare, pharma, and structures handling sensitive data',
        description: 'The healthcare and pharma sector requires a rigorous cybersecurity approach to protect sensitive medical data and ensure compliance (GDPR, HDS). We identify profiles capable of securing hospital information systems, clinical research platforms, and pharmaceutical infrastructures.',
      },
      {
        title: 'Industry, energy, and operators of vital importance (OIV)',
        description: 'OIVs and industrial actors require cybersecurity teams specialized in protecting industrial systems (OT/ICS), cyber risk management, and business continuity. We recruit experienced profiles in industrial cybersecurity and regulatory compliance.',
      },
      {
        title: 'Public sector, local authorities, and institutions',
        description: 'We support public organizations in strengthening their cybersecurity posture, respecting specific budget and regulatory constraints. Our profiles understand the challenges of public cybersecurity: protection of citizen data, compliance, and system modernization.',
      },
    ],
    deliverables: [
      'Security architects and cybersecurity strategy managers (CISO, RSSI).',
      'SOC analysts, detection and incident response engineers (Blue Team, DFIR).',
      'Pentesters, Red Team, and Ethical Hackers specialized in applications, infrastructure, and cloud.',
      'Governance, risk & compliance (GRC) experts and privacy/GDPR managers.',
      'Cyber crisis management and business continuity consultants.',
    ],
    advantages: [
      'Access to a qualified pool of cybersecurity talents (operational, senior, and executive profiles).',
      'Deep understanding of frameworks and standards (ISO 27001, NIST, EBIOS, MITRE ATT&CK).',
      'Rigorous selection process, focused on technical skills and security posture.',
      'Advisory approach to align your security needs with your business and regulatory challenges.',
    ],
  },
  'intelligence-artificielle': {
    heroTitle: 'Accelerate your data & AI projects with exceptional talents',
    heroDescription:
      'We recruit experts in Artificial Intelligence, Machine Learning, and Data Science to design, industrialize, and scale your data-driven products and platforms. From use case definition to model production, we build teams capable of creating value from your data while respecting your quality, ethics, and performance constraints.',
    presentationTitle: 'From AI vision to production, with the right profiles',
    presentationBody:
      'Sil Talents Tech supports organizations that want to structure or strengthen their AI and data teams. We identify profiles capable of transforming your data into performance levers: model design, industrialization, data governance, and user support. Each mission is designed to align technical excellence and business impact.',
    problems: [
      'Difficulty attracting experienced Data Scientists capable of understanding your business challenges.',
      'Need for MLOps teams to ensure reliable production deployment of AI models.',
      'Search for R&D profiles in AI for cutting-edge projects (NLP, computer vision, generative AI).',
      'Lack of governance around data, quality, and AI ethics.',
    ],
    sectorsDetailed: [
      {
        title: 'Tech, SaaS, and digital platforms',
        description: 'We recruit AI and data talents for tech and SaaS companies developing innovative products. Our profiles master scalability, performance, and industrialization challenges of AI models in cloud environments, with a product and user experience-oriented approach.',
      },
      {
        title: 'Automotive, mobility, and connected vehicles',
        description: 'The automotive and mobility sector massively recruits AI experts for autonomous vehicles, driving data analysis, and production chain optimization. We identify profiles specialized in computer vision, signal processing, and embedded systems.',
      },
      {
        title: 'Banking, insurance, fintech, and insurtech',
        description: 'Financial actors use AI for fraud detection, scoring, risk management, and process automation. We recruit data scientists and ML engineers capable of working in a strict regulatory environment, with strong requirements for traceability and model explicability.',
      },
      {
        title: 'Retail, e-commerce, and logistics',
        description: 'AI transforms retail and logistics: product recommendation, stock optimization, demand forecasting, warehouse automation. We identify profiles capable of developing AI solutions that directly impact revenue and operational efficiency.',
      },
      {
        title: 'Healthcare, medtech, and clinical research',
        description: 'The healthcare sector uses AI for diagnostic assistance, medical image analysis, pharmaceutical research, and treatment personalization. We recruit profiles specialized in medical AI, with an understanding of regulatory (CE marking, FDA) and ethical challenges.',
      },
    ],
    deliverables: [
      'Data Scientists, Machine Learning Engineers, and Data Engineers.',
      'Research Scientists for advanced or collaborative AI projects (laboratories, deeptech startups).',
      'MLOps Engineers and platform engineers to secure the model lifecycle.',
      'AI Product Managers and hybrid business/tech profiles to pilot your AI products.',
      'Experts in NLP, computer vision, recommendation, and generative AI.',
    ],
    advantages: [
      'Access to a network of senior AI profiles, PhDs, and experts from varied ecosystems (startup, scale-up, large groups).',
      'Mastery of main technical ecosystems (Python, TensorFlow, PyTorch, cloud data).',
      'Ability to source rare talents internationally.',
      'ROI-oriented approach: alignment of AI profiles with your business and product objectives.',
    ],
  },
  'reseaux-telecom': {
    heroTitle: 'Modernize your networks, telecoms, and cloud infrastructures',
    heroDescription:
      'Sil Talents Tech recruits network, telecom, cloud, and DevOps experts for you to modernize your infrastructures and guarantee the performance of your digital services. We help you build highly available, observable, and secure environments, capable of following your business growth and new user expectations.',
    presentationTitle: 'Reliable, scalable, and secure infrastructures',
    presentationBody:
      'Our Networks & Telecom specialists support your infrastructure transformation projects: network modernization, cloud migration, automation, observability, and continuous improvement. We help you build teams capable of reconciling performance, availability, and security requirements, in often hybrid and distributed environments.',
    problems: [
      'Migration or hybridization projects to the cloud (AWS, Azure, GCP) requiring advanced skills.',
      'Modernization of legacy infrastructures and rationalization of complex network environments.',
      'Need for DevOps / SRE teams to improve reliability, observability, and automation.',
      'Challenges related to 5G deployment, SD-WAN, NFV, and new telecom uses.',
    ],
    sectorsDetailed: [
      {
        title: 'Telecom operators and access providers',
        description: 'We support telecom operators in their network modernization, 5G deployment, and cloud transformation projects. Our profiles master SDN/NFV technologies, network function virtualization, and performance and availability challenges of critical infrastructures.',
      },
      {
        title: 'Cloud providers, hosting, and IT outsourcing',
        description: 'Cloud and hosting actors recruit infrastructure, DevOps, and SRE experts to guarantee the reliability, scalability, and security of their platforms. We identify profiles capable of managing distributed environments at very large scale.',
      },
      {
        title: 'Industry, IoT, and connected environments',
        description: 'Industry 4.0 and IoT require network and cloud teams capable of connecting, securing, and monitoring thousands of connected objects. We recruit profiles specialized in edge computing, industrial networks, and OT/IT integration.',
      },
      {
        title: 'ESN, integrators, and managed IT services',
        description: 'ESNs and integrators need network and cloud experts to support their clients in their transformation projects. We identify consultant profiles capable of intervening on varied contexts, with strong adaptation and advisory capabilities.',
      },
      {
        title: 'Commerce, e-commerce, and high-traffic platforms',
        description: 'E-commerce and retail platforms require highly performant, scalable, and resilient cloud infrastructures. We recruit DevOps/SRE profiles capable of optimizing availability, latency, and infrastructure costs, both during peak load and normal times.',
      },
    ],
    deliverables: [
      'Network architects, cloud architects, and IT architecture managers.',
      'Network engineers, network security engineers, and telecom engineers.',
      'DevOps Engineers, SRE, and CI/CD specialists.',
      'Solutions Architects for transformation or integration projects.',
      'Experts in virtualization, containerization, and infrastructure as code.',
    ],
    advantages: [
      'Network of certified profiles (CCNA/CCNP, cloud, DevOps) and experienced.',
      'Understanding of availability, performance, and security challenges of infrastructures.',
      'Ability to intervene on multi-cloud and hybrid contexts.',
      'Long-term support: occasional reinforcement, permanent recruitment, or advisory mission.',
    ],
  },
  'conseil-expertise': {
    heroTitle: 'IT consulting & expertise for your strategic decisions',
    heroDescription:
      'We provide you with high-value-added IT consultants and experts to pilot your digital transformations, strategic programs, and key technological decisions. Our consultants bring clear vision, structure your action plans, and secure execution, in direct connection with your business challenges and teams.',
    presentationTitle: 'IT experts at the service of your digital roadmap',
    presentationBody:
      'Sil Talents Tech intervenes alongside general management, IT departments, CTOs, and CPOs to secure major technological decisions: architecture choices, transformation trajectories, team organization, and IT governance. We select profiles capable of bringing vision, structuring programs, and federating teams around clear and measurable objectives.',
    problems: [
      'Need for occasional IT expertise or strategic reinforcement on critical projects.',
      'Management of complex digital transformation programs, multi-team and multi-country.',
      'Audit, rationalization, and optimization of your application portfolio and IT costs.',
      'Support for a CTO, IT director, or product direction in structuring decisions.',
    ],
    sectorsDetailed: [
      {
        title: 'SMEs and mid-sized companies in strong growth',
        description: 'Growing SMEs and mid-sized companies need IT experts capable of structuring their technical direction, modernizing their systems, and supporting their scaling. We identify CTO, IT director, and consultant profiles capable of working in agile environments, with constrained budgets and execution speed challenges.',
      },
      {
        title: 'Large companies and international groups',
        description: 'Large groups require strategic IT experts to pilot complex digital transformation programs, multi-country and multi-team. We recruit executive profiles (CTO, IT director), enterprise architects, and consultants capable of federating and aligning large organizations.',
      },
      {
        title: 'Startups and technological scale-ups',
        description: 'Tech startups and scale-ups recruit CTOs and tech leads capable of building innovative products, scaling technical teams, and structuring IT governance. We identify entrepreneurial profiles, with strong product culture and ability to evolve in high-growth environments.',
      },
      {
        title: 'Public and para-public organizations',
        description: 'Public and para-public organizations need IT experts to modernize their systems, improve citizen service quality, and optimize costs. We recruit profiles capable of working in a specific regulatory context, with an approach oriented toward public value and transparency.',
      },
    ],
    deliverables: [
      'CTOs, IT directors, technical directors, and program directors.',
      'Enterprise architects, solution architects, and tech leads.',
      'Organization, IT governance, and digital strategy consultants.',
      'Agile transformation, product, and delivery experts.',
      'Interim management profiles for high-stakes missions.',
    ],
    advantages: [
      'Selection of tailor-made profiles according to your context, culture, and objectives.',
      'Flexibility of intervention modes: permanent contract, fixed-term contract, freelance, advisory mission.',
      'Access to a network of independent experts and experienced IT executives.',
      'Results-oriented approach: measurable impact, support from framing to execution.',
    ],
  },
}

export function getServiceData(
  slug: string,
  lang: 'FR' | 'EN',
  defaultService: ServiceData
): ServiceData {
  if (lang === 'EN' && serviceTranslationsEN[slug]) {
    const enTranslation = serviceTranslationsEN[slug]
    return {
      ...defaultService,
      ...enTranslation,
      // Les propriétés qui ne sont pas traduites gardent leurs valeurs par défaut
    } as ServiceData
  }
  // Retourne les données FR par défaut
  return defaultService
}

























