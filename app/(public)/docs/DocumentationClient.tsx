"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Copy, CheckCircle2, Server, Mail, UserCircle, CheckSquare, Square, AlertTriangle } from "lucide-react";

type Language = "en" | "nl" | "fr" | "tr";
type DocType = "dns" | "email" | "portal" | "troubleshooting";

interface DocContent {
  title: string;
  description: string;
  checklistTitle: string;
  checklistItems: string[];
  steps: { title: string; content: string; warning?: string; image?: string }[];
}

const contentData: Record<DocType, Record<Language, DocContent>> = {
  dns: {
    en: {
      title: "DNS and Hosting Configuration",
      description: "Point your Combell domain to the Novatrum infrastructure.",
      checklistTitle: "Quick Setup Checklist",
      checklistItems: ["Configure DNS Settings (Combell)", "Add Email Records", "Login to Client Portal and view credentials"],
      steps: [
        { title: "STEP 1: Critical Cleanup", content: "Delete the 3 existing A records and 3 existing CNAME records in your Combell panel.", warning: "Do NOT touch the MX records (Email)." },
        { title: "STEP 2: Adding the A Record", content: "Add a new A record to connect your root domain.\nRecord: @ (or leave empty)\nIP Address: 76.76.21.21\nTTL: 3600", image: "/docs/A-record-EN.png" },
        { title: "STEP 3: Adding the CNAME Record", content: "Add a CNAME record for the 'www' prefix of your website.\nRecord: www\nValue: cname.vercel-dns.com\nTTL: 3600", image: "/docs/CNAME-records-EN.png" },
      ],
    },
    nl: {
      title: "DNS- en Hostingconfiguratie", description: "Verbind uw Combell domein met de Novatrum infrastructuur.", checklistTitle: "Snelle Installatie Checklist",
      checklistItems: ["Configureer DNS-instellingen (Combell)", "Voeg E-mailrecords toe", "Log in op het Client Portal en bekijk uw inloggegevens"],
      steps: [
        { title: "STAP 1: Belangrijke Opschoning", content: "Verwijder de 3 bestaande A-records en 3 bestaande CNAME-records in uw Combell paneel.", warning: "Raak de MX-records (E-mail) niet aan." },
        { title: "STAP 2: A-record Toevoegen", content: "Voeg een nieuw A-record toe om het hoofddomein te koppelen.\nRecord: @ (of leeg laten)\nIP-adres: 76.76.21.21\nTTL: 3600", image: "/docs/A-record-NL.png" },
        { title: "STAP 3: CNAME-record Toevoegen", content: "Voeg een CNAME-record toe voor de 'www' variant van uw website.\nRecord: www\nWaarde: cname.vercel-dns.com\nTTL: 3600", image: "/docs/CNAME-records-NL.png" },
      ],
    },
    fr: {
      title: "Configuration DNS et Hébergement", description: "Liez votre domaine Combell à l'infrastructure Novatrum.", checklistTitle: "Liste de contrôle d'installation rapide",
      checklistItems: ["Configurer les paramètres DNS (Combell)", "Ajouter les enregistrements d'e-mail", "Connectez-vous au Portail Client et consultez vos identifiants"],
      steps: [
        { title: "ÉTAPE 1: Nettoyage Critique", content: "Supprimez les 3 enregistrements A et les 3 enregistrements CNAME existants dans votre panneau Combell.", warning: "Ne modifiez PAS les enregistrements MX (E-mail)." },
        { title: "ÉTAPE 2: Ajouter un enregistrement A", content: "Ajoutez un nouvel enregistrement A pour lier le domaine principal.\nEnregistrement (Record): @ (ou laisser vide)\nAdresse IP: 76.76.21.21\nTTL: 3600", image: "/docs/A-record-FR.png" },
        { title: "ÉTAPE 3: Ajouter un enregistrement CNAME", content: "Ajoutez un enregistrement CNAME pour la variante 'www' de votre site.\nEnregistrement (Record): www\nValeur: cname.vercel-dns.com\nTTL: 3600", image: "/docs/CNAME-records-FR.png" },
      ],
    },
    tr: {
      title: "DNS ve Hosting Yapılandırması", description: "Combell alan adınızı Novatrum altyapısına bağlayın.", checklistTitle: "Hızlı Kurulum Kontrol Listesi",
      checklistItems: ["DNS Ayarlarını Yapılandırın (Combell)", "E-posta Kayıtlarını Ekleyin", "Müşteri Portalına giriş yapın ve kimlik bilgilerini görüntüleyin"],
      steps: [
        { title: "ADIM 1: Kritik Temizlik", content: "Combell panelinizdeki mevcut 3 adet A kaydını ve 3 adet CNAME kaydını silin.", warning: "MX (E-posta) kayıtlarına kesinlikle DOKUNMAYIN." },
        { title: "ADIM 2: A Kaydının Eklenmesi", content: "Kök alan adınızı bağlamak için yeni bir A kaydı ekleyin.\nKayıt (Record): @ (veya boş bırakın)\nIP Adresi: 76.76.21.21\nTTL: 3600", image: "/docs/A-record-EN.png" },
        { title: "ADIM 3: CNAME Kaydının Eklenmesi", content: "Web sitenizin 'www' ön eki için bir CNAME kaydı ekleyin.\nKayıt (Record): www\nDeğer (Value): cname.vercel-dns.com\nTTL: 3600", image: "/docs/CNAME-records-EN.png" },
      ],
    },
  },
  email: {
    en: { title: "Professional Email Setup", description: "Configure your domain for reliable and secure email communication.", checklistTitle: "Quick Setup Checklist", checklistItems: ["Configure DNS Settings (Combell)", "Add Email Records", "Login to Client Portal and view credentials"], steps: [{ title: "STEP 1: Adding MX Records", content: "MX records tell the internet where to deliver your emails. Please remove any old MX records first. Then, add the Novatrum-provided MX records to your Combell panel.", image: "/docs/MX-record-EN.png" }, { title: "STEP 2: Setting up SPF/TXT Records (Anti-Spam)", content: "To prevent your emails from landing in your clients' spam folders, you must add an SPF (TXT) record. This authenticates your domain.\n\nType: TXT\nRecord: @\nValue: v=spf1 include:_spf.relay.mailprotect.be -all" }, { title: "STEP 3: Device Configuration (Outlook / Apple Mail)", content: "Once the DNS records have propagated (can take up to 2 hours), you can connect your new email address to your preferred mail client. Use the secure credentials located in your Novatrum Client Portal under the 'Credentials' section." }] },
    nl: { title: "Professionele E-mail Instellen", description: "Configureer uw domein voor betrouwbare en veilige e-mailcommunicatie.", checklistTitle: "Snelle Installatie Checklist", checklistItems: ["Configureer DNS-instellingen (Combell)", "Voeg E-mailrecords toe", "Log in op het Client Portal en bekijk uw inloggegevens"], steps: [{ title: "STAP 1: MX-records Toevoegen", content: "MX-records vertellen het internet waar uw e-mails naartoe gestuurd moeten worden. Verwijder eerst eventuele oude MX-records. Voeg daarna de door Novatrum verstrekte MX-records toe in uw Combell paneel.", image: "/docs/MX-record-NL.png" }, { title: "STAP 2: SPF/TXT-records Instellen (Anti-Spam)", content: "Om te voorkomen dat uw e-mails in de spam-map van uw klanten belanden, moet u een TXT-record toevoegen. Dit SPF-record bewijst dat de servers namens uw domein e-mails mogen verzenden.\n\nType: TXT\nRecord: @\nWaarde: v=spf1 include:_spf.relay.mailprotect.be -all" }, { title: "STAP 3: Apparaten Koppelen (Outlook / Apple Mail)", content: "Zodra de DNS-records zijn ingesteld (dit kan tot 2 uur duren), kunt u uw nieuwe e-mailadres toevoegen aan uw favoriete mailprogramma. Gebruik hiervoor de inloggegevens die u veilig kunt terugvinden in uw Novatrum Client Portal onder de sectie 'Credentials'." }] },
    fr: { title: "Configuration E-mail Professionnelle", description: "Configurez votre domaine pour une communication par e-mail fiable et sécurisée.", checklistTitle: "Liste de contrôle d'installation rapide", checklistItems: ["Configurer les paramètres DNS (Combell)", "Ajouter les enregistrements d'e-mail", "Connectez-vous au Portail Client et consultez vos identifiants"], steps: [{ title: "ÉTAPE 1: Ajouter les enregistrements MX", content: "Les enregistrements MX indiquent à Internet où envoyer vos e-mails. Supprimez d'abord les anciens enregistrements MX. Ensuite, ajoutez les enregistrements MX fournis par Novatrum dans votre panneau Combell.", image: "/docs/MX-record-FR.png" }, { title: "ÉTAPE 2: Configuration des enregistrements SPF/TXT (Anti-Spam)", content: "Pour éviter que vos e-mails n'atterrissent dans les spams, vous devez ajouter un enregistrement TXT (SPF). Cela prouve que nos serveurs sont autorisés à envoyer des e-mails en votre nom.\n\nType: TXT\nEnregistrement (Record): @\nValeur: v=spf1 include:_spf.relay.mailprotect.be -all" }, { title: "ÉTAPE 3: Connecter vos appareils (Outlook / Apple Mail)", content: "Une fois les enregistrements DNS configurés (cela peut prendre jusqu'à 2 heures), vous pouvez ajouter votre nouvelle adresse à votre client de messagerie préféré. Utilisez les identifiants que vous trouverez en toute sécurité dans votre Portail Client Novatrum sous la section 'Credentials'." }] },
    tr: { title: "Profesyonel E-posta Kurulumu", description: "Alan adınızı güvenilir ve güvenli e-posta iletişimi için yapılandırın.", checklistTitle: "Hızlı Kurulum Kontrol Listesi", checklistItems: ["DNS Ayarlarını Yapılandırın (Combell)", "E-posta Kayıtlarını Ekleyin", "Müşteri Portalına giriş yapın ve kimlik bilgilerini görüntüleyin"], steps: [{ title: "ADIM 1: MX Kayıtlarının Eklenmesi", content: "MX kayıtları, internete e-postalarınızın nereye teslim edileceğini söyler. Lütfen önce eski MX kayıtlarını kaldırın. Ardından, Novatrum tarafından sağlanan MX kayıtlarını Combell panelinize ekleyin.", image: "/docs/MX-record-EN.png" }, { title: "ADIM 2: SPF/TXT Kayıtlarının Kurulumu (Anti-Spam)", content: "E-postalarınızın müşterilerinizin spam klasörlerine düşmesini önlemek için bir SPF (TXT) kaydı eklemelisiniz. Bu, alan adınızın kimliğini doğrular.\n\nTür: TXT\nKayıt (Record): @\nDeğer (Value): v=spf1 include:_spf.relay.mailprotect.be -all" }, { title: "ADIM 3: Cihaz Yapılandırması (Outlook / Apple Mail)", content: "DNS kayıtları yayıldıktan sonra (2 saate kadar sürebilir), yeni e-posta adresinizi tercih ettiğiniz posta istemcisine bağlayabilirsiniz. Novatrum Müşteri Portalınızda 'Credentials' (Kimlik Bilgileri) bölümünde bulunan güvenli kimlik bilgilerini kullanın." }] },
  },
  portal: {
    en: { title: "Client Portal Guide", description: "A comprehensive overview of your personalized Novatrum dashboard features.", checklistTitle: "Welcome to Novatrum", checklistItems: ["View live system status", "Check outstanding invoices", "Access your Secure Vault"], steps: [{ title: "1. Dashboard Overview", content: "Your Client Portal is designed to give you complete transparency and control over your project. The image below highlights the key sections of your dashboard.", image: "/docs/client-portal-overview.png" }, { title: "2. Project Tracking & Deployment Ledger", content: "Under the main project panel, track your development progress. We display the current Phase, Architecture Load (%), accumulated Engineering Time, and a live Deployment Ledger showing recent updates." }, { title: "3. Ledger & Invoices", content: "On the left side, manage your finances seamlessly. View the status of all your invoices (Unpaid/Paid), check reference numbers, and open detailed breakdowns using the 'VIEW' button." }, { title: "4. Secure Vault & Credentials", content: "The Secure Vault is a heavily encrypted environment within your portal. Find your email passwords here, and use this space to securely share sensitive credentials with the Novatrum engineering team without relying on vulnerable emails." }, { title: "5. Real-time Support Desk", content: "Located at the top right, the Support Desk is powered by WebSocket technology. Create tickets or communicate with our engineers in real-time without ever needing to refresh your page." }] },
    nl: { title: "Client Portal Gids", description: "Een overzicht van uw gepersonaliseerde Novatrum dashboard en functies.", checklistTitle: "Welkom bij Novatrum", checklistItems: ["Bekijk de live systeemstatus", "Controleer uw openstaande facturen", "Toegang tot uw beveiligde kluis (Secure Vault)"], steps: [{ title: "1. Dashboard Overzicht", content: "Uw Client Portal is ontworpen om u volledige transparantie en controle te geven over uw project. In de onderstaande afbeelding ziet u de belangrijkste secties genummerd en uitgelicht.", image: "/docs/client-portal-overview.png" }, { title: "2. Project Tracking & Deployment Ledger", content: "Onder het projectpaneel kunt u de exacte voortgang zien. Wij tonen de huidige projectfase (Phase), de architectuur belasting (Architecture Load %), de totale ontwikkeltijd (Engineering Time) en een logboek van alle implementaties (Deployment Ledger)." }, { title: "3. Ledger & Facturen", content: "Aan de linkerkant vindt u uw financiële overzicht. Hier kunt u de status van al uw facturen (Betaald/Onbetaald) bekijken, referentienummers inzien en direct de details openen via de 'VIEW' knop." }, { title: "4. Secure Vault & Credentials", content: "The Secure Vault is een zwaar versleutelde omgeving binnen uw portaal. Hier vindt u uw e-mailwachtwoorden, en kunt u veilig gevoelige informatie, zoals API-sleutels, delen met het Novatrum engineering team zonder e-mail te hoeven gebruiken." }, { title: "5. Real-time Support Desk", content: "Rechtsboven vindt u de 'Support Desk'. Ons systeem werkt met WebSockets, wat betekent dat u live met ons team kunt chatten of tickets kunt aanmaken zonder de pagina te verversen." }] },
    fr: { title: "Guide du Portail Client", description: "Un aperçu de votre tableau de bord Novatrum personnalisé et de ses fonctionnalités.", checklistTitle: "Bienvenue chez Novatrum", checklistItems: ["Consultez l'état du système en direct", "Vérifiez vos factures impayées", "Accédez à votre coffre-fort sécurisé (Secure Vault)"], steps: [{ title: "1. Aperçu du Tableau de Bord", content: "Votre Portail Client est conçu pour vous offrir une transparence et un contrôle total sur votre projet. L'image ci-dessous met en évidence les sections principales.", image: "/docs/client-portal-overview.png" }, { title: "2. Suivi de Projet et Journal de Déploiement", content: "Dans le panneau du projet, vous pouvez suivre l'avancement exact. Nous affichons la phase actuelle, la charge d'architecture (%), le temps d'ingénierie et un journal de tous les déploiements (Deployment Ledger)." }, { title: "3. Registre et Factures", content: "Sur le côté gauche se trouve votre aperçu financier. Consultez l'état de vos factures (Payé/Impayé), les numéros de référence et ouvrez les détails avec le bouton 'VIEW'." }, { title: "4. Secure Vault & Credentials", content: "Le Secure Vault est un environnement hautement crypté. Vous y trouverez vos mots de passe de messagerie et pourrez partager en toute sécurité des informations sensibles avec notre équipe d'ingénierie sans utiliser d'e-mails." }, { title: "5. Centre d'Assistance en Temps Réel", content: "En haut à droite se trouve le 'Support Desk'. Notre système utilise des WebSockets, ce qui vous permet de discuter en direct avec notre équipe ou de créer des tickets sans rafraîchir la page." }] },
    tr: { title: "Müşteri Portalı Rehberi", description: "Kişiselleştirilmiş Novatrum kontrol paneli özelliklerinize kapsamlı bir bakış.", checklistTitle: "Novatrum'a Hoş Geldiniz", checklistItems: ["Canlı sistem durumunu görüntüleyin", "Ödenmemiş faturaları kontrol edin", "Güvenli Kasanıza (Secure Vault) erişin"], steps: [{ title: "1. Kontrol Paneline Genel Bakış", content: "Müşteri Portalınız, projeniz üzerinde size tam şeffaflık ve kontrol sağlamak üzere tasarlanmıştır. Aşağıdaki görsel, kontrol panelinizin temel bölümlerini vurgulamaktadır.", image: "/docs/client-portal-overview.png" }, { title: "2. Proje Takibi ve Dağıtım Günlüğü (Ledger)", content: "Ana proje panelinin altında, geliştirme ilerlemenizi takip edin. Mevcut Aşama (Phase), Mimari Yük (Architecture Load %), birikmiş Mühendislik Süresi (Engineering Time) ve son güncellemeleri gösteren canlı bir Dağıtım Günlüğü (Deployment Ledger) görüntülüyoruz." }, { title: "3. Fatura ve Kayıtlar", content: "Sol tarafta finansal işlemlerinizi sorunsuzca yönetin. Tüm faturalarınızın durumunu (Ödenmemiş/Ödendi) görüntüleyin, referans numaralarını kontrol edin ve 'VIEW' düğmesini kullanarak ayrıntılı dökümleri açın." }, { title: "4. Güvenli Kasa ve Kimlik Bilgileri", content: "Güvenli Kasa (Secure Vault), portalınız içinde yoğun şekilde şifrelenmiş bir ortamdır. E-posta şifrelerinizi burada bulabilir ve savunmasız e-postalara güvenmeden Novatrum mühendislik ekibiyle hassas kimlik bilgilerini güvenli bir şekilde paylaşmak için bu alanı kullanabilirsiniz." }, { title: "5. Gerçek Zamanlı Destek Masası (Support Desk)", content: "Sağ üstte bulunan Destek Masası, WebSocket teknolojisi ile desteklenmektedir. Sayfanızı yenilemenize gerek kalmadan gerçek zamanlı olarak bilet (ticket) oluşturun veya mühendislerimizle iletişim kurun." }] },
  },
  troubleshooting: {
    en: { title: "Emergency & Troubleshooting", description: "Protocols for handling deployment errors, downtime, or system anomalies.", checklistTitle: "Initial Diagnostics", checklistItems: ["Check your Dashboard's System Status", "Verify if DNS is still propagating", "Submit an Urgent Ticket via Support Desk"], steps: [{ title: "1. Identifying the Error", content: "If you see a '500 Internal Server Error', our automated systems have already alerted the engineering team. If you see 'Domain Not Found', it usually means your recent Combell DNS changes are still propagating across the internet (this can take 2-24 hours)." }, { title: "2. Check Infrastructure Status", content: "Log into your Novatrum Client Portal and look at the 'System Status' indicators on your main dashboard. If 'Logic Layers' or 'Database' is marked as 'Degraded' or 'Down', we are actively deploying a fix." }, { title: "3. The Golden Rule (Crucial)", content: "Do NOT modify your Combell DNS records or MX records during downtime. Changing records multiple times will restart the global propagation timer, significantly delaying your site's recovery.", warning: "Never delete or change records to 'test' a fix. Wait for instructions from Novatrum." }, { title: "4. Requesting Immediate Assistance", content: "Navigate to the Support Desk within your portal. Create a new ticket and ensure you mark it as 'URGENT'. Provide a brief description of the error code you are seeing. An engineer will respond via the real-time chat." }] },
    nl: { title: "Noodgevallen & Probleemoplossing", description: "Protocollen voor implementatiefouten, downtime of systeemafwijkingen.", checklistTitle: "Initiële Diagnostiek", checklistItems: ["Controleer de Systeemstatus op uw Dashboard", "Verifieer of DNS nog aan het propageren is", "Dien een Urgent Ticket in via de Support Desk"], steps: [{ title: "1. De Fout Identificeren", content: "Als u een '500 Internal Server Error' ziet, hebben onze geautomatiseerde systemen het engineering team al gewaarschuwd. Als u 'Domain Not Found' ziet, betekent dit meestal dat uw recente Combell DNS-wijzigingen nog over het internet worden verspreid (dit kan 2-24 uur duren)." }, { title: "2. Controleer Infrastructuurstatus", content: "Log in op uw Novatrum Client Portal en bekijk de 'System Status' indicatoren op uw hoofddashboard. Als 'Logic Layers' of 'Database' is gemarkeerd als 'Degraded' of 'Down', zijn we actief bezig met een oplossing." }, { title: "3. De Gouden Regel (Cruciaal)", content: "Wijzig uw Combell DNS-records of MX-records NIET tijdens downtime. Het meerdere keren wijzigen van records zal de wereldwijde propagatietimer resetten, wat het herstel van uw site aanzienlijk vertraagt.", warning: "Verwijder of wijzig nooit records om een oplossing te 'testen'. Wacht op instructies van Novatrum." }, { title: "4. Directe Hulp Aanvragen", content: "Ga naar de Support Desk in uw portaal. Maak een nieuw ticket aan en markeer het als 'URGENT'. Geef een korte beschrijving van de foutcode die u ziet. Een engineer zal reageren via de real-time chat." }] },
    fr: { title: "Urgences et Dépannage", description: "Protocoles pour les erreurs de déploiement, les temps d'arrêt ou les anomalies du système.", checklistTitle: "Diagnostics Initiaux", checklistItems: ["Vérifiez l'état du système sur votre tableau de bord", "Vérifiez si le DNS est toujours en cours de propagation", "Soumettre un ticket urgent via le Support Desk"], steps: [{ title: "1. Identification de l'Erreur", content: "Si vous voyez une 'Erreur de serveur interne 500', nos systèmes automatisés ont déjà alerté l'équipe d'ingénierie. Si vous voyez 'Domaine introuvable', cela signifie généralement que vos récentes modifications DNS Combell se propagent encore sur Internet (cela peut prendre de 2 à 24 heures)." }, { title: "2. Vérifier l'État de l'Infrastructure", content: "Connectez-vous à votre portail client Novatrum et regardez les indicateurs 'État du système'. Si 'Logic Layers' ou 'Database' est marqué comme 'Dégradé' (Degraded) ou 'En panne' (Down), nous déployons activement un correctif." }, { title: "3. La Règle d'Or (Cruciale)", content: "Ne modifiez PAS vos enregistrements DNS ou MX Combell pendant un temps d'arrêt. La modification répétée des enregistrements réinitialisera le délai de propagation global, retardant considérablement la récupération de votre site.", warning: "Ne supprimez ou ne modifiez jamais d'enregistrements pour 'tester' une solution. Attendez les instructions de Novatrum." }, { title: "4. Demander une Assistance Immédiate", content: "Accédez au Support Desk dans votre portail. Créez un nouveau ticket et assurez-vous de le marquer comme 'URGENT'. Fournissez une brève description du code d'erreur que vous voyez. Un ingénieur répondra via le chat en temps réel." }] },
    tr: { title: "Acil Durum ve Sorun Giderme", description: "Dağıtım hataları, sistem kesintileri veya sunucu anormallikleri için müdahale protokolleri.", checklistTitle: "İlk Teşhis Kontrolü", checklistItems: ["Kontrol Panelinizdeki Sistem Durumunu kontrol edin", "DNS yönlendirmesinin devam edip etmediğini doğrulayın", "Destek Masası üzerinden 'Acil' talebi oluşturun"], steps: [{ title: "1. Hatayı Tanımlama", content: "Eğer ekranda '500 Internal Server Error' görüyorsanız, otomatik izleme sistemlerimiz mühendislik ekibimizi çoktan uyarmıştır. Eğer 'Domain Not Found' (Alan Adı Bulunamadı) görüyorsanız, bu durum Combell üzerinden yaptığınız DNS değişikliklerinin henüz küresel olarak yayılmadığını gösterir (bu işlem 2-24 saat sürebilir)." }, { title: "2. Altyapı Durumunu Kontrol Etme", content: "Novatrum Müşteri Portalınıza giriş yapın ve ana paneldeki 'Sistem Durumu' göstergelerine bakın. Herhangi bir sistem 'Degraded' (Bozulmuş) veya 'Down' (Çevrimdışı) olarak işaretlenmişse, ekibimiz halihazırda bir düzeltme yayınlıyordur." }, { title: "3. Altın Kural (Kritik Öneme Sahip)", content: "Kesinti veya hata anında Combell DNS veya MX kayıtlarınızı KESİNLİKLE değiştirmeyin. Kayıtları üst üste değiştirmek, küresel yayılma süresini sıfırlar ve sitenizin kurtarılmasını önemli ölçüde geciktirir.", warning: "Bir sorunu 'deneme yanılma' ile çözmek için asla kayıtları silmeyin veya değiştirmeyin. Her zaman Novatrum'dan gelecek talimatları bekleyin." }, { title: "4. Anında Destek Talep Etme", content: "Portalınızdaki 'Support Desk' (Destek Masası) bölümüne gidin. Yeni bir bilet oluşturun ve bunu 'URGENT' (Acil) olarak işaretlediğinizden emin olun. Gördüğünüz hata kodunun kısa bir açıklamasını yazın. Bir mühendis gerçek zamanlı sohbet üzerinden size hemen yanıt verecektir." }] },
  },
};

