// lib/docs-content.ts

export type DocType = "dns" | "email" | "troubleshooting";
export type Language = "en" | "nl" | "fr" | "tr";

// lib/docs-content.ts
export interface DocContent {
  title: string;
  description: string;
  checklistTitle: string;
  checklistItems: string[];
  steps: { title: string; content: string; warning?: string; image?: string }[];
}

export const contentData: Record<DocType, Record<Language, DocContent>> = {
  dns: {
    en: {
      title: "Connecting Your Domain to Novatrum",
      description: "Follow these steps to point your domain name to our servers. This works with any domain provider — Combell, Namecheap, Cloudflare, GoDaddy, or any other registrar.",
      checklistTitle: "What You Need Before Starting",
      checklistItems: [
        "Access to your domain provider account (where you bought your domain)",
        "About 10 minutes of your time",
        "No technical knowledge required — just follow the steps",
      ],
      steps: [
        {
          title: "STEP 1: Log Into Your Domain Provider",
          content: "Open the website where you purchased your domain name. This could be Combell, Namecheap, Cloudflare, GoDaddy, or any other provider. Look for a button or link that says \"DNS Settings\", \"Manage DNS\", \"DNS Zone\", or \"Advanced DNS\". Every provider calls it slightly differently, but they all have this section. If you can't find it, search for \"DNS\" in your provider's help section or contact their support — they will guide you to the right page in under a minute.",
          warning: "Make sure you are logged into the account that actually owns the domain. Sometimes companies have multiple accounts — check which email address received the domain purchase confirmation.",
        },
        {
          title: "STEP 2: Clean Up Old Records",
          content: "Before adding new records, you need to remove any existing ones that might conflict. Look for existing A records (sometimes called \"A (Host)\" or \"Address records\") and CNAME records. If you see any A records for \"@\" or your domain name, delete them. If you see any CNAME records for \"www\", delete those too. Don't worry — deleting these won't break anything permanently. You're just making room for the correct settings.",
          warning: "Do NOT touch or delete any MX records. MX records control your email delivery. Deleting them will stop your emails from working. Only remove A and CNAME records.",
        },
        {
          title: "STEP 3: Add the A Record (Main Domain)",
          content: "Now you'll create your first new record. An A record tells the internet which server hosts your website. Look for a button that says \"Add Record\", \"Create Record\", or a \"+\" icon.\n\nFill in the following values exactly as shown:\n\n• Type / Record Type: Select \"A\" from the dropdown menu\n• Host / Name / Hostname: Type \"@\" (just the at symbol — this means your root domain like novatrum.eu)\n• Points to / Value / IP Address: Type \"76.76.21.21\" (this is Novatrum's server address)\n• TTL: Leave this as default or set to 3600\n\nClick \"Save\" or \"Add Record\". If your provider asks for \"@\" and doesn't accept it, try leaving the host field empty instead — some providers prefer this.",
        },
        {
          title: "STEP 4: Add the CNAME Record (WWW Subdomain)",
          content: "Now add a second record. A CNAME record creates an alias — it makes \"www.yourdomain.com\" point to the same place as \"yourdomain.com\".\n\nClick \"Add Record\" again and fill in:\n\n• Type / Record Type: Select \"CNAME\" from the dropdown\n• Host / Name / Hostname: Type \"www\" (just these three letters, nothing else)\n• Points to / Value / Alias: Type \"cname.vercel-dns.com\" (this is Vercel's alias server)\n• TTL: Leave as default or 3600\n\nClick \"Save\" or \"Add Record\".",
        },
        {
          title: "STEP 5: Wait for Propagation",
          content: "Congratulations — you've configured your DNS! Now you need to wait. DNS changes don't take effect instantly. They need to spread across thousands of servers worldwide. This process is called \"propagation\" and typically takes between 30 minutes and 24 hours, though it often completes much faster.\n\nDuring this waiting period, your website may work on your phone but not on your laptop, or vice versa. This is completely normal. It just means the changes are still spreading. After a few hours, your site will be reachable from everywhere.\n\nYou can check if your domain is pointing correctly by visiting: https://www.whatsmydns.net and entering your domain name — it will show you which servers worldwide can already see the change.",
          warning: "Do NOT change or edit your DNS records again during this waiting period. Changing records repeatedly will restart the propagation timer from zero, making you wait even longer. If something seems wrong after 24 hours, contact us and we'll help you troubleshoot.",
        },
      ],
    },
    nl: {
      title: "Uw Domein Koppelen aan Novatrum",
      description: "Volg deze stappen om uw domeinnaam naar onze servers te verwijzen. Dit werkt met elke domeinprovider — Combell, Namecheap, Cloudflare, GoDaddy, of elke andere registrar.",
      checklistTitle: "Wat U Nodig Heeft Voordat U Begint",
      checklistItems: [
        "Toegang tot uw domeinprovideraccount (waar u uw domein heeft gekocht)",
        "Ongeveer 10 minuten van uw tijd",
        "Geen technische kennis vereist — volg gewoon de stappen",
      ],
      steps: [
        {
          title: "STAP 1: Log In Bij Uw Domeinprovider",
          content: "Open de website waar u uw domeinnaam heeft gekocht. Dit kan Combell, Namecheap, Cloudflare, GoDaddy of een andere aanbieder zijn. Zoek naar een knop of link met de tekst \"DNS-instellingen\", \"DNS Beheren\", \"DNS-zone\" of \"Geavanceerde DNS\". Elke aanbieder noemt het net iets anders, maar ze hebben allemaal deze sectie. Als u het niet kunt vinden, zoek dan naar \"DNS\" in de helpsectie van uw provider of neem contact op met hun ondersteuning.",
          warning: "Zorg ervoor dat u bent ingelogd op het account dat daadwerkelijk eigenaar is van het domein. Soms hebben bedrijven meerdere accounts — controleer welk e-mailadres de domeinaankoopbevestiging heeft ontvangen.",
        },
        {
          title: "STAP 2: Oude Records Opschonen",
          content: "Voordat u nieuwe records toevoegt, moet u bestaande records verwijderen die mogelijk conflicteren. Zoek naar bestaande A-records (soms \"A (Host)\" of \"Address records\" genoemd) en CNAME-records. Als u A-records ziet voor \"@\" of uw domeinnaam, verwijder ze dan. Als u CNAME-records ziet voor \"www\", verwijder die dan ook. Maak u geen zorgen — het verwijderen hiervan zal niets permanent beschadigen. U maakt gewoon ruimte voor de juiste instellingen.",
          warning: "Raak MX-records NIET aan en verwijder ze niet. MX-records regelen de bezorging van uw e-mail. Als u ze verwijdert, werkt uw e-mail niet meer. Verwijder alleen A- en CNAME-records.",
        },
        {
          title: "STAP 3: A-Record Toevoegen (Hoofddomein)",
          content: "Nu maakt u uw eerste nieuwe record aan. Een A-record vertelt het internet welke server uw website host. Zoek naar een knop \"Record Toevoegen\", \"Record Aanmaken\" of een \"+\" icoon.\n\nVul de volgende waarden exact in zoals getoond:\n\n• Type / Record Type: Selecteer \"A\" uit het dropdown-menu\n• Host / Naam / Hostname: Typ \"@\" (alleen het apenstaartje — dit betekent uw hoofddomein zoals novatrum.eu)\n• Verwijst naar / Waarde / IP-adres: Typ \"76.76.21.21\" (dit is het serveradres van Novatrum)\n• TTL: Laat dit op standaard of stel in op 3600\n\nKlik op \"Opslaan\" of \"Record Toevoegen\".",
        },
        {
          title: "STAP 4: CNAME-Record Toevoegen (WWW Subdomein)",
          content: "Voeg nu een tweede record toe. Een CNAME-record maakt een alias — het zorgt ervoor dat \"www.uwdomein.com\" naar dezelfde plek verwijst als \"uwdomein.com\".\n\nKlik opnieuw op \"Record Toevoegen\" en vul in:\n\n• Type / Record Type: Selecteer \"CNAME\" uit het dropdown-menu\n• Host / Naam / Hostname: Typ \"www\" (alleen deze drie letters, niets anders)\n• Verwijst naar / Waarde / Alias: Typ \"cname.vercel-dns.com\" (dit is de alias-server van Vercel)\n• TTL: Laat op standaard of 3600\n\nKlik op \"Opslaan\" of \"Record Toevoegen\".",
        },
        {
          title: "STAP 5: Wacht op Propagatie",
          content: "Gefeliciteerd — u heeft uw DNS geconfigureerd! Nu moet u wachten. DNS-wijzigingen worden niet onmiddellijk van kracht. Ze moeten zich verspreiden over duizenden servers wereldwijd. Dit proces heet \"propagatie\" en duurt meestal tussen 30 minuten en 24 uur, hoewel het vaak veel sneller gaat.\n\nTijdens deze wachttijd werkt uw website mogelijk wel op uw telefoon maar niet op uw laptop, of omgekeerd. Dit is volkomen normaal. Het betekent alleen dat de wijzigingen zich nog aan het verspreiden zijn. Na een paar uur is uw site overal bereikbaar.\n\nU kunt controleren of uw domein correct verwijst door naar https://www.whatsmydns.net te gaan en uw domeinnaam in te voeren.",
          warning: "Wijzig uw DNS-records NIET opnieuw tijdens deze wachttijd. Het herhaaldelijk wijzigen van records zal de propagatietimer opnieuw starten vanaf nul, waardoor u nog langer moet wachten. Als er na 24 uur iets mis lijkt, neem dan contact met ons op.",
        },
      ],
    },
    fr: {
      title: "Connecter Votre Domaine à Novatrum",
      description: "Suivez ces étapes pour pointer votre nom de domaine vers nos serveurs. Cela fonctionne avec n'importe quel fournisseur — Combell, Namecheap, Cloudflare, GoDaddy, ou tout autre registrar.",
      checklistTitle: "Ce Dont Vous Avez Besoin Avant de Commencer",
      checklistItems: [
        "Accès à votre compte chez votre fournisseur de domaine (là où vous avez acheté votre domaine)",
        "Environ 10 minutes de votre temps",
        "Aucune connaissance technique requise — suivez simplement les étapes",
      ],
      steps: [
        {
          title: "ÉTAPE 1: Connectez-vous à Votre Fournisseur de Domaine",
          content: "Ouvrez le site web où vous avez acheté votre nom de domaine. Cela peut être Combell, Namecheap, Cloudflare, GoDaddy ou tout autre fournisseur. Cherchez un bouton ou un lien intitulé \"Paramètres DNS\", \"Gérer DNS\", \"Zone DNS\" ou \"DNS Avancé\". Chaque fournisseur l'appelle légèrement différemment, mais ils ont tous cette section. Si vous ne la trouvez pas, cherchez \"DNS\" dans la section d'aide de votre fournisseur ou contactez leur support.",
          warning: "Assurez-vous d'être connecté au compte qui possède réellement le domaine. Parfois, les entreprises ont plusieurs comptes — vérifiez quelle adresse e-mail a reçu la confirmation d'achat du domaine.",
        },
        {
          title: "ÉTAPE 2: Nettoyer les Anciens Enregistrements",
          content: "Avant d'ajouter de nouveaux enregistrements, vous devez supprimer ceux qui existent déjà et qui pourraient entrer en conflit. Cherchez les enregistrements A existants (parfois appelés \"A (Hôte)\" ou \"Enregistrements d'adresse\") et les enregistrements CNAME. Si vous voyez des enregistrements A pour \"@\" ou votre nom de domaine, supprimez-les. Si vous voyez des enregistrements CNAME pour \"www\", supprimez-les aussi. Ne vous inquiétez pas — les supprimer ne cassera rien de permanent.",
          warning: "Ne touchez PAS et ne supprimez PAS les enregistrements MX. Les enregistrements MX contrôlent la livraison de vos e-mails. Les supprimer empêchera vos e-mails de fonctionner. Supprimez uniquement les enregistrements A et CNAME.",
        },
        {
          title: "ÉTAPE 3: Ajouter l'Enregistrement A (Domaine Principal)",
          content: "Vous allez maintenant créer votre premier nouvel enregistrement. Un enregistrement A indique à Internet quel serveur héberge votre site web. Cherchez un bouton \"Ajouter un Enregistrement\", \"Créer un Enregistrement\" ou une icône \"+\".\n\nRemplissez les valeurs suivantes exactement comme indiqué:\n\n• Type: Sélectionnez \"A\" dans le menu déroulant\n• Hôte / Nom / Hostname: Tapez \"@\" (juste le symbole arobase — cela signifie votre domaine racine)\n• Pointe vers / Valeur / Adresse IP: Tapez \"76.76.21.21\" (l'adresse du serveur Novatrum)\n• TTL: Laissez par défaut ou réglez sur 3600\n\nCliquez sur \"Enregistrer\" ou \"Ajouter l'Enregistrement\".",
        },
        {
          title: "ÉTAPE 4: Ajouter l'Enregistrement CNAME (Sous-domaine WWW)",
          content: "Ajoutez maintenant un deuxième enregistrement. Un enregistrement CNAME crée un alias — il fait en sorte que \"www.votredomaine.com\" pointe au même endroit que \"votredomaine.com\".\n\nCliquez à nouveau sur \"Ajouter un Enregistrement\" et remplissez:\n\n• Type: Sélectionnez \"CNAME\" dans le menu déroulant\n• Hôte / Nom / Hostname: Tapez \"www\" (juste ces trois lettres)\n• Pointe vers / Valeur / Alias: Tapez \"cname.vercel-dns.com\" (le serveur alias de Vercel)\n• TTL: Laissez par défaut ou 3600\n\nCliquez sur \"Enregistrer\" ou \"Ajouter l'Enregistrement\".",
        },
        {
          title: "ÉTAPE 5: Attendre la Propagation",
          content: "Félicitations — vous avez configuré votre DNS ! Maintenant, vous devez attendre. Les modifications DNS ne prennent pas effet instantanément. Elles doivent se propager à travers des milliers de serveurs dans le monde. Ce processus, appelé \"propagation\", prend généralement entre 30 minutes et 24 heures.\n\nPendant cette période d'attente, votre site peut fonctionner sur votre téléphone mais pas sur votre ordinateur, ou vice versa. C'est tout à fait normal. Après quelques heures, votre site sera accessible partout.\n\nVous pouvez vérifier si votre domaine pointe correctement en visitant https://www.whatsmydns.net et en entrant votre nom de domaine.",
          warning: "Ne modifiez PAS vos enregistrements DNS pendant cette période d'attente. Modifier les enregistrements de façon répétée relancera le temps de propagation depuis zéro. Si quelque chose semble anormal après 24 heures, contactez-nous.",
        },
      ],
    },
    tr: {
      title: "Alan Adınızı Novatrum'a Bağlama",
      description: "Alan adınızı sunucularımıza yönlendirmek için bu adımları takip edin. Bu rehber tüm domain sağlayıcılarıyla çalışır — Combell, Namecheap, Cloudflare, GoDaddy veya başka herhangi bir kayıt kuruluşu fark etmez.",
      checklistTitle: "Başlamadan Önce Gerekenler",
      checklistItems: [
        "Domain sağlayıcınızın hesabına erişim (domain'i nereden aldıysanız)",
        "Yaklaşık 10 dakika ayırmanız yeterli",
        "Teknik bilgi gerekmez — sadece adımları takip edin",
      ],
      steps: [
        {
          title: "ADIM 1: Domain Sağlayıcınıza Giriş Yapın",
          content: "Alan adınızı satın aldığınız web sitesini açın. Bu Combell, Namecheap, Cloudflare, GoDaddy veya başka bir sağlayıcı olabilir. \"DNS Ayarları\", \"DNS Yönetimi\", \"DNS Bölgesi\" veya \"Gelişmiş DNS\" yazan bir buton ya da bağlantı arayın. Her sağlayıcı bu bölümü biraz farklı adlandırır, ancak hepsinde mutlaka vardır. Eğer bulamazsanız, sağlayıcınızın yardım bölümünde \"DNS\" diye aratın veya destek ekibiyle iletişime geçin — sizi doğru sayfaya bir dakikada yönlendirirler.",
          warning: "Domain'in gerçek sahibi olan hesapla giriş yaptığınızdan emin olun. Bazen şirketlerin birden fazla hesabı olabilir — domain satın alma onayının hangi e-posta adresine geldiğini kontrol edin.",
        },
        {
          title: "ADIM 2: Eski Kayıtları Temizleyin",
          content: "Yeni kayıtlar eklemeden önce, çakışabilecek mevcut kayıtları temizlemeniz gerekir. Mevcut A kayıtlarını (bazen \"A (Host)\" veya \"Adres kayıtları\" olarak adlandırılır) ve CNAME kayıtlarını bulun. \"@\" veya alan adınız için A kayıtları görüyorsanız, bunları silin. \"www\" için CNAME kayıtları görüyorsanız, onları da silin. Endişelenmeyin — bunları silmek kalıcı olarak hiçbir şeyi bozmaz. Sadece doğru ayarlar için yer açıyorsunuz.",
          warning: "MX kayıtlarına KESİNLİKLE dokunmayın veya silmeyin. MX kayıtları e-posta teslimatınızı kontrol eder. Bunları silmek e-postalarınızın çalışmasını durdurur. Sadece A ve CNAME kayıtlarını silin.",
        },
        {
          title: "ADIM 3: A Kaydını Ekleyin (Ana Alan Adı)",
          content: "Şimdi ilk yeni kaydınızı oluşturacaksınız. A kaydı, internet'e web sitenizi hangi sunucunun barındırdığını söyler. \"Kayıt Ekle\", \"Kayıt Oluştur\" veya \"+\" simgesi şeklinde bir buton arayın.\n\nAşağıdaki değerleri tam olarak gösterildiği gibi doldurun:\n\n• Tür / Kayıt Tipi: Açılır menüden \"A\" seçeneğini seçin\n• Host / Ad / Sunucu Adı: \"@\" yazın (sadece et işareti — bu, novatrum.eu gibi ana alan adınızı temsil eder)\n• Yönlendir / Değer / IP Adresi: \"76.76.21.21\" yazın (bu Novatrum'un sunucu adresidir)\n• TTL: Varsayılan olarak bırakın veya 3600 olarak ayarlayın\n\n\"Kaydet\" veya \"Kayıt Ekle\" butonuna tıklayın. Eğer sağlayıcınız \"@\" işaretini kabul etmezse, host alanını boş bırakmayı deneyin — bazı sağlayıcılar bu şekilde kullanır.",
        },
        {
          title: "ADIM 4: CNAME Kaydını Ekleyin (WWW Alt Alan Adı)",
          content: "Şimdi ikinci bir kayıt ekleyin. CNAME kaydı bir takma ad oluşturur — \"www.sizin domain.com\" adresinin \"sizin domain.com\" ile aynı yere yönlenmesini sağlar.\n\nTekrar \"Kayıt Ekle\" butonuna tıklayın ve şunları doldurun:\n\n• Tür / Kayıt Tipi: Açılır menüden \"CNAME\" seçin\n• Host / Ad / Sunucu Adı: \"www\" yazın (sadece bu üç harf, başka bir şey değil)\n• Yönlendir / Değer / Takma Ad: \"cname.vercel-dns.com\" yazın (bu Vercel'in takma ad sunucusudur)\n• TTL: Varsayılan olarak bırakın veya 3600\n\n\"Kaydet\" veya \"Kayıt Ekle\" butonuna tıklayın.",
        },
        {
          title: "ADIM 5: Yayılma Süresini Bekleyin",
          content: "Tebrikler — DNS ayarlarınızı yapılandırdınız! Şimdi beklemeniz gerekiyor. DNS değişiklikleri anında etkili olmaz. Dünya çapında binlerce sunucuya yayılması gerekir. Bu sürece \"yayılma\" (propagation) denir ve genellikle 30 dakika ile 24 saat arasında sürer, ancak çoğu zaman çok daha hızlı tamamlanır.\n\nBu bekleme süresinde, web siteniz telefonunuzda çalışıp dizüstü bilgisayarınızda çalışmayabilir veya tam tersi olabilir. Bu tamamen normaldir. Sadece değişikliklerin hâlâ yayılmakta olduğu anlamına gelir. Birkaç saat sonra siteniz her yerden erişilebilir olacaktır.\n\nDomain'inizin doğru yönlenip yönlenmediğini kontrol etmek için https://www.whatsmydns.net adresini ziyaret edip alan adınızı girebilirsiniz — bu site, dünya çapındaki sunuculardan hangilerinin değişikliği gördüğünü size gösterir.",
          warning: "Bu bekleme süresi boyunca DNS kayıtlarınızı TEKRAR değiştirmeyin. Kayıtları tekrar tekrar değiştirmek, yayılma süresini sıfırdan başlatır ve daha da uzun beklemenize neden olur. 24 saat sonra hâlâ bir sorun varsa bizimle iletişime geçin, sorunu birlikte çözelim.",
        },
      ],
    },
  },
  email: {
    en: {
      title: "Professional Email Setup",
      description: "Configure your domain for reliable and secure email communication. These settings work with any email provider.",
      checklistTitle: "What You Need Before Starting",
      checklistItems: [
        "DNS access to your domain provider",
        "Your email account credentials (provided by Novatrum)",
        "About 15 minutes of your time",
      ],
      steps: [
        {
          title: "STEP 1: Adding MX Records",
          content: "MX records (Mail Exchange) tell the internet where to deliver your emails. Think of them as the postal service for your domain — they route incoming mail to the correct mail server.\n\nLog into your domain provider's DNS settings (same place where you added A and CNAME records). Look for existing MX records and remove any old ones first — keeping old records alongside new ones will cause delivery conflicts.\n\nThen add the MX records provided by Novatrum. The exact values depend on your email setup — you'll find them in your onboarding email or Novatrum dashboard.",
          warning: "Make sure to remove ALL old MX records before adding new ones. Having multiple conflicting MX records will cause emails to bounce or get lost.",
        },
        {
          title: "STEP 2: Setting up SPF/TXT Records (Anti-Spam Protection)",
          content: "SPF (Sender Policy Framework) is a security measure that prevents spammers from sending emails that appear to come from your domain. Without it, your legitimate emails may end up in your clients' spam folders.\n\nTo set up SPF, add a new TXT record in your DNS settings:\n\n• Type: Select \"TXT\" from the dropdown\n• Host / Name: Type \"@\" (your root domain)\n• Value: Type \"v=spf1 include:_spf.relay.mailprotect.be -all\"\n\nThis tells email providers: \"Only the servers listed here are authorized to send email from my domain. Reject everything else.\"",
        },
        {
          title: "STEP 3: Device Configuration (Outlook / Apple Mail / Gmail)",
          content: "Once DNS records have propagated (this can take up to 2 hours), you can connect your new email address to your preferred email application.\n\nYou'll need the following information, which you can find in your Novatrum dashboard under \"Credentials\":\n\n• Email address: Your full email (e.g., info@yourdomain.com)\n• Password: The secure password we generated for you\n• Incoming mail server (IMAP): mail.mailprotect.be\n• Outgoing mail server (SMTP): relay.mailprotect.be\n• Port: 993 (IMAP) and 587 (SMTP)\n• SSL: Enabled (required)\n\nMost email apps will auto-detect these settings when you enter your email address. If prompted, choose \"IMAP\" (not POP3) as the account type.",
        },
      ],
    },
    nl: {
      title: "Professionele E-mail Instellen",
      description: "Configureer uw domein voor betrouwbare en veilige e-mailcommunicatie. Deze instellingen werken met elke e-mailprovider.",
      checklistTitle: "Wat U Nodig Heeft Voordat U Begint",
      checklistItems: [
        "DNS-toegang tot uw domeinprovider",
        "Uw e-mailaccountgegevens (verstrekt door Novatrum)",
        "Ongeveer 15 minuten van uw tijd",
      ],
      steps: [
        {
          title: "STAP 1: MX-Records Toevoegen",
          content: "MX-records (Mail Exchange) vertellen het internet waar uw e-mails naartoe moeten. Zie ze als de postdienst voor uw domein — ze sturen inkomende e-mails naar de juiste mailserver.\n\nLog in op de DNS-instellingen van uw domeinprovider (dezelfde plek waar u A- en CNAME-records heeft toegevoegd). Zoek naar bestaande MX-records en verwijder eerst eventuele oude — oude records naast nieuwe houden veroorzaakt bezorgingsconflicten.\n\nVoeg daarna de MX-records toe die door Novatrum zijn verstrekt. De exacte waarden vindt u in uw onboarding-e-mail of Novatrum-dashboard.",
          warning: "Verwijder ALLE oude MX-records voordat u nieuwe toevoegt. Meerdere conflicterende MX-records zorgen ervoor dat e-mails worden geweigerd of verloren gaan.",
        },
        {
          title: "STAP 2: SPF/TXT-Records Instellen (Anti-Spam Bescherming)",
          content: "SPF (Sender Policy Framework) is een beveiligingsmaatregel die voorkomt dat spammers e-mails versturen die van uw domein lijken te komen. Zonder SPF kunnen uw legitieme e-mails in de spammappen van uw klanten belanden.\n\nOm SPF in te stellen, voegt u een nieuw TXT-record toe in uw DNS-instellingen:\n\n• Type: Selecteer \"TXT\" uit het dropdown-menu\n• Host / Naam: Typ \"@\" (uw hoofddomein)\n• Waarde: Typ \"v=spf1 include:_spf.relay.mailprotect.be -all\"\n\nDit vertelt e-mailproviders: \"Alleen de hier genoemde servers mogen e-mail verzenden vanaf mijn domein.\"",
        },
        {
          title: "STAP 3: Apparaat Configureren (Outlook / Apple Mail / Gmail)",
          content: "Zodra de DNS-records zijn gepropageerd (dit kan tot 2 uur duren), kunt u uw nieuwe e-mailadres verbinden met uw favoriete e-mailprogramma.\n\nU heeft de volgende informatie nodig, die u kunt vinden in uw Novatrum-dashboard onder \"Credentials\":\n\n• E-mailadres: Uw volledige e-mail (bijv. info@uwdomein.com)\n• Wachtwoord: Het veilige wachtwoord dat wij voor u hebben gegenereerd\n• Inkomende mailserver (IMAP): mail.mailprotect.be\n• Uitgaande mailserver (SMTP): relay.mailprotect.be\n• Poort: 993 (IMAP) en 587 (SMTP)\n• SSL: Ingeschakeld (verplicht)\n\nDe meeste e-mailapps detecteren deze instellingen automatisch wanneer u uw e-mailadres invoert. Kies \"IMAP\" (niet POP3) als accounttype.",
        },
      ],
    },
    fr: {
      title: "Configuration E-mail Professionnelle",
      description: "Configurez votre domaine pour une communication par e-mail fiable et sécurisée. Ces paramètres fonctionnent avec n'importe quel fournisseur.",
      checklistTitle: "Ce Dont Vous Avez Besoin Avant de Commencer",
      checklistItems: [
        "Accès DNS à votre fournisseur de domaine",
        "Vos identifiants de compte e-mail (fournis par Novatrum)",
        "Environ 15 minutes de votre temps",
      ],
      steps: [
        {
          title: "ÉTAPE 1: Ajouter les Enregistrements MX",
          content: "Les enregistrements MX (Mail Exchange) indiquent à Internet où livrer vos e-mails. Considérez-les comme le service postal de votre domaine.\n\nConnectez-vous aux paramètres DNS de votre fournisseur. Supprimez d'abord les anciens enregistrements MX. Ajoutez ensuite les enregistrements MX fournis par Novatrum.",
          warning: "Supprimez TOUS les anciens enregistrements MX avant d'en ajouter de nouveaux.",
        },
        {
          title: "ÉTAPE 2: Configurer SPF/TXT (Anti-Spam)",
          content: "Ajoutez un nouvel enregistrement TXT:\n\n• Type: TXT\n• Hôte: @\n• Valeur: v=spf1 include:_spf.relay.mailprotect.be -all",
        },
        {
          title: "ÉTAPE 3: Configurer Vos Appareils",
          content: "Utilisez les identifiants de votre tableau de bord Novatrum. Serveur IMAP: mail.mailprotect.be, SMTP: relay.mailprotect.be. Choisissez \"IMAP\" comme type de compte.",
        },
      ],
    },
    tr: {
      title: "Profesyonel E-posta Kurulumu",
      description: "Alan adınızı güvenilir ve güvenli e-posta iletişimi için yapılandırın. Bu ayarlar tüm e-posta sağlayıcılarıyla çalışır.",
      checklistTitle: "Başlamadan Önce Gerekenler",
      checklistItems: [
        "Domain sağlayıcınızın DNS ayarlarına erişim",
        "E-posta hesap bilgileriniz (Novatrum tarafından verilir)",
        "Yaklaşık 15 dakika ayırmanız yeterli",
      ],
      steps: [
        {
          title: "ADIM 1: MX Kayıtlarını Ekleme",
          content: "MX kayıtları (Mail Exchange), internet'e e-postalarınızın nereye teslim edileceğini söyler. Onları domain'inizin posta servisi gibi düşünün — gelen e-postaları doğru sunucuya yönlendirirler.\n\nDomain sağlayıcınızın DNS ayarlarına giriş yapın (A ve CNAME kayıtlarını eklediğiniz yerle aynı). Önce mevcut eski MX kayıtlarını bulun ve hepsini silin — eski kayıtları yenileriyle birlikte tutmak teslimat sorunlarına yol açar.\n\nArdından Novatrum tarafından sağlanan MX kayıtlarını ekleyin. Kesin değerleri, size gönderilen hoş geldiniz e-postasında veya Novatrum kontrol panelinizde bulabilirsiniz.",
          warning: "Yeni kayıtları eklemeden önce TÜM eski MX kayıtlarını sildiğinizden emin olun. Birden fazla çakışan MX kaydı, e-postaların geri dönmesine veya kaybolmasına neden olur.",
        },
        {
          title: "ADIM 2: SPF/TXT Kaydı Kurulumu (Anti-Spam Koruması)",
          content: "SPF (Sender Policy Framework), spam gönderenlerin sizin domain'inizden geliyormuş gibi görünen e-postalar göndermesini engelleyen bir güvenlik önlemidir. SPF olmadan, gerçek e-postalarınız müşterilerinizin spam klasörlerine düşebilir.\n\nSPF kurmak için DNS ayarlarınıza yeni bir TXT kaydı ekleyin:\n\n• Tür: Açılır menüden \"TXT\" seçin\n• Host / Ad: \"@\" yazın (ana domain'iniz)\n• Değer: \"v=spf1 include:_spf.relay.mailprotect.be -all\" yazın\n\nBu, e-posta sağlayıcılarına şu mesajı verir: \"Sadece burada listelenen sunucular benim domain'imden e-posta gönderme yetkisine sahiptir. Diğer her şeyi reddedin.\"",
        },
        {
          title: "ADIM 3: Cihaz Yapılandırması (Outlook / Apple Mail / Gmail)",
          content: "DNS kayıtları yayıldıktan sonra (bu 2 saate kadar sürebilir), yeni e-posta adresinizi tercih ettiğiniz e-posta uygulamasına bağlayabilirsiniz.\n\nNovatrum kontrol panelinizde \"Kimlik Bilgileri\" bölümünde bulabileceğiniz şu bilgilere ihtiyacınız olacak:\n\n• E-posta adresi: Tam e-posta adresiniz (örn: info@sizin domain.com)\n• Şifre: Sizin için oluşturduğumuz güvenli şifre\n• Gelen posta sunucusu (IMAP): mail.mailprotect.be\n• Giden posta sunucusu (SMTP): relay.mailprotect.be\n• Port: 993 (IMAP) ve 587 (SMTP)\n• SSL: Etkin (zorunlu)\n\nÇoğu e-posta uygulaması, e-posta adresinizi girdiğinizde bu ayarları otomatik olarak algılar. Hesap türü sorulursa \"IMAP\" seçin (POP3 değil).",
        },
      ],
    },
  },
  troubleshooting: {
    en: {
      title: "Emergency & Troubleshooting",
      description: "What to do when things don't go as planned. Quick fixes for common issues and how to reach us for urgent help.",
      checklistTitle: "Quick Diagnostic Checklist",
      checklistItems: [
        "Check if your domain is accessible from another device or network",
        "Verify your DNS changes on whatsmydns.net",
        "Contact us immediately if you see a server error (500)",
      ],
      steps: [
        {
          title: "1. My Website Shows \"Domain Not Found\" or \"This Site Can't Be Reached\"",
          content: "This almost always means your DNS changes are still propagating. When you change DNS records, the update needs to spread across thousands of internet servers worldwide. This process typically takes 30 minutes to 24 hours.\n\nWhat to do:\n• Wait. Seriously — in 95% of cases, the problem resolves itself within a few hours\n• Visit https://www.whatsmydns.net, enter your domain name, and select \"A\" record type. If some locations show \"76.76.21.21\" and others don't, propagation is still in progress\n• Try accessing your site from a different device (phone vs laptop) or different network (WiFi vs mobile data)\n• Clear your browser cache or try opening your site in a private/incognito window\n\nIf it's been more than 24 hours and your site still doesn't work, contact us — we'll investigate immediately.",
        },
        {
          title: "2. I See \"500 Internal Server Error\" or Similar Error Message",
          content: "A 500 error means our automated monitoring systems have already detected the issue and alerted the engineering team. You don't need to report this — we're already working on it.\n\nWhat happens behind the scenes:\n• Our uptime monitoring detects the error within 60 seconds\n• The engineering team receives an urgent notification\n• We begin diagnosing and deploying a fix\n• Most 500 errors are resolved within 15-30 minutes\n\nYou can check the current status of our infrastructure at any time in your Novatrum dashboard under \"System Status\".",
        },
        {
          title: "3. The Golden Rule: Don't Touch DNS During Downtime",
          content: "This is the most important rule in troubleshooting. When your site is down, the natural instinct is to \"try something\" — to change a setting, delete a record, or add something new. RESIST THIS URGE.\n\nChanging DNS records during an outage does not fix the problem. Instead, it restarts the propagation timer, making the situation worse. Multiple changes in a row can extend a 30-minute outage into a 24-hour nightmare.\n\nOnly make DNS changes when:\n• We specifically ask you to\n• You are following the setup guide for the first time\n• You are certain the site is working and you're making a planned update",
          warning: "Never delete or change DNS records to \"test\" if it fixes the problem. If you suspect a DNS issue, contact us first. We can check everything from our end in seconds.",
        },
        {
          title: "4. Requesting Immediate Assistance",
          content: "If you need urgent help, the fastest way to reach us is through your Novatrum dashboard:\n\n1. Log into your account\n2. Navigate to the Support Desk section\n3. Create a new ticket and mark it as \"URGENT\"\n4. Describe what you're seeing (include any error codes or screenshots)\n\nAn engineer will respond via the real-time chat system — no page refreshing needed. We aim to acknowledge all urgent tickets within 30 minutes during business hours.\n\nFor non-urgent questions, you can also email us at info@novatrum.eu. We typically respond within 24 hours.",
        },
      ],
    },
    nl: {
      title: "Noodgevallen & Probleemoplossing",
      description: "Wat te doen wanneer dingen niet volgens plan verlopen. Snelle oplossingen voor veelvoorkomende problemen en hoe u ons kunt bereiken voor dringende hulp.",
      checklistTitle: "Snelle Diagnostische Checklist",
      checklistItems: [
        "Controleer of uw domein bereikbaar is vanaf een ander apparaat of netwerk",
        "Verifieer uw DNS-wijzigingen op whatsmydns.net",
        "Neem direct contact met ons op bij een serverfout (500)",
      ],
      steps: [
        {
          title: "1. Mijn Website Toont \"Domain Not Found\" of \"Deze Site Is Niet Bereikbaar\"",
          content: "Dit betekent bijna altijd dat uw DNS-wijzigingen nog aan het propageren zijn. Dit proces duurt meestal 30 minuten tot 24 uur.\n\nWat te doen:\n• Wacht — in 95% van de gevallen lost het probleem zichzelf op\n• Bezoek https://www.whatsmydns.net en voer uw domein in\n• Probeer uw site vanaf een ander apparaat of netwerk\n• Wis uw browsercache of gebruik een privévenster\n\nAls het na 24 uur nog niet werkt, neem dan contact met ons op.",
        },
        {
          title: "2. Ik Zie \"500 Internal Server Error\"",
          content: "Een 500-fout betekent dat onze systemen het probleem al hebben gedetecteerd. We zijn er al mee bezig — de meeste 500-fouten zijn binnen 15-30 minuten opgelost.",
        },
        {
          title: "3. De Gouden Regel: Verander DNS Niet Tijdens Storingen",
          content: "Wijzig GEEN DNS-records tijdens een storing. Dit herstart de propagatietimer en maakt het probleem alleen maar erger.",
          warning: "Verwijder of wijzig nooit records om te 'testen' of het het probleem oplost. Neem eerst contact met ons op.",
        },
        {
          title: "4. Dringende Hulp Aanvragen",
          content: "Log in op uw dashboard, ga naar de Support Desk, maak een ticket aan en markeer het als \"URGENT\". Een engineer reageert via de real-time chat. Voor niet-dringende vragen: info@novatrum.eu.",
        },
      ],
    },
    fr: {
      title: "Urgences & Dépannage",
      description: "Que faire quand les choses ne se passent pas comme prévu. Solutions rapides et comment nous contacter.",
      checklistTitle: "Diagnostic Rapide",
      checklistItems: [
        "Vérifiez si votre domaine est accessible depuis un autre appareil",
        "Vérifiez vos modifications DNS sur whatsmydns.net",
        "Contactez-nous immédiatement en cas d'erreur serveur (500)",
      ],
      steps: [
        {
          title: "1. Mon Site Affiche \"Domaine Introuvable\"",
          content: "Cela signifie que vos modifications DNS sont encore en cours de propagation (30 min à 24h). Attendez — dans 95% des cas, le problème se résout tout seul.",
        },
        {
          title: "2. Je Vois \"500 Internal Server Error\"",
          content: "Nos systèmes ont déjà détecté le problème. La plupart des erreurs 500 sont résolues en 15-30 minutes.",
        },
        {
          title: "3. La Règle d'Or",
          content: "Ne modifiez PAS vos enregistrements DNS pendant une panne.",
          warning: "Ne supprimez jamais d'enregistrements pour 'tester'. Contactez-nous d'abord.",
        },
        {
          title: "4. Demander une Assistance Immédiate",
          content: "Créez un ticket URGENT via votre tableau de bord. Pour les questions non urgentes: info@novatrum.eu.",
        },
      ],
    },
    tr: {
      title: "Acil Durum ve Sorun Giderme",
      description: "İşler planlandığı gibi gitmediğinde ne yapmalısınız. Yaygın sorunlar için hızlı çözümler ve acil yardım için bize nasıl ulaşacağınız.",
      checklistTitle: "Hızlı Teşhis Kontrol Listesi",
      checklistItems: [
        "Domain'inize başka bir cihazdan veya ağdan erişilip erişilmediğini kontrol edin",
        "DNS değişikliklerinizi whatsmydns.net üzerinde doğrulayın",
        "Sunucu hatası (500) görürseniz hemen bizimle iletişime geçin",
      ],
      steps: [
        {
          title: "1. Web Sitem \"Domain Not Found\" veya \"Bu Siteye Ulaşılamıyor\" Gösteriyor",
          content: "Bu neredeyse her zaman DNS değişikliklerinizin hâlâ yayılmakta olduğu anlamına gelir. DNS kayıtlarını değiştirdiğinizde, güncellemenin dünya çapında binlerce internet sunucusuna yayılması gerekir. Bu süreç genellikle 30 dakika ile 24 saat arasında sürer.\n\nNe yapmalısınız:\n• Bekleyin. Cidden — vakaların %95'inde sorun birkaç saat içinde kendiliğinden çözülür\n• https://www.whatsmydns.net adresini ziyaret edin, alan adınızı girin ve \"A\" kayıt tipini seçin. Bazı konumlar \"76.76.21.21\" gösterirken diğerleri göstermiyorsa, yayılma hâlâ devam ediyordur\n• Sitenize farklı bir cihazdan (telefon vs dizüstü) veya farklı bir ağdan (WiFi vs mobil veri) erişmeyi deneyin\n• Tarayıcı önbelleğinizi temizleyin veya sitenizi gizli/incognito pencerede açmayı deneyin\n\n24 saatten fazla zaman geçtiyse ve siteniz hâlâ çalışmıyorsa bizimle iletişime geçin — hemen incelemeye alırız.",
        },
        {
          title: "2. \"500 Internal Server Error\" veya Benzeri Bir Hata Görüyorum",
          content: "500 hatası, otomatik izleme sistemlerimizin sorunu zaten tespit ettiği ve mühendislik ekibini uyardığı anlamına gelir. Bunu bildirmenize gerek yok — zaten üzerinde çalışıyoruz.\n\nPerde arkasında neler olur:\n• Çalışma süresi takip sistemimiz hatayı 60 saniye içinde algılar\n• Mühendislik ekibi acil bir bildirim alır\n• Teşhis koymaya ve düzeltme yayınlamaya başlarız\n• Çoğu 500 hatası 15-30 dakika içinde çözülür\n\nNovatrum kontrol panelinizde \"Sistem Durumu\" altından altyapımızın güncel durumunu her zaman kontrol edebilirsiniz.",
        },
        {
          title: "3. Altın Kural: Kesinti Sırasında DNS'e Dokunmayın",
          content: "Bu, sorun gidermedeki en önemli kuraldır. Siteniz kapalıyken, doğal içgüdü \"bir şeyler denemek\" olur — bir ayarı değiştirmek, bir kaydı silmek veya yeni bir şey eklemek. BU DÜRTÜYE DİRENİN.\n\nBir kesinti sırasında DNS kayıtlarını değiştirmek sorunu çözmez. Bunun yerine, yayılma süresini sıfırlayarak durumu daha da kötüleştirir. Art arda yapılan değişiklikler, 30 dakikalık bir kesintiyi 24 saatlik bir kabusa dönüştürebilir.\n\nSadece şu durumlarda DNS değişikliği yapın:\n• Size özellikle söylediğimizde\n• Kurulum rehberini ilk kez takip ediyorsanız\n• Sitenin çalıştığından eminseniz ve planlı bir güncelleme yapıyorsanız",
          warning: "Sorunu çözüp çözmediğini \"test etmek\" için asla DNS kayıtlarını silmeyin veya değiştirmeyin. Bir DNS sorunundan şüpheleniyorsanız, önce bizimle iletişime geçin. Saniyeler içinde her şeyi kendi tarafımızdan kontrol edebiliriz.",
        },
        {
          title: "4. Anında Destek Talep Etme",
          content: "Acil yardıma ihtiyacınız varsa, bize ulaşmanın en hızlı yolu Novatrum kontrol panelinizdir:\n\n1. Hesabınıza giriş yapın\n2. Destek Masası (Support Desk) bölümüne gidin\n3. Yeni bir bilet oluşturun ve \"URGENT\" (Acil) olarak işaretleyin\n4. Gördüğünüz şeyi açıklayın (hata kodlarını veya ekran görüntülerini ekleyin)\n\nBir mühendis gerçek zamanlı sohbet sistemi üzerinden yanıt verecektir — sayfa yenilemeye gerek yok. Mesai saatleri içinde tüm acil biletleri 30 dakika içinde yanıtlamayı hedefliyoruz.\n\nAcil olmayan sorular için info@novatrum.eu adresinden de bize e-posta gönderebilirsiniz. Genellikle 24 saat içinde yanıt veriyoruz.",
        },
      ],
    },
  },
};