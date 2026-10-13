const puppeteer = require('C:/Users/Nive/AppData/Roaming/npm/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function deepAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  const consoleWarns = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[CONSOLE ERROR] ${msg.text()}`);
    if (msg.type() === 'warning') consoleWarns.push(`[CONSOLE WARN] ${msg.text()}`);
  });
  page.on('pageerror', err => pageErrors.push(`[PAGE ERROR] ${err.toString()}`));
  page.on('requestfailed', req => failedRequests.push(`[REQ FAILED] ${req.method()} ${req.url()}`));
  page.on('response', resp => {
    if (resp.status() >= 400) failedRequests.push(`[HTTP ${resp.status()}] ${resp.request().method()} ${resp.url()}`);
  });

  console.log('=== PART 1: AUDITING WORKFLOWS DASHBOARD WINDOW (/) ===');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Check title & metrics
  const dashboardTitle = await page.$eval('h1', el => el.innerText).catch(() => 'No H1');
  console.log(`1. Dashboard Title: "${dashboardTitle}"`);

  // 2. Test status filters: All, Active, Draft
  console.log('2. Testing Dashboard Status Filters...');
  const filterButtons = await page.$$('button');
  for (const btn of filterButtons) {
    const text = await (await btn.getProperty('innerText')).jsonValue();
    if (text.includes('Active (') || text.includes('Draft (') || text.includes('All (')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 300));
      console.log(`   Clicked filter: ${text.trim()}`);
    }
  }

  // 3. Test Search Box
  console.log('3. Testing Dashboard Search Box...');
  const searchInput = await page.$('input[placeholder*="Search workflows"]');
  if (searchInput) {
    await searchInput.type('Welcome');
    await new Promise(r => setTimeout(r, 400));
    const countAfterSearch = await page.$$eval('[class*="group hover:border-zinc-700"]', els => els.length).catch(() => 0);
    console.log(`   Search for 'Welcome' returned cards: ${countAfterSearch}`);
    // Clear search
    await searchInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await new Promise(r => setTimeout(r, 400));
  }

  // 4. Test "New Workflow" button modal / action
  console.log('4. Testing "New Workflow" button...');
  const newWorkflowBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('New Workflow'));
  });
  if (newWorkflowBtn) {
    await newWorkflowBtn.click();
    await new Promise(r => setTimeout(r, 600));
    // Check if dialog opened
    const dialogOpen = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"], [class*="dialog"]');
      return !!d;
    });
    console.log(`   New Workflow Dialog opened: ${dialogOpen}`);

    // If clicking New Workflow navigates to editor, test navigation and return
    console.log('   Clicking "New Workflow" button...');
    await newWorkflowBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    console.log(`   Navigated to: ${page.url()}`);
    if (page.url().includes('/editor/')) {
      console.log('   ✓ Blank workflow created and redirected to editor successfully!');
      // Navigate back to dashboard to finish dashboard tests
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('\n=== PART 2: AUDITING WORKFLOW EDITOR WINDOW (/editor/[id]) ===');
  await page.goto(`${BASE_URL}/editor/wf-sample-welcome`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.react-flow__node');
  await new Promise(r => setTimeout(r, 1000));

  // 5. Test Title editing
  console.log('5. Testing Workflow Title inline rename in Header...');
  const headerText = await page.$eval('header', el => el.innerText);
  console.log(`   Header text snippet: ${headerText.split('\n').slice(0, 3).join(' | ')}`);

  // 6. Test Webhook Modal
  console.log('6. Testing Webhook Button in Header...');
  const webhookBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Webhook'));
  });
  if (webhookBtn) {
    await webhookBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const webhookModalVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="dialog"] h2, [role="dialog"]')).some(d => d.textContent.includes('Webhook'));
    });
    console.log(`   Webhook Modal visible: ${webhookModalVisible}`);
    // Close modal
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  }

  // 7. Test Node Selection and Parameter Drawer Tabs
  console.log('7. Testing Node Selection and Drawer Tabs (Params, Test, Inspect, Docs)...');
  const canvasNodes = await page.$$('.react-flow__node');
  console.log(`   Found ${canvasNodes.length} nodes on canvas`);
  if (canvasNodes.length > 0) {
    await canvasNodes[0].click();
    await new Promise(r => setTimeout(r, 600));

    // Check tabs in drawer
    const drawerTabs = await page.$$eval('aside button[role="tab"]', els => els.map(e => e.textContent.trim()));
    console.log(`   Drawer Tabs: ${drawerTabs.join(', ')}`);

    // Click each tab
    for (const tabName of ['Params', 'Test', 'Inspect', 'Docs']) {
      const tabHandle = await page.evaluateHandle((name) => {
        return Array.from(document.querySelectorAll('aside button[role="tab"]')).find(t => t.textContent.includes(name));
      }, tabName);
      if (tabHandle) {
        const canClick = await page.evaluate(el => !!el, tabHandle);
        if (canClick) {
          await tabHandle.click();
          await new Promise(r => setTimeout(r, 300));
          console.log(`   Switched to drawer tab: ${tabName}`);
        }
      }
    }

    // On Test tab, test "Execute Step Test"
    const testStepBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('aside button')).find(b => b.textContent.includes('Execute Step Test'));
    });
    if (testStepBtn && await page.evaluate(el => !!el, testStepBtn)) {
      console.log('   Testing Live Step Evaluator button...');
      await testStepBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const testResultSuccess = await page.evaluate(() => {
        return document.querySelector('aside')?.textContent?.includes('Step Execution Succeeded');
      });
      console.log(`   Step Execution Succeeded: ${testResultSuccess}`);
    }

    // Switch back to Params
    const paramsTab = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('aside button[role="tab"]')).find(t => t.textContent.includes('Params'));
    });
    if (paramsTab && await page.evaluate(el => !!el, paramsTab)) await paramsTab.click();

    // Close drawer via X button
    const closeDrawerBtn = await page.$('aside button:has(svg.lucide-x), aside button');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
      await new Promise(r => setTimeout(r, 300));
      console.log('   Closed parameter drawer.');
    }
  }

  // 8. Test Add Node Drawer
  console.log('8. Testing Add Node Drawer and Search Filter...');
  const addNodeBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Node'));
  });
  if (addNodeBtn) {
    await addNodeBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Test category filter pills
    const pills = await page.$$eval('aside button.capitalize', els => els.map(e => e.textContent.trim()));
    console.log(`   Library category pills (${pills.length}): ${pills.slice(0, 6).join(', ')}...`);

    // Close library
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
  }

  // 9. Test Run Workflow button
  console.log('9. Testing Run Workflow execution & telemetry panel...');
  const runBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run Workflow'));
  });
  if (runBtn) {
    await runBtn.click();
    await new Promise(r => setTimeout(r, 3500));

    const panelContent = await page.evaluate(() => {
      const p = document.querySelector('div.fixed.bottom-0');
      return p ? p.innerText.split('\n').slice(0, 8).join(' | ') : 'No panel';
    });
    console.log(`   Execution result: ${panelContent}`);
  }

  // 10. Check edges & handles rendering
  console.log('10. Inspecting Edges and Handles in DOM...');
  const edgeCount = await page.$$eval('.react-flow__edge', els => els.length);
  const handleCount = await page.$$eval('.react-flow__handle', els => els.length);
  console.log(`    Canvas Edge count: ${edgeCount}`);
  console.log(`    Canvas Handle count: ${handleCount}`);

  // Summary
  console.log('\n=== AUDIT RESULTS SUMMARY ===');
  console.log(`Console Errors: ${consoleErrors.length}`);
  consoleErrors.forEach(e => console.log('  ', e));

  console.log(`Console Warnings: ${consoleWarns.length}`);
  consoleWarns.slice(0, 5).forEach(w => console.log('  ', w));

  console.log(`Page Uncaught Errors: ${pageErrors.length}`);
  pageErrors.forEach(e => console.log('  ', e));

  console.log(`Failed HTTP Requests: ${failedRequests.length}`);
  failedRequests.forEach(r => console.log('  ', r));

  await browser.close();
}

deepAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
