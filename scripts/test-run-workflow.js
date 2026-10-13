const puppeteer = require('C:/Users/Nive/AppData/Roaming/npm/node_modules/puppeteer-core');

async function testWorkflowExecution() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log(`[PAGE ${msg.type().toUpperCase()}]`, msg.text()));
  page.on('pageerror', err => console.error('[PAGE UNCAUGHT ERROR]', err));
  page.on('response', resp => {
    if (resp.status() >= 400) console.warn(`[HTTP ${resp.status()}]`, resp.request().method(), resp.url());
  });

  console.log('Navigating to editor...');
  await page.goto('http://localhost:3000/editor/wf-sample-welcome', { waitUntil: 'networkidle2' });

  // Wait for loading to finish and buttons to appear
  await page.waitForSelector('button');
  await new Promise(r => setTimeout(r, 1000));

  const buttons = await page.$$('button');
  const buttonTexts = await page.$$eval('button', els => els.map(b => b.textContent.trim()));
  console.log('Available buttons:', buttonTexts);

  const runIdx = buttonTexts.findIndex(t => t.includes('Run Workflow'));
  if (runIdx !== -1) {
    console.log(`Clicking 'Run Workflow' at index ${runIdx}...`);
    await buttons[runIdx].click();

    // Wait 4 seconds for execution to process
    await new Promise(r => setTimeout(r, 4000));

    const panelContent = await page.evaluate(() => {
      const el = document.querySelector('div.fixed.bottom-0');
      return el ? el.innerText : 'Execution panel not found in DOM';
    });

    console.log('\n--- Execution Panel Output ---');
    console.log(panelContent.slice(0, 500));
  } else {
    console.error('Run Workflow button not found!');
  }

  await browser.close();
}

testWorkflowExecution().catch(console.error);
