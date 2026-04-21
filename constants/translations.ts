export type Language = 'en' | 'nl' | 'fr' | 'tr';

export const translations = {
  en: {
    nav: { home: "Home", services: "Services", process: "Process", contact: "Contact", privacy: "Privacy", terms: "Terms", gateway: "Client Portal" },
    footer: { rights: "All rights reserved.", builtIn: "Engineered in Dilbeek, Belgium.", lang: "Language" },

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
      title: "Privacy Policy",
      subtitle: "Data protection.",
      tag: "LEGAL",
      lastUpdated: "Last Updated: 2026",
      sec1Title: "01. Data Collection",
      sec1Desc: "We only collect what is strictly necessary for engineering your product.",
      sec1Notice: "We never sell your data to third parties.",
      techAuthTitle: "02. Technical Authentication",
      techAuthDesc: "We use strictly necessary technical cookies to maintain your secure session within the Client Portal. These are essential for core security features and do not track personal behavior.",
      sec2Title: "03. Communication",
      sec2Desc: "How we contact you securely.",
      rule1: "Strictly project-related communication.",
      rule2: "No third-party marketing spam.",
      rule3: "Secure and encrypted channels.",
      sec3Title: "04. Security",
      sec3Desc: "Your project parameters and credentials are encrypted within our private network.",
      footerTag: "QUESTIONS?",
      cta: "Contact Us"
    },
    terms: {
      title: "Terms of Service",
      subtitle: "Operational standards.",
      tag: "LEGAL",
      lastUpdated: "Last Updated: 2026",
      sec1Title: "01. Originality",
      sec1Desc: "Every line of code and UI component is custom engineered.",
      sec1Notice: "We strictly reject generic templates.",
      sec2Title: "02. Standards",
      sec2Desc: "Our baseline engineering rules.",
      rule1Title: "Quality",
      rule1Desc: "Uncompromising focus on sub-second load times.",
      rule2Title: "Delivery",
      rule2Desc: "Strict adherence to agreed deployment timelines.",
      rule3Title: "Support",
      rule3Desc: "Comprehensive post-launch care.",
      sec3Title: "03. Usage",
      sec3Desc: "Fair usage policies apply to all our deployed platforms and digital products.",
      sec4Title: "04. Ownership",
      sec4Desc: "Upon final payment, full intellectual property rights are transferred to your entity.",
      footerTag: "AGREEMENT",
      cta: "Calculate Estimate"
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
        minimal: "Minimal & Focus on Typography",
        bold: "Bold, Premium & Brand Driven",
        corporate: "Professional & Corporate Structure",
        interactive: "Highly Interactive & Complex UI"
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
        standard: "Standard (4-6 Weeks)",
        relaxed: "Relaxed (8-10 Weeks)",
        expedited: "Expedited (1-2 Weeks)"
      },
      constraint: {
        title: "Architectural Constraint",
        desc: "A complex platform cannot be expedited. Please prioritize standard or relaxed timelines for proper engineering."
      },
      form: {
        credentials: "Credentials",
        entity: "Entity Name *",
        website: "Current URL",
        goals: "Primary Objective & Goals *",
        goalsPlace: "Describe the ultimate purpose of this platform...",
        competitors: "Competitors or Inspirations",
        architecture: "Architecture",
        archDesc: "Select the engineering framework for your application.",
        pages: "Estimated Number of Pages/Screens",
        design: "Aesthetics",
        designDesc: "How should the platform feel? Select your direction.",
        color: "Primary Color",
        accent: "Accent Color",
        hasAccent: "Has Accent Color?",
        fonts: "Typography Preference",
        content: "Content & Copy",
        copy: "Include Professional Copywriting",
        assets: "Attach Brand Assets / Brief (Max 100MB)",
        integrations: "Integrations & Functionality",
        intDesc: "Select the complex features and third-party API syncs.",
        seo: "Visibility",
        seoDesc: "Select content engineering and indexing strategy.",
        timeline: "Logistics",
        timelineDesc: "Let's define the required deployment timeline.",
        maintenance: "Continuous Support",
        maintenanceDesc: "Include post-launch maintenance & security retainer.",
        maintenanceCheck: "Include priority maintenance",
        client: "Identify Client",
        clientSub: "Provide billing details to securely log this discovery into our systems.",
        name: "Full Name / Point of Contact *",
        email: "Corporate Email Address *",
        phone: "Corporate Phone Number *",
        address: "Billing Address (City, Country) *",
        vat: "VAT Number (Optional)",
        notes: "Design Notes",
        notesPlace: "Share any specific visual directions or technical notes...",
        transparencyTitle: "Operational Compliance",
        transparencyDesc: "Our pricing model separates engineering value from mandatory operational costs (licenses, cloud infrastructure, and business compliance). This ensures full transparency.",
        exclVat: "Excl. VAT & Operational Expenses",
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
        submit: "Lock Discovery & Blueprint",
        encrypting: "Encrypting...",
        finish: "Start Discovery",
        pdf: "Generate & Download PDF",
        hub: "Return to Hub"
      },
      success: {
        title: "Blueprint Locked.",
        sub: "Definitive Discovery",
        desc: "Your secure reference ID is logged. We will review your blueprint and email you within 24-48 hours with a Definitive Proposal.",
        dsNumber: "DS Number"
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
    nav: { home: "Home", services: "Diensten", process: "Methodologie", contact: "Contact", privacy: "Privacy", terms: "Voorwaarden", gateway: "Klantenportaal" },
    footer: { rights: "Alle rechten voorbehouden.", builtIn: "Ontwikkeld in Dilbeek, België.", lang: "Taal" },

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
      title: "Privacybeleid",
      subtitle: "Gegevensbescherming.",
      tag: "JURIDISCH",
      lastUpdated: "Laatst bijgewerkt: 2026",
      sec1Title: "01. Gegevensverzameling",
      sec1Desc: "Wij verzamelen alleen wat strikt noodzakelijk is voor de ontwikkeling.",
      sec1Notice: "Wij verkopen uw gegevens nooit aan derden.",
      techAuthTitle: "02. Technische Authenticatie",
      techAuthDesc: "Wij gebruiken strikt noodzakelijke technische cookies om uw veilige sessie binnen het Klantenportaal te behouden. Deze zijn essentieel voor de kernbeveiliging en volgen geen persoonlijk gedrag.",
      sec2Title: "03. Communicatie",
      sec2Desc: "Hoe wij veilig contact met u opnemen.",
      rule1: "Strikt projectgerelateerde communicatie.",
      rule2: "Geen marketing spam van derden.",
      rule3: "Veilige en versleutelde kanalen.",
      sec3Title: "04. Veiligheid",
      sec3Desc: "Uw projectparameters worden versleuteld binnen ons privénetwerk.",
      footerTag: "VRAGEN?",
      cta: "Neem Contact Op"
    },
    terms: {
      title: "Servicevoorwaarden",
      subtitle: "Operationele standaarden.",
      tag: "JURIDISCH",
      lastUpdated: "Laatst bijgewerkt: 2026",
      sec1Title: "01. Originaliteit",
      sec1Desc: "Elke regel code en UI wordt op maat gemaakt.",
      sec1Notice: "Wij weigeren het gebruik van generieke templates.",
      sec2Title: "02. Standaarden",
      sec2Desc: "Onze technische basisregels.",
      rule1Title: "Kwaliteit",
      rule1Desc: "Focus op laadtijden onder de seconde.",
      rule2Title: "Levering",
      rule2Desc: "Strikte naleving van afgesproken deadlines.",
      rule3Title: "Support",
      rule3Desc: "Uitgebreide zorg na lancering.",
      sec3Title: "03. Gebruik",
      sec3Desc: "Fair use beleid is van toepassing op al onze platformen.",
      sec4Title: "04. Eigendom",
      sec4Desc: "Na volledige betaling wordt het intellectueel eigendom aan u overgedragen.",
      footerTag: "AKKOORD",
      cta: "Schatting Berekenen"
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
      desc: "Voer de gedetailleerde parameters van uw project in. Wij maken bir exact technisch plan en een contractklaar voorstel.",
      liveEstimate: "Live Schatting",
      phase: "Fase",
      of: "van",
      fileUploading: "Encrypting Upload...",
      fileClick: "Klik of sleep bestanden hierheen",
      termsAgree: "Ik bevestig dat ik de ",
      termsLink: "Novatrum Algemene Voorwaarden",
      termsDesc: " heb gelezen en hiermee akkoord ga. Ik begrijp dat deze definitieve blauwdruk de technische omvang en factureringsvoorwaarden van onze samenwerking vormt.",
      integrations: {
        stripe: "Stripe Betalingsgateway",
        auth: "Kullanıcı Veri ve Yetkilendirme",
        crm: "CRM / Hubspot Synchronisatie",
        mail: "Nieuwsbrief & E-mail Synchronisatie",
        analytics: "Geavanceerde Gebeurtenisanalyses",
        ai: "Bespoke AI / ML Integratie",
        sockets: "Real-time Veri / Sockets",
        cms: "Custom Content Management (CMS)",
        multilang: "Meertalige Alfa's"
      },
      designStyles: {
        minimal: "Minimal & Focus op Typografie",
        bold: "Vet, Premium & Brand Driven",
        corporate: "Profesyonel & Kurumsal Yapı",
        interactive: "Hoog Interactief & Complex UI"
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
        standard: "Standaard (4-6 Weken)",
        relaxed: "Relaxed (8-10 Weken)",
        expedited: "Versneld (1-2 Weken)"
      },
      constraint: {
        title: "Architecturale Beperking",
        desc: "Een complex platform kan niet worden versneld. Geef a.u.b. prioriteit aan standaard- of relaxte tijdlijnen voor een goede technische uitvoering."
      },
      form: {
        credentials: "Credentials",
        entity: "Entiteitsnaam *",
        website: "Huidige URL",
        goals: "Primaire Doelstelling & Doelen *",
        goalsPlace: "Beschrijf het ultieme doel van dit platform...",
        competitors: "Concurrenten of Inspiraties",
        architecture: "Architectuur",
        archDesc: "Selecteer het technische framework voor uw applicatie.",
        pages: "Geschat aantal Pagina's/Schermen",
        design: "Esthetiek",
        designDesc: "Hoe moet het platform aanvoelen? Selecteer uw richting.",
        color: "Primaire Kleur",
        accent: "Accentkleur",
        hasAccent: "Accentkleur?",
        fonts: "Typografievoorkeur",
        content: "Inhoud & Copy",
        copy: "Include Professional Copywriting",
        assets: "Attach Brand Assets / Brief (Max 100MB)",
        integrations: "Integraties & Functionaliteit",
        intDesc: "Selecteer de complexe functies en API-synchronisaties.",
        seo: "Zichtbaarheid",
        seoDesc: "Selecteer de strategie voor content engineering en indexering.",
        timeline: "Logistiek",
        timelineDesc: "Laten we de vereiste lanceringstermijn bepalen.",
        maintenance: "Continu Onderhoud",
        maintenanceDesc: "Include post-launch maintenance & security retainer.",
        maintenanceCheck: "Include priority maintenance",
        client: "Identificeer Klant",
        clientSub: "Voer uw facturatiegegevens in om deze discovery veilig in onze systemen op te slaan.",
        name: "Volledige Naam / Contactpersoon *",
        email: "Zakelijk E-mailadres *",
        phone: "Kurumsal Telefoonnummer *",
        address: "Billing Adres (Stad, Land) *",
        vat: "BTW-nummer (Optioneel)",
        notes: "Ontwerpnotities",
        notesPlace: "Deel specifieke visuele richtlijnen of technische opmerkingen...",
        transparencyTitle: "Operationele Naleving",
        transparencyDesc: "Ons prijsmodel scheidt de technische waarde van verplichte operationele kosten (licenties, cloudinfrastructuur en zakelijke compliance). Dit zorgt voor volledige transparantie.",
        exclVat: "Excl. BTW & Operationele Kosten",
        twoMonthsFreeBadge: "2 Maanden Gratis Inbegrepen",
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
        total: "Canlı Hesaplama (€)",
        twoMonthsFreeNote: "Eerste 2 Maanden Gratis",
      },
      btn: {
        prev: "Vorige Fase",
        next: "Volgende Fase",
        submit: "Vergrendel Plan & Blueprint",
        encrypting: "Versleutelen...",
        finish: "Start Discovery",
        pdf: "Genereer & Download PDF",
        hub: "Terug naar Hub"
      },
      success: {
        title: "Plan Vergrendeld.",
        sub: "Definitieve Discovery",
        desc: "Uw beveiligde referentie-ID is vastgelegd. Wij zullen uw blueprint beoordelen en u binnen 24-48 uur e-mailen met bir Definitief Voorstel.",
        dsNumber: "DS Nummer"
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
    nav: { home: "Accueil", services: "Services", process: "Méthodologie", contact: "Contact", privacy: "Confidentialité", terms: "Conditions", gateway: "Portail Client" },
    footer: { rights: "Tous droits réservés.", builtIn: "Conçu à Dilbeek, Belgique.", lang: "Langue" },

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
      title: "Confidentialité",
      subtitle: "Protection des données.",
      tag: "LÉGAL",
      lastUpdated: "Dernière mise à jour : 2026",
      sec1Title: "01. Collecte de Données",
      sec1Desc: "Nous ne collectons que ce qui est strictement nécessaire à l'ingénierie.",
      sec1Notice: "Nous ne vendons jamais vos données à des tiers.",
      techAuthTitle: "02. Authentification Technique",
      techAuthDesc: "Nous utilisons des cookies techniques strictement nécessaires pour maintenir votre session sécurisée dans le Portail Client. Ils sont essentiels pour la sécurité et ne suivent pas le comportement personnel.",
      sec2Title: "03. Communication",
      sec2Desc: "Comment nous vous contactons en toute sécurité.",
      rule1: "Communication strictement liée au projet.",
      rule2: "Pas de spam marketing.",
      rule3: "Canaux sécurisés et chiffrés.",
      sec3Title: "04. Sécurité",
      sec3Desc: "Vos paramètres sont chiffrés dans notre réseau privé.",
      footerTag: "DES QUESTIONS ?",
      cta: "Nous Contacter"
    },
    terms: {
      title: "Conditions de Service",
      subtitle: "Normes opérationnelles.",
      tag: "LÉGAL",
      lastUpdated: "Dernière mise à jour : 2026",
      sec1Title: "01. Originalité",
      sec1Desc: "Chaque ligne de code est conçue sur mesure.",
      sec1Notice: "Nous rejetons les modèles génériques.",
      sec2Title: "02. Normes",
      sec2Desc: "Nos règles d'ingénierie de base.",
      rule1Title: "Qualité",
      rule1Desc: "Focus sur des temps de chargement ultra-rapides.",
      rule2Title: "Livraison",
      rule2Desc: "Respect strict des délais de déploiement.",
      rule3Title: "Support",
      rule3Desc: "Suivi complet après le lancement.",
      sec3Title: "03. Utilisation",
      sec3Desc: "Des politiques d'utilisation équitable s'appliquent.",
      sec4Title: "04. Propriété",
      sec4Desc: "Après paiement intégral, les droits de propriété intellectuelle vous sont transférés.",
      footerTag: "ACCORD",
      cta: "Calculer l'Estimation"
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
      integrations: {
        stripe: "Passerelle de Paiement Stripe",
        auth: "Authentification & Autorisation Utilisateur",
        crm: "Synchronisation CRM / Hubspot",
        mail: "Synchronisation Newsletter & Email",
        analytics: "Analyses d'Evénements Avancées",
        ai: "Intégration AI / ML sur mesure",
        sockets: "Données en Temps Réel / Sockets",
        cms: "Gestionnaire de Contenu (CMS)",
        multilang: "Alphas Multilingues"
      },
      designStyles: {
        minimal: "Minimal & Focus sur la Typographie",
        bold: "Gras, Premium & Brand Driven",
        corporate: "Structure Professionnelle & Entreprise",
        interactive: "Hautement Interactif & Complex UI"
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
        standard: "Standart (4-6 Semaines)",
        relaxed: "Relax (8-10 Semaines)",
        expedited: "Accéléré (1-2 Semaines)"
      },
      constraint: {
        title: "Contrainte Architecturale",
        desc: "Une plateforme complexe ne peut pas être accélérée. Veuillez privilégier les calendriers standard ou détendus pour une ingénierie appropriée."
      },
      form: {
        credentials: "Credentials",
        entity: "Nom de l'Entité *",
        website: "URL Actuelle",
        goals: "Objectif Principal & Buts *",
        goalsPlace: "Décrivez le but ultime de cette plateforme...",
        competitors: "Concurrents ou Inspirations",
        architecture: "Architecture",
        archDesc: "Sélectionnez le cadre d'ingénierie pour votre application.",
        pages: "Nombre Estimé de Pages/Écrans",
        design: "Esthétique",
        designDesc: "Quelle sensation la plateforme doit-elle dégager ? Sélectionnez votre direction.",
        color: "Couleur Principale",
        accent: "Couleur d'Accent",
        hasAccent: "Couleur d'Accent?",
        fonts: "Préférence de Typographie",
        content: "Contenu & Copy",
        copy: "Include Professional Copywriting",
        assets: "Attach Brand Assets / Brief (Max 100MB)",
        integrations: "Intégrations & Fonctionnalités",
        intDesc: "Sélectionnez les fonctionnalités complexes et les synchronisations API.",
        seo: "Visibilité",
        seoDesc: "Sélectionnez content engineering et la stratégie d'indexation.",
        timeline: "Logistique",
        timelineDesc: "Définissons le calendrier de déploiement requis.",
        maintenance: "Soutien Continu",
        maintenanceDesc: "Include post-launch maintenance & security retainer.",
        maintenanceCheck: "Include priority maintenance",
        client: "Identifier Client",
        clientSub: "Fournissez vos coordonnées de facturation pour enregistrer cette découverte en toute sécurité.",
        name: "Nom Complet / Point de Contact *",
        email: "Adresse E-mail Professionnelle *",
        phone: "Téléphone Professionnel *",
        address: "Adresse de Facturation (Ville, Pays) *",
        vat: "Numéro de TVA (Optionnel)",
        notes: "Notes de Conception",
        notesPlace: "Partagez toute direction visuelle spécifique ou note technique...",
        transparencyTitle: "Conformité Opérationnelle",
        transparencyDesc: "Notre modèle de tarification sépare la valeur d'ingénierie des coûts opérationnels obligatoires (licences, infrastructure cloud et conformité commerciale). Cela garantit une transparence totale.",
        exclVat: "Hors TVA & Frais Opérationnels",
        twoMonthsFreeBadge: "2 Mois Gratuits Inclus",
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
        submit: "Verrouiller Plan & Blueprint",
        encrypting: "Chiffrement...",
        finish: "Démarrer Découverte",
        pdf: "Générer & Télécharger PDF",
        hub: "Retour au Hub"
      },
      success: {
        title: "Blueprint Verrouillé.",
        sub: "Découverte Définitive",
        desc: "Votre ID de référence sécurisé est enregistré. Nous examinerons votre blueprint et vous enverrons un e-mail dans les 24-48 heures avec une Proposition Définitive.",
        dsNumber: "Numéro DS"
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
    nav: { home: "Ana Sayfa", services: "Hizmetler", process: "Metodoloji", contact: "İletişim", privacy: "Gizlilik", terms: "Şartlar", gateway: "Müşteri Portalı" },
    footer: { rights: "Tüm hakları saklıdır.", builtIn: "Dilbeek, Belçika'da geliştirildi.", lang: "Dil" },

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
      title: "Gizlilik Politikası",
      subtitle: "Veri koruması.",
      tag: "YASAL",
      lastUpdated: "Son Güncelleme: 2026",
      sec1Title: "01. Veri Toplama",
      sec1Desc: "Sadece ürününüzü geliştirmek için kesinlikle gerekli olanları topluyoruz.",
      sec1Notice: "Verilerinizi asla üçüncü şahıslara satmıyoruz.",
      techAuthTitle: "02. Teknik Kimlik Doğrulama",
      techAuthDesc: "Müşteri Portalı içindeki güvenli oturumunuzu sürdürmek için kesinlikle gerekli teknik çerezleri kullanıyoruz. Bunlar temel güvenlik özellikleri için şarttır ve kişisel davranışları izlemez.",
      sec2Title: "03. İletişim",
      sec2Desc: "Sizinle nasıl güvenli iletişim kuruyoruz.",
      rule1: "Kesinlikle projeyle ilgili iletişim.",
      rule2: "Üçüncü taraf pazarlama spam'i yok.",
      rule3: "Yalnızca güvenli ve şifreli kanallar.",
      sec3Title: "04. Güvenlik",
      sec3Desc: "Proje parametreleriniz ve kimlik bilgileriniz özel ağımızda şifrelenir.",
      footerTag: "SORULARINIZ MI VAR?",
      cta: "Bize Ulaşın"
    },
    terms: {
      title: "Hizmet Şartları",
      subtitle: "Operasyonel standartlar.",
      tag: "YASAL",
      lastUpdated: "Son Güncelleme: 2026",
      sec1Title: "01. Özgünlük",
      sec1Desc: "Her kod satırı ve UI bileşeni özel olarak tasarlanır.",
      sec1Notice: "Jenerik şablonları kesinlikle reddediyoruz.",
      sec2Title: "02. Standartlar",
      sec2Desc: "Temel mühendislik kurallarımız.",
      rule1Title: "Kalite",
      rule1Desc: "Saniyenin altındaki yükleme sürelerine tavizsiz odaklanma.",
      rule2Title: "Teslimat",
      rule2Desc: "Anlaşılan dağıtım takvimlerine sıkı sıkıya bağlılık.",
      rule3Title: "Destek",
      rule3Desc: "Lansman sonrası kapsamlı bakım.",
      sec3Title: "03. Kullanım",
      sec3Desc: "Adil kullanım politikaları dağıtılan tüm platformlarımız için geçerlidir.",
      sec4Title: "04. Sahiplik",
      sec4Desc: "Son ödemenin ardından, tüm fikri mülkiyet hakları kurumunuza devredilir.",
      footerTag: "SÖZLEŞME",
      cta: "Tahmini Hesapla"
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
      integrations: {
        stripe: "Stripe Ödeme Altyapısı",
        auth: "Kullanıcı Doğrulama ve Yetkilendirme",
        crm: "CRM / Hubspot Senkronizasyonu",
        mail: "Bülten ve E-posta Senkronizasyonu",
        analytics: "Gelişmiş Olay Analitiği",
        ai: "Özel AI / ML Entegrasyonu",
        sockets: "Gerçek Zamanlı Veri / Sockets",
        cms: "Özel İçerik Yönetimi (CMS)",
        multilang: "Çok Dilli Altyapı"
      },
      designStyles: {
        minimal: "Minimal & Tipografi Odaklı",
        bold: "Cesur, Premium & Marka Odaklı",
        corporate: "Profesyonel & Kurumsal Yapı",
        interactive: "Yüksek Etkileşimli & Karmaşık UI"
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
        standard: "Standart (4-6 Hafta)",
        relaxed: "Esnek (8-10 Hafta)",
        expedited: "Hızlandırılmış (1-2 Hafta)"
      },
      constraint: {
        title: "Mühendislik Kısıtlaması",
        desc: "Karmaşık bir platform hızlandırılamaz. Lütfen düzgün bir mühendislik süreci için standart veya esnek takvimlere öncelik verin."
      },
      form: {
        credentials: "Kimlik Bilgileri",
        entity: "Kurum / Marka Adı *",
        website: "Mevcut URL",
        goals: "Temel Hedef ve Amaçlar *",
        goalsPlace: "Bu platformun nihai amacını açıklayın...",
        competitors: "Rakipler veya İlham Kaynakları",
        architecture: "Mimari",
        archDesc: "Uygulamanız için mühendislik çerçevesini seçin.",
        pages: "Tahmini Sayfa/Ekran Sayısı",
        design: "Estetik",
        designDesc: "Platform nasıl hissettirmeli? Markanıza özel tasarım sistemleri geliştiriyoruz.",
        color: "Ana Renk",
        accent: "Vurgu Rengi",
        hasAccent: "Vurgu Rengi mi?",
        fonts: "Tipografi Tercihi",
        content: "İçerik ve Copy",
        copy: "Profesyonel Copywriting Dahil",
        assets: "Marka Varlıkları / Brief (Maks 100MB)",
        integrations: "Entegrasyonlar ve İşlevsellik",
        intDesc: "Karmaşık özellikleri ve üçüncü taraf API senkronizasyonlarını seçin.",
        seo: "Görünürlük",
        seoDesc: "İçerik mühendisliği ve indeksleme stratejisini seçin.",
        timeline: "Lojistik",
        timelineDesc: "Gerekli lansman takvimini belirleyelim.",
        maintenance: "Sürekli Destek",
        maintenanceDesc: "Lansman sonrası bakım ve güvenlik desteği dahil.",
        maintenanceCheck: "Öncelikli bakım dahil",
        client: "Kimlik Doğrulama",
        clientSub: "Bu keşfi sistemlerimize güvenli bir şekilde kaydetmek için fatura bilgilerinizi girin.",
        name: "Tam Ad / İletişim Kişisi *",
        email: "Kurumsal E-posta Adresi *",
        phone: "Kurumsal Telefon Numarası *",
        address: "Fatura Adresi (Şehir, Ülke) *",
        vat: "Vergi Numarası (Opsiyonel)",
        notes: "Tasarım Notları",
        notesPlace: "Belirli görsel yönlendirmeleri veya teknik notları paylaşın...",
        transparencyTitle: "Operasyonel Şeffaflık",
        transparencyDesc: "Fiyatlandırma modelimiz, mühendislik değerini zorunlu operasyonel maliyetlerden (lisanslar, bulut altyapısı ve yasal uyumluluk) ayırır. Bu, tam bir şeffaflık sağlar.",
        exclVat: "Hariç: KDV & Altyapı Bedeli",
        twoMonthsFreeBadge: "2 Ay Ücretsiz Dahil",
        pdfDisclaimer: "* Tahmin mühendislik değerini temsil eder. Operasyonel giderler (Altyapı/Uyum) ve KDV kayıt aşamasında hesaplanır.",
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
        submit: "Planı ve Taslağı Kilitle",
        encrypting: "Şifreleniyor...",
        finish: "Kesin Keşfi Başlat",
        pdf: "PDF Üret ve İndir",
        hub: "Merkeze Dön"

      },
      success: {
        title: "Plan Kilitlendi.",
        sub: "Kesin Keşif Süreci",
        desc: "Güvenli referans kimliğiniz kaydedildi. Blueprint'inizi inceleyeceğiz ve 24-48 saat içinde size Kesin Teklif ile e-postayla ulaşacağız.",
        dsNumber: "DS Numarası"
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