import fs from 'fs';

const categories = {
  'Merge PDF': 'Organize PDF',
  'Split PDF': 'Organize PDF',
  'Organize PDF': 'Organize PDF',
  'N-Up PDF': 'Organize PDF',
  'Remove Blank Pages': 'Organize PDF',
  'Rotate PDF': 'Organize PDF',
  'Remove Pages': 'Organize PDF',
  'Add Page Numbers': 'Organize PDF',
  'Booklet PDF': 'Organize PDF',
  'Bates Numbering': 'Organize PDF',

  'Compress PDF': 'Optimize PDF',
  'Resize PDF': 'Optimize PDF',
  'Crop PDF': 'Optimize PDF',

  'PDF to PNG': 'Convert PDF',
  'PDF to JPG': 'Convert PDF',
  'PNG to PDF': 'Convert PDF',
  'JPG to PDF': 'Convert PDF',
  'PDF/A': 'Convert PDF',
  'Scan to PDF': 'Convert PDF',

  'Grayscale PDF': 'Edit PDF',
  'Flatten PDF': 'Edit PDF',
  'Sign PDF': 'Edit PDF',
  'PDF Compare': 'Edit PDF',

  'Protect PDF': 'PDF Security',
  'Unlock PDF': 'PDF Security',
  'Sanitize PDF': 'PDF Security',
  'Watermark PDF': 'PDF Security',
  'Redact PDF': 'PDF Security',

  'Extract Text': 'PDF Intelligence',
  'OCR PDF': 'PDF Intelligence',
  'Extract Images': 'PDF Intelligence',
  'Repair PDF': 'PDF Intelligence',
  'Reverse PDF': 'Organize PDF'
};

const trCategories = {
  'Organize PDF': 'Düzenle',
  'Optimize PDF': 'Optimize Et',
  'Convert PDF': 'Dönüştür',
  'Edit PDF': 'Düzenle & İmza',
  'PDF Security': 'Güvenlik',
  'PDF Intelligence': 'Yapay Zeka & Araçlar'
};

