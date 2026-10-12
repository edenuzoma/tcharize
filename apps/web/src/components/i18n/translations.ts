import type { LanguageCode } from "@tcharize/contracts";

export interface Translations {
  // Navigation
  navProduct: string;
  navLanguages: string;
  navDevelopers: string;
  navPricing: string;
  navCompany: string;
  navSignIn: string;
  navCreateAccount: string;
  navDashboard: string;

  // Hero
  heroBadge: string;
  heroH1Lead: string;
  heroH1Accent: string;
  heroDesc: string;
  heroCtaSignup: string;
  heroCtaExplore: string;
  statLanguages: string;
  statEngine: string;
  statBrowser: string;

  // See it before you build it
  seeItEyebrow: string;
  seeItTitle: string;
  seeItDesc: string;
  seeItTry: string;
  liveCardHeader: string;
  liveCardEnglish: string;
  liveCardSampleEn: string;
  liveCardYoruba: string;
  liveCardSampleYo: string;
  liveCardWhyWords: string;
  liveCardWhyExplanation: string;

  // Products
  prodHeadingEyebrow: string;
  prodHeadingTitle: string;
  prodHeadingDesc: string;
  prodEngineLabel: string;
  prodEngineTitle: string;
  prodEngineText: string;
  prodEngineLink: string;
  prodExtLabel: string;
  prodExtTitle: string;
  prodExtText: string;
  prodExtLink: string;
  prodVoiceLabel: string;
  prodVoiceTitle: string;
  prodVoiceText: string;
  prodVoiceLink: string;

  // Pricing
  pricingEyebrow: string;
  pricingTitle: string;
  pricingDesc: string;
  planFreeName: string;
  planFreeDesc: string;
  planBuilderName: string;
  planBuilderDesc: string;
  planTeamName: string;
  planTeamDesc: string;
  getStarted: string;

  // Footer
  footerMission: string;
  footerAttribution: string;
  footerRights: string;
  footerPrivacy: string;
  footerTerms: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    navProduct: "Product",
    navLanguages: "Languages",
    navDevelopers: "Developers",
    navPricing: "Pricing",
    navCompany: "Company",
    navSignIn: "Sign in",
    navCreateAccount: "Create account",
    navDashboard: "Dashboard",

    heroBadge: "Built for Nigeria. Ready for Africa.",
    heroH1Lead: "The localization engine for",
    heroH1Accent: "our languages.",
    heroDesc:
      "Measure translation quality, translate with N-ATLaS, and let native speakers make every word feel at home.",
    heroCtaSignup: "Create your account",
    heroCtaExplore: "Explore the platform",
    statLanguages: "Nigerian languages",
    statEngine: "Localization engine",
    statBrowser: "Browser access",

    seeItEyebrow: "See it before you build it",
    seeItTitle: "One sentence. Meaning you can trust.",
    seeItDesc:
      "Keep the live translation card you love, then take the same engine into your product, repository, or browser.",
    seeItTry: "Try a real translation",
    liveCardHeader: "Live translation",
    liveCardEnglish: "English",
    liveCardSampleEn: "Welcome. We are glad you are here.",
    liveCardYoruba: "Yorùbá",
    liveCardSampleYo: "Ẹ káàbọ̀. Inú wa dùn pé ẹ wà níbí.",
    liveCardWhyWords: "Why these words?",
    liveCardWhyExplanation: "A short, simple explanation helps every translation teach.",

    prodHeadingEyebrow: "One home for every word",
    prodHeadingTitle: "More than a translator.",
    prodHeadingDesc:
      "Tcharize gives ordinary people a simple button and gives builders the serious tools behind it.",
    prodEngineLabel: "Localization engine",
    prodEngineTitle: "Ship in our languages.",
    prodEngineText:
      "Translate product strings, websites, and documents. Keep names, placeholders, tone, and meaning safe.",
    prodEngineLink: "Open the playground",
    prodExtLabel: "Browser extension",
    prodExtTitle: "Make any page feel local.",
    prodExtText:
      "One tap changes the words on a page. Passwords, forms, code, and private fields stay untouched.",
    prodExtLink: "Meet the extension",
    prodVoiceLabel: "Language-aware voice",
    prodVoiceTitle: "Listen with the right rhythm.",
    prodVoiceText:
      "Speech is routed to a model for each language. No one-size-fits-all foreign computer voice.",
    prodVoiceLink: "How voice works",

