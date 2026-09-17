import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173'
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outputDir = process.env.SCREENSHOT_DIR || '/tmp/facerail-visual-check'
const routes = ['/search', '/compare', '/collections', '/collections/create', '/samples', '/samples/create', '/faces/create']
const errors = []

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ executablePath: chromePath, headless: true })

try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) errors.push(`${route}: console ${message.type()}: ${message.text()}`)
    })
    page.on('pageerror', (error) => errors.push(`${route}: page: ${error.message}`))

    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    if (!response?.ok()) errors.push(`${route}: HTTP ${response?.status() || 'no response'}`)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    if (overflow) errors.push(`${route}: horizontal overflow at desktop viewport`)

    if (route === '/search') {
      await page.screenshot({ path: `${outputDir}/search-desktop.png`, fullPage: true })
    }
    await page.close()
  }

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  mobile.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(`/search mobile: console ${message.type()}: ${message.text()}`)
  })
  mobile.on('pageerror', (error) => errors.push(`/search mobile: page: ${error.message}`))
  await mobile.goto(`${baseUrl}/search`, { waitUntil: 'networkidle' })
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (mobileOverflow) errors.push('/search: horizontal overflow at mobile viewport')
  await mobile.screenshot({ path: `${outputDir}/search-mobile.png`, fullPage: true })
  await mobile.close()
} finally {
  await browser.close()
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Visual checks passed. Screenshots: ${outputDir}`)
}
