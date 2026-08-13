const fs = require('fs');
let content = fs.readFileSync('web/src/i18n/toolCopy.ts', 'utf8');

// Replace faqTitle: '...',
content = content.replace(/faqTitle:\s*'.*?',\s*/g, '');
content = content.replace(/faqTitle:\s*".*?",\s*/g, '');

// The `faq` arrays are trickier. 
// For split and organize they are `faq: [],`
content = content.replace(/faq:\s*\[\],\s*/g, '');

// For png, jpg, merge, the faq arrays are multi-line.
// E.g., faq: [\n        privacyEn,\n        ...\n      ],\n      crossLink: ...
content = content.replace(/faq:\s*\[[\s\S]*?\],\s*crossLink:/g, 'crossLink:');

fs.writeFileSync('web/src/i18n/toolCopy.ts', content);