    pricingEyebrow: "Simple pricing in Naira",
    pricingTitle: "Pay for what you translate.",
    pricingDesc: "Start free with community support. Upgrade as your team grows.",
    planFreeName: "Free",
    planFreeDesc: "For trying an idea.",
    planBuilderName: "Builder",
    planBuilderDesc: "For products finding their people.",
    planTeamName: "Team",
    planTeamDesc: "For teams shipping every week.",
    getStarted: "Get started",

    footerMission: "Nigeria's localization engineering and translation frontier AI. Built so every person can use the internet in words that feel like home.",
    footerAttribution:
      "N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.",
    footerRights: "All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
  },

  ha: {
    navProduct: "Kayan Aiki",
    navLanguages: "Harsuna",
    navDevelopers: "Masu Shirye-shirye",
    navPricing: "Farashi",
    navCompany: "Kamfani",
    navSignIn: "Shiga ciki",
    navCreateAccount: "Bude Asusu",
    navDashboard: "Teburin Aiki",

    heroBadge: "An gina shi don Najeriya. Shirye don Afirka.",
    heroH1Lead: "Injin fassarar harsuna don",
    heroH1Accent: "harsunanmu na asali.",
    heroDesc:
      "Auna ingancin fassara, fassara tare da N-ATLaS, kuma bar masu jin yare su sanya kowace kalma ta ji dadin zama.",
    heroCtaSignup: "Bude asusunka yanzu",
    heroCtaExplore: "Binciko dandalin",
    statLanguages: "Harsunan Najeriya",
    statEngine: "Injin Fassara",
    statBrowser: "Danna a binciken yanar gizo",

    seeItEyebrow: "Gani da ido kafin gini",
    seeItTitle: "Jumla daya. Ma'ana da zaku iya amincewa da ita.",
    seeItDesc:
      "Kiyaye katin fassarar kai tsaye da kuke so, sannan ku dauki wannan injin din zuwa manhajar ku.",
    seeItTry: "Gwada ainihin fassara",
    liveCardHeader: "Fassara kai tsaye",
    liveCardEnglish: "Turanci",
    liveCardSampleEn: "Barka da zuwa. Muna farin cikin kasancewar ku a nan.",
    liveCardYoruba: "Hausa",
    liveCardSampleYo: "Barka da zuwa. Muna matukar farin ciki da zuwanku.",
    liveCardWhyWords: "Me yasa aka zabi wadannan kalmomin?",
    liveCardWhyExplanation: "Gajeren bayani mai sauki na taimaka wa kowa ya fahimci fassarar.",

    prodHeadingEyebrow: "Wuri guda don kowace kalma",
    prodHeadingTitle: "Fiye da mai fassara kawai.",
    prodHeadingDesc:
      "Tcharize na ba wa kowa maballin fassara mai sauki kuma yana ba masu gini manyan kayan aiki a baya.",
    prodEngineLabel: "Injin Fassara",
    prodEngineTitle: "Kaddamar da manhaja a harsunanmu.",
    prodEngineText:
      "Fassara rubutun manhaja, shafukan yanar gizo, da takardu cikin aminci da kiyaye ma'ana.",
    prodEngineLink: "Bude dakin gwaji",
    prodExtLabel: "Kayan Aikin Bincike",
    prodExtTitle: "Mai da kowane shafi ya zama na gida.",
    prodExtText:
      "Danna sau daya yana canza kalmomin shafi. Kalmomin sirri da fom basa taba lalacewa.",
    prodExtLink: "Koyi game da kari",
    prodVoiceLabel: "Muryar Asali",
    prodVoiceTitle: "Saurari da ainihin sautin yare.",
    prodVoiceText:
      "Ana sarrafa murya ta asalin yare ba tare da amfani da muryoyin na'ura marasa dacewa ba.",
    prodVoiceLink: "Yadda murya ke aiki",

    pricingEyebrow: "Farashi mai sauki a Naira",
    pricingTitle: "Biya gwargwadon abin da ka fassara.",
    pricingDesc: "Fara kyauta tare da tallafin al'umma. Kara girma yayin da kungiyar ku ke bunkasa.",
    planFreeName: "Kyauta",
    planFreeDesc: "Don gwada sabon ra'ayi.",
    planBuilderName: "Mai Gini",
    planBuilderDesc: "Don manhajoji masu neman masu amfani.",
    planTeamName: "Kungiya",
    planTeamDesc: "Don kungiyoyin da ke kaddamarwa kowane mako.",
    getStarted: "Fara yanzu",

    footerMission: "Injiniyancin Fassara da AI na Najeriya.",
    footerAttribution:
      "N-ATLaS aiki ne na Ma'aikatar Sadarwa, Kirkire-kirkire da Tattalin Arzikin Dijital ta Tarayya, karkashin Awarri Technologies.",
    footerRights: "Duk hakkoki an kiyaye su.",
    footerPrivacy: "Ka'idojin Sirri",
    footerTerms: "Ka'idojin Amfani",
  },

  ig: {
    navProduct: "Ngwaahịa",
    navLanguages: "Asụsụ",
    navDevelopers: "Ndị Mmepụta",
    navPricing: "Ọnụ ahịa",
    navCompany: "Ụlọ ọrụ",
    navSignIn: "Banye",
    navCreateAccount: "Mepụta akaụntụ",
    navDashboard: "Tebụl Ọrụ",

    heroBadge: "Emebere maka Naijiria. Dị njikere maka Africa.",
    heroH1Lead: "Injin nsụgharị maka",
    heroH1Accent: "asụsụ anyị.",
    heroDesc:
      "Tụọ ogo nsụgharị, sụgharịa site na N-ATLaS, mee ka ndị obodo mee ka okwu ọ bụla dị mma.",
    heroCtaSignup: "Mepụta akaụntụ gị",
    heroCtaExplore: "Chọgharịa n'elu ikpo okwu",
    statLanguages: "Asụsụ Naijiria",
    statEngine: "Injin Nsụgharị",
    statBrowser: "Ohere nchọgharị",

    seeItEyebrow: "Hụ ya tupu ị wuo ya",
    seeItTitle: "Otu ahịrịokwu. Pụtara ihe ị nwere ike ịtụkwasị obi.",
    seeItDesc:
      "Debe kaadị nsụgharị ndụ ị hụrụ n'anya, wee buru otu injin ahụ banye n'ime ngwaahịa gị.",
    seeItTry: "Nwaa ezigbo nsụgharị",
    liveCardHeader: "Nsụgharị ndụ",
    liveCardEnglish: "Bekee",
    liveCardSampleEn: "Nnọọ. Obi dị anyị ụtọ na ị nọ ebe a.",
    liveCardYoruba: "Igbo",
    liveCardSampleYo: "Nnọọ nụ. Anyị nwere obi ụtọ na unu bịara.",
    liveCardWhyWords: "Gịnị kpatara okwu ndị a?",
    liveCardWhyExplanation: "Nkọwa dị mfe na-enyere onye ọ bụla aka ịghọta.",

    prodHeadingEyebrow: "Otu ụlọ maka okwu ọ bụla",
    prodHeadingTitle: "Karịa nanị onye nsụgharị.",
    prodHeadingDesc:
      "Tcharize na-enye ndị nkịtị bọtịnụ dị mfe ma na-enye ndị na-ewu ngwa ngwa ọrụ siri ike.",
    prodEngineLabel: "Injin Nsụgharị",
    prodEngineTitle: "Nyefee n'asụsụ anyị.",
    prodEngineText:
      "Sụgharịa eriri ngwaahịa, weebụsaịtị, na akwụkwọ. Debe aha na nkọwa nke ọma.",
    prodEngineLink: "Mepee ebe egwuregwu",
    prodExtLabel: "Mgbakwunye nchọgharị",
    prodExtTitle: "Mee ka ibe ọ bụla dị ka nke obodo.",
    prodExtText:
      "Otu mmetụ na-agbanwe okwu na ibe. Okwuntughe na mpaghara nzuzo na-adị nchebe.",
    prodExtLink: "Zute mgbakwunye",
    prodVoiceLabel: "Olu maara asụsụ",
    prodVoiceTitle: "Gee ntị n'ụda ziri ezi.",
    prodVoiceText:
      "A na-eduzi okwu site n'asụsụ obodo. Enweghịzi olu kọmputa mba ọzọ na-emebi ụda.",
    prodVoiceLink: "Otu olu si arụ ọrụ",

    pricingEyebrow: "Ọnụ ego dị mfe na Naira",
    pricingTitle: "Kwuo ụgwọ maka ihe ị sụgharịrị.",
    pricingDesc: "Bido n'efu site na nkwado obodo. Kwalite ka otu gị na-eto.",
    planFreeName: "N'efu",
    planFreeDesc: "Maka ịnwale echiche.",
    planBuilderName: "Onye Nrụpụta",
    planBuilderDesc: "Maka ngwaahịa na-achọ ndị ha.",
    planTeamName: "Otu",
    planTeamDesc: "Maka ndị otu na-ebuga kwa izu.",
    getStarted: "Bido ugbu a",

    footerMission: "Injinia Nsụgharị na AI nke Naijiria.",
    footerAttribution:
      "N-ATLaS bụ atụmatụ nke Federal Ministry of Communications, Innovation and Digital Economy, nke Awarri Technologies na-akwado.",
    footerRights: "Echekwara ikike niile.",
    footerPrivacy: "Amụma Nzuzo",
    footerTerms: "Usoro Ọrụ",
  },

  yo: {
    navProduct: "Ọja",
    navLanguages: "Awọn Ede",
    navDevelopers: "Awọn Olùgbéejáde",
    navPricing: "Iye Owo",
    navCompany: "Ile-iṣẹ",
    navSignIn: "Wọle",
    navCreateAccount: "Ṣẹda akọọlẹ",
    navDashboard: "Pẹpẹ Iṣakoso",

    heroBadge: "A kọ ọ fun Naijiria. Ṣetan fun Afirka.",
    heroH1Lead: "Ẹrọ itumọ ede fun",
    heroH1Accent: "awọn ede abinibi wa.",
    heroDesc:
      "Ṣe iwọn didara itumọ, tumọ pẹlu N-ATLaS, ki o jẹ ki awọn ọmọ orilẹ-ede jẹ ki gbogbo ọrọ dun bi ti ile.",
    heroCtaSignup: "Ṣẹda akọọlẹ rẹ",
    heroCtaExplore: "Ṣawari pẹpẹ naa",
    statLanguages: "Awọn ede Naijiria",
    statEngine: "Ẹrọ itumọ ede",
    statBrowser: "Wiwọle aṣawakiri",

    seeItEyebrow: "Wo o ki o to kọ ọ",
    seeItTitle: "Gbolohun kan. Itumọ ti o le gbẹkẹle.",
    seeItDesc:
      "Tọju kaadi itumọ laaye ti o nifẹ, lẹhinna mu ẹrọ kanna wọ inu ọja rẹ tabi aṣawakiri rẹ.",
    seeItTry: "Gbiyanju itumọ gidi kan",
    liveCardHeader: "Itumọ laaye",
    liveCardEnglish: "Gẹẹsi",
    liveCardSampleEn: "Welcome. We are glad you are here.",
    liveCardYoruba: "Yorùbá",
    liveCardSampleYo: "Ẹ káàbọ̀. Inú wa dùn pé ẹ wà níbí.",
    liveCardWhyWords: "Kini idi ti a fi yan awọn ọrọ wọnyi?",
    liveCardWhyExplanation: "Alaye kukuru ati rọrun n ran gbogbo itumọ lọwọ lati kọni.",

    prodHeadingEyebrow: "Ile kan fun gbogbo ọrọ",
    prodHeadingTitle: "O ju olutumo lasan lọ.",
    prodHeadingDesc:
      "Tcharize n fun awọn eniyan lasan ni bọtini ti o rọrun ti o si n fun awọn olukọle ni awọn irinṣẹ to lagbara.",
    prodEngineLabel: "Ẹrọ itumọ ede",
    prodEngineTitle: "Gbe ọja jade ni ede wa.",
    prodEngineText:
      "Tumọ awọn ọrọ ọja, oju opo wẹẹbu, ati awọn iwe aṣẹ. Tọju orukọ, ohun orin, ati itumọ lailewu.",
    prodEngineLink: "Ṣii gbagede idanwo",
    prodExtLabel: "Ifikun aṣawakiri",
    prodExtTitle: "Muu ki oju-iwe eyikeyi dabi ti agbegbe.",
    prodExtText:
      "Tẹ lẹẹkan ṣoṣo lati yi awọn ọrọ pada. Ọrọ igbaniwọle ati data aṣiri wa ni aabo.",
    prodExtLink: "Mọ nipa ifikun naa",
    prodVoiceLabel: "Ohun orin abinibi",
    prodVoiceTitle: "Gbọ pẹlu ilu ti o tọ.",
    prodVoiceText:
      "A n dari ọrọ nipasẹ ede pẹlu awọn agbọrọsọ abinibi. Ko si ohun oyinbo ti n ba faweli wa jẹ.",
    prodVoiceLink: "Bawo ni ohun ṣe n ṣiṣẹ",

    pricingEyebrow: "Iye owo ti o rọrun ni Naira",
    pricingTitle: "Sanwo fun ohun ti o tumọ nikan.",
    pricingDesc: "Bẹrẹ lọfẹẹ pẹlu atilẹyin agbegbe. Mu dara sii bi ẹgbẹ rẹ ṣe n dagba.",
    planFreeName: "Ọfẹ",
    planFreeDesc: "Fun idanwo ero tuntun.",
    planBuilderName: "Olùkọ́le",
    planBuilderDesc: "Fun awọn ọja ti n wa awọn alabara wọn.",
    planTeamName: "Ẹgbẹ",
    planTeamDesc: "Fun awọn ẹgbẹ ti n gbejade lojoojumọ.",
    getStarted: "Bẹrẹ bayi",

    footerMission: "Imọ-ẹrọ Itumọ Ede ati AI Aṣaaju ti Naijiria.",
    footerAttribution:
      "N-ATLaS jẹ ipilẹṣẹ ti Ile-iṣẹ Ibaraẹnisọrọ, Imotuntun ati Eto-ọrọ Oni-nọmba ti Orilẹ-ede, ti Awarri Technologies n dari.",
    footerRights: "Gbogbo ẹtọ wa ni ipamọ.",
    footerPrivacy: "Eto Asiri",
    footerTerms: "Awọn Ofin Iṣẹ",
  },

  pcm: {
    navProduct: "Product",
    navLanguages: "Languages",
    navDevelopers: "Developers",
    navPricing: "Pricing",
    navCompany: "Company",
    navSignIn: "Sign in",
    navCreateAccount: "Create account",
    navDashboard: "Dashboard",

    heroBadge: "Dem build am for Naijá. Ready for Africa.",
    heroH1Lead: "The localization engine for",
    heroH1Accent: "our own languages.",
    heroDesc:
      "Measure translation quality, translate with N-ATLaS, make native speakers make every word feel like home.",
    heroCtaSignup: "Create your account",
    heroCtaExplore: "Explore the platform",
    statLanguages: "Naijá languages",
    statEngine: "Localization engine",
    statBrowser: "Browser access",

    seeItEyebrow: "See am before you build am",
    seeItTitle: "One sentence. Meaning wey you fit trust.",
    seeItDesc:
      "Keep the live translation card wey you like, take the same engine enter your product, code, or browser.",
    seeItTry: "Try real translation",
    liveCardHeader: "Live translation",
    liveCardEnglish: "English",
    liveCardSampleEn: "Welcome. We are glad you are here.",
    liveCardYoruba: "Naijá Pidgin",
    liveCardSampleYo: "Welcome. Body dey sweet us say you dey here.",
    liveCardWhyWords: "Why these words?",
    liveCardWhyExplanation: "Short simple explanation dey help every translation teach well well.",

    prodHeadingEyebrow: "One house for every word",
    prodHeadingTitle: "Pass just translator.",
    prodHeadingDesc:
      "Tcharize dey give ordinary people simple button and give developers serious tools behind am.",
    prodEngineLabel: "Localization engine",
    prodEngineTitle: "Ship inside our languages.",
    prodEngineText:
      "Translate product strings, websites, and documents. Keep names, tone, and meaning safe.",
    prodEngineLink: "Open the playground",
    prodExtLabel: "Browser extension",
    prodExtTitle: "Make any page feel local.",
    prodExtText:
      "One tap changes words on top page. Passwords, forms, and private data dey safe.",
    prodExtLink: "Meet the extension",
    prodVoiceLabel: "Original native voice",
    prodVoiceTitle: "Listen with proper rhythm.",
    prodVoiceText:
      "Audio dey routed by language and native speakers check am. No oyibo accent to spoil tone.",
    prodVoiceLink: "How voice dey work",

    pricingEyebrow: "Simple pricing inside Naira",
    pricingTitle: "Pay for wetin you translate.",
    pricingDesc: "Start free with community support. Upgrade as your team dey grow.",
    planFreeName: "Free",
    planFreeDesc: "To test an idea.",
    planBuilderName: "Builder",
    planBuilderDesc: "For products wey dey find users.",
    planTeamName: "Team",
    planTeamDesc: "For teams wey dey ship every week.",
    getStarted: "Start now",

    footerMission: "Nigeria Localization Engineering and Translation Frontier AI.",
    footerAttribution:
      "N-ATLaS na initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and e dey powered by Awarri Technologies.",
    footerRights: "All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
  },
};
