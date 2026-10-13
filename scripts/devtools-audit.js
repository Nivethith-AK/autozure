const puppeteer = require('C:/Users/Nive/AppData/Roaming/npm/node_modules/puppeteer-core');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE_URL = 'http://localhost:3000';

const routes = [
  { name: 'Dashboard', path: '/' },
  { name: 'Editor', path: '/editor/wf-sample-welcome' },
  { name: 'Plugins Hub', path: '/plugins' },
  { name: 'Executions', path: '/executions' },
  { name: 'Settings', path: '/settings' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
];

async function runAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const allIssues = [];

  for (const route of routes) {
    console.log(`\n========================================`);
    console.log(`Auditing: ${route.name} (${BASE_URL}${route.path})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleLogs = [];
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        consoleErrors.push(text);
      } else if (type === 'warning') {
        // filter benign Next.js warnings if any
        consoleLogs.push(`[WARN] ${text}`);
      } else {
        consoleLogs.push(`[${type}] ${text}`);
      }
    });

    page.on('pageerror', err => {
      pageErrors.push(err.toString());
    });

    page.on('requestfailed', req => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText || 'failed'}`);
    });

    page.on('response', resp => {
      if (resp.status() >= 400) {
        failedRequests.push(`${resp.status()} ${resp.request().method()} ${resp.url()}`);
      }
    });

    try {
      const response = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });

      console.log(`HTTP Status: ${response.status()}`);

      // Wait a moment for React hydration and effects
      await new Promise(r => setTimeout(r, 1500));

      // Extra interactive tests for Editor
      if (route.name === 'Editor') {
        console.log('Testing Editor interactions...');
        // Check if canvas nodes exist
        const nodeCount = await page.$$eval('.react-flow__node', els => els.length);
        console.log(`Found ${nodeCount} ReactFlow nodes on canvas`);

        // Try clicking on the first node to open ParameterDrawer
        if (nodeCount > 0) {
          const firstNode = await page.$('.react-flow__node');
          await firstNode.click();
          await new Promise(r => setTimeout(r, 500));

          // Check if drawer or properties panel is visible
          const drawerVisible = await page.evaluate(() => {
            const el = document.querySelector('input, textarea, [data-testid="parameter-drawer"], aside');
            return !!el;
          });
          console.log(`Drawer / properties opened: ${drawerVisible}`);
        }

        // Test zoom/fit controls
        const controlsCount = await page.$$eval('.react-flow__controls button', els => els.length);
        console.log(`ReactFlow controls found: ${controlsCount}`);

        // Test Run Workflow button
        const runButton = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Run') || b.textContent.includes('Execute'));
          return btn ? btn.textContent.trim() : null;
        });
        console.log(`Run button found: ${runButton}`);
      }

      // Extra interactive tests for Plugins Hub
      if (route.name === 'Plugins Hub') {
        console.log('Testing Plugins Hub interactions...');
        // Test search input
        const searchInput = await page.$('input[placeholder*="Search"]');
        if (searchInput) {
          await searchInput.type('slack');
          await new Promise(r => setTimeout(r, 500));
          const visibleCards = await page.$$eval('[class*="border"]', els => els.length);
          console.log(`Search for 'slack' yielded cards count: ${visibleCards}`);
        }
      }

    } catch (err) {
      console.error(`Navigation or interaction error on ${route.path}:`, err.message);
      pageErrors.push(err.message);
    }

    if (consoleErrors.length > 0) {
      console.log(`\n❌ Console Errors (${consoleErrors.length}):`);
      consoleErrors.forEach(e => console.log(`   - ${e}`));
      allIssues.push({ route: route.path, type: 'console.error', items: consoleErrors });
    } else {
      console.log(`✅ Zero Console Errors`);
    }

    if (pageErrors.length > 0) {
      console.log(`\n❌ Page Uncaught Exceptions (${pageErrors.length}):`);
      pageErrors.forEach(e => console.log(`   - ${e}`));
      allIssues.push({ route: route.path, type: 'pageerror', items: pageErrors });
    } else {
      console.log(`✅ Zero Page Exceptions`);
    }

    if (failedRequests.length > 0) {
      console.log(`\n⚠️ Failed Network Requests (${failedRequests.length}):`);
      failedRequests.forEach(e => console.log(`   - ${e}`));
      allIssues.push({ route: route.path, type: 'failedRequests', items: failedRequests });
    } else {
      console.log(`✅ Zero Failed Requests`);
    }

    await page.close();
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`AUDIT COMPLETE. Total routes audited: ${routes.length}`);
  console.log(`Total issues detected: ${allIssues.length}`);
  console.log(`========================================`);
}

runAudit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
