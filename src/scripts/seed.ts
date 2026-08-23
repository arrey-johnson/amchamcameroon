import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
import { makeAvatar, makeLogo, makePlaceholder } from "./placeholder";
import { lex } from "./lexical";

type Payload = Awaited<ReturnType<typeof getPayload>>;

const ASSETS = path.join(path.dirname(fileURLToPath(import.meta.url)), "assets");

/** Upload a generated image to the media library, with EN/FR alt text. */
async function upload(
  payload: Payload,
  buffer: Buffer,
  name: string,
  altEn: string,
  altFr: string,
): Promise<number> {
  const doc = await payload.create({
    collection: "media",
    locale: "en",
    data: { alt: altEn },
    file: { data: buffer, mimetype: "image/png", name: `${name}.png`, size: buffer.length },
  });
  await payload.update({
    collection: "media",
    id: doc.id,
    locale: "fr",
    data: { alt: altFr },
  });
  return doc.id as number;
}

/** Upload a real image file from src/scripts/assets (jpg or png). */
async function uploadReal(
  payload: Payload,
  file: string,
  altEn: string,
  altFr: string,
): Promise<number> {
  const buffer = readFileSync(path.join(ASSETS, file));
  const mimetype = file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const doc = await payload.create({
    collection: "media",
    locale: "en",
    data: { alt: altEn },
    file: { data: buffer, mimetype, name: file, size: buffer.length },
  });
  await payload.update({ collection: "media", id: doc.id, locale: "fr", data: { alt: altFr } });
  return doc.id as number;
}

