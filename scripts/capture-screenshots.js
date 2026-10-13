const puppeteer = require('C:/Users/Nive/AppData/Roaming/npm/node_modules/puppeteer-core');
const path = require('path');

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Editor Canvas
  console.log('Capturing Editor Canvas...');
  await page.goto('http://localhost:3000/editor/wf-sample-welcome', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('.react-flow__node');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(__dirname, 'editor.png') });

  // 1b. Editor Node Drawer
  console.log('Capturing Editor with Node Config Drawer open...');
  const firstNode = await page.$('.react-flow__node');
  if (firstNode) {
    await firstNode.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(__dirname, 'editor_drawer.png') });
  }

  // 2. Plugins
  console.log('Capturing Plugins Hub...');
  await page.goto('http://localhost:3000/plugins', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'plugins.png') });

  // 3. Dashboard
  console.log('Capturing Dashboard...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'dashboard.png') });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

captureScreenshots().catch(console.error);
