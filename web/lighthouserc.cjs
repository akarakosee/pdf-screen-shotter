// Lighthouse CI (quality gate 3): ≥95 in all four categories on / and
// /pdf-to-png, CLS ≈ 0 with the ad slot reserved at fixed height.
module.exports = {
  ci: {
    collect: {
      staticDistDir: 'dist',
      url: ['http://localhost/index.html', 'http://localhost/pdf-to-png/index.html'],
      numberOfRuns: 1,
      settings: {
        chromePath: process.env.CHROME_PATH || undefined,
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.02 }],
      },
    },
  },
};