async function seed() {
  const payload = await getPayload({ config });
  payload.logger.info("🌱 Seeding AmCham Cameroon…");

  // ── Wipe existing content (idempotent re-seed) ─────────────────────────
  const collections = [
    "hero-slides",
    "ticker-items",
    "news",
    "events",
    "newsletters",
    "members",
    "board-members",
    "committees",
    "pages",
    "gallery-albums",
    "us-news",
    "media",
  ] as const;
  for (const collection of collections) {
    const all = await payload.find({ collection, limit: 500, depth: 0 });
    for (const doc of all.docs) {
      await payload.delete({ collection, id: doc.id }).catch(() => {});
    }
  }

  // ── Admin user ─────────────────────────────────────────────────────────
  const existingUsers = await payload.find({ collection: "users", limit: 1 });
  if (existingUsers.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: {
        name: "AmCham Admin",
        email: "admin@amchamcam.org",
        password: "ChangeMe!2026",
        role: "superadmin",
      },
    });
    payload.logger.info("👤 Admin created — admin@amchamcam.org / ChangeMe!2026");
  }

  // ── Settings global ────────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: "settings",
    locale: "en",
    data: {
      address:
        "Suite A3, 5th Floor, Mabou Building (next to MTN),\nRue Toyota, Bonapriso, Douala, Cameroon",
      emails: [{ email: "ed@amchamcam.org" }, { email: "etienne@amchamcam.org" }],
      phones: [
        { phone: "+237 242 08 05 43" },
        { phone: "+237 677 71 37 05" },
        { phone: "+237 697 47 47 47" },
        { phone: "+237 679 50 34 34" },
      ],
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d994.95!2d9.7015056!3d4.0228613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x106113b9042b06cd%3A0x8489ac2bc594bbf8!2sAmCham%20Cameroon%20(American%20Chamber%20of%20Commerce%20in%20Cameroon)!5e0!3m2!1sen!2scm!4v1720000000000!5m2!1sen!2scm",
      whatsappNumber: "237677713705",
      whatsappMessage: "Hello AmCham Cameroon, I would like more information.",
      callNumber: "+237677713705",
      facebook: "https://facebook.com/amchamcmr",
      twitter: "https://x.com/amchamcmr",
      linkedin: "https://www.linkedin.com/company/amcham-cameroon",
      youtube: "https://www.youtube.com/@amchamcameroon",
      fromAddress: "AmCham Cameroon <onboarding@resend.dev>",
      adminNotifyEmail: "ed@amchamcam.org",
      autoReplyEnabled: true,
      autoReplySubject: "Thank you for contacting AmCham Cameroon",
      autoReplyBody:
        "Dear {{name}},\n\nThank you for reaching out to AmCham Cameroon — we've received your message and will respond within 1–2 business days.\n\nBest regards,\nThe AmCham Cameroon Team",
      usNewsMode: "curated",
      stats: [
        { value: "1994", label: "Founded" },
        { value: "~100", label: "Member companies" },
        { value: "U.S. Chamber", label: "Affiliate" },
        { value: "3+", label: "Working committees" },
      ],
      siteTitle: "AmCham Cameroon — American Chamber of Commerce in Cameroon",
      siteDescription:
        "AmCham Cameroon is the premier organization promoting trade, investment and good business practices between Cameroon and the United States. Founded in 1994, an affiliate of the U.S. Chamber of Commerce.",
    },
  });
  await payload.updateGlobal({
    slug: "settings",
    locale: "fr",
    data: {
      address:
        "Suite A3, 5ᵉ étage, Immeuble Mabou (à côté de MTN),\nRue Toyota, Bonapriso, Douala, Cameroun",
      whatsappMessage: "Bonjour AmCham Cameroun, je souhaite avoir plus d'informations.",
      autoReplySubject: "Merci d'avoir contacté AmCham Cameroun",
      autoReplyBody:
        "Cher/Chère {{name}},\n\nMerci d'avoir contacté AmCham Cameroun — nous avons bien reçu votre message et vous répondrons sous 1 à 2 jours ouvrés.\n\nCordialement,\nL'équipe AmCham Cameroun",
      stats: [
        { value: "1994", label: "Fondée en" },
        { value: "~100", label: "Entreprises membres" },
        { value: "U.S. Chamber", label: "Affiliée" },
        { value: "3+", label: "Comités de travail" },
      ],
      siteTitle: "AmCham Cameroun — Chambre de Commerce Américaine au Cameroun",
      siteDescription:
        "AmCham Cameroun est la première organisation de promotion du commerce, de l'investissement et des bonnes pratiques d'affaires entre le Cameroun et les États-Unis. Fondée en 1994, affiliée à la U.S. Chamber of Commerce.",
    },
  });
  payload.logger.info("⚙️  Settings seeded");

  // ── Hero slides ────────────────────────────────────────────────────────
  const heroData = [
    {
      img: "hero-partnership",
      real: "delegation.jpg",
      variant: "navy" as const,
      en: {
        title: "The bridge between Cameroonian and American business",
        subtitle:
          "Join ~100 member companies advancing trade, investment and shared prosperity between Cameroon and the United States.",
        cta: "Become a Member",
        alt: "U.S. and Cameroon business partnership",
      },
      fr: {
        title: "Le pont entre les entreprises camerounaises et américaines",
        subtitle:
          "Rejoignez une centaine d'entreprises membres qui font avancer le commerce, l'investissement et la prospérité partagée entre le Cameroun et les États-Unis.",
        cta: "Devenir membre",
        alt: "Partenariat d'affaires É.-U.–Cameroun",
      },
      url: "/membership/apply",
    },
    {
      img: "hero-advocacy",
      variant: "red" as const,
      en: {
        title: "Advocacy that shapes a better business climate",
        subtitle:
          "A collective voice engaging government, the U.S. Embassy and the U.S. Chamber of Commerce on the issues that matter to your business.",
        cta: "Our Committees",
        alt: "Business advocacy and policy",
      },
      fr: {
        title: "Un plaidoyer qui façonne un meilleur climat des affaires",
        subtitle:
          "Une voix collective en dialogue avec le gouvernement, l'Ambassade des États-Unis et la U.S. Chamber of Commerce sur les enjeux qui comptent pour votre entreprise.",
        cta: "Nos comités",
        alt: "Plaidoyer et politiques d'affaires",
      },
      url: "/committees",
    },
    {
      img: "hero-missions",
      variant: "green" as const,
      en: {
        title: "Trade missions that open the U.S. market",
        subtitle:
          "We lead delegations of Cameroonian businesses to trade shows and partners across the United States.",
        cta: "Upcoming Events",
        alt: "Trade missions to the USA",
      },
      fr: {
        title: "Des missions commerciales qui ouvrent le marché américain",
        subtitle:
          "Nous conduisons des délégations d'entreprises camerounaises vers des salons et partenaires à travers les États-Unis.",
        cta: "Événements à venir",
        alt: "Missions commerciales aux USA",
      },
      url: "/events",
    },
  ];

  for (let i = 0; i < heroData.length; i++) {
    const h = heroData[i] as (typeof heroData)[number] & { real?: string };
    const imgId = h.real
      ? await uploadReal(payload, h.real, h.en.alt, h.fr.alt)
      : await upload(
          payload,
          await makePlaceholder(1920, 900, "AmCham Cameroon", h.variant),
          h.img,
          h.en.alt,
          h.fr.alt,
        );
    const doc = await payload.create({
      collection: "hero-slides",
      locale: "en",
      data: {
        title: h.en.title,
        subtitle: h.en.subtitle,
        image: imgId,
        ctaLabel: h.en.cta,
        ctaUrl: h.url,
        order: i,
        active: true,
      },
    });
    await payload.update({
      collection: "hero-slides",
      id: doc.id,
      locale: "fr",
      data: { title: h.fr.title, subtitle: h.fr.subtitle, ctaLabel: h.fr.cta },
    });
  }
  payload.logger.info("🖼️  Hero slides seeded");

  // ── Ticker items ───────────────────────────────────────────────────────
  const tickerData = [
    {
      en: "Read our latest position paper on the business climate",
      fr: "Lisez notre dernière note de position sur le climat des affaires",
      url: "/news",
    },
    {
      en: "Welcome to our newest member companies this quarter",
      fr: "Bienvenue à nos nouvelles entreprises membres ce trimestre",
      url: "/membership/directory",
    },
  ];
  for (let i = 0; i < tickerData.length; i++) {
    const item = tickerData[i];
    const doc = await payload.create({
      collection: "ticker-items",
      locale: "en",
      data: { text: item.en, url: item.url, order: i, active: true },
    });
    await payload.update({ collection: "ticker-items", id: doc.id, locale: "fr", data: { text: item.fr } });
  }
  payload.logger.info("📢 Ticker seeded");

  // ── Pages ──────────────────────────────────────────────────────────────
  const pageData = [
    {
      slug: "who-we-are",
      en: {
        title: "Who We Are",
        intro:
          "AmCham Cameroon is the premier organization promoting trade, investment and good business practices between Cameroon and the United States.",
        body: [
          { p: "Founded in 1994, the American Chamber of Commerce in Cameroon (AmCham Cameroon) is an independent, non-profit business association and an affiliate of the U.S. Chamber of Commerce — the world's largest business federation." },
          { h2: "A bilateral business community" },
          { p: "We bring together nearly 100 member companies from every sector of the economy: banking and finance, energy, telecommunications, logistics, agribusiness, legal and professional services, and more. Our members range from multinational corporations to dynamic Cameroonian SMEs." },
          { h2: "What we do" },
          { ul: ["Advocate for a competitive, transparent business climate", "Connect members through high-level networking and matchmaking", "Deliver market intelligence on U.S.–Cameroon trade and investment", "Lead trade missions and facilitate business travel to the United States"] },
          { p: "Headquartered in Douala, Cameroon's economic capital, AmCham Cameroon is the trusted gateway for companies building bridges between the two economies." },
        ],
      },
      fr: {
        title: "Qui sommes-nous",
        intro:
          "AmCham Cameroun est la première organisation de promotion du commerce, de l'investissement et des bonnes pratiques d'affaires entre le Cameroun et les États-Unis.",
        body: [
          { p: "Fondée en 1994, la Chambre de Commerce Américaine au Cameroun (AmCham Cameroun) est une association d'affaires indépendante et à but non lucratif, affiliée à la U.S. Chamber of Commerce — la plus grande fédération d'entreprises au monde." },
          { h2: "Une communauté d'affaires bilatérale" },
          { p: "Nous réunissons près de 100 entreprises membres de tous les secteurs de l'économie : banque et finance, énergie, télécommunications, logistique, agro-industrie, services juridiques et professionnels, et bien plus. Nos membres vont des multinationales aux PME camerounaises dynamiques." },
          { h2: "Ce que nous faisons" },
          { ul: ["Défendre un climat des affaires compétitif et transparent", "Connecter les membres par le réseautage et la mise en relation de haut niveau", "Fournir une intelligence de marché sur le commerce et l'investissement É.-U.–Cameroun", "Conduire des missions commerciales et faciliter les voyages d'affaires aux États-Unis"] },
          { p: "Basée à Douala, capitale économique du Cameroun, AmCham Cameroun est la passerelle de confiance pour les entreprises qui construisent des ponts entre les deux économies." },
        ],
      },
    },
    {
      slug: "vision-mission",
      en: {
        title: "Vision & Mission",
        intro: "Trust, prestige and momentum in the U.S.–Cameroon business partnership.",
        body: [
          { h2: "Our Mission" },
          { p: "To promote trade, investment and good business practices between Cameroon and the United States, and to advance the interests of our members through advocacy, networking and business intelligence." },
          { h2: "Our Vision" },
          { p: "A thriving, transparent and mutually beneficial economic partnership between Cameroon and the United States, in which our members lead and prosper." },
          { h2: "Our Values" },
          { ul: ["Integrity and good governance", "Bilateral partnership and mutual respect", "Member value above all", "Advocacy grounded in evidence"] },
        ],
      },
      fr: {
        title: "Vision & Mission",
        intro: "Confiance, prestige et élan dans le partenariat d'affaires É.-U.–Cameroun.",
        body: [
          { h2: "Notre mission" },
          { p: "Promouvoir le commerce, l'investissement et les bonnes pratiques d'affaires entre le Cameroun et les États-Unis, et faire avancer les intérêts de nos membres par le plaidoyer, le réseautage et l'intelligence économique." },
          { h2: "Notre vision" },
          { p: "Un partenariat économique florissant, transparent et mutuellement bénéfique entre le Cameroun et les États-Unis, dans lequel nos membres prospèrent et jouent un rôle de premier plan." },
          { h2: "Nos valeurs" },
          { ul: ["Intégrité et bonne gouvernance", "Partenariat bilatéral et respect mutuel", "La valeur pour les membres avant tout", "Un plaidoyer fondé sur les faits"] },
        ],
      },
    },
    {
      slug: "word-from-the-us-embassy",
      en: {
        title: "Word from the U.S. Embassy",
        intro: "A message on the U.S.–Cameroon commercial partnership.",
        body: [
          { p: "The United States is proud to partner with AmCham Cameroon in strengthening the commercial ties between our two nations. American companies find in Cameroon a strategic gateway to Central Africa, and Cameroonian enterprises find in the United States a market of unmatched scale and opportunity." },
          { p: "The U.S. Mission in Cameroon works hand in hand with AmCham to support a level playing field, transparent regulation, and the rule of law — the foundations on which durable trade and investment are built." },
          { p: "We commend AmCham Cameroon's members for their leadership and look forward to deepening this partnership in the years ahead." },
        ],
      },
      fr: {
        title: "Mot de l'Ambassade des États-Unis",
        intro: "Un message sur le partenariat commercial É.-U.–Cameroun.",
        body: [
          { p: "Les États-Unis sont fiers de collaborer avec AmCham Cameroun pour renforcer les liens commerciaux entre nos deux nations. Les entreprises américaines trouvent au Cameroun une porte d'entrée stratégique vers l'Afrique centrale, et les entreprises camerounaises trouvent aux États-Unis un marché d'une ampleur et d'opportunités inégalées." },
          { p: "La Mission américaine au Cameroun travaille main dans la main avec AmCham pour soutenir des règles du jeu équitables, une réglementation transparente et l'État de droit — les fondements sur lesquels se construisent un commerce et un investissement durables." },
          { p: "Nous saluons les membres d'AmCham Cameroun pour leur leadership et nous réjouissons d'approfondir ce partenariat dans les années à venir." },
        ],
      },
    },
    {
      slug: "word-from-the-president",
      en: {
        title: "Word from the President",
        intro: "A message from the President of AmCham Cameroon.",
        body: [
          { p: "Welcome to AmCham Cameroon. For three decades, our Chamber has been the voice of the U.S.–Cameroon business community — advocating for our members, opening doors, and building the trust on which great partnerships are made." },
          { p: "Today, the opportunity has never been greater. From energy and infrastructure to digital services and agribusiness, the two economies have more to offer each other than ever before. Our role is to help you seize that opportunity." },
          { p: "Whether you are an established multinational or an ambitious Cameroonian SME, there is a place for you at this table. I invite you to join us." },
        ],
      },
      fr: {
        title: "Mot du Président",
        intro: "Un message du Président d'AmCham Cameroun.",
        body: [
          { p: "Bienvenue à AmCham Cameroun. Depuis trois décennies, notre Chambre est la voix de la communauté d'affaires É.-U.–Cameroun — défendant nos membres, ouvrant des portes et bâtissant la confiance sur laquelle se construisent les grands partenariats." },
          { p: "Aujourd'hui, l'opportunité n'a jamais été aussi grande. De l'énergie et des infrastructures aux services numériques et à l'agro-industrie, les deux économies ont plus que jamais à s'offrir mutuellement. Notre rôle est de vous aider à saisir cette opportunité." },
          { p: "Que vous soyez une multinationale établie ou une PME camerounaise ambitieuse, il y a une place pour vous à cette table. Je vous invite à nous rejoindre." },
        ],
      },
    },
    {
      slug: "membership-benefits",
      en: {
        title: "Why Join AmCham Cameroon",
        intro: "Membership connects your company to a bilateral network, actionable intelligence and a collective voice.",
        body: [
          { h2: "Who can join" },
          { p: "Membership is open to companies and individuals with a genuine interest in U.S.–Cameroon trade and investment — American and Cameroonian firms alike, from multinationals to SMEs, as well as professionals and entrepreneurs." },
          { h2: "A return on your membership" },
          { p: "Our members consistently tell us that the relationships, intelligence and visibility they gain through AmCham more than repay their annual dues. Membership is an investment in your company's growth across two markets." },
        ],
      },
      fr: {
        title: "Pourquoi rejoindre AmCham Cameroun",
        intro: "L'adhésion connecte votre entreprise à un réseau bilatéral, à une intelligence exploitable et à une voix collective.",
        body: [
          { h2: "Qui peut adhérer" },
          { p: "L'adhésion est ouverte aux entreprises et aux particuliers ayant un réel intérêt pour le commerce et l'investissement É.-U.–Cameroun — entreprises américaines comme camerounaises, des multinationales aux PME, ainsi que les professionnels et entrepreneurs." },
          { h2: "Un retour sur votre adhésion" },
          { p: "Nos membres nous confirment régulièrement que les relations, l'intelligence et la visibilité obtenues grâce à AmCham valent bien plus que leur cotisation annuelle. L'adhésion est un investissement dans la croissance de votre entreprise sur deux marchés." },
        ],
      },
    },
  ];

  // Real cover photos for specific About pages.
  const pageCovers: Record<string, string> = {
    "who-we-are": "delegation.jpg",
    "word-from-the-us-embassy": "delegation.jpg",
    "word-from-the-president": "portrait.jpg",
  };
  for (const p of pageData) {
    const coverFile = pageCovers[p.slug];
    const coverId = coverFile
      ? await uploadReal(payload, coverFile, p.en.title, p.fr.title)
      : undefined;
    const doc = await payload.create({
      collection: "pages",
      locale: "en",
      data: {
        title: p.en.title,
        slug: p.slug,
        intro: p.en.intro,
        body: lex(p.en.body),
        coverImage: coverId,
        _status: "published",
      },
    });
    await payload.update({
      collection: "pages",
      id: doc.id,
      locale: "fr",
      data: { title: p.fr.title, intro: p.fr.intro, body: lex(p.fr.body), _status: "published" },
    });
  }
  payload.logger.info("📄 Pages seeded");

  // ── News ───────────────────────────────────────────────────────────────
  const newsData = [
    {
      slug: "amcham-business-forum-2026",
      category: "press-release",
      variant: "navy" as const,
      real: "delegation.jpg",
      author: "AmCham Cameroon",
      en: {
        title: "AmCham Cameroon announces its 2026 Business Forum in Douala",
        excerpt: "The flagship annual gathering will convene business leaders, policymakers and U.S. partners around the theme of resilient trade.",
        body: [{ p: "AmCham Cameroon is proud to announce its 2026 Business Forum, the Chamber's flagship annual event, bringing together senior executives, government officials and U.S. commercial partners in Douala." }, { p: "This year's edition focuses on resilient trade and investment in a changing global economy, with dedicated sessions on energy, digital transformation and access to finance." }],
      },
      fr: {
        title: "AmCham Cameroun annonce son Forum d'affaires 2026 à Douala",
        excerpt: "Le grand rendez-vous annuel réunira dirigeants d'entreprise, décideurs publics et partenaires américains autour du thème du commerce résilient.",
        body: [{ p: "AmCham Cameroun est fière d'annoncer son Forum d'affaires 2026, l'événement phare annuel de la Chambre, qui réunira des cadres dirigeants, des responsables gouvernementaux et des partenaires commerciaux américains à Douala." }, { p: "L'édition de cette année met l'accent sur le commerce et l'investissement résilients dans une économie mondiale en mutation, avec des sessions dédiées à l'énergie, à la transformation numérique et à l'accès au financement." }],
      },
    },
    {
      slug: "position-paper-business-climate",
      category: "policy",
      variant: "red" as const,
      author: "Trade & Investment Committee",
      en: {
        title: "New position paper: improving Cameroon's business climate",
        excerpt: "AmCham's Trade & Investment Committee sets out concrete recommendations to strengthen competitiveness and attract investment.",
        body: [{ p: "AmCham Cameroon has released a new position paper outlining practical recommendations to improve the national business climate, developed through consultation with members across all sectors." }, { p: "The paper addresses tax predictability, customs facilitation, contract enforcement and the digitalization of public services." }],
      },
      fr: {
        title: "Nouvelle note de position : améliorer le climat des affaires au Cameroun",
        excerpt: "Le Comité Commerce & Investissement d'AmCham formule des recommandations concrètes pour renforcer la compétitivité et attirer l'investissement.",
        body: [{ p: "AmCham Cameroun a publié une nouvelle note de position présentant des recommandations pratiques pour améliorer le climat national des affaires, élaborée en concertation avec des membres de tous les secteurs." }, { p: "La note aborde la prévisibilité fiscale, la facilitation douanière, l'exécution des contrats et la numérisation des services publics." }],
      },
    },
    {
      slug: "trade-mission-houston",
      category: "news",
      variant: "green" as const,
      author: "AmCham Cameroon",
      en: {
        title: "AmCham to lead a trade mission to Houston, Texas",
        excerpt: "A delegation of Cameroonian energy and services companies will meet U.S. partners at a major industry gathering.",
        body: [{ p: "AmCham Cameroon will lead a trade mission to Houston, Texas, connecting Cameroonian energy and services companies with American partners, investors and industry leaders." }, { p: "Member companies interested in joining the delegation are invited to contact the Chamber's secretariat." }],
      },
      fr: {
        title: "AmCham conduira une mission commerciale à Houston, au Texas",
        excerpt: "Une délégation d'entreprises camerounaises de l'énergie et des services rencontrera des partenaires américains lors d'un grand rendez-vous sectoriel.",
        body: [{ p: "AmCham Cameroun conduira une mission commerciale à Houston, au Texas, mettant en relation des entreprises camerounaises de l'énergie et des services avec des partenaires, investisseurs et leaders américains du secteur." }, { p: "Les entreprises membres souhaitant rejoindre la délégation sont invitées à contacter le secrétariat de la Chambre." }],
      },
    },
    {
      slug: "agoa-opportunities-op-ed",
      category: "op-ed",
      variant: "mixed" as const,
      author: "AmCham Cameroon",
      en: {
        title: "Op-Ed: Making the most of AGOA for Cameroonian exporters",
        excerpt: "Duty-free access to the U.S. market remains an underused opportunity — here is how our members can seize it.",
        body: [{ p: "The African Growth and Opportunity Act (AGOA) offers Cameroonian producers duty-free access to the United States for thousands of product lines. Yet the opportunity remains underused." }, { p: "In this op-ed, we argue that with the right market intelligence and partnerships, Cameroonian exporters can significantly expand their U.S. footprint." }],
      },
      fr: {
        title: "Tribune : tirer le meilleur parti de l'AGOA pour les exportateurs camerounais",
        excerpt: "L'accès en franchise de droits au marché américain reste une opportunité sous-exploitée — voici comment nos membres peuvent la saisir.",
        body: [{ p: "L'African Growth and Opportunity Act (AGOA) offre aux producteurs camerounais un accès en franchise de droits aux États-Unis pour des milliers de lignes de produits. Pourtant, l'opportunité reste sous-exploitée." }, { p: "Dans cette tribune, nous soutenons qu'avec la bonne intelligence de marché et les bons partenariats, les exportateurs camerounais peuvent considérablement accroître leur présence aux États-Unis." }],
      },
    },
    {
      slug: "new-members-q1-2026",
      category: "news",
      variant: "navy" as const,
      real: "patrons.jpg",
      author: "AmCham Cameroon",
      en: {
        title: "AmCham welcomes new member companies",
        excerpt: "Several leading firms have joined the Chamber this quarter, strengthening our bilateral community.",
        body: [{ p: "AmCham Cameroon is delighted to welcome its newest member companies, spanning finance, logistics and technology." }, { p: "Their arrival reflects growing confidence in the U.S.–Cameroon business partnership and the value of Chamber membership." }],
      },
      fr: {
        title: "AmCham accueille de nouvelles entreprises membres",
        excerpt: "Plusieurs entreprises de premier plan ont rejoint la Chambre ce trimestre, renforçant notre communauté bilatérale.",
        body: [{ p: "AmCham Cameroun est ravie d'accueillir ses nouvelles entreprises membres, actives dans la finance, la logistique et la technologie." }, { p: "Leur arrivée témoigne d'une confiance croissante dans le partenariat d'affaires É.-U.–Cameroun et de la valeur de l'adhésion à la Chambre." }],
      },
    },
    {
      slug: "executive-networking-breakfast",
      category: "news",
      variant: "green" as const,
      author: "AmCham Cameroon",
      en: {
        title: "Executive networking breakfast brings members together",
        excerpt: "Members gathered for candid conversation on the outlook for trade and investment in 2026.",
        body: [{ p: "AmCham's latest executive networking breakfast brought members together for candid conversation and valuable connections." }, { p: "These regular gatherings are among the most appreciated benefits of Chamber membership." }],
      },
      fr: {
        title: "Un petit-déjeuner de réseautage réunit les membres",
        excerpt: "Les membres se sont réunis pour un échange franc sur les perspectives du commerce et de l'investissement en 2026.",
        body: [{ p: "Le dernier petit-déjeuner de réseautage exécutif d'AmCham a réuni les membres pour des échanges francs et des connexions précieuses." }, { p: "Ces rencontres régulières figurent parmi les avantages les plus appréciés de l'adhésion à la Chambre." }],
      },
    },
  ];

  const now = Date.now();
  for (let i = 0; i < newsData.length; i++) {
    const n = newsData[i] as (typeof newsData)[number] & { real?: string };
    const imgId = n.real
      ? await uploadReal(payload, n.real, n.en.title, n.fr.title)
      : await upload(
          payload,
          await makePlaceholder(900, 506, "AmCham News", n.variant),
          `news-${n.slug}`,
          n.en.title,
          n.fr.title,
        );
    const doc = await payload.create({
      collection: "news",
      locale: "en",
      data: {
        title: n.en.title,
        slug: n.slug,
        category: n.category as "news" | "press-release" | "op-ed" | "policy",
        excerpt: n.en.excerpt,
        coverImage: imgId,
        body: lex(n.en.body),
        author: n.author,
        publishedAt: new Date(now - i * 6 * 864e5).toISOString(),
        _status: "published",
      },
    });
    await payload.update({
      collection: "news",
      id: doc.id,
      locale: "fr",
      data: { title: n.fr.title, excerpt: n.fr.excerpt, body: lex(n.fr.body), _status: "published" },
    });
  }
  payload.logger.info("📰 News seeded");

  // ── Events ─────────────────────────────────────────────────────────────
  // Only seed confirmed past events. Do not invent future dates — upcoming
  // events should be added in the CMS when they are real.
  const eventData = [
    {
      slug: "annual-gala-2025",
      category: "gala",
      variant: "mixed" as const,
      offsetDays: -40,
      past: true,
      en: { title: "AmCham Annual Gala 2025", venue: "Douala", desc: [{ p: "Our members gathered for an elegant evening celebrating another year of the U.S.–Cameroon business partnership." }], priceM: "", priceN: "" },
      fr: { title: "Gala annuel AmCham 2025", venue: "Douala", desc: [{ p: "Nos membres se sont réunis pour une soirée élégante célébrant une nouvelle année de partenariat d'affaires É.-U.–Cameroun." }], priceM: "", priceN: "" },
    },
  ];

  for (const e of eventData as ((typeof eventData)[number] & { real?: string })[]) {
    const imgId = e.real
      ? await uploadReal(payload, e.real, e.en.title, e.fr.title)
      : await upload(
          payload,
          await makePlaceholder(900, 506, "AmCham Event", e.variant),
          `event-${e.slug}`,
          e.en.title,
          e.fr.title,
        );
    const start = new Date(now + e.offsetDays * 864e5);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(13, 0, 0, 0);

    // Build a small gallery for past events.
    const gallery: { image: number }[] = [];
    if (e.past) {
      for (let g = 0; g < 4; g++) {
        const gid = await upload(
          payload,
          await makePlaceholder(900, 675, "AmCham", (["navy", "red", "green", "mixed"] as const)[g]),
          `event-${e.slug}-photo-${g}`,
          `${e.en.title} — photo ${g + 1}`,
          `${e.fr.title} — photo ${g + 1}`,
        );
        gallery.push({ image: gid });
      }
    }

    const doc = await payload.create({
      collection: "events",
      locale: "en",
      data: {
        title: e.en.title,
        slug: e.slug,
        coverImage: imgId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        venue: e.en.venue,
        category: e.category as "conference" | "networking" | "trade-mission" | "training" | "gala",
        description: lex(e.en.desc),
        priceMember: e.en.priceM || undefined,
        priceNonMember: e.en.priceN || undefined,
        gallery,
        _status: "published",
      },
    });
    await payload.update({
      collection: "events",
      id: doc.id,
      locale: "fr",
      data: {
        title: e.fr.title,
        venue: e.fr.venue,
        description: lex(e.fr.desc),
        priceMember: e.fr.priceM || undefined,
        priceNonMember: e.fr.priceN || undefined,
        _status: "published",
      },
    });
  }
  payload.logger.info("📅 Events seeded");

  // ── Committees ─────────────────────────────────────────────────────────
  const committeeData = [
    {
      slug: "trade-investment",
      chair: "AmCham Cameroon",
      en: { name: "Trade & Investment", summary: "Advancing bilateral trade flows and a competitive investment climate.", focus: ["Market access & AGOA", "Investment promotion", "Business climate reform"], body: [{ p: "The Trade & Investment Committee is the engine of the Chamber's economic advocacy. It works to expand bilateral trade flows, promote Cameroon as an investment destination, and remove barriers that hold back business." }] },
      fr: { name: "Commerce & Investissement", summary: "Développer les flux commerciaux bilatéraux et un climat d'investissement compétitif.", focus: ["Accès au marché & AGOA", "Promotion de l'investissement", "Réforme du climat des affaires"], body: [{ p: "Le Comité Commerce & Investissement est le moteur du plaidoyer économique de la Chambre. Il œuvre à développer les flux commerciaux bilatéraux, à promouvoir le Cameroun comme destination d'investissement et à lever les obstacles qui freinent les affaires." }] },
    },
    {
      slug: "tax-legal",
      chair: "AmCham Cameroon",
      en: { name: "Tax & Legal", summary: "Clarity, predictability and fairness in tax and regulation.", focus: ["Tax predictability", "Regulatory reform", "Contract enforcement"], body: [{ p: "The Tax & Legal Committee brings together legal and finance professionals to engage authorities on tax policy, regulatory clarity and the rule of law — the conditions businesses need to plan and invest with confidence." }] },
      fr: { name: "Fiscal & Juridique", summary: "Clarté, prévisibilité et équité en matière fiscale et réglementaire.", focus: ["Prévisibilité fiscale", "Réforme réglementaire", "Exécution des contrats"], body: [{ p: "Le Comité Fiscal & Juridique réunit des professionnels du droit et de la finance pour dialoguer avec les autorités sur la politique fiscale, la clarté réglementaire et l'État de droit — les conditions dont les entreprises ont besoin pour planifier et investir en confiance." }] },
    },
    {
      slug: "oil-gas-energy",
      chair: "AmCham Cameroon",
      en: { name: "Oil, Gas & Energy", summary: "Supporting a strong, transparent and sustainable energy sector.", focus: ["Energy investment", "Local content", "Sustainability & transition"], body: [{ p: "The Oil, Gas & Energy Committee represents members across the energy value chain, advocating for a transparent, competitive and sustainable sector that attracts investment and delivers reliable power." }] },
      fr: { name: "Pétrole, Gaz & Énergie", summary: "Soutenir un secteur énergétique fort, transparent et durable.", focus: ["Investissement énergétique", "Contenu local", "Durabilité & transition"], body: [{ p: "Le Comité Pétrole, Gaz & Énergie représente les membres de toute la chaîne de valeur énergétique, plaidant pour un secteur transparent, compétitif et durable qui attire l'investissement et fournit une énergie fiable." }] },
    },
  ];

  for (let i = 0; i < committeeData.length; i++) {
    const c = committeeData[i];
    const imgId = await upload(
      payload,
      await makePlaceholder(900, 506, c.en.name, (["navy", "red", "green"] as const)[i % 3]),
      `committee-${c.slug}`,
      c.en.name,
      c.fr.name,
    );
    const doc = await payload.create({
      collection: "committees",
      locale: "en",
      data: {
        name: c.en.name,
        slug: c.slug,
        summary: c.en.summary,
        description: lex(c.en.body),
        focusAreas: c.en.focus.map((area) => ({ area })),
        chair: c.chair,
        coverImage: imgId,
        order: i,
      },
    });
    await payload.update({
      collection: "committees",
      id: doc.id,
      locale: "fr",
      data: {
        name: c.fr.name,
        summary: c.fr.summary,
        description: lex(c.fr.body),
        focusAreas: c.fr.focus.map((area) => ({ area })),
      },
    });
  }
  payload.logger.info("🏛️  Committees seeded");

  // ── Board & Executive (real 2024 Board of Directors) ───────────────────
  const board = [
    { name: "Laure Djoukam", roleEn: "President", roleFr: "Présidente", company: "CEO, Shekina Invest", v: "navy" as const },
    { name: "Guy H. Tchente", roleEn: "Vice President", roleFr: "Vice-Président", company: "Managing Partner, Conseils Fiscaux & Associés", v: "red" as const },
    { name: "Marie-Paul Matouke", roleEn: "Treasurer", roleFr: "Trésorière", company: "Head of Corporate Affairs, Brand & Marketing, Standard Chartered Bank", v: "green" as const },
    { name: "Ebenezer Bodylawson", roleEn: "Board Member", roleFr: "Administrateur", company: "CFO & Executive Director, MTN", v: "navy" as const },
    { name: "Sarada Nya, Esq.", roleEn: "Board Member", roleFr: "Administratrice", company: "Managing Partner, Nya & Co. Law Firm", v: "red" as const },
    { name: "Lawrence Abunaw", roleEn: "Board Member", roleFr: "Administrateur", company: "Country Senior Partner & COE, PwC", v: "green" as const },
    { name: "Richard Fowang", roleEn: "Board Member", roleFr: "Administrateur", company: "General Manager, Colgate-Palmolive", v: "navy" as const },
    { name: "Hélène Dengoue", roleEn: "Board Member", roleFr: "Administratrice", company: "General Manager, Blessing Petroleum", v: "red" as const },
    { name: "Emilie Siewe", roleEn: "Board Member", roleFr: "Administratrice", company: "Managing Director, Tropix Group", v: "green" as const },
    { name: "John Tomich", roleEn: "Board Member", roleFr: "Administrateur", company: "VP & Country Manager, Noble Energy (Chevron)", v: "navy" as const },
    { name: "Ashley White", roleEn: "Ex Officio Board Member", roleFr: "Membre de droit", company: "Director, U.S. Embassy Branch Office Douala", v: "red" as const },
  ];
  const executive = [
    { name: "Etienne Nkoa", roleEn: "Executive Director", roleFr: "Directeur Exécutif", company: "AmCham Cameroon", v: "navy" as const },
    { name: "Membership & Events", roleEn: "Membership & Events", roleFr: "Adhésion & Événements", company: "AmCham Cameroon Secretariat", v: "red" as const },
    { name: "Communications", roleEn: "Communications", roleFr: "Communication", company: "AmCham Cameroon Secretariat", v: "green" as const },
  ];

  const seedPeople = async (list: typeof board, group: "board" | "executive") => {
    for (let i = 0; i < list.length; i++) {
      const person = list[i];
      const photoId = await upload(
        payload,
        await makeAvatar(person.name, person.v),
        `person-${group}-${i}`,
        person.name,
        person.name,
      );
      const doc = await payload.create({
        collection: "board-members",
        locale: "en",
        data: {
          name: person.name,
          role: person.roleEn,
          company: person.company,
          photo: photoId,
          group,
          order: i,
          linkedin: "https://www.linkedin.com/company/amcham-cameroon",
        },
      });
      await payload.update({
        collection: "board-members",
        id: doc.id,
        locale: "fr",
        data: { role: person.roleFr },
      });
    }
  };
  await seedPeople(board, "board");
  await seedPeople(executive, "executive");
  payload.logger.info("👥 Board & Executive seeded");

  // ── Members (real AmCham Cameroon patron & sponsor companies) ──────────
  const members = [
    // Patrons
    { name: "Standard Chartered Bank", sector: "Banking & Finance", category: "patron" },
    { name: "MTN Cameroon", sector: "Telecommunications", category: "patron" },
    { name: "Colgate-Palmolive", sector: "Consumer Goods", category: "patron" },
    { name: "Citi", sector: "Banking & Finance", category: "patron" },
    { name: "PwC", sector: "Professional Services", category: "patron" },
    { name: "Ecobank", sector: "Banking & Finance", category: "patron" },
    { name: "SGS", sector: "Inspection & Certification", category: "patron" },
    { name: "Conseils Fiscaux Associés", sector: "Tax & Legal", category: "patron" },
    { name: "COTCO", sector: "Energy", category: "patron" },
    { name: "Société Générale Cameroun", sector: "Banking & Finance", category: "patron" },
    { name: "Noble Energy", sector: "Energy", category: "patron" },
    { name: "Olam", sector: "Agribusiness", category: "patron" },
    { name: "Prudential Beneficial", sector: "Insurance", category: "patron" },
    // Sponsors
    { name: "Deloitte", sector: "Professional Services", category: "sponsor" },
    { name: "UBA (United Bank for Africa)", sector: "Banking & Finance", category: "sponsor" },
    { name: "Tropix Group SARL", sector: "Trade & Distribution", category: "sponsor" },
    { name: "NFC Bank", sector: "Banking & Finance", category: "sponsor" },
    { name: "ELTA Travel", sector: "Travel & Tourism", category: "sponsor" },
    { name: "Les Hôtels Séréna", sector: "Hospitality", category: "sponsor" },
    { name: "Nya & Co. Law Firm", sector: "Legal Services", category: "sponsor" },
    { name: "The Abeng Law Firm", sector: "Legal Services", category: "sponsor" },
    { name: "American School of Douala", sector: "Education", category: "sponsor" },
    { name: "InfoPro Solution (IPS)", sector: "Technology", category: "sponsor" },
    { name: "Carrières du Moungo", sector: "Construction Materials", category: "sponsor" },
    { name: "Yellow Card", sector: "Fintech", category: "corporate" },
    { name: "Blueberry Travel", sector: "Travel & Tourism", category: "corporate" },
    { name: "Jeffersons Group", sector: "Diversified", category: "corporate" },
    { name: "Green Springs Digital University", sector: "Education", category: "sme" },
  ];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const logoId = await upload(payload, await makeLogo(m.name), `member-${i}`, `${m.name} logo`, `Logo ${m.name}`);
    const doc = await payload.create({
      collection: "members",
      locale: "en",
      data: {
        name: m.name,
        logo: logoId,
        sector: m.sector,
        category: m.category as "patron" | "sponsor" | "corporate" | "sme" | "individual",
        website: "https://amchamcam.org",
        description: `${m.name} is a valued member of AmCham Cameroon, active in ${m.sector.toLowerCase()}.`,
        featured: ["patron", "sponsor"].includes(m.category),
        order: i,
      },
    });
    await payload.update({
      collection: "members",
      id: doc.id,
      locale: "fr",
      data: { description: `${m.name} est un membre estimé d'AmCham Cameroun, actif dans le secteur : ${m.sector}.` },
    });
  }
  payload.logger.info("🏢 Members seeded");

  // ── Newsletters ────────────────────────────────────────────────────────
  const { makePdf } = await import("./pdf");
  for (let i = 0; i < 4; i++) {
    const issueNo = 12 - i;
    const titleEn = `AmCham Cameroon Newsletter — Issue ${issueNo}`;
    const titleFr = `Newsletter AmCham Cameroun — Numéro ${issueNo}`;
    const coverId = await upload(
      payload,
      await makePlaceholder(600, 800, `Issue ${issueNo}`, (["navy", "red", "green", "mixed"] as const)[i % 4]),
      `newsletter-cover-${issueNo}`,
      titleEn,
      titleFr,
    );
    const pdfBuf = makePdf(`AmCham Cameroon — Newsletter Issue ${issueNo}`);
    const pdfDoc = await payload.create({
      collection: "media",
      locale: "en",
      data: { alt: titleEn },
      file: { data: pdfBuf, mimetype: "application/pdf", name: `newsletter-${issueNo}.pdf`, size: pdfBuf.length },
    });
    const doc = await payload.create({
      collection: "newsletters",
      locale: "en",
      data: {
        title: titleEn,
        issueNumber: String(issueNo),
        date: new Date(now - i * 30 * 864e5).toISOString(),
        coverImage: coverId,
        pdf: pdfDoc.id,
      },
    });
    await payload.update({ collection: "newsletters", id: doc.id, locale: "fr", data: { title: titleFr } });
  }
  payload.logger.info("📬 Newsletters seeded");

  // ── U.S. News (curated) ────────────────────────────────────────────────
  const usNews = [
    { titleEn: "U.S. Chamber highlights record trade with Africa", titleFr: "La U.S. Chamber met en avant un commerce record avec l'Afrique", source: "U.S. Chamber of Commerce", url: "https://www.uschamber.com" },
    { titleEn: "USTR reviews AGOA renewal and eligibility", titleFr: "L'USTR examine le renouvellement et l'éligibilité à l'AGOA", source: "USTR", url: "https://ustr.gov" },
    { titleEn: "U.S. energy firms expand investment in Central Africa", titleFr: "Les entreprises énergétiques américaines renforcent leurs investissements en Afrique centrale", source: "Reuters Business", url: "https://www.reuters.com/business" },
    { titleEn: "Prosper Africa announces new deal support facility", titleFr: "Prosper Africa annonce un nouveau dispositif d'appui aux transactions", source: "Prosper Africa", url: "https://www.prosperafrica.gov" },
  ];
  for (let i = 0; i < usNews.length; i++) {
    const u = usNews[i];
    const doc = await payload.create({
      collection: "us-news",
      locale: "en",
      data: {
        title: u.titleEn,
        source: u.source,
        url: u.url,
        publishedAt: new Date(now - i * 3 * 864e5).toISOString(),
        approved: true,
        summary: "Curated headline relevant to AmCham Cameroon members.",
      },
    });
    await payload.update({
      collection: "us-news",
      id: doc.id,
      locale: "fr",
      data: { title: u.titleFr, summary: "Actualité sélectionnée, pertinente pour les membres d'AmCham Cameroun." },
    });
  }
  payload.logger.info("🇺🇸 U.S. news seeded");

  // ── Gallery ────────────────────────────────────────────────────────────
  const albumImages: { image: number; caption: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const gid = await upload(
      payload,
      await makePlaceholder(900, 675, "AmCham Gala 2025", (["navy", "red", "green", "mixed", "dark", "navy"] as const)[i]),
      `gallery-gala-${i}`,
      `Annual Gala 2025 — photo ${i + 1}`,
      `Gala annuel 2025 — photo ${i + 1}`,
    );
    albumImages.push({ image: gid, caption: `Annual Gala 2025 — moment ${i + 1}` });
  }
  const albumDoc = await payload.create({
    collection: "gallery-albums",
    locale: "en",
    data: {
      title: "Annual Gala 2025",
      date: new Date(now - 40 * 864e5).toISOString(),
      cover: albumImages[0].image,
      images: albumImages,
    },
  });
  await payload.update({
    collection: "gallery-albums",
    id: albumDoc.id,
    locale: "fr",
    data: { title: "Gala annuel 2025", images: albumImages.map((img, i) => ({ ...img, caption: `Gala annuel 2025 — moment ${i + 1}` })) },
  });
  payload.logger.info("📸 Gallery seeded");

  payload.logger.info("✅ Seed complete!");
}

await seed();