function processFile(path, isTr) {
  let content = fs.readFileSync(path, 'utf8');

  // Inject category into tools
  for (const [enName, cat] of Object.entries(categories)) {
    const finalCat = isTr ? trCategories[cat] : cat;
    // We need to match the tool by its href to be safe across languages, or just by name if it's the EN file
    // For TR file, it's safer to map by href.
    let hrefSlug = enName.toLowerCase().replace(/ /g, '-').replace(/\//g, '-').replace('pdf-a', 'pdf-a');
    if (enName === 'PDF to PNG') hrefSlug = 'pdf-to-png';
    if (enName === 'PDF to JPG') hrefSlug = 'pdf-to-jpg';
    if (enName === 'PNG to PDF') hrefSlug = 'png-to-pdf';
    if (enName === 'JPG to PDF') hrefSlug = 'img-to-pdf'; // exception
    if (enName === 'N-Up PDF') hrefSlug = 'n-up-pdf';
    if (enName === 'PDF/A') hrefSlug = 'pdf-a';
    if (enName === 'PDF Compare') hrefSlug = 'compare-pdf';

    const hrefMatch = isTr ? `/tr/${hrefSlug}` : `/${hrefSlug}`;
    
    // Find the object with this href
    const regex = new RegExp(`(href:\\s*'${hrefMatch}',\\s*idx:.*?,\\s*name:.*?,\\s*line:.*?,\\s*Icon:.*?,\\s*)(})`, 'gs');
    content = content.replace(regex, `$1category: '${finalCat}',\n  $2`);
    
    // Also try without trailing comma in Icon
    const regex2 = new RegExp(`(href:\\s*'${hrefMatch}',\\s*idx:.*?,\\s*name:.*?,\\s*line:.*?,\\s*Icon:.*?\\n\\s*)(})`, 'gs');
    content = content.replace(regex2, `$1category: '${finalCat}',\n  $2`);
  }

  // Inject UI
  const filterUI = isTr ? `
  <section class="mx-auto max-w-[1440px] px-4 pb-6">
    <div class="flex flex-wrap items-center justify-center gap-2" id="category-filters">
      <button class="filter-btn active rounded-full px-4 py-2 font-mono text-[13px] tracking-wide transition-colors duration-200 bg-amber text-bg dark:bg-amber-dark dark:text-bg-dark font-bold shadow-sm" data-category="All">Tümü</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Düzenle">Düzenle</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Optimize Et">Optimize Et</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Dönüştür">Dönüştür</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Düzenle & İmza">Düzenle & İmza</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Güvenlik">Güvenlik</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Yapay Zeka & Araçlar">Yapay Zeka & Araçlar</button>
    </div>
  </section>
` : `
  <section class="mx-auto max-w-[1440px] px-4 pb-6">
    <div class="flex flex-wrap items-center justify-center gap-2" id="category-filters">
      <button class="filter-btn active rounded-full px-4 py-2 font-mono text-[13px] tracking-wide transition-colors duration-200 bg-amber text-bg dark:bg-amber-dark dark:text-bg-dark font-bold shadow-sm" data-category="All">All</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Organize PDF">Organize PDF</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Optimize PDF">Optimize PDF</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Convert PDF">Convert PDF</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="Edit PDF">Edit PDF</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="PDF Security">PDF Security</button>
      <button class="filter-btn rounded-full border border-black/10 dark:border-white/10 bg-surface dark:bg-surface-dark px-4 py-2 font-mono text-[13px] tracking-wide text-ink-muted dark:text-ink-muted-dark hover:border-amber dark:hover:border-amber-dark transition-colors duration-200" data-category="PDF Intelligence">PDF Intelligence</button>
    </div>
  </section>
`;

  content = content.replace(/<section class="mx-auto max-w-\[1440px\] px-4 pb-\[16px\]">/, filterUI + '\n  <section class="mx-auto max-w-[1440px] px-4 pb-[16px]">');

  // Add data-category to li
  content = content.replace(/<li>(\s*)<a/g, '<li data-category={tool.category} class="tool-item transition-all duration-300 transform scale-100 opacity-100">$1<a');

  // Inject Script
  const scriptStr = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const filters = document.querySelectorAll('.filter-btn');
    const tools = document.querySelectorAll('.tool-item');
    
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active class
        filters.forEach(f => {
          f.classList.remove('bg-amber', 'text-bg', 'dark:bg-amber-dark', 'dark:text-bg-dark', 'font-bold', 'shadow-sm', 'active');
          f.classList.add('border', 'border-black/10', 'dark:border-white/10', 'bg-surface', 'dark:bg-surface-dark', 'text-ink-muted', 'dark:text-ink-muted-dark');
        });
        
        btn.classList.add('bg-amber', 'text-bg', 'dark:bg-amber-dark', 'dark:text-bg-dark', 'font-bold', 'shadow-sm', 'active');
        btn.classList.remove('border', 'border-black/10', 'dark:border-white/10', 'bg-surface', 'dark:bg-surface-dark', 'text-ink-muted', 'dark:text-ink-muted-dark');
        
        const category = btn.getAttribute('data-category');
        
        tools.forEach(tool => {
          if (category === 'All' || tool.getAttribute('data-category') === category) {
            tool.style.display = 'block';
            setTimeout(() => {
              tool.style.opacity = '1';
              tool.style.transform = 'scale(1)';
            }, 50);
          } else {
            tool.style.opacity = '0';
            tool.style.transform = 'scale(0.95)';
            setTimeout(() => {
              tool.style.display = 'none';
            }, 300); // match transition duration
          }
        });
      });
    });
  });
</script>
`;
  if (!content.includes('id="category-filters"')) {
    console.error('Failed to inject UI into', path);
  }
  if (!content.includes('data-category=')) {
     console.error('Failed to inject data-category into', path);
  }
  content = content + '\n' + scriptStr;

  fs.writeFileSync(path, content);
}

processFile('src/pages/index.astro', false);
processFile('src/pages/tr/index.astro', true);

