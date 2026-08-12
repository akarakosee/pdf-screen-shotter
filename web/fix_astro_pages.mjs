import fs from 'fs';

function makeAstro(name, shellName, copyName, lang) {
  const isTr = lang === 'tr';
  const prefix = isTr ? '../../' : '../';
  
  return `---
import ToolPage from '${prefix}layouts/ToolPage.astro';
import { ${copyName} } from '${prefix}i18n/toolCopy';
import { ${shellName} } from '${prefix}components/${shellName}';

const copy = ${copyName}.${lang};
---

<ToolPage
  title={copy.title}
  description={copy.description}
  h1={copy.h1}
  tagline={copy.tagline}
  howToName={copy.howToName}
  howItWorks={copy.howItWorks}
  steps={copy.steps}
  lang="${lang}"
>
  <${shellName} client:load ${isTr ? "t={import('../../i18n/tr').then(m => m.tr)}" : ''} />
</ToolPage>
`;
}

// Since I didn't pass t down gracefully for SSR in the previous components if they were synchronous,
// Wait, in ToolPage, the shell doesn't receive `t` by default unless we pass it. But the Shell defaults to `en` if not passed.
// Actually, for TR we need to pass `t`. A better way is:
// import { tr } from '../../i18n/tr';
// <Shell client:load t={tr} />

function makeAstroFixed(name, shellName, copyName, lang) {
  const isTr = lang === 'tr';
  const prefix = isTr ? '../../' : '../';
  const trImport = isTr ? `\nimport { tr } from '${prefix}i18n/tr';` : '';
  const tProp = isTr ? ` t={tr}` : '';

  return `---
import ToolPage from '${prefix}layouts/ToolPage.astro';
import { ${copyName} } from '${prefix}i18n/toolCopy';
import { ${shellName} } from '${prefix}components/${shellName}';${trImport}

const copy = ${copyName}.${lang};
---

<ToolPage
  title={copy.title}
  description={copy.description}
  h1={copy.h1}
  tagline={copy.tagline}
  howToName={copy.howToName}
  howItWorks={copy.howItWorks}
  steps={copy.steps}
  lang="${lang}"
>
  <${shellName} client:load${tProp} />
</ToolPage>
`;
}

fs.writeFileSync('./src/pages/remove-annotations.astro', makeAstroFixed('remove-annotations', 'RemoveAnnotationsShell', 'removeAnnotationsCopy', 'en'));
fs.writeFileSync('./src/pages/tr/remove-annotations.astro', makeAstroFixed('remove-annotations', 'RemoveAnnotationsShell', 'removeAnnotationsCopy', 'tr'));
fs.writeFileSync('./src/pages/pdf-to-webp.astro', makeAstroFixed('pdf-to-webp', 'PdfToWebpShell', 'pdfToWebpCopy', 'en'));
fs.writeFileSync('./src/pages/tr/pdf-to-webp.astro', makeAstroFixed('pdf-to-webp', 'PdfToWebpShell', 'pdfToWebpCopy', 'tr'));
fs.writeFileSync('./src/pages/auto-crop.astro', makeAstroFixed('auto-crop', 'AutoCropShell', 'autoCropCopy', 'en'));
fs.writeFileSync('./src/pages/tr/auto-crop.astro', makeAstroFixed('auto-crop', 'AutoCropShell', 'autoCropCopy', 'tr'));

console.log('Astro pages fixed!');