export default function DocumentationClient() {
  const [lang, setLang] = useState<Language>("en");
  const [activeDoc, setActiveDoc] = useState<DocType>("dns");
  const [copied, setCopied] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const currentContent = contentData[activeDoc][lang];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleChecklist = (index: number) => {
    const newList = [...checklist];
    newList[index] = !newList[index];
    setChecklist(newList);
  };

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <div className="max-w-5xl mx-auto px-6 pt-36 pb-32">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">Documentation</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">{currentContent.title}</h1>
          <p className="text-sm text-zinc-400 font-light mt-3 max-w-lg">{currentContent.description}</p>
        </motion.div>

        {/* Lang Selector */}
        <div className="flex flex-wrap gap-3 mb-12">
          {(["en", "nl", "fr", "tr"] as Language[]).map((l: Language) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                lang === l ? "bg-black text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-black"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Doc Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-12 pb-2">
          {([
            { key: "dns", icon: Server, label: "DNS & Hosting" },
            { key: "email", icon: Mail, label: "Email Setup" },
            { key: "portal", icon: UserCircle, label: "Client Portal" },
            { key: "troubleshooting", icon: AlertTriangle, label: "Emergency" },
          ]).map((doc: { key: string; icon: any; label: string }) => (
            <button
              key={doc.key}
              onClick={() => setActiveDoc(doc.key as DocType)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${
                activeDoc === doc.key ? "bg-black text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-black"
              }`}
            >
              <doc.icon size={14} /> {doc.label}
            </button>
          ))}
        </div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50"
        >
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-4">{currentContent.checklistTitle}</h4>
          <div className="space-y-3">
            {currentContent.checklistItems.map((item: string, i: number) => (
              <button key={i} onClick={() => toggleChecklist(i)} className="flex items-center gap-3 text-left w-full">
                {checklist[i] ? <CheckSquare size={18} className="text-emerald-500 shrink-0" /> : <Square size={18} className="text-zinc-300 shrink-0" />}
                <span className={`text-sm font-light ${checklist[i] ? "text-zinc-400 line-through" : "text-zinc-600"}`}>{item}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12">
          {currentContent.steps.map((step: { title: string; content: string; image?: string; warning?: string }, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className="text-base font-light tracking-tight text-black mb-4">{step.title}</h3>
              <p className="text-sm text-zinc-500 font-light leading-relaxed whitespace-pre-line">{step.content}</p>
              {step.image && (
                <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-100">
                  <img src={step.image} alt={step.title} className="w-full h-auto" />
                </div>
              )}
              {step.warning && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-light">{step.warning}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Copy */}
        {activeDoc === "dns" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50"
          >
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-5">Quick Copy</h4>
            <div className="space-y-3">
              {[
                { label: "76.76.21.21", value: "76.76.21.21" },
                { label: "cname.vercel-dns.com", value: "cname.vercel-dns.com" },
              ].map((item: { label: string; value: string }) => (
                <div key={item.value} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200">
                  <span className="text-sm font-mono text-zinc-700 truncate mr-4">{item.label}</span>
                  <button onClick={() => handleCopy(item.value)} className="text-zinc-400 hover:text-black shrink-0 p-1">
                    {copied === item.value ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Save PDF */}
        <div className="mt-16 text-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-50 border border-zinc-200 text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-100 transition-all"
          >
            <Download size={14} /> Save PDF
          </button>
        </div>

      </div>
    </main>
  );
}