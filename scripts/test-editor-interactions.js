const puppeteer = require('C:/Users/Nive/AppData/Roaming/npm/node_modules/puppeteer-core');

async function testEditorInteractions() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => errors.push(`Page Error: ${err.message}`));

  console.log('1. Navigating to Editor...');
  await page.goto('http://localhost:3000/editor/wf-sample-welcome', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.react-flow__node');

  const initialNodeCount = await page.$$eval('.react-flow__node', els => els.length);
  console.log(`   Initial canvas nodes: ${initialNodeCount}`);

  console.log('2. Opening Node Library Drawer...');
  const addNodeBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Node'));
  });
  if (addNodeBtn) {
    await addNodeBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const libraryDrawerVisible = await page.evaluate(() => {
      return !!document.querySelector('aside');
    });
    console.log(`   Library drawer opened: ${libraryDrawerVisible}`);

    // Click on the first node in the library to add it
    console.log('3. Inserting a node from library into canvas...');
    const firstLibraryItem = await page.$('aside div[draggable]');
    if (firstLibraryItem) {
      await firstLibraryItem.click();
      await new Promise(r => setTimeout(r, 600));
      const newNodeCount = await page.$$eval('.react-flow__node', els => els.length);
      console.log(`   Nodes on canvas after insert: ${newNodeCount} (Expected: ${initialNodeCount + 1})`);
    }

    // Close library
    const closeBtn = await page.$('aside button');
    if (closeBtn) await closeBtn.click();
  }

  console.log('4. Selecting a canvas node...');
  const nodes = await page.$$('.react-flow__node');
  if (nodes.length > 0) {
    await nodes[0].click();
    await new Promise(r => setTimeout(r, 600));

    // Check if Parameter Drawer is open on the right
    const configDrawer = await page.evaluate(() => {
      const asides = Array.from(document.querySelectorAll('aside'));
      return asides.some(a => a.textContent.includes('Params') || a.textContent.includes('Test') || a.textContent.includes('Inspect'));
    });
    console.log(`   Parameter drawer open: ${configDrawer}`);
  }

  console.log('5. Clicking Auto-Align button...');
  const autoAlignBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Auto-Align'));
  });
  if (autoAlignBtn) {
    await autoAlignBtn.click();
    console.log('   Auto-Align triggered successfully');
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('6. Saving workflow...');
  const saveBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save'));
  });
  if (saveBtn) {
    await saveBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('   Save triggered successfully');
  }

  console.log('7. Running workflow...');
  const runBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run Workflow'));
  });
  if (runBtn) {
    await runBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    const executionStatus = await page.evaluate(() => {
      const el = document.querySelector('div.fixed.bottom-0');
      return el ? el.innerText.includes('SUCCESS') : false;
    });
    console.log(`   Workflow run status SUCCESS: ${executionStatus}`);
  }

  console.log(`\nInteractive audit complete. Total unexpected errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error('  ', e));
  }

  await browser.close();
}

testEditorInteractions().catch(console.error);
