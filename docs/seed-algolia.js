const appId = 'BSA94HWH77';
const adminKey = 'd12e3457271ee356b09bf713908b90e5';
const indexName = 'tcharize_docs';

const docsRecords = [
  {
    objectID: 'getting-started',
    title: 'Getting Started with Tcharize',
    section: 'Overview',
    content: 'Tcharize is Nigeria localization engineering and translation frontier AI. It helps developers and teams translate and localize apps, websites, documents, and product content across English, Hausa, Igbo, Yoruba, and Nigerian Pidgin.',
    url: '/docs#overview'
  },
  {
    objectID: 'translate-api',
    title: 'Translate Single String API',
    section: 'API Reference',
    content: 'Send a POST request to /api/v1/localization/translate with sourceLanguage, targetLanguage, text, and explain flag. Powered by the NCAIR1/N-ATLaS model.',
    url: '/docs#api'
  },
  {
    objectID: 'batch-translate-api',
    title: 'Batch Translation API',
    section: 'API Reference',
    content: 'Send a POST request to /api/v1/localization/batch with an array of texts. Batches are processed efficiently and return translations with traceable quality scores.',
    url: '/docs#api'
  },
  {
    objectID: 'glossary-management',
    title: 'Glossary & Brand Terminology',
    section: 'Localization Engine',
    content: 'Define project-specific glossary terms and brand vocabulary to guarantee words like Paystack or Naira are never incorrectly translated.',
    url: '/docs#glossary'
  },
  {
    objectID: 'browser-extension',
    title: 'WXT Manifest V3 Browser Extension',
    section: 'Extension',
    content: 'Translate any live website in your browser safely. Batches DOM text, ignores sensitive password and input fields, and supports instant restore.',
    url: '/docs#extension'
  },
  {
    objectID: 'voice-studio',
    title: 'Nigerian Voice Studio & Pronunciation',
    section: 'Voice',
    content: 'Synthesize spoken Nigerian languages with authentic tonal pronunciation for Yoruba, Igbo, Hausa, and Nigerian Pidgin.',
    url: '/docs#voice'
  },
  {
    objectID: 'paystack-billing',
    title: 'Paystack Billing & Quotas',
    section: 'Billing',
    content: 'Plans in transparent Naira (Free ₦0, Builder ₦15,000, Team ₦60,000). Webhooks are verified with HMAC-SHA512 signatures and processed idempotently.',
    url: '/pricing'
  },
  {
    objectID: 'api-keys',
    title: 'API Keys & Developer Authentication',
    section: 'Security',
    content: 'Generate hashed API keys (tch_live_...) with instant revocation and scoped workspace permissions.',
    url: '/dashboard'
  }
];

async function seed() {
  const res = await fetch(`https://${appId}-dsn.algolia.net/1/indexes/${indexName}/batch`, {
    method: 'POST',
    headers: {
      'x-algolia-application-id': appId,
      'x-algolia-api-key': adminKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: docsRecords.map(record => ({
        action: 'updateObject',
        body: record
      }))
    })
  });

  const data = await res.json();
  console.log('Algolia Seed Result:', data);
}

seed();
