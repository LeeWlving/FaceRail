import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { preview } from 'vite'

// Exercise the built app without a Rails server, credentials, or real face images.
const root = fileURLToPath(new URL('../', import.meta.url))
const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
const imageBase64B = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNg+A8AAQIBAEK+vGgAAAAASUVORK5CYII='
const imageFile = { name: 'smoke.png', mimeType: 'image/png', buffer: Buffer.from(imageBase64, 'base64') }
const imageFileB = { ...imageFile, name: 'smoke-b.png', buffer: Buffer.from(imageBase64B, 'base64') }
const location = { x: 0, y: 0, w: 1, h: 1 }
const namespace = 'smoke_space'
const collectionName = 'smoke_faces'
const copy = {
  'zh-CN': {
    search: '人脸搜索', searchButton: '开始搜索', searchCriteria: '查询条件', searchResults: '搜索结果',
    searchEmpty: '上传图片并开始搜索', missingIdentifiers: '请输入命名空间和集合名称', missingQueryImage: '请选择查询图片',
    namespace: '命名空间', collectionName: '集合名称', advanced: '高级参数', selectedImage: '已选择图片',
    sampleId: '样本 ID', matchScore: '匹配分', noMatches: '没有达到阈值的匹配',
    collections: '集合列表', query: '查询', collectionEmpty: '输入命名空间后查询', missingNamespace: '请输入命名空间',
    retainImages: '保留图片', yes: '是',
    compare: '人脸比对', compareButton: '开始比对', firstImage: '选择第一张图片', secondImage: '选择第二张图片',
    missingCompareImages: '请选择两张待比对图片', compareResults: '比对结果', highlySimilar: '高度相似',
    confidence: '相似度置信分', distance: '向量欧氏距离', faceInfo: '返回人脸位置与质量分',
  },
  'en-US': {
    search: 'Face Search', searchButton: 'Search', searchCriteria: 'Search Criteria', searchResults: 'Search Results',
    searchEmpty: 'Upload an image to start searching', missingIdentifiers: 'Enter the namespace and collection name', missingQueryImage: 'Select a query image',
    namespace: 'Namespace', collectionName: 'Collection Name', advanced: 'Advanced Options', selectedImage: 'Selected image',
    sampleId: 'Sample ID', matchScore: 'Match Score', noMatches: 'No matches reached the threshold',
    collections: 'Collection List', query: 'Search', collectionEmpty: 'Enter a namespace to search', missingNamespace: 'Enter a namespace',
    retainImages: 'Retain Images', yes: 'Yes',
    compare: 'Face Compare', compareButton: 'Compare', firstImage: 'Select first image', secondImage: 'Select second image',
    missingCompareImages: 'Select two images to compare', compareResults: 'Comparison Result', highlySimilar: 'Highly Similar',
    confidence: 'Similarity Confidence', distance: 'Vector Euclidean Distance', faceInfo: 'Return face location and quality score',
  },
}

async function visible(locator) {
  await locator.waitFor({ state: 'visible' })
}

async function checkLocale(page, locale, title) {
  await visible(page.getByRole('heading', { level: 1, name: title, exact: true }))
  assert.equal(await page.locator('html').getAttribute('lang'), locale)
}

async function submitAndWait(page, button, path) {
  const [response] = await Promise.all([
    page.waitForResponse((response) => new URL(response.url()).pathname === path && response.request().method() === 'POST'),
    button.click(),
  ])
  assert.equal(response.status(), 200)
  assert.equal(await response.finished(), null)
}

