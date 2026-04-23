export type Language = 'en' | 'nl' | 'fr' | 'tr';

export const translations = {
  en: {
    nav: { 
      home: "Home", services: "Services", process: "Process", contact: "Contact", privacy: "Privacy", terms: "Terms", gateway: "Client Portal",
      products: "Products", showroom: "Showroom", documentation: "Documentation", systemStatus: "System Status"
    },
    footer: { 
      rights: "All rights reserved.", builtIn: "Engineered in Dilbeek, Belgium.", lang: "Language",
      company: "Company", resources: "Resources", connect: "Connect"
    },

    hero: {
      badge: "Digital Studio • Dilbeek, Belgium",
      title: "Digital products.",
      subtitle: "Built right.",
      desc: "We engineer fast, scalable web applications using modern open-source tools. Clean code, functional design, and transparent workflows.",
      ctaStart: "Initiate Project",
      ctaExplore: "Explore Capabilities"
    },

    services: {
      title: "Engineering Capabilities.",
      subtitle: "Architectural focus areas.",
      frontend: { title: "Frontend Architecture", desc: "Custom user interfaces with sub-second load times. Built with React and Tailwind CSS." },
      fullstack: { title: "Full-Stack Systems", desc: "Robust relational databases and secure backends. Engineered for enterprise scalability." }
    },

    process: {
      title: "Engineering Workflow.",
      subtitle: "A transparent deployment pipeline.",
      step1: { label: "01. Scope", title: "Strategy", desc: "We define exact project parameters and technical requirements." },
      step2: { label: "02. Build", title: "Development", desc: "Writing clean, modular code in a secure staging environment." },
      step3: { label: "03. Launch", title: "Deployment", desc: "Rigorous cross-device testing and seamless server deployment." }
    },

    tech: {
      tag: "CORE TECHNOLOGIES",
      items: { next: "Next.js", ts: "TypeScript", tailwind: "Tailwind CSS", supabase: "Supabase", vercel: "Vercel" }
    },

    pricing: {
      tag: "ALGORITHMIC ESTIMATES",
      title: "Calculate parameters.",
      desc: "No hidden fees. Generate a baseline calculation for your architecture before we initiate discovery.",
      check1: "Instant baseline figure",
      check2: "Non-binding calculation",
      check3: "Tailored to your scope",
      button: "Start Calculator"
    },

    contact: {
      title: "Initiate Contact.",
      subtitle: "Secure communication channel.",
      namePlaceholder: "Entity Name",
      emailPlaceholder: "Corporate Email",
      messagePlaceholder: "Project specifications...",
      button: "Transmit Message"
    },

    privacy: {
      title: "Data Protection",
      subtitle: "Privacy Directive & GDPR.",
      tag: "Compliance",
      lastUpdated: "Last Updated: April 2026",
      sec1Title: "01. Data Collection & Processing",
      sec1Desc: "As a European engineering firm, we operate under strict GDPR compliance. We collect only the cryptographic and corporate data absolutely necessary to architect and host your digital infrastructure.",
      sec1Notice: "We strictly refuse the sale, monetization, or unauthorized sharing of client data to third parties.",
      techAuthTitle: "02. Technical Authentication (Cookies)",
      techAuthDesc: "Novatrum utilizes zero-knowledge session handling. We deploy only strictly necessary technical cookies required to authenticate your identity within the Client Portal. We do not use third-party marketing trackers.",
      sec2Title: "03. Communication Privacy",
      sec2Desc: "Your corporate communication is treated as confidential engineering data.",
      rule1: "End-to-end encryption on project parameters.",
      rule2: "Zero unsolicited third-party marketing.",
      rule3: "Automated deletion of expired credentials.",
      sec3Title: "04. Infrastructure Security",
      sec3Desc: "All database environments and architectural blueprints are isolated within our private edge network. Data is encrypted both in transit and at rest to ensure enterprise-grade impenetrability.",
      footerTag: "SECURITY INQUIRIES?",
      cta: "Contact Engineering"
    },
    terms: {
      title: "Terms of",
      subtitle: "Service & Partnership",
      tag: "Legal Directive",
      lastUpdated: "Effective: April 2026",
      sec1Title: "01. Acceptance & Scope",
      sec1Desc: "By initiating a project, you agree to our Legal Blueprint. These terms define the professional and technical boundaries of our partnership. We do not operate on hourly rates; any additional features requested after approval will be evaluated as a fixed-price addition.",
      sec1Notice: "Actioning a deposit or gateway access confirms your explicit acceptance of these parameters.",
      sec2Title: "02. Professional Conduct",
      sec2Desc: "To maintain engineering focus and project integrity, all interactions must adhere strictly to the following communication protocol:",
      rule1Title: "Client Portal",
      rule1Desc: "All official requests, revisions, and technical support must be routed via the Novatrum Client Portal.",
      rule2Title: "Corporate Email",
      rule2Desc: "Secondary official communication and documentation are handled via corporate email channels.",
      rule3Title: "No Informal Channels",
      rule3Desc: "Informal messaging (e.g., WhatsApp, Social Media) is strictly not recognized for project directives.",
      sec3Title: "03. Billing & Retainers",
      sec3Desc: "Billing is milestone-based. Initial setup fees reserve engineering capacity and infrastructure. Therefore, initial payments are strictly non-refundable. Delays in payment exceeding 14 days will result in an immediate infrastructure pause.",
      sec4Title: "04. Architecture Ownership",
      sec4Desc: "While clients hold commercial usage rights to the visual design, the core software and source code remain the exclusive property of Novatrum. All systems are hosted on our edge network. We operate as a SaaS provider; raw code is never exported.",
      footerTag: "Novatrum // Autonomous Engineering Systems",
      cta: "Return to Gateway"
    },

    legal: {
      pageTitle: "Legal Blueprint",
      subtitle: "General Terms & Conditions",
      desc: "The foundational parameters governing our engineering partnerships.",
      footerInfo: "Novatrum Core Infrastructure // Security & Compliance Division",
      footerLink: "General Terms of Service",
      sections: [
        { num: '01', title: 'Scope of Work (Scope Creep)', desc: 'The services provided by Novatrum are strictly limited to the specifications outlined in the agreed "Definitive Blueprint". We do not operate on hourly rates; any additional features or pages requested after approval will be evaluated and billed as a fixed-price structural addition.' },
        { num: '02', title: 'Payment Terms & Retainers', desc: 'Invoices are generated via our automated system. Development will pause if payments are delayed beyond 14 days. Initial payments (setup fees/deposits) reserve engineering time and infrastructure. Therefore, these initial payments are strictly non-refundable if the project is cancelled by the client.' },
        { num: '03', title: 'Intellectual Property & Access', desc: 'Upon final payment, the client receives full commercial rights to the visual design. The underlying codebase and Admin Dashboards remain the exclusive property of Novatrum. Novatrum reserves the right to display the completed project in our portfolio and marketing materials unless a custom NDA is signed.' },
        { num: '04', title: 'Hosting & Continuous Engineering', desc: 'To guarantee enterprise-grade security, all platforms are hosted exclusively on Novatrum\'s infrastructure. A mandatory monthly continuous engineering retainer applies. We operate as a SaaS provider; raw code is never exported to third-party servers.' },
        { num: '05', title: 'Client Responsibilities & Communication', desc: 'The client is solely responsible for purchasing their Domain Name. All official communication, technical support, and revision requests must be conducted exclusively via the Novatrum Client Portal or corporate email. Informal channels (e.g., WhatsApp, social media) are not recognized for project directives.' },
        { num: '06', title: 'Limitation of Liability', desc: 'Novatrum engineers high-performance systems, but we cannot guarantee absolute immunity from cyber threats. Novatrum\'s maximum liability for any claim arising out of the project is limited to the total amount paid by the client for that specific project.' }
      ]
    },

    showroom: {
      badge: "Environment Selector",
      title: "Simulation Hub.",
      subtitle: "Explore industry-specific prototypes engineered with Novatrum infrastructure. Each module is designed to redefine industry standards.",
      networkActive: "Showroom Active",
      networkMaintenance: "Network Maintenance",
      networkDegraded: "Network Degraded",
      moduleReady: "Ready",
      btnDeploy: "Initialize Protocol",
      btnRestricted: "Access Restricted",
      footerEnv: "Simulation Environment.",
      btnHub: "Return to Hub",
      btnStart: "Start Protocol",
      demos: {
        creative: { title: "Aura Creative", category: "Architecture & Studio", desc: "Luxury, minimal, and visually-driven portfolio architecture. Features smooth scrolling and large typography." },
        fintech: { title: "Aegis Finance", category: "Neo-Banking & Wealth", desc: "High-contrast, Swiss-style financial interface designed for enterprise-level wealth management." },
        logistics: { title: "Node Logistics", category: "Global Tracking & B2B", desc: "Operational company dashboard focused on speed, dense data tables, and live map tracking." },
        quantum: { title: "Quantum Engine", category: "Spatial Computing & WebGL", desc: "Dark-mode heavy, 3D interactive neural API showcase for developers and Web3 startups." }
      }
    },

    statusPage: {
      titleStatus: "Status",
      subtitle: "Real-time Core Infrastructure Availability",
      coreSystems: "Core Infrastructure",
      autoUpdate: "Automatically updated every 10 minutes",
      lastCheck: "Last check:",
      global: {
        operational: "All Systems Operational",
        outage: "Major System Outage",
        degraded: "Partial System Degradation"
      },
      badge: {
        operational: "Operational",
        degraded: "Degraded",
        outage: "Outage"
      }
    },

    gateway: {
      title: "Project Initiation",
      subtitle: "Select your preferred pathway to begin the engineering process.",
      opt1Title: "Quick Estimate",
      opt1Time: "3 - 5 Minutes",
      opt1Desc: "Get a ballpark figure based on standard parameters. Perfect if you are in the early stages of budget planning.",
      opt1Feat1: "Fast & Simple",
      opt1Feat2: "No commitments",
      opt1Feat3: "Approximate pricing only",
      opt1Btn: "Calculate Estimate",
      opt2Title: "Definitive Blueprint",
      opt2Time: "10 - 12 Minutes",
      opt2Desc: "A deep dive into your technical needs. We will lock in your parameters and provide an exact, contract-ready proposal.",
      opt2NoticeTitle: "Engineering Requirement",
      opt2NoticeDesc: "This form is highly detailed. Please only proceed if you are ready to outline your project's technical scope.",
      opt2Btn: "Initiate Discovery",
      returnHub: "Return to Hub"
    },

    discoveryPage: {
      title: "Definitive",
      subtitle: "Discovery.",
      desc: "Provide the detailed parameters of your project. We will engineer a precise blueprint and contract-ready proposal.",
      liveEstimate: "Live Estimate",
      phase: "Phase",
      of: "of",
      fileUploading: "Encrypting Upload...",
      fileClick: "Click or Drag files here",
      termsAgree: "I acknowledge that I have read and agree to the ",
      termsLink: "Novatrum Master Service Agreement",
      termsDesc: ". I understand that this definitive blueprint forms the technical scope and billing terms of our collaboration.",
      
      // --- PREMIUM ARCHITECTURE OPTIONS ---
      architectures: {
        landing: { label: "Landing Architecture", desc: "A high-performance, single-page digital asset. Includes bespoke design, sub-second load times, and conversion-optimized routing." },
        corporate: { label: "Corporate Platform", desc: "A multi-page authoritative presence. Features scalable CMS architecture, flawless SEO structures, and dynamic routing." },
        ecommerce: { label: "Digital Storefront", desc: "A bespoke conversion engine. Custom inventory logic, frictionless checkout flows, and secure payment architectures." },
        saas: { label: "Custom Software (SaaS)", desc: "Proprietary digital infrastructure. Advanced database design, complex user auth, and bespoke business logic engineered from scratch." }
      },

      // --- PREMIUM SETUP FEE ---
      setupFee: {
        title: "Initialization Fee",
        desc: "Every Novatrum architecture begins with a standard operational setup. This mandatory fee ensures enterprise-grade performance and security from day one.",
        includesTitle: "The Novatrum Standard Includes:",
        items: {
          i1: "Vercel Edge Network Deployment",
          i2: "SSL Encryption & Security Headers",
          i3: "Global CDN Configuration",
          i4: "100/100 Lighthouse Performance Tuning"
        }
      },

      // --- PREMIUM MAINTENANCE OPTIONS ---
      maintenance: {
        none: { title: "No Ongoing Support", desc: "Client assumes full responsibility for server security, API changes, and maintenance post-launch." },
        essential: { title: "Infrastructure Management", desc: "Proactive security patches, uptime monitoring, daily database backups, and core system updates." },
        growth: { title: "Growth Engineering", desc: "Infrastructure package + 5 hours of monthly continuous development and UI/UX iterations." },
        scale: { title: "Dedicated Tech Lead", desc: "Growth package + 15 hours of development. Priority Slack channel and dedicated engineering support." }
      },

      integrations: {
        stripe: "Stripe Payment Gateway",
        auth: "User Authentication & Authorization",
        crm: "CRM / Hubspot Sync",
        mail: "Newsletter & Email Sync",
        analytics: "Advanced Event Analytics",
        ai: "Bespoke AI / ML Integration",
        sockets: "Real-time Data / Sockets",
        cms: "Custom Content Management (CMS)",
        multilang: "Multi-language Alphas"
      },
      designStyles: {
        minimal: "Scandinavian Minimal",
        bold: "Bold & Editorial",
        corporate: "Modern Corporate",
        interactive: "Award-Winning Immersive"
      },
      fontPrefs: {
        sans: "Modern Sans-Serif",
        serif: "Classic Serif",
        mono: "Industrial Monospace"
      },
      seoLevels: {
        standard: "Standard SEO Structure",
        advanced: "Advanced / Technical SEO"
      },
      timelines: {
        standard: "Standard Pipeline",
        relaxed: "Relaxed Delivery",
        expedited: "Expedited Priority"
      },
      constraint: {
        title: "Architectural Constraint",
        desc: "A complex platform cannot be expedited. Please prioritize standard or relaxed timelines for proper engineering."
      },
      form: {
        credentials: "Credentials",
        entity: "Corporate Entity / Brand Name *",
        website: "Existing Domain (Optional)",
        goals: "Primary Objective *",
        goalsPlace: "What specific business problem are we solving? (e.g., Automating bookings, increasing B2B leads, launching a SaaS product)",
        competitors: "Direct Competitors / Benchmarks",
        architecture: "Architecture.",
        archDesc: "Select the foundational technical structure for your deployment.",
        pages: "Scale Requirement (Page Count)",
        design: "Aesthetics.",
        designDesc: "Define the visual engineering and brand parameters.",
        color: "Primary Color",
        accent: "Accent Color",
        hasAccent: "Has Accent Color?",
        fonts: "Typography Base",
        content: "Assets.",
        copy: "Novatrum SEO Copywriting",
        assets: "Asset Upload Center",
        integrations: "Matrix.",
        intDesc: "Select backend capabilities and API integrations.",
        seo: "Visibility",
        seoDesc: "Select content engineering and indexing strategy.",
        timeline: "Logistics.",
        timelineDesc: "Define delivery timeline and ongoing engineering retainer.",
        maintenance: "Continuous Engineering (Retainer)",
        maintenanceDesc: "Include post-launch infrastructure management.",
        maintenanceCheck: "Include priority maintenance",
        client: "Authorization.",
        clientSub: "Finalize billing credentials to generate the official blueprint.",
        name: "Authorized Signatory *",
        email: "Corporate Email *",
        phone: "Phone Number",
        address: "Billing Address *",
        vat: "VAT Number",
        notes: "Design Notes",
        notesPlace: "Share any specific visual directions or technical notes...",
        transparencyTitle: "Operational Compliance",
        transparencyDesc: "Our pricing model separates engineering value from mandatory operational costs (licenses, cloud infrastructure, and business compliance). This ensures full transparency.",
        exclVat: "Excl. VAT",
        twoMonthsFreeBadge: "2 Months Free Included",
        pdfDisclaimer: "* Estimate represents engineering value. Operational expenses and VAT are calculated during onboarding.",
      },
      summary: {
        title: "Intelligence Summary",
        desc: "A baseline algorithmic blueprint of your defined parameters.",
        notBinding: "NOT BINDING",
        platform: "Platform Architecture",
        logistics: "Deployment Timeline",
        copywriting: "Copywriting",
        maintenance: "Maintenance",
        design: "Design Direction",
        integrations: "Integrations",
        total: "Live Calculation (€)",
        twoMonthsFreeNote: "First 2 Months Free",
      },
      btn: {
        prev: "Previous Phase",
        next: "Next Phase",
        submit: "Submit For Review",
        encrypting: "Encrypting Protocol...",
        finish: "Start Discovery",
        pdf: "Download Blueprint PDF",
        hub: "Return to Central Gateway"
      },
      success: {
        title: "Protocol Logged.",
        sub: "Definitive Discovery",
        desc: "Architecture specifications secured. Engineering review pending.",
        dsNumber: "Deployment Reference"
      }
    },

    contactPage: {
      title: "Initiate Contact",
      subtitle: "Digital Engineering.",
      desc: "Discuss your technical requirements or request a private consultation with our engineering team.",
      studioName: "Novatrum Infrastructure.",
      studioLoc: "Dilbeek, Belgium",
      studioOper: "Available for global operations",
      roadmapTitle: "ENGINEERING ROADMAP",
      steps: [
        { s: "01", t: "Discovery & Strategy", d: "We discuss your goals, technical requirements, and define the scope." },
        { s: "02", t: "Architecture & UI", d: "We map out the system architecture and design the user experience." },
        { s: "03", t: "Core Development", d: "We build the platform and deploy it to a secure, scalable environment." }
      ],
      badge: "Engineering Capacity: Open",
      form: {
        nameLabel: "Full Name *",
        namePlaceholder: "e.g. John Doe",
        emailLabel: "Corporate Email *",
        emailPlaceholder: "john@company.com",
        categoryLabel: "Inquiry Type",
        categoryValue: "Digital Product Engineering",
        briefLabel: "Project Details *",
        briefPlaceholder: "Describe your architectural needs...",
        submit: "Transmit Message",
        sending: "Sending..."
      },
      success: {
        title: "Transmission Successful.",
        desc: "Your message has been securely logged. Our team will review your requirements and respond shortly.",
        button: "Transmit Another Note"
      },
      faqTitle: "Common",
      faqSubtitle: "Inquiries.",
      faqDesc: "Here are some frequent questions regarding our engineering process and technical capabilities.",
      faqs: [
        { q: "What is your typical project timeline?", a: "Depending on structural complexity, standard deployments take 4 to 8 weeks. Expedited options are available." },
        { q: "Do you offer post-launch maintenance?", a: "Yes, we provide priority maintenance retainers including security patches and continuous optimization." },
        { q: "What is your core technology stack?", a: "We engineer systems using Next.js, React, Tailwind CSS, Node.js, and PostgreSQL via Supabase." }
      ]
    },

    calculator: {
      title: "Architectural Estimate",
      subtitle: "Define baseline parameters",
      stepInfo: "Phase",
      of: "of",
      tag: "ESTIMATE",
      included: "Included",
      monthly: "mo",
      month: "month",
      customPalette: "Custom Colors",
      builderTitle: "Brand Identity",
      builderDesc: "Select your precise hex codes.",
      shuffleColors: "Shuffle",
      applyPalette: "Apply Custom Colors",
      paletteSelected: "Palette Applied",
      textPlaceholder: "Describe any specific functionality, integrations, or competitor references here...",
      estimateGen: "Blueprint Calculated",
      totalInv: "Estimated Investment",
      recurringLabel: "Recurring Retainer",
      btnPrev: "Previous Phase",
      btnReset: "Restart Process",
      btnNext: "Next Phase",
      btnFinish: "Generate Estimate",
      formNameLabel: "Entity Name",
      formNamePlace: "Company or Your Name",
      formCompanyLabel: "Current Website (Optional)",
      formCompanyPlace: "https://...",
      formEmailLabel: "Secure Email",
      formEmailPlace: "Where should we send the data?",
      btnSending: "Compiling Data...",
      btnSend: "Reveal Estimate",
      notice: "This is a non-binding algorithmic estimate.",
      successTitle: "Estimate Dispatched",
      successDesc: "A copy of your baseline estimate has been sent to your email. We will contact you to discuss definitive parameters.",
      liveTotal: "Live Calculation",
      resetConfirm: "Are you sure you want to purge current selections and restart the calculation?",
      opt2Btn: "Start Definitive Discovery",
      returnHub: "Return to Hub",
      stepsData: [
        {
          title: "Core Infrastructure",
          subtitle: "Select the foundational architecture of your platform.",
          options: [
            { label: "Landing Page", desc: "High-conversion single page presence." },
            { label: "Corporate Site", desc: "Multi-page professional business architecture." },
            { label: "Standard E-Commerce", desc: "Digital storefront with standard cart flows." },
            { label: "Advanced Integration", desc: "Platform requiring complex third-party API syncs." },
            { label: "SaaS / Web App", desc: "Custom software with complex database logic." }
          ]
        },
        { title: "Aesthetics & UI", subtitle: "Select your visual direction." },
        {
          title: "Branding Assets",
          subtitle: "Do you require custom visual asset creation?",
          options: [
            { label: "Brand Identity Design", desc: "Logo, typography, and core brand guidelines." },
            { label: "Bespoke UI Design", desc: "Custom wireframing and high-fidelity mockups." }
          ]
        },
        {
          title: "Content & SEO",
          subtitle: "Select content engineering requirements.",
          options: [
            { label: "Standard SEO Setup", desc: "Basic meta tags and indexing." },
            { label: "Professional Copywriting", desc: "SEO-optimized sales copy for all pages." },
            { label: "Advanced Technical SEO", desc: "Schema markup and programmatic architecture." }
          ]
        },
        {
          title: "Lead Generation",
          subtitle: "Select user acquisition tools.",
          options: [
            { label: "Advanced Contact Forms", desc: "Conditional logic and webhook routing." },
            { label: "Newsletter Sync", desc: "Integration with Mailchimp/ConvertKit." },
            { label: "CRM Integration", desc: "Direct sync with Hubspot or Salesforce." }
          ]
        },
        {
          title: "Performance & Logistics",
          subtitle: "Select hosting and ongoing engineering support.",
          options: [
            { label: "Standard Optimization", desc: "Standard caching and asset delivery." },
            { label: "Ultra Performance", desc: "Guaranteed 95+ Core Web Vitals score." },
            { label: "Premium Hosting", desc: "Dedicated resources and daily backups." },
            { label: "Priority Maintenance", desc: "Ongoing code updates and security patches." }
          ]
        },
        {
          title: "Deployment Timeline",
          subtitle: "Select your required launch schedule.",
          options: [
            { label: "Standard Queue (4-6 Weeks)", desc: "Regular engineering priority." },
            { label: "Expedited (1-2 Weeks)", desc: "Priority delivery. Premium applied." }
          ]
        },
        { title: "Architectural Vision", subtitle: "Provide any final directives or technical notes." }
      ],
      palettes: [
        { name: "Novatrum Dark", desc: "Our signature look. Deep, premium, and bold." },
        { name: "Nordic Clean", desc: "Light, minimal, focused on typography." },
        { name: "Midnight Tech", desc: "Modern blue tones for tech-driven startups." },
        { name: "Industrial Gold", desc: "High contrast with elegant gold accents." }
      ]
    },

    processPage: {
      title: "Engineering",
      subtitle: "Methodology.",
      desc: "A transparent, step-by-step framework designed to turn complex logic into elegant, high-performance digital realities.",
      steps: [
        { num: "01", title: "Discovery & Blueprinting", subtitle: "Defining the Architecture", desc: "We initiate with a deep dive into your technical requirements and business objectives. Together, we lock in the project scope and establish a definitive engineering roadmap." },
        { num: "02", title: "UI/UX Engineering", subtitle: "Designing the Interface", desc: "We draft the visual architecture. Rejecting generic templates, every interface is custom-engineered to ensure pixel-perfect alignment with your brand's digital identity." },
        { num: "03", title: "Core Development", subtitle: "Writing the Logic", desc: "Our team writes clean, modular, and highly scalable code. You receive continuous progress updates and access to a secure staging environment to monitor the build." },
        { num: "04", title: "Testing & Deployment", subtitle: "Going Live", desc: "Following rigorous cross-device quality assurance, we execute the deployment protocol. We ensure your platform is secure, optimized, and built to handle enterprise traffic." }
      ],
      ctaTitle: "Ready to initiate your build?",
      ctaButton: "Commence Discovery"
    },

    servicesPage: {
      title: "Bespoke Architectures",
      subtitle: "We engineer fast, scalable, and conversion-focused digital platforms using state-of-the-art open-source technologies.",
      s1: {
        title: "Custom Frontend Engineering",
        desc: "We develop bespoke user interfaces with an uncompromising focus on sub-second load times and fluid interactions. No templates—just pure performance and seamless digital experiences.",
        tech: "REACT • NEXT.JS • TAILWIND",
        features: [
          "Sub-second rendering performance",
          "Fluid responsive architecture across all viewports",
          "Advanced interactive UI and WebGL elements"
        ]
      },
      s2: {
        title: "Full-Stack SaaS Systems",
        desc: "End-to-end web application engineering. From encrypted user authentication flows to complex relational database logic, we build robust architectures ready for enterprise scale.",
        tech: "NODE.JS • SUPABASE • POSTGRES",
        features: [
          "Encrypted user authentication and authorization",
          "Real-time database synchronization",
          "Complex third-party API and webhook routing"
        ]
      },
      s3: {
        title: "E-Commerce Infrastructure",
        desc: "High-performance digital storefronts engineered to maximize transaction conversion rates, handle massive traffic spikes, and ensure bank-grade checkout security.",
        tech: "STRIPE • CUSTOM CMS • ANALYTICS",
        features: [
          "Bank-grade secure payment gateway integration",
          "Conversion-optimized checkout pipelines",
          "Granular sales and user behavior analytics"
        ]
      },
      ctaTitle: "Ready to define your parameters?",
      ctaButton: "Start Project Discovery"
    },

    productsPage: {
      splashInit: "Initializing Premium Modules...",
      heroTag: "Premium Modules",
      heroTitleLine1: "Expand Your",
      heroTitleLine2: "Architecture.",
      heroDesc: "Supercharge your operations with deeply integrated SaaS modules. From military-grade security to omniscient AI assistants, build the exact infrastructure your agency needs.",
      visualInterface: "Visual Interface",
      investment: "Module Investment",
      mo: "/mo",
      btnRequest: "Request Access",
      ctaTitle: "Not sure which nodes to activate?",
      ctaDesc: "Connect with the engineering team to audit your current architecture and determine the exact modules required for optimal scaling.",
      btnConsult: "Consult Engineering",
      modules: {
        nexus: {
          name: "Nexus CX Module",
          tagline: "Client Experience Paradigm",
          desc: "A dedicated internal portal for your clients. Centralize all communications, document sharing, and project status tracking in one highly secure, branded environment. Eliminate email clutter and elevate your professional image.",
          f1: "Real-time project tracking",
          f2: "Secure vault access",
          f3: "Automated billing sync"
        },
        sentinel: {
          name: "Sentinel Core Security",
          tagline: "Military-Grade Infrastructure",
          desc: "Advanced threat protection for your architecture. Sentinel Core provides continuous vulnerability scanning, DDoS mitigation, and automated database backups to ensure your digital assets remain impenetrable 24/7.",
          f1: "Automated daily backups",
          f2: "DDoS mitigation layer",
          f3: "Zero-day vulnerability patching"
        },
        architect: {
          name: "Architect AI Module",
          tagline: "Automated Blueprint Generation",
          desc: "Instantly generate high-conversion technical audit reports and architecture blueprints for prospective clients. Use data-driven insights to close deals faster with automated PageSpeed and Wappalyzer parsing.",
          f1: "Instant audit generation",
          f2: "PDF blueprint rendering",
          f3: "Legacy stack identification"
        },
        neural: {
          name: "Neural AI Engine",
          tagline: "The Ultimate Oracle",
          desc: "Deploy a high-level infrastructure intelligence node. Neural AI has real-time access to your entire database, acting as a tireless executive assistant capable of calculating MRR, tracking debts, and writing sales copies.",
          price: "Tiered",
          f1: "Unlimited world knowledge",
          f2: "Live database context",
          f3: "Financial & technical logic"
        }
      }
    },
  },

  nl: {
    nav: { 
      home: "Home", services: "Diensten", process: "Methodologie", contact: "Contact", privacy: "Privacy", terms: "Voorwaarden", gateway: "Klantenportaal",
      products: "Producten", showroom: "Showroom", documentation: "Documentatie", systemStatus: "Systeemstatus"
    },
    footer: { 
      rights: "Alle rechten voorbehouden.", builtIn: "Ontwikkeld in Dilbeek, België.", lang: "Taal",
      company: "Bedrijf", resources: "Bronnen", connect: "Contact"
    },

    hero: {
      badge: "Digitale Studio • Dilbeek, België",
      title: "Digitale producten.",
      subtitle: "Perfect gebouwd.",
      desc: "Wij engineeren snelle, schaalbare webapplicaties met moderne open-source tools. Schone code, functioneel design en transparante processen.",
      ctaStart: "Project Starten",
      ctaExplore: "Onze Expertise"
    },

    services: {
      title: "Engineering Capaciteiten.",
      subtitle: "Architecturale aandachtsgebieden.",
      frontend: { title: "Frontend Architectuur", desc: "Custom user interfaces met sub-seconde laadtijden. Gebouwd met React en Tailwind CSS." },
      fullstack: { title: "Full-Stack Systemen", desc: "Robuuste relationele databases en veilige backends. Geëngineerd voor schaalbaarheid." }
    },

    process: {
      title: "Engineering Workflow.",
      subtitle: "Een transparante deployment pipeline.",
      step1: { label: "01. Scope", title: "Strategie", desc: "We definiëren exacte projectparameters en technische eisen." },
      step2: { label: "02. Build", title: "Ontwikkeling", desc: "Schrijven van schone, modulaire code in een beveiligde testomgeving." },
      step3: { label: "03. Launch", title: "Deployment", desc: "Grondige cross-device testing en naadloze server deployment." }
    },

    tech: {
      tag: "KERNTECHNOLOGIEËN",
      items: { next: "Next.js", ts: "TypeScript", tailwind: "Tailwind CSS", supabase: "Supabase", vercel: "Vercel" }
    },

    pricing: {
      tag: "ALGORITMISCHE SCHATTINGEN",
      title: "Bereken parameters.",
      desc: "Geen verborgen kosten. Genereer een basisberekening voor uw architectuur voordat we starten.",
      check1: "Directe basisindicatie",
      check2: "Niet-bindende berekening",
      check3: "Afgestemd op uw scope",
      button: "Start Calculator"
    },

    contact: {
      title: "Contact Opnemen.",
      subtitle: "Beveiligd communicatiekanaal.",
      namePlaceholder: "Entiteitsnaam",
      emailPlaceholder: "Zakelijk E-mailadres",
      messagePlaceholder: "Projectspecificaties...",
      button: "Bericht Verzenden"
    },
    privacy: {
      title: "Gegevensbescherming",
      subtitle: "Privacyrichtlijn & AVG.",
      tag: "Compliance",
      lastUpdated: "Laatst bijgewerkt: April 2026",
      sec1Title: "01. Gegevensverzameling & Verwerking",
      sec1Desc: "Als Europees ingenieursbureau werken wij onder strikte AVG (GDPR) naleving. Wij verzamelen alleen cryptografische en bedrijfsgegevens die absoluut noodzakelijk zijn om uw digitale infrastructuur te hosten.",
      sec1Notice: "Wij weigeren ten strengste de verkoop of het ongeautoriseerd delen van klantgegevens aan derden.",
      techAuthTitle: "02. Technische Authenticatie (Cookies)",
      techAuthDesc: "Novatrum maakt gebruik van zero-knowledge sessiebeheer. Wij plaatsen alleen strikt noodzakelijke cookies om uw identiteit binnen het Klantenportaal te verifiëren. Wij gebruiken geen third-party marketing trackers.",
      sec2Title: "03. Communicatie Privacy",
      sec2Desc: "Uw zakelijke communicatie wordt behandeld als vertrouwelijke technische data.",
      rule1: "End-to-end encryptie op projectparameters.",
      rule2: "Geen ongevraagde marketing van derden.",
      rule3: "Automatische verwijdering van verlopen inloggegevens.",
      sec3Title: "04. Infrastructuur Veiligheid",
      sec3Desc: "Alle databaseomgevingen zijn geïsoleerd binnen ons private edge-netwerk. Gegevens worden zowel tijdens verzending als in rust (at rest) versleuteld om enterprise-grade veiligheid te garanderen.",
      footerTag: "BEVEILIGINGSVRAGEN?",
      cta: "Contacteer Engineering"
    },
    terms: {
      title: "Voorwaarden van",
      subtitle: "Service & Partnerschap",
      tag: "Juridische Richtlijn",
      lastUpdated: "Geldig vanaf: April 2026",
      sec1Title: "01. Aanvaarding & Bereik",
      sec1Desc: "Door een project te starten, gaat u akkoord met onze Legal Blueprint. Wij werken niet met uurtarieven; extra functies die na goedkeuring worden aangevraagd, worden geëvalueerd als een vaste prijs toevoeging.",
      sec1Notice: "Het betalen van een aanbetaling of inloggen bevestigt uw uitdrukkelijke acceptatie van deze parameters.",
      sec2Title: "02. Professioneel Gedrag",
      sec2Desc: "Om de technische focus te behouden, dienen alle interacties strikt te voldoen aan het volgende communicatieprotocol:",
      rule1Title: "Client Portal",
      rule1Desc: "Alle officiële verzoeken en technische ondersteuning moeten via het Novatrum Client Portal verlopen.",
      rule2Title: "Zakelijke E-mail",
      rule2Desc: "Secundaire officiële communicatie wordt afgehandeld via zakelijke e-mail.",
      rule3Title: "Geen Informele Kanalen",
      rule3Desc: "Informele berichten (bijv. WhatsApp) worden strikt niet erkend voor projectrichtlijnen.",
      sec3Title: "03. Facturatie & Retainers",
      sec3Desc: "Facturatie is per mijlpaal. Opstartkosten reserveren engineering-capaciteit en zijn daarom strikt niet-restitueerbaar. Betalingsachterstanden van meer dan 14 dagen leiden tot het pauzeren van de infrastructuur.",
      sec4Title: "04. Eigendom Architectuur",
      sec4Desc: "Hoewel klanten commerciële gebruiksrechten hebben, blijft de kernsoftware exclusief eigendom van Novatrum. Systemen worden op ons netwerk gehost als SaaS; broncode wordt nooit geëxporteerd.",
      footerTag: "Novatrum // Autonome Engineering Systemen",
      cta: "Terug naar Gateway"
    },

    legal: {
      pageTitle: "Juridische Blueprint",
      subtitle: "Algemene Voorwaarden",
      desc: "De fundamentele parameters die onze technische partnerschappen regelen.",
      footerInfo: "Novatrum Core Infrastructure // Beveiliging & Compliance",
      footerLink: "Algemene Voorwaarden",
      sections: [
        { num: '01', title: 'Werkbereik (Scope Creep)', desc: 'De diensten van Novatrum zijn strikt beperkt tot de specificaties in de "Definitive Blueprint". Wij werken niet met uurtarieven; extra functies die na goedkeuring worden aangevraagd, worden gefactureerd als een vaste prijs toevoeging.' },
        { num: '02', title: 'Betalingsvoorwaarden', desc: 'Ontwikkeling pauzeert als betalingen meer dan 14 dagen te laat zijn. Aanbetalingen (opstartkosten) reserveren engineering-tijd en infrastructuur. Deze initiële betalingen zijn daarom strikt niet-restitueerbaar indien het project door de klant wordt geannuleerd.' },
        { num: '03', title: 'Intellectueel Eigendom & Toegang', desc: 'Na volledige betaling krijgt de klant commerciële rechten op het visuele ontwerp. De onderliggende broncode blijft exclusief eigendom van Novatrum. Novatrum behoudt zich het recht voor om het voltooide project in haar portfolio te tonen, tenzij een specifieke NDA is getekend.' },
        { num: '04', title: 'Hosting & Continuous Engineering', desc: 'Om topveiligheid te garanderen, worden alle platformen uitsluitend gehost op de Novatrum infrastructuur. Er geldt een verplichte maandelijkse onderhoudsvergoeding. Wij werken als SaaS-provider; broncode wordt nooit naar externe servers geëxporteerd.' },
        { num: '05', title: 'Verantwoordelijkheden & Communicatie', desc: 'De klant is zelf verantwoordelijk voor zijn Domeinnaam. Alle officiële communicatie, technische ondersteuning en revisieverzoeken dienen uitsluitend via het Novatrum Client Portal of e-mail te verlopen. Informele kanalen (zoals WhatsApp) worden niet geaccepteerd voor projectrichtlijnen.' },
        { num: '06', title: 'Beperking van Aansprakelijkheid', desc: 'Novatrum ontwikkelt hoogwaardige systemen, maar kan geen absolute immuniteit tegen cyberdreigingen garanderen. De maximale aansprakelijkheid van Novatrum is beperkt tot het totale bedrag dat door de klant voor dat project is betaald.' }
      ]
    },

    showroom: {
      badge: "Omgevingsselector",
      title: "Simulatie Hub.",
      subtitle: "Verken branchespecifieke prototypes gebouwd met Novatrum infrastructuur. Elke module is ontworpen om industriestandaarden te herdefiniëren.",
      networkActive: "Showroom Actief",
      networkMaintenance: "Netwerk Onderhoud",
      networkDegraded: "Netwerk Problemen",
      moduleReady: "Klaar",
      btnDeploy: "Protocol Initialiseren",
      btnRestricted: "Toegang Geweigerd",
      footerEnv: "Simulatie Omgeving.",
      btnHub: "Terug naar Hub",
      btnStart: "Start Protocol",
      demos: {
        creative: { title: "Aura Creative", category: "Architectuur & Studio", desc: "Luxe, minimalistische en visueel gedreven portfolio architectuur. Met soepele scrolling en grote typografie." },
        fintech: { title: "Aegis Finance", category: "Neo-Banking & Vermogen", desc: "Hoog contrast, financiële interface in Zwitserse stijl ontworpen voor enterprise vermogensbeheer." },
        logistics: { title: "Node Logistics", category: "Global Tracking & B2B", desc: "Operationeel bedrijfsdashboard gericht op snelheid, dichte datatabellen en live map tracking." },
        quantum: { title: "Quantum Engine", category: "Spatial Computing & WebGL", desc: "Dark-mode zware, 3D interactieve neurale API showcase voor ontwikkelaars en Web3 startups." }
      }
    },

    statusPage: {
      titleStatus: "Status",
      subtitle: "Real-time Kerninfrastructuur Beschikbaarheid",
      coreSystems: "Kerninfrastructuur",
      autoUpdate: "Wordt elke 10 minuten automatisch bijgewerkt",
      lastCheck: "Laatste controle:",
      global: {
        operational: "Alle Systemen Operationeel",
        outage: "Grote Systeemstoring",
        degraded: "Gedeeltelijke Systeemvertraging"
      },
      badge: {
        operational: "Operationeel",
        degraded: "Vertraagd",
        outage: "Storing"
      }
    },

    gateway: {
      title: "Project Initiatie",
      subtitle: "Kies uw gewenste traject om het engineeringsproces te starten.",
      opt1Title: "Snelle Schatting",
      opt1Time: "3 - 5 Minuten",
      opt1Desc: "Krijg een indicatie op basis van standaardparameters. Perfect als u in de vroege fase van budgetplanning zit.",
      opt1Feat1: "Snel & Eenvoudig",
      opt1Feat2: "Geen verplichtingen",
      opt1Feat3: "Enkel een indicatieve prijs",
      opt1Btn: "Schatting Berekenen",
      opt2Title: "Definitieve Blueprint",
      opt2Time: "10 - 12 Minuten",
      opt2Desc: "Een diepgaande analyse van uw technische behoeften. Wij leggen uw parameters vast en bieden een contractklaar voorstel.",
      opt2NoticeTitle: "Technische Vereiste",
      opt2NoticeDesc: "Dit formulier is zeer gedetailleerd. Ga alleen verder als u klaar bent om uw projectomvang te schetsen.",
      opt2Btn: "Start Discovery",
      returnHub: "Terug naar Hub"
    },

    discoveryPage: {
      title: "Definitieve",
      subtitle: "Discovery.",
      desc: "Voer de gedetailleerde parameters van uw project in. Wij engineeren een exact technisch plan en een contractklaar voorstel.",
      liveEstimate: "Live Schatting",
      phase: "Fase",
      of: "van",
      fileUploading: "Encrypting Upload...",
      fileClick: "Klik of sleep bestanden hierheen",
      termsAgree: "Ik bevestig dat ik de ",
      termsLink: "Novatrum Algemene Voorwaarden",
      termsDesc: " heb gelezen en hiermee akkoord ga. Ik begrijp dat deze definitieve blauwdruk de technische omvang en factureringsvoorwaarden van onze samenwerking vormt.",
      
      // --- PREMIUM ARCHITECTURE OPTIONS ---
      architectures: {
        landing: { label: "Landing Architectuur", desc: "Een high-performance, single-page digitaal platform. Inclusief op maat gemaakt design, sub-seconde laadtijden en conversie-geoptimaliseerde routing." },
        corporate: { label: "Corporate Platform", desc: "Een multi-page autoritaire aanwezigheid. Voorzien van schaalbare CMS-architectuur, foutloze SEO-structuren en dynamische routing." },
        ecommerce: { label: "Digitaal Storefront", desc: "Een op maat gemaakte conversiemachine. Custom voorraadlogica, frictieloze checkout-flows en veilige betalingsarchitecturen." },
        saas: { label: "Custom Software (SaaS)", desc: "Eigen digitale infrastructuur. Geavanceerd database-ontwerp, complexe gebruikersauthenticatie en op maat gemaakte bedrijfslogica vanaf nul opgebouwd." }
      },

      // --- PREMIUM SETUP FEE ---
      setupFee: {
        title: "Initialisatiekosten",
        desc: "Elke Novatrum architectuur begint met een standaard operationele setup. Deze verplichte vergoeding garandeert enterprise-grade prestaties en veiligheid vanaf dag één.",
        includesTitle: "De Novatrum Standaard Omvat:",
        items: {
          i1: "Vercel Edge Network Deployment",
          i2: "SSL Encryptie & Security Headers",
          i3: "Wereldwijde CDN Configuratie",
          i4: "100/100 Lighthouse Prestatie Tuning"
        }
      },

      // --- PREMIUM MAINTENANCE OPTIONS ---
      maintenance: {
        none: { title: "Geen Doorlopende Ondersteuning", desc: "Klant neemt volledige verantwoordelijkheid voor serverbeveiliging, API-wijzigingen en onderhoud na de lancering." },
        essential: { title: "Infrastructuur Beheer", desc: "Proactieve beveiligingspatches, uptime monitoring, dagelijkse database back-ups en kernsysteem updates." },
        growth: { title: "Growth Engineering", desc: "Infrastructuurpakket + 5 uur maandelijkse continue ontwikkeling en UI/UX-iteraties." },
        scale: { title: "Toegewijde Tech Lead", desc: "Growth pakket + 15 uur ontwikkeling. Prioritair Slack-kanaal en toegewijde technische ondersteuning." }
      },

      integrations: {
        stripe: "Stripe Betalingsinfrastructuur",
        auth: "Authenticatie & Rollen",
        crm: "CRM Sync",
        mail: "Transactionele E-mail",
        analytics: "Telemetrie & Analytics",
        ai: "AI & LLM Pipelines",
        sockets: "Real-time WebSockets",
        cms: "Bespoke Admin Controle",
        multilang: "Meertaligheid (i18n)"
      },
      designStyles: {
        minimal: "Scandinavisch Minimalisme",
        bold: "Bold & Editorial",
        corporate: "Modern Corporate",
        interactive: "Bekroonde Immersieve UI"
      },
      fontPrefs: {
        sans: "Modern Sans-Serif",
        serif: "Classic Serif",
        mono: "Industrial Monospace"
      },
      seoLevels: {
        standard: "Standaard SEO Yapısı",
        advanced: "Geavanceerd / Technisch SEO"
      },
      timelines: {
        standard: "Standaard Pipeline",
        relaxed: "Relaxte Levering",
        expedited: "Versnelde Prioriteit"
      },
      constraint: {
        title: "Architecturale Beperking",
        desc: "Een complex platform kan niet worden versneld. Geef a.u.b. prioriteit aan standaard- of relaxte tijdlijnen voor een goede technische uitvoering."
      },
      form: {
        credentials: "Credentials",
        entity: "Corporate Entiteit / Merknaam *",
        website: "Huidig Domein (Optioneel)",
        goals: "Primaire Doelstelling *",
        goalsPlace: "Welk specifiek zakelijk probleem lossen we op?",
        competitors: "Directe Concurrenten / Benchmarks",
        architecture: "Architectuur.",
        archDesc: "Selecteer de fundamentele technische structuur voor uw deployment.",
        pages: "Schaalvereiste (Aantal Pagina's)",
        design: "Esthetiek.",
        designDesc: "Definieer de visuele engineering en merkparameters.",
        color: "Primaire Kleur",
        accent: "Accentkleur",
        hasAccent: "Accentkleur toevoegen?",
        fonts: "Typografie Basis",
        content: "Assets.",
        copy: "Novatrum SEO Copywriting",
        assets: "Asset Upload Centrum",
        integrations: "Matrix.",
        intDesc: "Selecteer backend capaciteiten en API integraties.",
        seo: "Zichtbaarheid",
        seoDesc: "Selecteer de strategie voor content engineering en indexering.",
        timeline: "Logistiek.",
        timelineDesc: "Definieer de leveringstermijn en doorlopend onderhoudscontract.",
        maintenance: "Continuous Engineering",
        maintenanceDesc: "Inclusief infrastructuurbeheer na lancering.",
        maintenanceCheck: "Inclusief prioriteit onderhoud",
        client: "Autorisatie.",
        clientSub: "Voer uw facturatiegegevens in om de officiële blauwdruk te genereren.",
        name: "Bevoegde Ondertekenaar *",
        email: "Zakelijk E-mailadres *",
        phone: "Telefoonnummer",
        address: "Factuuradres *",
        vat: "BTW-nummer",
        notes: "Ontwerpnotities",
        notesPlace: "Deel specifieke visuele richtlijnen of technische opmerkingen...",
        transparencyTitle: "Operationele Naleving",
        transparencyDesc: "Ons prijsmodel scheidt de technische waarde van verplichte operationele kosten. Dit zorgt voor volledige transparantie.",
        exclVat: "Excl. BTW",
        twoMonthsFreeBadge: "2 Maanden Gratis",
        pdfDisclaimer: "* Schatting vertegenwoordigt technische waarde. Operationele kosten en BTW worden berekend tijdens de onboarding.",
      },
      summary: {
        title: "Intelligence Samenvatting",
        desc: "Een basis algoritmisch plan van uw gedefinieerde parameters.",
        notBinding: "NIET BINDEND",
        platform: "Platform Architectuur",
        logistics: "Deployment Tijdlijn",
        copywriting: "Copywriting",
        maintenance: "Onderhoud",
        design: "Ontwerprichting",
        integrations: "Integraties",
        total: "Live Berekening (€)",
        twoMonthsFreeNote: "Eerste 2 Maanden Gratis",
      },
      btn: {
        prev: "Vorige Fase",
        next: "Volgende Fase",
        submit: "Indienen voor Beoordeling",
        encrypting: "Protocol Versleutelen...",
        finish: "Start Discovery",
        pdf: "Download Blueprint PDF",
        hub: "Terug naar Central Gateway"
      },
      success: {
        title: "Protocol Vastgelegd.",
        sub: "Definitieve Discovery",
        desc: "Architectuurspecificaties beveiligd. Wachtend op technische beoordeling.",
        dsNumber: "Deployment Referentie"
      }
    },

    contactPage: {
      title: "Contact Opnemen",
      subtitle: "Digitale Engineering.",
      desc: "Bespreek uw technische vereisten of vraag een consultatie aan met ons engineeringteam.",
      studioName: "Novatrum Infrastructure.",
      studioLoc: "Dilbeek, België",
      studioOper: "Beschikbaar voor wereldwijde operaties",
      roadmapTitle: "ENGINEERING ROADMAP",
      steps: [
        { s: "01", t: "Ontdekking & Strategie", d: "We bespreken uw doelen, technische eisen en bepalen de scope." },
        { s: "02", t: "Architectuur & UI", d: "We ontwerpen de systeemarchitectuur en de gebruikerservaring." },
        { s: "03", t: "Kernontwikkeling", d: "We bouwen het platform en implementeren het in een veilige omgeving." }
      ],
      badge: "Engineering Capaciteit: Open",
      form: {
        nameLabel: "Volledige Naam *",
        namePlaceholder: "bijv. Jan Jansen",
        emailLabel: "Zakelijk E-mailadres *",
        emailPlaceholder: "jan@bedrijf.nl",
        categoryLabel: "Type Aanvraag",
        categoryValue: "Digital Product Engineering",
        briefLabel: "Projectdetails *",
        briefPlaceholder: "Beschrijf uw architecturale behoeften...",
        submit: "Bericht Verzenden",
        sending: "Verzenden..."
      },
      success: {
        title: "Transmissie Succesvol.",
        desc: "Uw bericht is veilig geregistreerd. Ons team zal uw vereisten beoordelen en spoedig reageren.",
        button: "Nog Een Bericht Verzenden"
      },
      faqTitle: "Veelgestelde",
      faqSubtitle: "Vragen.",
      faqDesc: "Hier zijn enkele veelgestelde vragen over ons engineeringsproces en onze technische capaciteiten.",
      faqs: [
        { q: "Wat is uw typische projecttijdlijn?", a: "Afhankelijk van structurele complexiteit duren standaardimplementaties 4 tot 8 weken. Versnelde opties zijn mogelijk." },
        { q: "Biedt u onderhoud na de lancering?", a: "Ja, wij bieden prioritaire onderhoudscontracten inclusief beveiligingspatches en continue optimalisatie." },
        { q: "Wat is uw kerntechnologie stack?", a: "Wij engineeren systemen met Next.js, React, Tailwind CSS, Node.js en PostgreSQL via Supabase." }
      ]
    },

    calculator: {
      title: "Architecturale Schatting",
      subtitle: "Definieer basisparameters",
      stepInfo: "Fase",
      of: "van",
      tag: "SCHATTING",
      included: "Inbegrepen",
      monthly: "mnd",
      month: "maand",
      customPalette: "Aangepaste Kleuren",
      builderTitle: "Merkidentiteit",
      builderDesc: "Selecteer uw exacte hex-codes.",
      shuffleColors: "Wisselen",
      applyPalette: "Kleuren Toepassen",
      paletteSelected: "Palet Toegepast",
      textPlaceholder: "Beschrijf hier specifieke functionaliteiten, integraties of concurrenten...",
      estimateGen: "Blueprint Berekend",
      totalInv: "Geschatte Investering",
      recurringLabel: "Terugkerende Kosten",
      btnPrev: "Vorige Fase",
      btnReset: "Proces Herstarten",
      btnNext: "Volgende Fase",
      btnFinish: "Schatting Genereren",
      formNameLabel: "Entiteitsnaam",
      formNamePlace: "Bedrijf of Uw Naam",
      formCompanyLabel: "Huidige Website (Optioneel)",
      formCompanyPlace: "https://...",
      formEmailLabel: "Veilig E-mailadres",
      formEmailPlace: "Waar mogen we de data heen sturen?",
      btnSending: "Data Verwerken...",
      btnSend: "Schatting Bekijken",
      notice: "Dit is een niet-bindende algoritmische schatting.",
      successTitle: "Schatting Verzonden",
      successDesc: "Een kopie van uw basisschatting is naar uw e-mail verzonden. Wij nemen contact op voor de definitieve parameters.",
      liveTotal: "Live Berekening",
      resetConfirm: "Weet u zeker dat u de huidige selecties wilt wissen en opnieuw wilt beginnen?",
      opt2Btn: "Start Definitieve Discovery",
      returnHub: "Terug naar Hub",
      stepsData: [
        {
          title: "Kerninfrastructuur",
          subtitle: "Selecteer de basisarchitectuur van uw platform.",
          options: [
            { label: "Landing Page", desc: "Conversiegerichte single-page aanwezigheid." },
            { label: "Corporate Site", desc: "Meerdere pagina's professionele bedrijfsarchitectuur." },
            { label: "Standaard E-Commerce", desc: "Digitale winkel met standaard winkelwagen." },
            { label: "Geavanceerde Integratie", desc: "Platform dat complexe externe API-syncs vereist." },
            { label: "SaaS / Web App", desc: "Maatwerk software met complexe databaselogica." }
          ]
        },
        { title: "Esthetiek & UI", subtitle: "Selecteer uw visuele richting." },
        {
          title: "Merkidentiteit",
          subtitle: "Heeft u visuele middelen op maat nodig?",
          options: [
            { label: "Merkidentiteit Design", desc: "Logo, typografie en merkrichtlijnen." },
            { label: "Bespoke UI Design", desc: "Maatwerk wireframing en high-fidelity mockups." }
          ]
        },
        {
          title: "Content & SEO",
          subtitle: "Selecteer contentvereisten.",
          options: [
            { label: "Standaard SEO Setup", desc: "Basis meta-tags en indexering." },
            { label: "Professionele Copywriting", desc: "SEO-geoptimaliseerde wervende teksten." },
            { label: "Geavanceerde Technische SEO", desc: "Schema markup en programmatische architectuur." }
          ]
        },
        {
          title: "Leadgeneratie",
          subtitle: "Selecteer tools voor gebruikersacquisitie.",
          options: [
            { label: "Geavanceerde Formulieren", desc: "Conditionele logica en webhook-routering." },
            { label: "Nieuwsbrief Sync", desc: "Integratie met Mailchimp/ConvertKit." },
            { label: "CRM Integratie", desc: "Directe synchronisatie met Hubspot of Salesforce." }
          ]
        },
        {
          title: "Prestaties & Logistiek",
          subtitle: "Selecteer hosting en doorlopende support.",
          options: [
            { label: "Standaard Optimalisatie", desc: "Standaard caching en asset delivery." },
            { label: "Ultra Prestaties", desc: "Gegarandeerde 95+ Core Web Vitals score." },
            { label: "Premium Hosting", desc: "Toegewezen bronnen en dagelijkse back-ups." },
            { label: "Prioriteit Onderhoud", desc: "Continue code-updates en beveiligingspatches." }
          ]
        },
        {
          title: "Leveringstermijn",
          subtitle: "Selecteer uw gewenste lanceringsschema.",
          options: [
            { label: "Standaard (4-6 Weken)", desc: "Reguliere engineeringprioriteit." },
            { label: "Versneld (1-2 Weken)", desc: "Prioriteitslevering. Premiumtarief van toepassing." }
          ]
        },
        { title: "Architecturale Visie", subtitle: "Geef uw laatste richtlijnen of technische notities door." }
      ],
      palettes: [
        { name: "Novatrum Dark", desc: "Onze signatuur look. Diep, premium en krachtig." },
        { name: "Nordic Clean", desc: "Licht, minimalistisch, gericht op typografie." },
        { name: "Midnight Tech", desc: "Moderne blauwtinten voor tech-startups." },
        { name: "Industrial Gold", desc: "Hoog contrast met elegante gouden accenten." }
      ]
    },

    processPage: {
      title: "Engineering",
      subtitle: "Methodologie.",
      desc: "Een transparant, stapsgewijs framework ontworpen om complexe logica om te zetten in elegante, hoogwaardige digitale realiteiten.",
      steps: [
        { num: "01", title: "Ontdekking & Blueprinting", subtitle: "De Architectuur Bepalen", desc: "We starten met een diepgaande analyse van uw technische eisen en doelen. Samen bepalen we de scope en stellen we een roadmap op." },
        { num: "02", title: "UI/UX Engineering", subtitle: "De Interface Ontwerpen", desc: "Wij tekenen de visuele architectuur uit. Geen generieke templates—elke interface wordt op maat gemaakt om perfect aan te sluiten bij uw merk." },
        { num: "03", title: "Kernontwikkeling", subtitle: "De Logica Schrijven", desc: "Ons team schrijft schone, modulaire en schaalbare code. U ontvangt continue updates en krijgt toegang tot een testomgeving." },
        { num: "04", title: "Testen & Lancering", subtitle: "Live Gaan", desc: "Na grondige kwaliteitscontrole voeren wij het implementatieprotocol uit. Wij zorgen ervoor dat uw platform veilig en geoptimaliseerd is." }
      ],
      ctaTitle: "Klaar om uw bouw te starten?",
      ctaButton: "Start Discovery"
    },

    servicesPage: {
      title: "Maatwerk Architectuur",
      subtitle: "Wij engineeren snelle, schaalbare en conversiegerichte digitale platformen met state-of-the-art open-source technologieën.",
      s1: {
        title: "Custom Frontend Engineering",
        desc: "Wij ontwikkelen op maat gemaakte interfaces met een onvoorwaardelijke focus op sub-seconde laadtijden en vloeiende interacties. Geen templates—puur prestaties.",
        tech: "REACT • NEXT.JS • TAILWIND",
        features: [
          "Sub-seconde rendering prestaties",
          "Vloeiende responsieve architectuur",
          "Geavanceerde interactieve UI en WebGL"
        ]
      },
      s2: {
        title: "Full-Stack SaaS Systemen",
        desc: "End-to-end webapplicatie-engineering. Van versleutelde authenticatie tot complexe relationele databaselogica, wij bouwen robuuste architecturen.",
        tech: "NODE.JS • SUPABASE • POSTGRES",
        features: [
          "Versleutelde authenticatie en autorisatie",
          "Real-time database synchronisatie",
          "Complexe API en webhook routering"
        ]
      },
      s3: {
        title: "E-Commerce Infrastructuur",
        desc: "High-performance digitale winkels ontworpen om conversieratio's te maximaliseren, enorme verkeerspieken te verwerken en bankwaardige veiligheid te garanderen.",
        tech: "STRIPE • CUSTOM CMS • ANALYTICS",
        features: [
          "Bankwaardige betalingsgateway integratie",
          "Conversie-geoptimaliseerde checkouts",
          "Gedetailleerde verkoop- en gebruikersanalyses"
        ]
      },
      ctaTitle: "Klaar om uw parameters te bepalen?",
      ctaButton: "Start Project Discovery"
    },

    productsPage: {
      splashInit: "Premium Modules Initialiseren...",
      heroTag: "Premium Modules",
      heroTitleLine1: "Breid Uw Architectuur",
      heroTitleLine2: "Uit.",
      heroDesc: "Geef uw operaties een boost met diep geïntegreerde SaaS-modules. Van militaire beveiliging tot alwetende AI-assistenten, bouw de exacte infrastructuur die uw bureau nodig heeft.",
      visualInterface: "Visuele Interface",
      investment: "Module Investering",
      mo: "/mnd",
      btnRequest: "Toegang Aanvragen",
      ctaTitle: "Niet zeker welke nodes u moet activeren?",
      ctaDesc: "Neem contact op met het engineeringteam om uw huidige architectuur te auditen en de exacte modules te bepalen die nodig zijn voor optimale schaalbaarheid.",
      btnConsult: "Engineering Raadplegen",
      modules: {
        nexus: {
          name: "Nexus CX Module",
          tagline: "Klantervaring Paradigma",
          desc: "Een speciaal intern portaal voor uw klanten. Centraliseer alle communicatie, het delen van documenten en het bijhouden van de projectstatus in één zeer veilige, merkgebonden omgeving. Elimineer e-mailrommel en verhoog uw professionele imago.",
          f1: "Real-time project tracking",
          f2: "Beveiligde kluistoegang",
          f3: "Geautomatiseerde facturatie sync"
        },
        sentinel: {
          name: "Sentinel Core Security",
          tagline: "Militaire Infrastructuur",
          desc: "Geavanceerde bedreigingsbescherming voor uw architectuur. Sentinel Core biedt continue kwetsbaarheidsscans, DDoS-mitigatie en geautomatiseerde database back-ups om ervoor te zorgen dat uw digitale activa 24/7 ondoordringbaar blijven.",
          f1: "Geautomatiseerde dagelijkse back-ups",
          f2: "DDoS mitigatie laag",
          f3: "Zero-day kwetsbaarheid patching"
        },
        architect: {
          name: "Architect AI Module",
          tagline: "Geautomatiseerde Blueprint Generatie",
          desc: "Genereer direct technische auditrapporten en architectuurblauwdrukken met hoge conversie voor potentiële klanten. Gebruik data-gedreven inzichten om deals sneller te sluiten met geautomatiseerde PageSpeed en Wappalyzer parsing.",
          f1: "Directe audit generatie",
          f2: "PDF blueprint rendering",
          f3: "Identificatie van legacy stack"
        },
        neural: {
          name: "Neural AI Engine",
          tagline: "Het Ultieme Orakel",
          desc: "Implementeer een high-level infrastructuur intelligentie node. Neural AI heeft real-time toegang tot uw volledige database en fungeert als een onvermoeibare uitvoerende assistent die in staat is om MRR te berekenen, schulden bij te houden en verkoopteksten te schrijven.",
          price: "Gelaagd",
          f1: "Onbeperkte wereldkennis",
          f2: "Live database context",
          f3: "Financiële & technische logica"
        }
      }
    },
  },

  fr: {
    nav: { 
      home: "Accueil", services: "Services", process: "Méthodologie", contact: "Contact", privacy: "Confidentialité", terms: "Conditions", gateway: "Portail Client",
      products: "Produits", showroom: "Showroom", documentation: "Documentation", systemStatus: "État du Système"
    },
    footer: { 
      rights: "Tous droits réservés.", builtIn: "Conçu à Dilbeek, Belgique.", lang: "Langue",
      company: "Entreprise", resources: "Ressources", connect: "Connecter"
    },

    hero: {
      badge: "Studio Digital • Dilbeek, Belgique",
      title: "Produits numériques.",
      subtitle: "Parfaitement conçus.",
      desc: "Nous concevons des applications web rapides et évolutives avec des outils open-source modernes. Code propre et processus transparents.",
      ctaStart: "Initier le Projet",
      ctaExplore: "Explorer nos Compétences"
    },

    services: {
      title: "Capacités d'Ingénierie.",
      subtitle: "Domaines d'expertise architecturale.",
      frontend: { title: "Architecture Frontend", desc: "Interfaces utilisateur sur mesure avec des temps de chargement ultra-rapides. Construit avec React et Tailwind CSS." },
      fullstack: { title: "Systèmes Full-Stack", desc: "Bases de données relationnelles robustes et backends sécurisés. Conçu pour l'évolutivité." }
    },

    process: {
      title: "Processus d'Ingénierie.",
      subtitle: "Un pipeline de déploiement transparent.",
      step1: { label: "01. Portée", title: "Stratégie", desc: "Nous définissons les paramètres exacts du projet et les exigences techniques." },
      step2: { label: "02. Build", title: "Développement", desc: "Écriture d'un code propre et modulaire dans un environnement de test sécurisé." },
      step3: { label: "03. Launch", title: "Déploiement", desc: "Tests rigoureux sur tous les appareils et déploiement fluide sur serveur." }
    },

    tech: {
      tag: "TECHNOLOGIES DE POINTE",
      items: { next: "Next.js", ts: "TypeScript", tailwind: "Tailwind CSS", supabase: "Supabase", vercel: "Vercel" }
    },

    pricing: {
      tag: "ESTIMATIONS ALGORITHMIQUES",
      title: "Calculez les paramètres.",
      desc: "Aucun frais caché. Générez un calcul de base pour votre architecture avant de commencer la découverte.",
      check1: "Estimation de base instantanée",
      check2: "Calcul sans engagement",
      check3: "Adapté à votre portée",
      button: "Démarrer le Calculateur"
    },

    contact: {
      title: "Établir le Contact.",
      subtitle: "Canal de communication sécurisé.",
      namePlaceholder: "Nom de l'Entité",
      emailPlaceholder: "E-mail Professionnel",
      messagePlaceholder: "Spécifications du projet...",
      button: "Transmettre le Message"
    },
    privacy: {
      title: "Protection des Données",
      subtitle: "Directive de Confidentialité & RGPD.",
      tag: "Conformité",
      lastUpdated: "Dernière mise à jour : Avril 2026",
      sec1Title: "01. Collecte et Traitement des Données",
      sec1Desc: "En tant que cabinet d'ingénierie européen, nous opérons sous stricte conformité RGPD. Nous ne collectons que les données cryptographiques et d'entreprise absolument nécessaires pour héberger votre infrastructure numérique.",
      sec1Notice: "Nous refusons strictement la vente, la monétisation ou le partage non autorisé des données clients à des tiers.",
      techAuthTitle: "02. Authentification Technique (Cookies)",
      techAuthDesc: "Novatrum utilise une gestion de session zero-knowledge. Nous ne déployons que les cookies techniques strictement nécessaires pour authentifier votre identité dans le Portail Client. Nous n'utilisons aucun tracker tiers.",
      sec2Title: "03. Confidentialité des Communications",
      sec2Desc: "Votre communication d'entreprise est traitée comme des données d'ingénierie confidentielles.",
      rule1: "Chiffrement de bout en bout des paramètres.",
      rule2: "Aucun marketing tiers non sollicité.",
      rule3: "Suppression automatique des identifiants expirés.",
      sec3Title: "04. Sécurité de l'Infrastructure",
      sec3Desc: "Tous les environnements de base de données sont isolés dans notre réseau privé. Les données sont chiffrées en transit et au repos (at rest) pour garantir une impénétrabilité de niveau entreprise.",
      footerTag: "QUESTIONS DE SÉCURITÉ ?",
      cta: "Contacter l'Ingénierie"
    },
    terms: {
      title: "Conditions de",
      subtitle: "Service & Partenariat",
      tag: "Directive Juridique",
      lastUpdated: "En vigueur : Avril 2026",
      sec1Title: "01. Acceptation et Portée",
      sec1Desc: "En initiant un projet, vous acceptez notre Blueprint Juridique. Nous ne travaillons pas à taux horaire ; toute fonctionnalité supplémentaire sera évaluée à un prix fixe.",
      sec1Notice: "Le paiement d'un acompte confirme votre acceptation explicite de ces paramètres.",
      sec2Title: "02. Conduite Professionnelle",
      sec2Desc: "Pour maintenir la concentration technique, toutes les interactions doivent respecter le protocole de communication suivant :",
      rule1Title: "Portail Client",
      rule1Desc: "Toutes les demandes officielles et le support doivent passer par le Portail Client Novatrum.",
      rule2Title: "E-mail d'Entreprise",
      rule2Desc: "La communication officielle secondaire est gérée par e-mail d'entreprise.",
      rule3Title: "Pas de Canaux Informels",
      rule3Desc: "La messagerie informelle (ex: WhatsApp) n'est pas reconnue pour les directives de projet.",
      sec3Title: "03. Facturation et Acomptes",
      sec3Desc: "Les frais d'installation initiaux réservent la capacité d'ingénierie et sont donc strictement non remboursables. Les retards de paiement de plus de 14 jours entraînent une pause de l'infrastructure.",
      sec4Title: "04. Propriété de l'Architecture",
      sec4Desc: "Les clients détiennent les droits d'utilisation commerciale, mais le code source reste la propriété de Novatrum. Nous opérons comme un fournisseur SaaS ; le code brut n'est jamais exporté.",
      footerTag: "Novatrum // Systèmes d'Ingénierie Autonomes",
      cta: "Retour au Portail"
    },

    legal: {
      pageTitle: "Blueprint Juridique",
      subtitle: "Conditions Générales",
      desc: "Les paramètres fondamentaux régissant nos partenariats d'ingénierie.",
      footerInfo: "Infrastructure Core Novatrum // Division Sécurité & Conformité",
      footerLink: "Conditions Générales de Service",
      sections: [
        { num: '01', title: 'Portée du Travail (Scope Creep)', desc: 'Les services de Novatrum sont limités aux spécifications du "Definitive Blueprint". Nous ne travaillons pas à taux horaire ; toute fonctionnalité supplémentaire demandée sera évaluée et facturée à un prix fixe.' },
        { num: '02', title: 'Conditions de Paiement', desc: 'Le développement sera suspendu si les paiements sont retardés de plus de 14 jours. Les paiements initiaux (acomptes) réservent le temps d\'ingénierie. Par conséquent, ils sont strictement non remboursables si le projet est annulé par le client.' },
        { num: '03', title: 'Propriété Intellectuelle & Accès', desc: 'Après paiement intégral, le client obtient les droits commerciaux sur le design. Le code source sous-jacent reste la propriété exclusive de Novatrum. Novatrum se réserve le droit de présenter le projet dans son portfolio, sauf si un accord de confidentialité (NDA) est signé.' },
        { num: '04', title: 'Hébergement & Ingénierie Continue', desc: 'Pour garantir une sécurité maximale, toutes les plateformes sont hébergées exclusivement sur l\'infrastructure de Novatrum. Des frais mensuels obligatoires s\'appliquent. Nous opérons comme un fournisseur SaaS ; le code brut n\'est jamais exporté.' },
        { num: '05', title: 'Responsabilités & Communication', desc: 'Le client est responsable de l\'achat de son nom de domaine. Toute communication officielle, support technique et demande de révision doivent être effectués exclusivement via le Portail Client Novatrum ou par e-mail. Les canaux informels (ex: WhatsApp) ne sont pas reconnus.' },
        { num: '06', title: 'Limitation de Responsabilité', desc: 'Novatrum conçoit des systèmes haute performance, mais ne peut garantir une immunité absolue. La responsabilité maximale de Novatrum est limitée au montant total payé par le client pour ce projet spécifique.' }
      ]
    },

    showroom: {
      badge: "Sélecteur d'Environnement",
      title: "Hub de Simulation.",
      subtitle: "Explorez des prototypes spécifiques à l'industrie conçus avec l'infrastructure Novatrum. Chaque module est conçu pour redéfinir les normes de l'industrie.",
      networkActive: "Showroom Actif",
      networkMaintenance: "Maintenance du Réseau",
      networkDegraded: "Réseau Dégradé",
      moduleReady: "Prêt",
      btnDeploy: "Initialiser le Protocole",
      btnRestricted: "Accès Restreint",
      footerEnv: "Environnement de Simulation.",
      btnHub: "Retour au Hub",
      btnStart: "Démarrer le Protocole",
      demos: {
        creative: { title: "Aura Creative", category: "Architecture & Studio", desc: "Architecture de portfolio de luxe, minimaliste et axée sur le visuel. Avec défilement fluide et grande typographie." },
        fintech: { title: "Aegis Finance", category: "Néo-Banque & Patrimoine", desc: "Interface financière à contraste élevé, de style suisse, conçue pour la gestion de patrimoine d'entreprise." },
        logistics: { title: "Node Logistics", category: "Suivi Mondial & B2B", desc: "Tableau de bord opérationnel axé sur la vitesse, les tables de données denses et le suivi cartographique en direct." },
        quantum: { title: "Quantum Engine", category: "Informatique Spatiale & WebGL", desc: "Vitrine d'API neuronale interactive 3D, fortement en mode sombre, pour les développeurs et startups Web3." }
      }
    },

    statusPage: {
      titleStatus: "Statut",
      subtitle: "Disponibilité de l'Infrastructure de Base en Temps Réel",
      coreSystems: "Infrastructure de Base",
      autoUpdate: "Mis à jour automatiquement toutes les 10 minutes",
      lastCheck: "Dernière vérification :",
      global: {
        operational: "Tous les Systèmes sont Opérationnels",
        outage: "Panne Système Majeure",
        degraded: "Dégradation Partielle du Système"
      },
      badge: {
        operational: "Opérationnel",
        degraded: "Dégradé",
        outage: "Panne"
      }
    },

    gateway: {
      title: "Initiation de Projet",
      subtitle: "Sélectionnez votre voie préférée pour commencer le processus d'ingénierie.",
      opt1Title: "Estimation Rapide",
      opt1Time: "3 - 5 Minutes",
      opt1Desc: "Obtenez une indication basée sur des paramètres standards. Idéal pour la planification budgétaire.",
      opt1Feat1: "Rapide & Simple",
      opt1Feat2: "Sans engagement",
      opt1Feat3: "Prix approximatif uniquement",
      opt1Btn: "Calculer l'Estimation",
      opt2Title: "Blueprint Définitif",
      opt2Desc: "Une analyse approfondie de vos besoins techniques. Nous définirons vos paramètres et fournirons une proposition contractuelle.",
      opt2Time: "10 - 12 Minutes",
      opt2NoticeTitle: "Exigence Technique",
      opt2NoticeDesc: "Ce formulaire est très détaillé. Ne continuez que si vous êtes prêt à définir la portée de votre projet.",
      opt2Btn: "Démarrer la Découverte",
      returnHub: "Retour au Hub"
    },

    discoveryPage: {
      title: "Découverte",
      subtitle: "Définitive.",
      desc: "Fournissez les paramètres détaillés de votre projet. Nous concevrons un plan technique précis et une proposition prête pour le contrat.",
      liveEstimate: "Estimation en Direct",
      phase: "Phase",
      of: "de",
      fileUploading: "Encrypting Upload...",
      fileClick: "Cliquez ou glissez les fichiers ici",
      termsAgree: "Je reconnais avoir lu et accepté les ",
      termsLink: "Conditions Générales de Service de Novatrum",
      termsDesc: ". Je comprends que ce plan définitif constitue la portée technique et les conditions de facturation de notre collaboration.",
      
      // --- PREMIUM ARCHITECTURE OPTIONS ---
      architectures: {
        landing: { label: "Architecture Landing", desc: "Un actif numérique d'une seule page à haute performance. Comprend un design sur mesure, des temps de chargement ultra-rapides et un routage optimisé." },
        corporate: { label: "Plateforme Corporate", desc: "Une présence d'autorité multi-pages. Comprend une architecture CMS évolutive, des structures SEO impeccables et un routage dynamique." },
        ecommerce: { label: "Vitrine Numérique", desc: "Un moteur de conversion sur mesure. Logique d'inventaire personnalisée, flux de paiement sans friction et architectures sécurisées." },
        saas: { label: "Logiciel Sur Mesure (SaaS)", desc: "Infrastructure numérique propriétaire. Conception de base de données avancée, authentification complexe et logique métier conçue de zéro." }
      },

      // --- PREMIUM SETUP FEE ---
      setupFee: {
        title: "Frais d'Initialisation",
        desc: "Chaque architecture Novatrum commence par une configuration opérationnelle standard. Ces frais obligatoires garantissent des performances et une sécurité de niveau entreprise dès le premier jour.",
        includesTitle: "Le Standard Novatrum Comprend :",
        items: {
          i1: "Déploiement Vercel Edge Network",
          i2: "Chiffrement SSL & En-têtes de Sécurité",
          i3: "Configuration CDN Globale",
          i4: "Ajustement des Performances Lighthouse 100/100"
        }
      },

      // --- PREMIUM MAINTENANCE OPTIONS ---
      maintenance: {
        none: { title: "Aucun Support Continu", desc: "Le client assume l'entière responsabilité de la sécurité du serveur, des modifications d'API et de la maintenance." },
        essential: { title: "Gestion de l'Infrastructure", desc: "Correctifs de sécurité proactifs, surveillance de la disponibilité, sauvegardes quotidiennes et mises à jour du système." },
        growth: { title: "Ingénierie de Croissance", desc: "Pack infrastructure + 5 heures de développement continu mensuel et d'itérations UI/UX." },
        scale: { title: "Tech Lead Dédié", desc: "Pack croissance + 15 heures de développement. Canal Slack prioritaire et support technique dédié." }
      },

      integrations: {
        stripe: "Infrastructure de Paiement",
        auth: "Authentification & Rôles",
        crm: "Synchronisation CRM",
        mail: "E-mail Transactionnel",
        analytics: "Télémétrie & Analytics",
        ai: "Pipelines IA & LLM",
        sockets: "WebSockets en Temps Réel",
        cms: "Contrôle Admin Sur Mesure",
        multilang: "Multilingue (i18n)"
      },
      designStyles: {
        minimal: "Minimalisme Scandinave",
        bold: "Audacieux & Éditorial",
        corporate: "Corporate Moderne",
        interactive: "UI Immersive Primée"
      },
      fontPrefs: {
        sans: "Modern Sans-Serif",
        serif: "Classic Serif",
        mono: "Industrial Monospace"
      },
      seoLevels: {
        standard: "Structure SEO Standart",
        advanced: "SEO Avancé / Technique"
      },
      timelines: {
        standard: "Pipeline Standard",
        relaxed: "Livraison Détendue",
        expedited: "Priorité Accélérée"
      },
      constraint: {
        title: "Contrainte Architecturale",
        desc: "Une plateforme complexe ne peut pas être accélérée. Veuillez privilégier les calendriers standard pour une ingénierie appropriée."
      },
      form: {
        credentials: "Credentials",
        entity: "Entité Corporative / Nom de Marque *",
        website: "Domaine Existant (Optionnel)",
        goals: "Objectif Principal *",
        goalsPlace: "Quel problème commercial spécifique résolvons-nous ?",
        competitors: "Concurrents Directs / Benchmarks",
        architecture: "Architecture.",
        archDesc: "Sélectionnez la structure technique fondamentale pour votre déploiement.",
        pages: "Exigence d'Échelle (Nombre de Pages)",
        design: "Esthétique.",
        designDesc: "Définissez l'ingénierie visuelle et les paramètres de marque.",
        color: "Couleur Principale",
        accent: "Couleur d'Accent",
        hasAccent: "Ajouter une couleur d'accent ?",
        fonts: "Base Typographique",
        content: "Actifs.",
        copy: "Copywriting SEO Novatrum",
        assets: "Centre de Téléchargement d'Actifs",
        integrations: "Matrice.",
        intDesc: "Sélectionnez les capacités backend et les intégrations API.",
        seo: "Visibilité",
        seoDesc: "Sélectionnez la stratégie d'ingénierie de contenu.",
        timeline: "Logistique.",
        timelineDesc: "Définissez le calendrier de livraison et le contrat d'ingénierie continu.",
        maintenance: "Ingénierie Continue",
        maintenanceDesc: "Inclure la gestion de l'infrastructure post-lancement.",
        maintenanceCheck: "Inclure la maintenance prioritaire",
        client: "Autorisation.",
        clientSub: "Finalisez les informations de facturation pour générer le plan officiel.",
        name: "Signataire Autorisé *",
        email: "E-mail Professionnel *",
        phone: "Numéro de Téléphone",
        address: "Adresse de Facturation *",
        vat: "Numéro de TVA",
        notes: "Notes de Conception",
        notesPlace: "Partagez des directives visuelles spécifiques ou notes...",
        transparencyTitle: "Conformité Opérationnelle",
        transparencyDesc: "Notre modèle de tarification sépare la valeur d'ingénierie des coûts opérationnels obligatoires. Cela garantit une transparence totale.",
        exclVat: "Hors TVA",
        twoMonthsFreeBadge: "2 Mois Gratuits",
        pdfDisclaimer: "* L'estimation représente la valeur d'ingénierie. Les frais opérationnels et la TVA sont calculés lors de l'intégration.",
      },
      summary: {
        title: "Résumé d'Intelligence",
        desc: "Un blueprint algorithmique de base de vos paramètres définis.",
        notBinding: "NON BINDING",
        platform: "Architecture de la Plateforme",
        logistics: "Calendrier de Déploiement",
        copywriting: "Copywriting",
        maintenance: "Maintenance",
        design: "Direction de Conception",
        integrations: "Intégrations",
        total: "Calcul en Direct (€)",
        twoMonthsFreeNote: "Les 2 Premiers Mois Gratuits",
      },
      btn: {
        prev: "Phase Précédente",
        next: "Phase Suivante",
        submit: "Soumettre pour Examen",
        encrypting: "Chiffrement du Protocole...",
        finish: "Démarrer Découverte",
        pdf: "Télécharger le Blueprint PDF",
        hub: "Retour au Portail Central"
      },
      success: {
        title: "Protocole Enregistré.",
        sub: "Découverte Définitive",
        desc: "Spécifications de l'architecture sécurisées. En attente d'examen technique.",
        dsNumber: "Référence de Déploiement"
      }
    },

    contactPage: {
      title: "Établir le Contact",
      subtitle: "Ingénierie Numérique.",
      desc: "Discutez de vos exigences techniques ou demandez une consultation avec notre équipe d'ingénierie.",
      studioName: "Novatrum Infrastructure.",
      studioLoc: "Dilbeek, Belgique",
      studioOper: "Disponible pour des opérations mondiales",
      roadmapTitle: "FEUILLE DE ROUTE D'INGÉNIERIE",
      steps: [
        { s: "01", t: "Découverte & Stratégie", d: "Nous discutons de vos objectifs, de vos exigences techniques et définissons la portée." },
        { s: "02", t: "Architecture & UI", d: "Nous cartographions l'architecture du système et concevons l'expérience utilisateur." },
        { s: "03", t: "Développement Central", d: "Nous construisons la plateforme et la déployons dans un environnement sécurisé." }
      ],
      badge: "Capacité d'Ingénierie: Ouverte",
      form: {
        nameLabel: "Nom Complet *",
        namePlaceholder: "ex. Jean Dupont",
        emailLabel: "E-mail Professionnel *",
        emailPlaceholder: "jean@entreprise.fr",
        categoryLabel: "Type de Demande",
        categoryValue: "Ingénierie de Produits Numériques",
        briefLabel: "Détails du Projet *",
        briefPlaceholder: "Décrivez vos besoins architecturaux...",
        submit: "Transmettre le Message",
        sending: "Envoi en cours..."
      },
      success: {
        title: "Transmission Réussie.",
        desc: "Votre message a été enregistré en toute sécurité. Notre équipe examinera vos exigences et vous répondra sous peu.",
        button: "Transmettre un Autre Message"
      },
      faqTitle: "Questions",
      faqSubtitle: "Fréquentes.",
      faqDesc: "Voici quelques questions fréquentes concernant notre processus d'ingénierie et nos capacités techniques.",
      faqs: [
        { q: "Quel est le calendrier typique d'un projet ?", a: "Selon la complexité structurelle, les déploiements standards prennent de 4 à 8 semaines. Des options accélérées sont disponibles." },
        { q: "Proposez-vous une maintenance après le lancement ?", a: "Oui, nous fournissons des contrats de maintenance prioritaires incluant des correctifs de sécurité et une optimisation continue." },
        { q: "Quelle est votre pile technologique de base ?", a: "Nous concevons des systèmes utilisant Next.js, React, Tailwind CSS, Node.js et PostgreSQL via Supabase." }
      ]
    },

    calculator: {
      title: "Estimation Architecturale",
      subtitle: "Définissez les paramètres de base",
      stepInfo: "Phase",
      of: "sur",
      tag: "ESTIMATION",
      included: "Inclus",
      monthly: "mois",
      month: "mois",
      customPalette: "Couleurs Personnalisées",
      builderTitle: "Identité de Marque",
      builderDesc: "Sélectionnez vos codes hexadécimaux.",
      shuffleColors: "Mélanger",
      applyPalette: "Appliquer les Couleurs",
      paletteSelected: "Palette Appliquée",
      textPlaceholder: "Décrivez ici toute fonctionnalité spécifique, intégration ou référence...",
      estimateGen: "Blueprint Calculé",
      totalInv: "Investissement Estimé",
      recurringLabel: "Frais Récurrents",
      btnPrev: "Phase Précédente",
      btnReset: "Redémarrer",
      btnNext: "Phase Suivante",
      btnFinish: "Générer l'Estimation",
      formNameLabel: "Nom de l'Entité",
      formNamePlace: "Entreprise ou Votre Nom",
      formCompanyLabel: "Site Web Actuel (Optionnel)",
      formCompanyPlace: "https://...",
      formEmailLabel: "E-mail Sécurisé",
      formEmailPlace: "Où devons-nous envoyer les données ?",
      btnSending: "Compilation des Données...",
      btnSend: "Révéler l'Estimation",
      notice: "Ceci est une estimation algorithmique non contraignante.",
      successTitle: "Estimation Envoyée",
      successDesc: "Une copie de votre estimation a été envoyée à votre adresse e-mail. Nous vous contacterons pour discuter des paramètres.",
      liveTotal: "Calcul en Direct",
      resetConfirm: "Êtes-vous sûr de vouloir effacer les sélections actuelles et recommencer ?",
      opt2Btn: "Démarrer la Découverte Définitive",
      returnHub: "Retour au Hub",
      stepsData: [
        {
          title: "Infrastructure de Base",
          subtitle: "Sélectionnez l'architecture de votre plateforme.",
          options: [
            { label: "Landing Page", desc: "Page unique à fort taux de conversion." },
            { label: "Site d'Entreprise", desc: "Architecture professionnelle multi-pages." },
            { label: "E-Commerce Standard", desc: "Boutique numérique avec panier." },
            { label: "Intégration Avancée", desc: "Plateforme nécessitant des API complexes." },
            { label: "SaaS / Web App", desc: "Logiciel sur mesure avec logique de base de données." }
          ]
        },
        { title: "Esthétique & UI", subtitle: "Sélectionnez votre direction visuelle." },
        {
          title: "Identité de Marque",
          subtitle: "Avez-vous besoin d'une création visuelle sur mesure ?",
          options: [
            { label: "Design d'Identité", desc: "Logo, typographie et directives de marque." },
            { label: "Design UI Sur Mesure", desc: "Maquettes personnalisées haute fidélité." }
          ]
        },
        {
          title: "Contenu & SEO",
          subtitle: "Sélectionnez les exigences en matière de contenu.",
          options: [
            { label: "Configuration SEO Standard", desc: "Balises meta de base et indexation." },
            { label: "Copywriting Professionnel", desc: "Textes de vente optimisés pour le SEO." },
            { label: "SEO Technique Avancé", desc: "Balisage Schema et architecture programmatique." }
          ]
        },
        {
          title: "Génération de Leads",
          subtitle: "Sélectionnez les outils d'acquisition.",
          options: [
            { label: "Formulaires Avancés", desc: "Logique conditionnelle et webhooks." },
            { label: "Synchronisation Newsletter", desc: "Intégration avec Mailchimp/ConvertKit." },
            { label: "Intégration CRM", desc: "Synchronisation directe avec Hubspot ou Salesforce." }
          ]
        },
        {
          title: "Performance & Logistique",
          subtitle: "Sélectionnez l'hébergement et le support continu.",
          options: [
            { label: "Optimisation Standard", desc: "Mise en cache standard et livraison des ressources." },
            { label: "Ultra Performance", desc: "Score Core Web Vitals garanti > 95." },
            { label: "Hébergement Premium", desc: "Ressources dédiées et sauvegardes quotidiennes." },
            { label: "Maintenance Prioritaire", desc: "Mises à jour du code et correctifs de sécurité." }
          ]
        },
        {
          title: "Délai de Déploiement",
          subtitle: "Sélectionnez votre calendrier de lancement.",
          options: [
            { label: "Standard (4-6 Semaines)", desc: "Priorité d'ingénierie régulière." },
            { label: "Accéléré (1-2 Semaines)", desc: "Livraison prioritaire. Prime appliquée." }
          ]
        },
        { title: "Vision Architecturale", subtitle: "Fournissez vos directives finales ou notes techniques." }
      ],
      palettes: [
        { name: "Novatrum Dark", desc: "Notre look signature. Profond, premium et audacieux." },
        { name: "Nordic Clean", desc: "Lumineux, minimaliste, axé sur la typographie." },
        { name: "Midnight Tech", desc: "Tons bleus modernes pour les startups." },
        { name: "Industrial Gold", desc: "Contraste élevé avec d'élégants accents dorés." }
      ]
    },

    processPage: {
      title: "Ingénierie",
      subtitle: "Méthodologie.",
      desc: "Un cadre transparent, étape par étape, conçu pour transformer une logique complexe en réalités numériques élégantes.",
      steps: [
        { num: "01", title: "Découverte & Blueprinting", subtitle: "Définir l'Architecture", desc: "Nous commençons par une plongée approfondie dans vos exigences techniques. Ensemble, nous établissons une feuille de route d'ingénierie." },
        { num: "02", title: "Ingénierie UI/UX", subtitle: "Concevoir l'Interface", desc: "Nous dessinons l'architecture visuelle. Rejetant les modèles génériques, chaque interface est conçue sur mesure." },
        { num: "03", title: "Développement Central", subtitle: "Écrire la Logique", desc: "Notre équipe écrit un code propre et évolutif. Vous recevez des mises à jour continues et accédez à un environnement sécurisé." },
        { num: "04", title: "Test & Déploiement", subtitle: "Mise en Ligne", desc: "Après une assurance qualité rigoureuse, nous exécutons le déploiement. Votre plateforme est optimisée pour le trafic d'entreprise." }
      ],
      ctaTitle: "Prêt à initier votre construction ?",
      ctaButton: "Commencer la Découverte"
    },

    servicesPage: {
      title: "Architectures Sur Mesure",
      subtitle: "Nous concevons des plateformes numériques rapides et évolutives avec des technologies open-source de pointe.",
      s1: {
        title: "Ingénierie Frontend Personnalisée",
        desc: "Nous développons des interfaces avec une attention sans compromis sur les temps de chargement. Pas de modèles, juste des performances pures.",
        tech: "REACT • NEXT.JS • TAILWIND",
        features: [
          "Performances de rendu inférieures à une seconde",
          "Architecture fluide sur tous les appareils",
          "UI interactive avancée et éléments WebGL"
        ]
      },
      s2: {
        title: "Systèmes SaaS Full-Stack",
        desc: "Ingénierie d'applications web de bout en bout. De l'authentification chiffrée à la logique de base de données complexe.",
        tech: "NODE.JS • SUPABASE • POSTGRES",
        features: [
          "Authentification et autorisation chiffrées",
          "Synchronisation de base de données en temps réel",
          "Routage complexe d'API et de webhooks"
        ]
      },
      s3: {
        title: "Infrastructure E-Commerce",
        desc: "Vitrines numériques haute performance conçues pour maximiser les conversions et assurer une sécurité bancaire.",
        tech: "STRIPE • CUSTOM CMS • ANALYTICS",
        features: [
          "Intégration de passerelle de paiement sécurisée",
          "Pipelines de paiement optimisés pour la conversion",
          "Analyses granulaires des ventes et des utilisateurs"
        ]
      },
      ctaTitle: "Prêt à définir vos paramètres ?",
      ctaButton: "Démarrer la Découverte du Projet"
    },

    productsPage: {
      splashInit: "Initialisation des Modules Premium...",
      heroTag: "Modules Premium",
      heroTitleLine1: "Développez Votre",
      heroTitleLine2: "Architecture.",
      heroDesc: "Dynamisez vos opérations avec des modules SaaS profondément intégrés. De la sécurité de niveau militaire aux assistants IA omniscients, construisez l'infrastructure exacte dont votre agence a besoin.",
      visualInterface: "Interface Visuelle",
      investment: "Investissement du Module",
      mo: "/mois",
      btnRequest: "Demander l'Accès",
      ctaTitle: "Vous ne savez pas quels nœuds activer ?",
      ctaDesc: "Connectez-vous avec l'équipe d'ingénierie pour auditer votre architecture actuelle et déterminer les modules exacts requis pour une mise à l'échelle optimale.",
      btnConsult: "Consulter l'Ingénierie",
      modules: {
        nexus: {
          name: "Module Nexus CX",
          tagline: "Paradigme de l'Expérience Client",
          desc: "Un portail interne dédié pour vos clients. Centralisez toutes les communications, le partage de documents et le suivi de l'état des projets dans un environnement de marque hautement sécurisé. Éliminez l'encombrement des e-mails et rehaussez votre image professionnelle.",
          f1: "Suivi de projet en temps réel",
          f2: "Accès sécurisé au coffre-fort",
          f3: "Synchronisation automatisée de la facturation"
        },
        sentinel: {
          name: "Sécurité Sentinel Core",
          tagline: "Infrastructure de Niveau Militaire",
          desc: "Protection avancée contre les menaces pour votre architecture. Sentinel Core fournit une analyse continue des vulnérabilités, une atténuation des attaques DDoS et des sauvegardes automatisées de la base de données pour garantir que vos actifs numériques restent impénétrables 24h/24 et 7j/7.",
          f1: "Sauvegardes quotidiennes automatisées",
          f2: "Couche d'atténuation DDoS",
          f3: "Correction des vulnérabilités Zero-day"
        },
        architect: {
          name: "Module Architect AI",
          tagline: "Génération Automatisée de Blueprint",
          desc: "Générez instantanément des rapports d'audit technique à fort taux de conversion et des plans d'architecture pour les clients potentiels. Utilisez des informations basées sur les données pour conclure des transactions plus rapidement avec l'analyse automatisée de PageSpeed et Wappalyzer.",
          f1: "Génération d'audit instantanée",
          f2: "Rendu de blueprint PDF",
          f3: "Identification de la pile existante"
        },
        neural: {
          name: "Moteur Neural AI",
          tagline: "L'Oracle Ultime",
          desc: "Déployez un nœud d'intelligence d'infrastructure de haut niveau. Neural AI a un accès en temps réel à l'ensemble de votre base de données, agissant comme un assistant exécutif infatigable capable de calculer le MRR, de suivre les dettes et d'écrire des textes de vente.",
          price: "À plusieurs niveaux",
          f1: "Connaissance illimitée du monde",
          f2: "Contexte de base de données en direct",
          f3: "Logique financière & technique"
        }
      }
    },
  },

  tr: {
    nav: { 
      home: "Ana Sayfa", services: "Hizmetler", process: "Metodoloji", contact: "İletişim", privacy: "Gizlilik", terms: "Şartlar", gateway: "Müşteri Portalı",
      products: "Ürünler", showroom: "Showroom", documentation: "Dokümantasyon", systemStatus: "Sistem Durumu"
    },
    footer: { 
      rights: "Tüm hakları saklıdır.", builtIn: "Dilbeek, Belçika'da geliştirildi.", lang: "Dil",
      company: "Şirket", resources: "Kaynaklar", connect: "Bağlantı"
    },

    hero: {
      badge: "Dijital Stüdyo • Dilbeek, Belçika",
      title: "Dijital ürünler.",
      subtitle: "Doğru inşa edilmiş.",
      desc: "Modern açık kaynaklı araçlar kullanarak hızlı, ölçeklenebilir web uygulamaları geliştiriyoruz. Temiz kod, işlevsel tasarım ve şeffaf iş akışları.",
      ctaStart: "Projeyi Başlat",
      ctaExplore: "Yetenekleri Keşfet"
    },

    services: {
      title: "Mühendislik Yetenekleri.",
      subtitle: "Mimari odak alanları.",
      frontend: { title: "Frontend Mimarisi", desc: "Saniyenin altında yükleme hızına sahip özel kullanıcı arayüzleri. React ve Tailwind CSS ile inşa edilmiştir." },
      fullstack: { title: "Full-Stack Sistemler", desc: "Sağlam ilişkisel veritabanları ve güvenli arka uçlar. Kurumsal ölçeklenebilirlik için tasarlandı." }
    },

    process: {
      title: "Mühendislik İş Akışı.",
      subtitle: "Şeffaf bir dağıtım süreci.",
      step1: { label: "01. Kapsam", title: "Strateji", desc: "Kesin proje parametrelerini ve teknik gereksinimleri tanımlıyoruz." },
      step2: { label: "02. İnşa", title: "Geliştirme", desc: "Güvenli bir test ortamında temiz, modüler kod yazımı." },
      step3: { label: "03. Lansman", title: "Dağıtım", desc: "Cihazlar arası titiz testler ve sorunsuz sunucu dağıtımı." }
    },

    tech: {
      tag: "TEMEL TEKNOLOJİLER",
      items: { next: "Next.js", ts: "TypeScript", tailwind: "Tailwind CSS", supabase: "Supabase", vercel: "Vercel" }
    },

    pricing: {
      tag: "ALGORİTMİK TAHMİNLER",
      title: "Parametreleri hesaplayın.",
      desc: "Gizli ücret yok. Keşfe başlamadan önce mimariniz için temel bir hesaplama oluşturun.",
      check1: "Anında temel fiyat",
      check2: "Bağlayıcı olmayan hesaplama",
      check3: "Kapsamınıza göre uyarlandı",
      button: "Hesaplayıcıyı Başlat"
    },

    contact: {
      title: "İletişim Kur.",
      subtitle: "Güvenli iletişim kanalı.",
      namePlaceholder: "Kurum Adı",
      emailPlaceholder: "Kurumsal E-posta",
      messagePlaceholder: "Proje özellikleri...",
      button: "Mesajı İlet"
    },

    privacy: {
      title: "Veri Koruması",
      subtitle: "Gizlilik Yönergesi ve GDPR.",
      tag: "Uyumluluk",
      lastUpdated: "Son Güncelleme: Nisan 2026",
      sec1Title: "01. Veri Toplama ve İşleme",
      sec1Desc: "Avrupa merkezli bir mühendislik firması olarak katı GDPR uyumluluğu altında faaliyet gösteriyoruz. Sadece dijital altyapınızı barındırmak için kesinlikle gerekli olan kriptografik ve kurumsal verileri topluyoruz.",
      sec1Notice: "Müşteri verilerinin satılmasını, paraya dönüştürülmesini veya üçüncü şahıslarla izinsiz paylaşılmasını kesinlikle reddediyoruz.",
      techAuthTitle: "02. Teknik Kimlik Doğrulama (Çerezler)",
      techAuthDesc: "Novatrum, sıfır bilgi (zero-knowledge) oturum yönetimi kullanır. Müşteri Portalı içindeki kimliğinizi doğrulamak için yalnızca kesinlikle gerekli teknik çerezleri dağıtıyoruz. Üçüncü taraf pazarlama izleyicileri (tracker) kullanmıyoruz.",
      sec2Title: "03. İletişim Gizliliği",
      sec2Desc: "Kurumsal iletişiminiz, gizli mühendislik verisi olarak kabul edilir.",
      rule1: "Proje parametrelerinde uçtan uca şifreleme.",
      rule2: "İstenmeyen üçüncü taraf pazarlama mesajları yok.",
      rule3: "Süresi dolan kimlik bilgilerinin otomatik silinmesi.",
      sec3Title: "04. Altyapı Güvenliği",
      sec3Desc: "Tüm veritabanı ortamları ve mimari planlar özel uç ağımızda (edge network) izole edilmiştir. Kurumsal düzeyde aşılmazlık sağlamak için veriler hem aktarım sırasında hem de sunucuda (at rest) şifrelenir.",
      footerTag: "GÜVENLİK SORULARINIZ MI VAR?",
      cta: "Mühendisliğe Ulaşın"
    },
    terms: {
      title: "Hizmet",
      subtitle: "Şartları ve Ortaklık",
      tag: "Yasal Yönerge",
      lastUpdated: "Geçerlilik: Nisan 2026",
      sec1Title: "01. Kabul ve Kapsam",
      sec1Desc: "Bir projeyi başlatarak Hukuki Bildirgemizi kabul etmiş olursunuz. Saatlik ücretle çalışmıyoruz; onaydan sonra talep edilen ek özellikler sabit fiyatlı bir eklenti olarak değerlendirilir.",
      sec1Notice: "Ön ödeme yapmak veya panele giriş yapmak, bu parametreleri açıkça kabul ettiğinizi onaylar.",
      sec2Title: "02. Profesyonel İletişim",
      sec2Desc: "Mühendislik odağını korumak için, tüm etkileşimler aşağıdaki iletişim protokolüne sıkı sıkıya bağlı kalmalıdır:",
      rule1Title: "Müşteri Portalı",
      rule1Desc: "Tüm resmi talepler, revizyonlar ve teknik destek Novatrum Müşteri Portalı üzerinden iletilmelidir.",
      rule2Title: "Kurumsal E-posta",
      rule2Desc: "İkincil resmi iletişim ve belgelendirme kurumsal e-posta kanallarıyla yönetilir.",
      rule3Title: "Resmi Olmayan Kanallar Yok",
      rule3Desc: "Kayıt dışı mesajlaşmalar (örn. WhatsApp, Instagram) iş direktifi olarak kesinlikle kabul edilmez.",
      sec3Title: "03. Faturalandırma ve Ödemeler",
      sec3Desc: "İlk kurulum ücretleri (avanslar) mühendislik kapasitesini rezerve eder. Bu nedenle ön ödemeler kesinlikle iade edilmez. 14 günü aşan ödeme gecikmeleri altyapının anında durdurulmasına neden olur.",
      sec4Title: "04. Mimari Sahipliği",
      sec4Desc: "Müşteriler görsel tasarımın ticari kullanım haklarına sahip olsa da, çekirdek yazılım ve kaynak kodu Novatrum'un münhasır mülkiyetindedir. Bir SaaS olarak çalışıyoruz; ham kodlar asla dışa aktarılmaz.",
      footerTag: "Novatrum // Otonom Mühendislik Sistemleri",
      cta: "Panele Geri Dön"
    },

    legal: {
      pageTitle: "Hukuki Bildirge",
      subtitle: "Genel Şartlar ve Koşullar",
      desc: "Mühendislik ortaklıklarımızı yöneten temel parametreler.",
      footerInfo: "Novatrum Çekirdek Altyapısı // Güvenlik ve Uyumluluk Birimi",
      footerLink: "Genel Hizmet Şartları",
      sections: [
        { num: '01', title: 'Çalışma Kapsamı (Kapsam Kayması)', desc: 'Novatrum tarafından sağlanan hizmetler, üzerinde anlaşılan "Kesin Blueprint" içinde belirtilen özelliklerle sınırlıdır. Saatlik ücretle çalışmıyoruz; talep edilen ek özellikler, sabit fiyatlı yapısal bir eklenti olarak değerlendirilir ve faturalandırılır.' },
        { num: '02', title: 'Ödeme Koşulları ve İadeler', desc: 'Ödemeler 14 gün gecikirse geliştirme duraklatılır. Projeyi başlatmak için alınan ilk ödemeler (avans/kurulum), mühendislik zamanının ve altyapının rezerve edilmesini kapsar. Bu nedenle, projenin müşteri tarafından iptal edilmesi durumunda kesinlikle iade edilmez.' },
        { num: '03', title: 'Fikri Mülkiyet ve Erişim', desc: 'Son ödeme ile müşteri görsel tasarımın ticari kullanım hakkını alır. Ancak temel kod tabanı münhasıran Novatrum\'un mülkiyetinde kalır. Novatrum, özel bir gizlilik sözleşmesi (NDA) imzalanmadığı sürece tamamlanan projeyi kendi portföyünde sergileme hakkını saklı tutar.' },
        { num: '04', title: 'Barındırma ve Sürekli Mühendislik', desc: 'Kurumsal düzeyde güvenliği garanti etmek için, platformlar yalnızca Novatrum\'un altyapısında barındırılır. Zorunlu bir aylık bakım/hosting ücreti uygulanır. Bir SaaS (Hizmet olarak yazılım) gibi çalışıyoruz; ham kodlar asla dış sunuculara aktarılmaz.' },
        { num: '05', title: 'Müşteri Sorumlulukları ve İletişim', desc: 'Müşteri, Alan Adını (Domain) almaktan kendisi sorumludur. Tüm resmi iletişim, teknik destek ve revizyon talepleri yalnızca Novatrum Müşteri Portalı veya resmi e-posta üzerinden yürütülmelidir. Resmi olmayan kanallar (örn. WhatsApp, Instagram) direktif olarak kabul edilmez.' },
        { num: '06', title: 'Sorumluluk Sınırlandırması', desc: 'Novatrum yüksek performanslı sistemler tasarlar, ancak siber tehditlere karşı mutlak dokunulmazlık garanti edemeyiz. Novatrum\'un projeden kaynaklanan herhangi bir talep için maksimum sorumluluğu, o proje için ödenen toplam miktarla sınırlıdır.' }
      ]
    },

    showroom: {
      badge: "Ortam Seçici",
      title: "Simülasyon Merkezi.",
      subtitle: "Novatrum altyapısıyla geliştirilmiş sektöre özel prototipleri keşfedin. Her modül endüstri standartlarını yeniden tanımlamak için tasarlanmıştır.",
      networkActive: "Showroom Aktif",
      networkMaintenance: "Ağ Bakımı",
      networkDegraded: "Ağ Sorunları",
      moduleReady: "Hazır",
      btnDeploy: "Protokolü Başlat",
      btnRestricted: "Erişim Kısıtlandı",
      footerEnv: "Simülasyon Ortamı.",
      btnHub: "Merkeze Dön",
      btnStart: "Protokolü Başlat",
      demos: {
        creative: { title: "Aura Creative", category: "Mimarlık & Stüdyo", desc: "Lüks, minimal ve görsel odaklı portföy mimarisi. Pürüzsüz kaydırma ve büyük tipografi içerir." },
        fintech: { title: "Aegis Finance", category: "Yeni Nesil Bankacılık & Varlık", desc: "Kurumsal düzeyde varlık yönetimi için tasarlanmış yüksek kontrastlı, İsviçre tarzı finansal arayüz." },
        logistics: { title: "Node Logistics", category: "Küresel Takip & B2B", desc: "Hıza, yoğun veri tablolarına ve canlı harita takibine odaklanan operasyonel şirket panosu." },
        quantum: { title: "Quantum Engine", category: "Uzamsal Bilişim & WebGL", desc: "Geliştiriciler ve Web3 girişimleri için karanlık mod ağırlıklı, 3D etkileşimli sinirsel API vitrini." }
      }
    },
    statusPage: {
      titleStatus: "Durumu",
      subtitle: "Gerçek Zamanlı Temel Altyapı Kullanılabilirliği",
      coreSystems: "Temel Altyapı",
      autoUpdate: "Her 10 dakikada bir otomatik güncellenir",
      lastCheck: "Son kontrol:",
      global: {
        operational: "Tüm Sistemler Çalışıyor",
        outage: "Büyük Sistem Kesintisi",
        degraded: "Kısmi Sistem Yavaşlaması"
      },
      badge: {
        operational: "Aktif",
        degraded: "Yavaş",
        outage: "Kesinti"
      }
    },

    gateway: {
      title: "Proje Başlangıcı",
      subtitle: "Mühendislik sürecine başlamak için tercih ettiğiniz yolu seçin.",
      opt1Title: "Hızlı Tahmin",
      opt1Time: "3 - 5 Dakika",
      opt1Desc: "Standart parametrelere dayalı olarak bir fiyat aralığı alın. Bütçe planlamasının ilk aşamalarındaysanız idealdir.",
      opt1Feat1: "Hızlı ve Basit",
      opt1Feat2: "Taahhüt gerektirmez",
      opt1Feat3: "Yalnızca yaklaşık fiyatlandırma",
      opt1Btn: "Tahmini Hesapla",
      opt2Title: "Kesin Proje Planı",
      opt2Time: "10 - 12 Dakika",
      opt2Desc: "Teknik ihtiyaçlarınıza derinlemesine bir bakış. Parametrelerinizi belirleyecek ve sözleşmeye hazır kesin bir teklif sunacağız.",
      opt2NoticeTitle: "Mühendislik Gereksinimi",
      opt2NoticeDesc: "Bu form oldukça detaylıdır. Lütfen yalnızca projenizin teknik kapsamını belirlemeye hazırsanız devam edin.",
      opt2Btn: "Keşfe Başla",
      returnHub: "Merkeze Dön"
    },

    discoveryPage: {
      title: "Kesin Keşif",
      subtitle: "Süreci.",
      desc: "Projenizin detaylı parametrelerini girin. Sizin için hassas bir teknik plan ve sözleşmeye hazır bir teklif hazırlayalım.",
      liveEstimate: "Canlı Tahmin",
      phase: "Aşama",
      of: "/",
      fileUploading: "Şifrelenmiş Yükleme...",
      fileClick: "Dosyaları buraya tıklayın veya sürükleyin",
      termsAgree: "Okuduğumu ve kabul ettiğimi onaylıyorum: ",
      termsLink: "Novatrum Genel Hizmet Sözleşmesi",
      termsDesc: ". Bu kesin taslağın, işbirliğimizin teknik kapsamını ve faturalandırma şartlarını oluşturduğunu anlıyorum.",
      
      // --- PREMIUM ARCHITECTURE OPTIONS ---
      architectures: {
        landing: { label: "Landing Mimarisi", desc: "Yüksek performanslı, tek sayfalık dijital varlık. Özel tasarım, saniyenin altında yükleme süreleri ve dönüşüm odaklı yönlendirme içerir." },
        corporate: { label: "Kurumsal Platform", desc: "Çok sayfalı otoriter bir yapı. Ölçeklenebilir CMS mimarisi, kusursuz SEO yapıları ve dinamik yönlendirme sunar." },
        ecommerce: { label: "Dijital Vitrin", desc: "Özel bir dönüşüm motoru. Özel envanter mantığı, sürtünmesiz ödeme akışları ve güvenli ödeme mimarileri." },
        saas: { label: "Özel Yazılım (SaaS)", desc: "Tescilli dijital altyapı. Gelişmiş veritabanı tasarımı, karmaşık kullanıcı doğrulama ve sıfırdan tasarlanmış özel iş mantığı." }
      },

      // --- PREMIUM SETUP FEE ---
      setupFee: {
        title: "Başlatma Ücreti",
        desc: "Her Novatrum mimarisi standart bir operasyonel kurulumla başlar. Bu zorunlu ücret, ilk günden itibaren kurumsal düzeyde performans ve güvenlik sağlar.",
        includesTitle: "Novatrum Standardı Şunları İçerir:",
        items: {
          i1: "Vercel Edge Ağı (Network) Dağıtımı",
          i2: "SSL Şifreleme ve Güvenlik Başlıkları",
          i3: "Küresel CDN Yapılandırması",
          i4: "100/100 Lighthouse Performans Optimizasyonu"
        }
      },

      // --- PREMIUM MAINTENANCE OPTIONS ---
      maintenance: {
        none: { title: "Sürekli Destek Yok", desc: "Müşteri, lansman sonrası sunucu güvenliği, API değişiklikleri ve bakım için tüm sorumluluğu üstlenir." },
        essential: { title: "Altyapı Yönetimi", desc: "Proaktif güvenlik yamaları, çalışma süresi izleme, günlük veritabanı yedeklemeleri ve temel sistem güncellemeleri." },
        growth: { title: "Büyüme Mühendisliği", desc: "Altyapı paketi + aylık 5 saat sürekli geliştirme ve UI/UX iterasyonları." },
        scale: { title: "Özel Teknoloji Lideri (Tech Lead)", desc: "Büyüme paketi + 15 saat geliştirme. Öncelikli Slack kanalı ve özel mühendislik desteği." }
      },

      integrations: {
        stripe: "Ödeme Altyapısı",
        auth: "Kimlik Doğrulama & Roller",
        crm: "CRM Senkronizasyonu",
        mail: "İşlemsel E-posta (Transactional)",
        analytics: "Telemetri & Analitik",
        ai: "AI & LLM Veri Hatları",
        sockets: "Gerçek Zamanlı WebSockets",
        cms: "Özel Admin Kontrolü",
        multilang: "Çoklu Dil (i18n)"
      },
      designStyles: {
        minimal: "İskandinav Minimalizmi",
        bold: "Cesur & Editoryal",
        corporate: "Modern Kurumsal",
        interactive: "Ödüllü Sürükleyici UI"
      },
      fontPrefs: {
        sans: "Modern Sans-Serif",
        serif: "Klasik Serif",
        mono: "Endüstriyel Monospace"
      },
      seoLevels: {
        standard: "Standart SEO Yapısı",
        advanced: "Gelişmiş / Teknik SEO"
      },
      timelines: {
        standard: "Standart Takvim",
        relaxed: "Esnek Teslimat",
        expedited: "Hızlandırılmış Öncelik"
      },
      constraint: {
        title: "Mühendislik Kısıtlaması",
        desc: "Karmaşık bir platform hızlandırılamaz. Lütfen düzgün bir mühendislik süreci için standart veya esnek takvimlere öncelik verin."
      },
      form: {
        credentials: "Kimlik Bilgileri",
        entity: "Kurumsal Varlık / Marka Adı *",
        website: "Mevcut Alan Adı (Opsiyonel)",
        goals: "Birincil Hedef *",
        goalsPlace: "Hangi spesifik iş problemini çözüyoruz? (Örn: Randevuları otomatikleştirmek, B2B müşteri adaylarını artırmak)",
        competitors: "Doğrudan Rakipler / Karşılaştırmalar",
        architecture: "Mimari.",
        archDesc: "Dağıtımınız için temel teknik yapıyı seçin.",
        pages: "Ölçek Gereksinimi (Sayfa Sayısı)",
        design: "Estetik.",
        designDesc: "Görsel mühendisliği ve marka parametrelerini tanımlayın.",
        color: "Ana Renk",
        accent: "Vurgu Rengi",
        hasAccent: "Vurgu Rengi Eklensin mi?",
        fonts: "Tipografi Tabanı",
        content: "Varlıklar.",
        copy: "Novatrum SEO Metin Yazarlığı",
        assets: "Varlık Yükleme Merkezi",
        integrations: "Matris.",
        intDesc: "Backend yeteneklerini ve API entegrasyonlarını seçin.",
        seo: "Görünürlük",
        seoDesc: "İçerik mühendisliği ve indeksleme stratejisini seçin.",
        timeline: "Lojistik.",
        timelineDesc: "Teslimat takvimini ve devam eden mühendislik sözleşmesini belirleyin.",
        maintenance: "Sürekli Mühendislik",
        maintenanceDesc: "Lansman sonrası altyapı yönetimini dahil edin.",
        maintenanceCheck: "Öncelikli bakımı dahil et",
        client: "Yetkilendirme.",
        clientSub: "Resmi teknik planı oluşturmak için fatura bilgilerini kesinleştirin.",
        name: "Yetkili İmza Sahibi *",
        email: "Kurumsal E-posta *",
        phone: "Telefon Numarası",
        address: "Fatura Adresi *",
        vat: "Vergi / KDV Numarası",
        notes: "Tasarım Notları",
        notesPlace: "Belirli görsel yönlendirmeleri veya teknik notları paylaşın...",
        transparencyTitle: "Operasyonel Şeffaflık",
        transparencyDesc: "Fiyatlandırma modelimiz, mühendislik değerini zorunlu operasyonel maliyetlerden (lisanslar, bulut altyapısı) ayırır. Bu, tam bir şeffaflık sağlar.",
        exclVat: "KDV Hariç",
        twoMonthsFreeBadge: "İlk 2 Ay Ücretsiz",
        pdfDisclaimer: "* Tahmin mühendislik değerini temsil eder. Operasyonel giderler ve KDV kayıt aşamasında hesaplanır.",
      },
      summary: {
        title: "Zeka Özeti",
        desc: "Tanımladığınız parametrelerin temel algoritmik bir taslağı.",
        notBinding: "BAĞLAYICI DEĞİLDİR",
        platform: "Platform Mimarisi",
        logistics: "Dağıtım Takvimi",
        copywriting: "Metin Yazarlığı",
        maintenance: "Bakım",
        design: "Tasarım Yönü",
        integrations: "Entegrasyonlar",
        total: "Canlı Hesaplama (€)",
        twoMonthsFreeNote: "İlk 2 Ay Ücretsiz",
      },
      btn: {
        prev: "Önceki Aşama",
        next: "Sonraki Aşama",
        submit: "İnceleme İçin Gönder",
        encrypting: "Protokol Şifreleniyor...",
        finish: "Kesin Keşfi Başlat",
        pdf: "Blueprint PDF İndir",
        hub: "Merkeze Dön"
      },
      success: {
        title: "Protokol Kaydedildi.",
        sub: "Kesin Keşif Süreci",
        desc: "Mimari özellikler güvenceye alındı. Mühendislik incelemesi bekleniyor.",
        dsNumber: "Dağıtım Referansı"
      }
    },

    contactPage: {
      title: "İletişim Kur",
      subtitle: "Dijital Mühendislik.",
      desc: "Teknik gereksinimlerinizi tartışın veya mühendislik ekibimizden özel bir danışmanlık talep edin.",
      studioName: "Novatrum Infrastructure.",
      studioLoc: "Dilbeek, Belçika",
      studioOper: "Küresel operasyonlar için uygundur",
      roadmapTitle: "MÜHENDİSLİK YOL HARİTASI",
      steps: [
        { s: "01", t: "Keşif ve Strateji", d: "Hedeflerinizi, teknik gereksinimlerinizi tartışıyor ve kapsamı belirliyoruz." },
        { s: "02", t: "Mimari ve UI", d: "Sistem mimarisinin haritasını çıkarıyor ve kullanıcı deneyimini tasarlıyoruz." },
        { s: "03", t: "Temel Geliştirme", d: "Platformu inşa ediyor ve güvenli, ölçeklenebilir bir ortama dağıtıyoruz." }
      ],
      badge: "Mühendislik Kapasitesi: Açık",
      form: {
        nameLabel: "Tam Adınız *",
        namePlaceholder: "örn. Ahmet Yılmaz",
        emailLabel: "Kurumsal E-posta *",
        emailPlaceholder: "ahmet@sirket.com",
        categoryLabel: "Talep Türü",
        categoryValue: "Dijital Ürün Mühendisliği",
        briefLabel: "Proje Detayları *",
        briefPlaceholder: "Mimari ihtiyaçlarınızı açıklayın...",
        submit: "Mesajı İlet",
        sending: "Gönderiliyor..."
      },
      success: {
        title: "İletim Başarılı.",
        desc: "Mesajınız güvenli bir şekilde kaydedildi. Ekibimiz gereksinimlerinizi inceleyecek ve kısa süre içinde yanıt verecektir.",
        button: "Başka Bir Mesaj İlet"
      },
      faqTitle: "Sıkça Sorulan",
      faqSubtitle: "Sorular.",
      faqDesc: "Mühendislik sürecimiz ve teknik yeteneklerimiz hakkında sıkça sorulan bazı sorular.",
      faqs: [
        { q: "Tipik proje zaman çizelgeniz nedir?", a: "Yapısal karmaşıklığa bağlı olarak, standart dağıtımlar 4 ila 8 hafta sürer. Hızlandırılmış seçenekler mevcuttur." },
        { q: "Lansman sonrası bakım sunuyor musunuz?", a: "Evet, güvenlik yamalarını ve sürekli optimizasyonu içeren öncelikli bakım sözleşmeleri sağlıyoruz." },
        { q: "Temel teknoloji yığınınız nedir?", a: "Sistemleri Next.js, React, Tailwind CSS, Node.js ve Supabase aracılığıyla PostgreSQL kullanarak inşa ediyoruz." }
      ]
    },

    calculator: {
      title: "Mimari Tahmin",
      subtitle: "Temel parametreleri tanımlayın",
      stepInfo: "Aşama",
      of: "/",
      tag: "TAHMİN",
      included: "Dahil",
      monthly: "ay",
      month: "ay",
      customPalette: "Özel Renkler",
      builderTitle: "Marka Kimliği",
      builderDesc: "Kesin hex kodlarınızı seçin.",
      shuffleColors: "Karıştır",
      applyPalette: "Renkleri Uygula",
      paletteSelected: "Palet Uygulandı",
      textPlaceholder: "Belirli bir işlevi, entegrasyonu veya rakip referansını burada açıklayın...",
      estimateGen: "Plan Hesaplandı",
      totalInv: "Tahmini Yatırım",
      recurringLabel: "Aylık Ücret",
      btnPrev: "Önceki Aşama",
      btnReset: "Süreci Yeniden Başlat",
      btnNext: "Sonraki Aşama",
      btnFinish: "Tahmin Üret",
      formNameLabel: "Kurum Adı",
      formNamePlace: "Şirket veya Kendi Adınız",
      formCompanyLabel: "Mevcut Web Sitesi (İsteğe Bağlı)",
      formCompanyPlace: "https://...",
      formEmailLabel: "Güvenli E-posta",
      formEmailPlace: "Verileri nereye göndermeliyiz?",
      btnSending: "Veriler Derleniyor...",
      btnSend: "Tahmini Göster",
      notice: "Bu bağlayıcı olmayan algoritmik bir tahmindir.",
      successTitle: "Tahmin Gönderildi",
      successDesc: "Temel tahmininizin bir kopyası e-postanıza gönderildi. Kesin parametreleri tartışmak için sizinle iletişime geçeceğiz.",
      liveTotal: "Canlı Hesaplama",
      resetConfirm: "Mevcut seçimleri temizlemek ve hesaplamayı yeniden başlatmak istediğinizden emin misiniz?",
      opt2Btn: "Kesin Keşif Sürecini Başlat",
      returnHub: "Merkeze Dön",
      stepsData: [
        {
          title: "Temel Altyapı",
          subtitle: "Platformunuzun temel mimarisini seçin.",
          options: [
            { label: "Açılış Sayfası (Landing)", desc: "Yüksek dönüşümlü tek sayfalık varlık." },
            { label: "Kurumsal Site", desc: "Çok sayfalı profesyonel şirket mimarisi." },
            { label: "Standart E-Ticaret", desc: "Standart sepet akışlarına sahip dijital vitrin." },
            { label: "Gelişmiş Entegrasyon", desc: "Karmaşık üçüncü taraf API senkronizasyonları." },
            { label: "SaaS / Web App", desc: "Karmaşık veritabanı mantığına sahip özel yazılım." }
          ]
        },
        { title: "Estetik ve UI", subtitle: "Görsel yönünüzü seçin." },
        {
          title: "Marka Varlıkları",
          subtitle: "Özel görsel varlık oluşturulmasına ihtiyacınız var mı?",
          options: [
            { label: "Marka Kimliği Tasarımı", desc: "Logo, tipografi ve temel marka yönergeleri." },
            { label: "Özel UI Tasarımı", desc: "Özel taslaklar ve yüksek kaliteli mockuplar." }
          ]
        },
        {
          title: "İçerik ve SEO",
          subtitle: "İçerik mühendisliği gereksinimlerini seçin.",
          options: [
            { label: "Standart SEO Kurulumu", desc: "Temel meta etiketler ve indeksleme." },
            { label: "Profesyonel Metin Yazarlığı", desc: "Tüm sayfalar için SEO uyumlu satış metni." },
            { label: "Gelişmiş Teknik SEO", desc: "Schema işaretlemesi ve programatik mimari." }
          ]
        },
        {
          title: "Müşteri Kazanımı",
          subtitle: "Kullanıcı kazanım araçlarını seçin.",
          options: [
            { label: "Gelişmiş İletişim Formları", desc: "Koşullu mantık ve webhook yönlendirmesi." },
            { label: "Bülten Senkronizasyonu", desc: "Mailchimp/ConvertKit ile entegrasyon." },
            { label: "CRM Entegrasyonu", desc: "Hubspot veya Salesforce ile doğrudan senkronizasyon." }
          ]
        },
        {
          title: "Performans ve Lojistik",
          subtitle: "Hosting ve devam eden mühendislik desteğini seçin.",
          options: [
            { label: "Standart Optimizasyon", desc: "Standart önbelleğe alma ve varlık teslimi." },
            { label: "Ultra Performans", desc: "Garantili 95+ Core Web Vitals puanı." },
            { label: "Premium Hosting", desc: "Ayrılmış kaynaklar ve günlük yedeklemeler." },
            { label: "Öncelikli Bakım", desc: "Devam eden kod güncellemeleri ve güvenlik yamaları." }
          ]
        },
        {
          title: "Dağıtım Takvimi",
          subtitle: "Gerekli lansman programınızı seçin.",
          options: [
            { label: "Standart Sıra (4-6 Hafta)", desc: "Normal mühendislik önceliği." },
            { label: "Acil (1-2 Hafta)", desc: "Öncelikli teslimat. Premium uygulanır." }
          ]
        },
        { title: "Mimari Vizyon", subtitle: "Son direktifleri veya teknik notları ekleyin." }
      ],
      palettes: [
        { name: "Novatrum Dark", desc: "İmza görünümümüz. Derin, premium ve cesur." },
        { name: "Nordic Clean", desc: "Aydınlık, minimal, tipografi odaklı." },
        { name: "Midnight Tech", desc: "Teknoloji girişimleri için modern mavi tonlar." },
        { name: "Industrial Gold", desc: "Zarif altın detaylarla yüksek kontrast." }
      ]
    },

    processPage: {
      title: "Mühendislik",
      subtitle: "Metodolojisi.",
      desc: "Karmaşık mantığı zarif, yüksek performanslı dijital gerçekliklere dönüştürmek için tasarlanmış şeffaf bir çerçeve.",
      steps: [
        { num: "01", title: "Keşif ve Planlama", subtitle: "Mimarinin Tanımlanması", desc: "Teknik gereksinimlerinize ve hedeflerinize derinlemesine bir bakışla başlıyoruz. Birlikte proje kapsamını kilitliyor ve bir yol haritası oluşturuyoruz." },
        { num: "02", title: "UI/UX Mühendisliği", subtitle: "Arayüzün Tasarlanması", desc: "Görsel mimariyi çiziyoruz. Jenerik şablonları reddederek, her arayüz markanızın dijital kimliğiyle kusursuz uyum sağlamak için özel olarak tasarlanır." },
        { num: "03", title: "Temel Geliştirme", subtitle: "Mantığın Yazılması", desc: "Ekibimiz temiz, modüler ve yüksek düzeyde ölçeklenebilir kod yazar. Sürekli güncellemeler alır ve süreci izlemek için güvenli bir test ortamına erişirsiniz." },
        { num: "04", title: "Test ve Dağıtım", subtitle: "Canlıya Alma", desc: "Titiz kalite güvencesinin ardından dağıtım protokolünü uyguluyoruz. Platformunuzun güvenli, optimize edilmiş ve kurumsal trafiği kaldırabilecek şekilde olmasını sağlıyoruz." }
      ],
      ctaTitle: "İnşaata başlamaya hazır mısınız?",
      ctaButton: "Keşfi Başlat"
    },

    servicesPage: {
      title: "Özel Mimariler",
      subtitle: "Modern açık kaynaklı teknolojileri kullanarak hızlı, ölçeklenebilir ve dönüşüm odaklı dijital platformlar inşa ediyoruz.",
      s1: {
        title: "Özel Frontend Mühendisliği",
        desc: "Saniyenin altında yükleme sürelerine ve akıcı etkileşimlere tavizsiz bir şekilde odaklanarak özel kullanıcı arayüzleri geliştiriyoruz. Şablon yok—sadece saf performans.",
        tech: "REACT • NEXT.JS • TAILWIND",
        features: [
          "Saniyenin altında işleme performansı",
          "Tüm cihazlarda akıcı duyarlı mimari",
          "Gelişmiş etkileşimli UI ve WebGL öğeleri"
        ]
      },
      s2: {
        title: "Full-Stack SaaS Sistemleri",
        desc: "Uçtan uca web uygulaması mühendisliği. Şifrelenmiş kullanıcı doğrulama akışlarından karmaşık veritabanı mantığına kadar, kurumsal ölçeğe hazır mimariler oluşturuyoruz.",
        tech: "NODE.JS • SUPABASE • POSTGRES",
        features: [
          "Şifrelenmiş kullanıcı doğrulama ve yetkilendirme",
          "Gerçek zamanlı veritabanı senkronizasyonu",
          "Karmaşık üçüncü taraf API ve webhook yönlendirmesi"
        ]
      },
      s3: {
        title: "E-Ticaret Altyapısı",
        desc: "Dönüşüm oranlarını en üst düzeye çıkarmak, büyük trafik artışlarını yönetmek ve banka düzeyinde ödeme güvenliği sağlamak için tasarlanmış yüksek performanslı dijital vitrinler.",
        tech: "STRIPE • CUSTOM CMS • ANALYTICS",
        features: [
          "Banka düzeyinde güvenli ödeme altyapısı",
          "Dönüşüm odaklı optimize edilmiş ödeme süreçleri",
          "Ayrıntılı satış ve kullanıcı davranışı analizi"
        ]
      },
      ctaTitle: "Parametrelerinizi belirlemeye hazır mısınız?",
      ctaButton: "Proje Keşfine Başla"
    },

    productsPage: {
      splashInit: "Premium Modüller Başlatılıyor...",
      heroTag: "Premium Modüller",
      heroTitleLine1: "Mimarinizi",
      heroTitleLine2: "Genişletin.",
      heroDesc: "Operasyonlarınızı derinlemesine entegre edilmiş SaaS modülleri ile güçlendirin. Askeri düzeyde güvenlikten her şeyi bilen yapay zeka asistanlarına kadar, ajansınızın ihtiyaç duyduğu tam altyapıyı oluşturun.",
      visualInterface: "Görsel Arayüz",
      investment: "Modül Yatırımı",
      mo: "/ay",
      btnRequest: "Erişim Talep Et",
      ctaTitle: "Hangi düğümleri etkinleştireceğinizden emin değil misiniz?",
      ctaDesc: "Mevcut mimarinizi denetlemek ve optimum ölçeklendirme için gereken kesin modülleri belirlemek üzere mühendislik ekibiyle bağlantı kurun.",
      btnConsult: "Mühendisliğe Danışın",
      modules: {
        nexus: {
          name: "Nexus CX Modülü",
          tagline: "Müşteri Deneyimi Paradigması",
          desc: "Müşterileriniz için özel bir iç portal. Tüm iletişimleri, belge paylaşımını ve proje durumu izlemeyi son derece güvenli, markalı bir ortamda merkezileştirin. E-posta karmaşasını ortadan kaldırın ve profesyonel imajınızı yükseltin.",
          f1: "Gerçek zamanlı proje takibi",
          f2: "Güvenli kasa erişimi",
          f3: "Otomatik faturalandırma senkronizasyonu"
        },
        sentinel: {
          name: "Sentinel Core Güvenlik",
          tagline: "Askeri Düzeyde Altyapı",
          desc: "Mimariniz için gelişmiş tehdit koruması. Sentinel Core, dijital varlıklarınızın 7/24 aşılmaz kalmasını sağlamak için sürekli güvenlik açığı taraması, DDoS azaltma ve otomatik veritabanı yedeklemeleri sağlar.",
          f1: "Otomatik günlük yedeklemeler",
          f2: "DDoS azaltma katmanı",
          f3: "Sıfır gün (Zero-day) güvenlik açığı yaması"
        },
        architect: {
          name: "Architect AI Modülü",
          tagline: "Otomatik Plan Üretimi",
          desc: "Potansiyel müşteriler için anında yüksek dönüşümlü teknik denetim raporları ve mimari planlar oluşturun. Otomatik PageSpeed ve Wappalyzer ayrıştırması ile anlaşmaları daha hızlı kapatmak için veriye dayalı içgörüleri kullanın.",
          f1: "Anında denetim oluşturma",
          f2: "PDF plan oluşturma",
          f3: "Eski sistem (legacy stack) tanımlama"
        },
        neural: {
          name: "Neural AI Motoru",
          tagline: "Nihai Kahin",
          desc: "Üst düzey bir altyapı zekası düğümü dağıtın. Neural AI, tüm veritabanınıza gerçek zamanlı erişime sahiptir; MRR'yi hesaplayabilen, borçları takip edebilen ve satış metinleri yazabilen yorulmak bilmez bir yönetici asistanı olarak hareket eder.",
          price: "Kademeli",
          f1: "Sınırsız dünya bilgisi",
          f2: "Canlı veritabanı bağlamı",
          f3: "Finansal ve teknik mantık"
        }
      }
    },
  }
};