async function runLocale(browser, baseUrl, locale) {
  const text = copy[locale]
  const context = await browser.newContext({ locale, viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' })
  const errors = []
  const requests = []
  // Fail closed: only production assets and these three local mocked APIs are allowed.
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const key = `${request.method()} ${url.pathname}`
    let data
    if (url.origin === baseUrl && key === 'POST /api/visual/search/do') {
      requests.push({ key, payload: request.postDataJSON() })
      data = [
        { faceScore: 97, location, match: [{ sampleId: 'smoke_sample', faceId: 'smoke_face', confidence: 98.5, sampleData: [{ key: 'label', value: 'local fixture' }] }] },
        { faceScore: 90, location, match: [] },
      ]
    } else if (url.origin === baseUrl && key === 'GET /api/visual/collect/list') {
      requests.push({ key, payload: Object.fromEntries(url.searchParams) })
      data = [{ namespace, collectionName, collectionComment: 'Local smoke collection', storageFaceInfo: true, sampleColumns: [], faceColumns: [] }]
    } else if (url.origin === baseUrl && key === 'POST /api/visual/compare/do') {
      const payload = request.postDataJSON()
      requests.push({ key, payload })
      data = {
        confidence: 91.25, distance: 0.1875,
        faceInfo: payload.needFaceInfo === false ? null : { locationA: location, locationB: location, faceScoreA: 95, faceScoreB: 96 },
      }
    } else if (url.origin === baseUrl && request.method() === 'GET' && ['document', 'script', 'stylesheet', 'image', 'font'].includes(request.resourceType()) && !/^\/(api|visual|rails)\//.test(url.pathname)) {
      await route.continue()
      return
    } else {
      errors.push(`Unexpected network request: ${request.method()} ${request.url()}`)
      await route.abort('blockedbyclient')
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data, message: '' }) })
  })

  const page = await context.newPage()
  page.setDefaultTimeout(10_000)
  page.on('pageerror', (error) => errors.push(`Uncaught error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`Console error: ${message.text()}`)
  })
  const apiRequests = (path) => requests.filter(({ key }) => key.endsWith(path))

  try {
    const response = await page.goto(`${baseUrl}/search`)
    assert.equal(response.status(), 200)
    await checkLocale(page, locale, text.search)
    await visible(page.getByRole('heading', { name: text.searchCriteria, exact: true }))
    await visible(page.getByText(text.searchEmpty, { exact: true }))

    // Switch through the actual UI, then reload to verify persisted preference.
    const otherLocale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'
    await page.getByText(otherLocale === 'en-US' ? 'EN' : '中文', { exact: true }).click()
    await checkLocale(page, otherLocale, copy[otherLocale].search)
    assert.equal(await page.evaluate(() => localStorage.getItem('facerail.locale')), otherLocale)
    await page.reload()
    await checkLocale(page, otherLocale, copy[otherLocale].search)
    await page.getByText(locale === 'en-US' ? 'EN' : '中文', { exact: true }).click()
    await checkLocale(page, locale, text.search)

    // Search validates before sending, reads an upload, and renders matched/unmatched faces.
    const searchButton = page.getByRole('button', { name: text.searchButton, exact: true })
    await searchButton.click()
    await visible(page.getByText(text.missingIdentifiers, { exact: true }))
    await page.getByLabel(text.namespace, { exact: true }).fill(namespace)
    await page.getByLabel(text.collectionName, { exact: true }).fill(collectionName)
    await searchButton.click()
    await visible(page.getByText(text.missingQueryImage, { exact: true }))
    assert.equal(requests.length, 0, 'Invalid search must not call an API')
    await page.locator('input[type="file"]').setInputFiles(imageFile)
    await visible(page.getByRole('img', { name: text.selectedImage, exact: true }))
    await submitAndWait(page, searchButton, '/api/visual/search/do')
    await visible(page.getByRole('cell', { name: 'smoke_sample', exact: true }))
    await visible(page.getByRole('heading', { name: text.searchResults, exact: true }))
    await visible(page.getByRole('columnheader', { name: text.sampleId, exact: true }).first())
    await visible(page.getByRole('columnheader', { name: text.matchScore, exact: true }).first())
    await visible(page.getByText(text.noMatches, { exact: true }))
    await visible(page.getByRole('cell', { name: '98.50', exact: true }))
    assert.deepEqual(apiRequests('/visual/search/do').map(({ payload }) => payload), [{ namespace, collectionName, imageBase64 }])

    await page.getByText(text.advanced, { exact: true }).click()
    await page.getByRole('spinbutton').first().fill('3')
    await submitAndWait(page, searchButton, '/api/visual/search/do')
    await visible(page.getByRole('cell', { name: 'smoke_sample', exact: true }))
    assert.deepEqual(apiRequests('/visual/search/do').at(-1).payload, {
      namespace, collectionName, imageBase64, confidenceThreshold: 0, faceScoreThreshold: 0, limit: 3, maxFaceNum: 5,
    })
    assert.equal(apiRequests('/visual/search/do').length, 2)
    console.log(`${locale}: search validation, upload, results, advanced options, and locale persistence passed`)

    // Navigate using translated navigation; query parameters must survive reload.
    await page.getByRole('link', { name: text.collections, exact: true }).click()
    await checkLocale(page, locale, text.collections)
    await visible(page.getByText(text.collectionEmpty, { exact: true }))
    await page.getByRole('button', { name: text.query, exact: true }).click()
    await visible(page.getByText(text.missingNamespace, { exact: true }))
    assert.equal(apiRequests('/visual/collect/list').length, 0)
    await page.getByLabel(text.namespace, { exact: true }).fill(` ${namespace} `)
    await page.getByRole('button', { name: text.query, exact: true }).click()
    await page.waitForURL(`${baseUrl}/collections?namespace=${namespace}`)
    await visible(page.getByRole('cell', { name: collectionName, exact: true }))
    await visible(page.getByRole('columnheader', { name: text.retainImages, exact: true }))
    await visible(page.getByRole('cell', { name: text.yes, exact: true }))
    await page.reload()
    await checkLocale(page, locale, text.collections)
    await visible(page.getByRole('cell', { name: collectionName, exact: true }))
    assert.equal(await page.getByLabel(text.namespace, { exact: true }).inputValue(), namespace)
    const collectionRequests = apiRequests('/visual/collect/list')
    assert.ok(collectionRequests.length >= 2, 'Query and reload must both load collections')
    for (const { payload } of collectionRequests) assert.deepEqual(payload, { namespace })
    console.log(`${locale}: collection validation, query, translated table, and reload passed`)

    await page.getByRole('link', { name: text.compare, exact: true }).click()
    await checkLocale(page, locale, text.compare)
    await visible(page.getByText(text.firstImage, { exact: true }))
    await visible(page.getByText(text.secondImage, { exact: true }))
    const compareButton = page.getByRole('button', { name: text.compareButton, exact: true })
    await compareButton.click()
    await visible(page.getByText(text.missingCompareImages, { exact: true }))
    assert.equal(apiRequests('/visual/compare/do').length, 0)
    await page.locator('input[type="file"]').nth(0).setInputFiles(imageFile)
    await page.locator('input[type="file"]').nth(1).setInputFiles(imageFileB)
    await visible(page.getByRole('img', { name: text.selectedImage, exact: true }).nth(1))
    await submitAndWait(page, compareButton, '/api/visual/compare/do')
    await visible(page.getByRole('heading', { name: text.compareResults, exact: true }))
    await visible(page.getByText(text.highlySimilar, { exact: true }))
    await visible(page.getByText(text.confidence, { exact: true }))
    await visible(page.getByText(text.distance, { exact: true }))
    await visible(page.getByText('91.25', { exact: true }))
    await visible(page.getByText('0.1875', { exact: true }))
    assert.equal(await page.locator('.face-previews .face-overlay').count(), 2)
    assert.deepEqual(apiRequests('/visual/compare/do').map(({ payload }) => payload), [{ imageBase64A: imageBase64, imageBase64B }])

    await page.getByText(text.advanced, { exact: true }).click()
    const faceInfoCheckbox = page.getByRole('checkbox', { name: text.faceInfo, exact: true })
    assert.equal(await faceInfoCheckbox.isChecked(), true)
    // Element Plus hides the native input; use the visible translated label.
    await page.getByText(text.faceInfo, { exact: true }).click()
    assert.equal(await faceInfoCheckbox.isChecked(), false)
    await submitAndWait(page, compareButton, '/api/visual/compare/do')
    await visible(page.getByRole('heading', { name: text.compareResults, exact: true }))
    assert.deepEqual(apiRequests('/visual/compare/do').at(-1).payload, {
      imageBase64A: imageBase64, imageBase64B, faceScoreThreshold: 0, needFaceInfo: false,
    })
    assert.equal(apiRequests('/visual/compare/do').length, 2)
    assert.equal(await page.locator('.face-previews').count(), 0)
    assert.deepEqual(errors, [], `${locale}: browser and network errors`)
    console.log(`${locale}: compare validation, two uploads, translated metrics, and optional face info passed`)
  } catch (error) {
    if (errors.length) console.error(errors.join('\n'))
    throw new Error(`${locale}: ${error.message}`, { cause: error })
  } finally {
    await context.close()
  }
}

await access(new URL('../dist/index.html', import.meta.url))
// Disable inherited development proxies as an additional guard against backend calls.
const server = await preview({ root, preview: { host: '127.0.0.1', port: 0, strictPort: true, proxy: {} } })
let browser
try {
  const baseUrl = `http://127.0.0.1:${server.httpServer.address().port}`
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
  for (const locale of Object.keys(copy)) await runLocale(browser, baseUrl, locale)
  console.log('Locale smoke checks passed for zh-CN and en-US against production assets; all APIs were mocked.')
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()))
}
