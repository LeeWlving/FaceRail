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
const identity = { namespace, collectionName }
const sampleId = 'smoke_sample_0'
const sampleIdentity = { ...identity, sampleId }
const collection = { ...identity, collectionComment: 'Local smoke collection', storageFaceInfo: true, sampleColumns: [], faceColumns: [] }
const samples = Array.from({ length: 12 }, (_, index) => ({ ...identity, sampleId: `smoke_sample_${index}`, sampleData: [], faces: [] }))
const copy = {
  'zh-CN': {
    search: '人脸搜索', searchButton: '开始搜索', searchCriteria: '查询条件', searchResults: '搜索结果',
    searchEmpty: '上传图片并开始搜索', missingIdentifiers: '请输入命名空间和集合名称', missingQueryImage: '请选择查询图片',
    namespace: '命名空间', collectionName: '集合名称', advanced: '高级参数', resultLimit: '返回数量', maximumFaces: '最多检测人脸', selectedImage: '已选择图片',
    sampleId: '样本 ID', matchScore: '匹配分', noMatches: '没有达到阈值的匹配',
    collections: '集合列表', query: '查询', collectionEmpty: '输入命名空间后查询', missingNamespace: '请输入命名空间',
    retainImages: '保留图片', yes: '是',
    compare: '人脸比对', compareButton: '开始比对', firstImage: '选择第一张图片', secondImage: '选择第二张图片',
    missingCompareImages: '请选择两张待比对图片', compareResults: '比对结果', highlySimilar: '高度相似',
    confidence: '相似度置信分', distance: '向量欧氏距离', faceInfo: '返回人脸位置与质量分',
    view: '查看', remove: '删除', collectionView: '查看集合', collectionRemove: '删除集合', collectionCreate: '创建集合',
    samples: '样本列表', sampleView: '查看样本', sampleRemove: '删除样本', sampleCreate: '创建样本', newSample: '新建样本',
    previous: '上一页', next: '下一页', pageSize: '每页数量', sort: '排序', newest: '最近创建',
    addFace: '添加人脸', faceCreate: '录入人脸', submitFace: '提交处理', faceStatus: '查看处理状态',
    permanentlyDelete: '永久删除', confirmDelete: '确认删除',
  },
  'en-US': {
    search: 'Face Search', searchButton: 'Search', searchCriteria: 'Search Criteria', searchResults: 'Search Results',
    searchEmpty: 'Upload an image to start searching', missingIdentifiers: 'Enter the namespace and collection name', missingQueryImage: 'Select a query image',
    namespace: 'Namespace', collectionName: 'Collection Name', advanced: 'Advanced Options', resultLimit: 'Result Limit', maximumFaces: 'Maximum Faces', selectedImage: 'Selected image',
    sampleId: 'Sample ID', matchScore: 'Match Score', noMatches: 'No matches reached the threshold',
    collections: 'Collection List', query: 'Search', collectionEmpty: 'Enter a namespace to search', missingNamespace: 'Enter a namespace',
    retainImages: 'Retain Images', yes: 'Yes',
    compare: 'Face Compare', compareButton: 'Compare', firstImage: 'Select first image', secondImage: 'Select second image',
    missingCompareImages: 'Select two images to compare', compareResults: 'Comparison Result', highlySimilar: 'Highly Similar',
    confidence: 'Similarity Confidence', distance: 'Vector Euclidean Distance', faceInfo: 'Return face location and quality score',
    view: 'View', remove: 'Delete', collectionView: 'View Collection', collectionRemove: 'Delete Collection', collectionCreate: 'Create Collection',
    samples: 'Sample List', sampleView: 'View Sample', sampleRemove: 'Delete Sample', sampleCreate: 'Create Sample', newSample: 'New Sample',
    previous: 'Previous', next: 'Next', pageSize: 'Items per Page', sort: 'Sort', newest: 'Newest First',
    addFace: 'Add Face', faceCreate: 'Enroll Face', submitFace: 'Submit', faceStatus: 'View Processing Status',
    permanentlyDelete: 'Delete Permanently', confirmDelete: 'Confirm Delete',
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

async function expandAdvanced(page, name) {
  const header = page.getByRole('button', { name, exact: true })
  await visible(header)
  assert.equal(await header.getAttribute('aria-expanded'), 'false')
  // Activate the focusable collapse header, not its nested title span.
  await header.press('Enter')
  await visible(page.getByRole('button', { name, exact: true, expanded: true }))
  const region = page.getByRole('region', { name, exact: true })
  await visible(region)
  assert.equal(await region.getAttribute('aria-hidden'), 'false')
  return region
}

async function checkRoute(page, baseUrl, path, query) {
  await page.waitForURL((url) => url.origin === baseUrl && url.pathname === path &&
    url.searchParams.size === Object.keys(query).length &&
    Object.entries(query).every(([key, value]) => url.searchParams.get(key) === String(value)))
  // Home keys RouterView by fullPath and remounts it through an out-in transition.
  // Wait for the replacement page before filling controls on the outgoing page.
  await page.waitForFunction(() => document.querySelector('.route-page') &&
    !document.querySelector('.page-enter-active, .page-leave-active'))
  assert.deepEqual(Object.fromEntries(new URL(page.url()).searchParams), query)
}

async function checkFields(page, text, values) {
  for (const [key, value] of Object.entries(values)) {
    // Detail pages contain both editable query fields and readonly identity fields.
    const fields = page.getByLabel(text[key], { exact: true })
    await visible(fields.first())
    for (const field of await fields.all()) assert.equal(await field.inputValue(), value)
  }
}

async function checkRouting(page, baseUrl, locale, apiRequests) {
  const text = copy[locale]
  const button = (name) => page.getByRole('button', { name, exact: true })
  const row = (id) => page.getByRole('row').filter({ has: page.getByRole('cell', { name: id, exact: true }) })
  const checkPage = async (path, query, title, fields = {}) => {
    await checkRoute(page, baseUrl, path, query)
    await checkLocale(page, locale, title)
    await checkFields(page, text, fields)
  }
  const checkAPI = (path, payload) => assert.deepEqual(apiRequests(path).at(-1)?.payload, payload)
  const pagination = (offset = '0', limit = '10', order = 'asc') => ({ ...identity, offset, limit, order })
  const checkSamples = async (query, firstId) => {
    await checkPage('/samples', query, text.samples, identity)
    await visible(page.getByRole('cell', { name: firstId, exact: true }))
    assert.equal(await page.getByRole('spinbutton', { name: text.pageSize, exact: true }).inputValue(), query.limit)
    assert.equal(await button(text.previous).isDisabled(), query.offset === '0')
    checkAPI('/visual/sample/list', query)
  }

  await row(collectionName).getByRole('button', { name: text.view, exact: true }).click()
  await checkPage('/collections/view', identity, text.collectionView, identity)
  checkAPI('/visual/collect/get', identity)
  await page.reload()
  await checkPage('/collections/view', identity, text.collectionView, identity)
  await button(text.sampleView).click()
  await checkSamples(pagination(), sampleId)

  // Numeric offset must add, not concatenate; the short final page disables Next.
  await button(text.next).click()
  await checkSamples(pagination('10'), 'smoke_sample_10')
  assert.equal(await button(text.next).isDisabled(), true)
  await page.reload()
  await checkSamples(pagination('10'), 'smoke_sample_10')
  await button(text.previous).click()
  await checkSamples(pagination(), sampleId)

  await page.getByRole('spinbutton', { name: text.pageSize, exact: true }).fill('2')
  await page.getByRole('spinbutton', { name: text.pageSize, exact: true }).press('Tab')
  const sort = page.locator('.el-select').filter({ has: page.getByRole('combobox', { name: text.sort, exact: true }) })
  await sort.click()
  await page.getByRole('option', { name: text.newest, exact: true }).click()
  await button(text.query).click()
  await checkSamples(pagination('0', '2', 'desc'), 'smoke_sample_11')
  await button(text.next).click()
  await checkSamples(pagination('2', '2', 'desc'), 'smoke_sample_9')
  await page.reload()
  await checkSamples(pagination('2', '2', 'desc'), 'smoke_sample_9')
  await visible(sort.getByText(text.newest, { exact: true }))

  // A locale switch must preserve the current page and query state.
  const otherLocale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'
  await page.getByText(otherLocale === 'en-US' ? 'EN' : '中文', { exact: true }).click()
  await checkLocale(page, otherLocale, copy[otherLocale].samples)
  await checkRoute(page, baseUrl, '/samples', pagination('2', '2', 'desc'))
  await page.getByText(locale === 'en-US' ? 'EN' : '中文', { exact: true }).click()
  await checkSamples(pagination('2', '2', 'desc'), 'smoke_sample_9')

  // push/back/forward must restore the list's replaced pagination entry.
  const selected = { ...identity, sampleId: 'smoke_sample_9' }
  await row(selected.sampleId).getByRole('button', { name: text.view, exact: true }).click()
  await checkPage('/samples/view', selected, text.sampleView, selected)
  checkAPI('/visual/sample/get', selected)
  await page.goBack()
  await checkSamples(pagination('2', '2', 'desc'), selected.sampleId)
  await page.goForward()
  await checkPage('/samples/view', selected, text.sampleView, selected)
  await page.reload()
  await checkPage('/samples/view', selected, text.sampleView, selected)
  await button(text.addFace).click()
  await checkPage('/faces/create', selected, text.faceCreate, selected)
  await page.reload()
  await checkPage('/faces/create', selected, text.faceCreate, selected)
  await page.locator('input[type="file"]').setInputFiles(imageFile)
  await visible(page.getByRole('img', { name: text.selectedImage, exact: true }))
  await submitAndWait(page, button(text.submitFace), '/api/visual/face/create')
  checkAPI('/visual/face/create', { ...selected, imageBase64, faceData: [] })
  await button(text.faceStatus).click()
  await checkPage('/samples/view', selected, text.sampleView, selected)
  checkAPI('/visual/sample/get', selected)

  // Exercise both string and function redirects using real deep links.
  const legacyRoutes = [
    ['/collect/list', '/collections', { namespace }, text.collections],
    ['/collect/create', '/collections/create', identity, text.collectionCreate],
    ['/collect/view', '/collections/view', identity, text.collectionView],
    ['/collect/remove', '/collections/remove', identity, text.collectionRemove],
    ['/sample/list', '/samples', pagination('2', '2', 'desc'), text.samples],
    ['/sample/create', '/samples/create', identity, text.sampleCreate],
    ['/sample/view', '/samples/view', sampleIdentity, text.sampleView],
    ['/sample/remove', '/samples/remove', sampleIdentity, text.sampleRemove],
    ['/face/create', '/faces/create', sampleIdentity, text.faceCreate],
    ['/search/mVn', '/search', identity, text.search],
    ['/compare/1v1', '/compare', identity, text.compare],
  ]
  for (const [legacy, path, query, title] of legacyRoutes) {
    await page.goto(`${baseUrl}${legacy}?${new URLSearchParams(query)}`)
    await checkPage(path, query, title)
    if (path === '/samples') await checkSamples(query, 'smoke_sample_9')
    else if (path === '/collections') await checkFields(page, text, { namespace })
    else if (!['/search', '/compare', '/collections/create'].includes(path)) {
      await checkFields(page, text, query)
    }
  }

  // Create/delete only local fixtures; assert outgoing identity and return navigation.
  await page.goto(`${baseUrl}/samples?${new URLSearchParams(identity)}`)
  await checkSamples(pagination(), sampleId)
  await button(text.newSample).click()
  await checkPage('/samples/create', identity, text.sampleCreate, identity)
  const created = { ...identity, sampleId: 'smoke_created' }
  await page.getByLabel(text.sampleId, { exact: true }).fill(created.sampleId)
  await page.locator('input[type="file"]').setInputFiles(imageFile)
  await visible(page.getByRole('img', { name: text.selectedImage, exact: true }))
  await submitAndWait(page, button(text.sampleCreate), '/api/visual/sample/create')
  checkAPI('/visual/sample/create', { ...created, imageBase64, sampleData: [], faceData: [] })
  await checkPage('/samples/view', created, text.sampleView, created)
  checkAPI('/visual/sample/get', created)
  await page.goBack()
  await checkPage('/samples/create', identity, text.sampleCreate, identity)
  await page.goBack()
  await checkSamples(pagination(), sampleId)
  await row(sampleId).getByRole('button', { name: text.remove, exact: true }).click()
  await checkPage('/samples/remove', sampleIdentity, text.sampleRemove, sampleIdentity)
  await page.reload()
  await checkPage('/samples/remove', sampleIdentity, text.sampleRemove, sampleIdentity)
  await button(text.permanentlyDelete).click()
  assert.equal(apiRequests('/visual/sample/delete').length, 0, 'Opening confirmation must not delete')
  await page.getByRole('dialog').getByRole('button', { name: text.confirmDelete, exact: true }).click()
  await checkSamples(pagination(), 'smoke_sample_1')
  checkAPI('/visual/sample/delete', sampleIdentity)
  assert.equal(apiRequests('/visual/sample/delete').length, 1)
  assert.equal(await page.getByRole('cell', { name: sampleId, exact: true }).count(), 0)

  await page.goto(`${baseUrl}/collections?${new URLSearchParams({ namespace })}`)
  await visible(row(collectionName))
  await row(collectionName).getByRole('button', { name: text.remove, exact: true }).click()
  await checkPage('/collections/remove', identity, text.collectionRemove, identity)
  await page.reload()
  await checkPage('/collections/remove', identity, text.collectionRemove, identity)
  await button(text.permanentlyDelete).click()
  assert.equal(apiRequests('/visual/collect/delete').length, 0, 'Opening confirmation must not delete')
  await page.getByRole('dialog').getByRole('button', { name: text.confirmDelete, exact: true }).click()
  await checkPage('/collections', { namespace }, text.collections, { namespace })
  await visible(page.getByText(text.collectionEmpty, { exact: true }))
  checkAPI('/visual/collect/delete', identity)
  assert.equal(apiRequests('/visual/collect/delete').length, 1)
  assert.equal(await page.getByRole('cell', { name: collectionName, exact: true }).count(), 0)
  console.log(`${locale}: collection/sample/face navigation, pagination, reload, history, create/delete, and all 11 legacy redirects passed`)
}

async function runLocale(browser, baseUrl, locale) {
  const text = copy[locale]
  const context = await browser.newContext({ locale, viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' })
  const errors = []
  const requests = []
  let mockSamples = structuredClone(samples)
  let collectionDeleted = false
  // Fail closed: only local production assets and explicitly mocked APIs are allowed.
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
      data = collectionDeleted ? [] : [collection]
    } else if (url.origin === baseUrl && request.method() === 'GET' && [
      '/api/visual/collect/get', '/api/visual/collect/delete',
      '/api/visual/sample/list', '/api/visual/sample/get', '/api/visual/sample/delete',
    ].includes(url.pathname)) {
      const payload = Object.fromEntries(url.searchParams)
      requests.push({ key, payload })
      if (url.pathname === '/api/visual/collect/get') data = collection
      if (url.pathname === '/api/visual/collect/delete') { collectionDeleted = true; data = null }
      if (url.pathname === '/api/visual/sample/get') data = mockSamples.find((sample) => sample.sampleId === payload.sampleId)
      if (url.pathname === '/api/visual/sample/list') {
        const ordered = payload.order === 'desc' ? [...mockSamples].reverse() : mockSamples
        data = ordered.slice(Number(payload.offset), Number(payload.offset) + Number(payload.limit))
      }
      if (url.pathname === '/api/visual/sample/delete') {
        mockSamples = mockSamples.filter((sample) => sample.sampleId !== payload.sampleId)
        data = null
      }
    } else if (url.origin === baseUrl && ['POST /api/visual/face/create', 'POST /api/visual/sample/create'].includes(key)) {
      const payload = request.postDataJSON()
      requests.push({ key, payload })
      data = { ...sampleIdentity, ...payload, faceId: 'smoke_face', embeddingStatus: 'ready' }
      if (url.pathname === '/api/visual/sample/create') {
        data = { namespace: payload.namespace, collectionName: payload.collectionName, sampleId: payload.sampleId, sampleData: payload.sampleData, faces: [] }
        mockSamples.push(data)
      }
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

    const searchOptions = await expandAdvanced(page, text.advanced)
    for (const [name, value] of [[text.resultLimit, '3'], [text.maximumFaces, '2']]) {
      const input = searchOptions.getByRole('spinbutton', { name, exact: true })
      await visible(input)
      const bounds = await input.boundingBox()
      assert.ok(bounds && bounds.width > 0 && bounds.height > 0, `${locale}: ${name} must have usable dimensions`)
      await input.fill(value)
      await input.press('Tab')
      assert.equal(await input.inputValue(), value)
    }
    await submitAndWait(page, searchButton, '/api/visual/search/do')
    await visible(page.getByRole('cell', { name: 'smoke_sample', exact: true }))
    assert.deepEqual(apiRequests('/visual/search/do').at(-1).payload, {
      namespace, collectionName, imageBase64, confidenceThreshold: 0, faceScoreThreshold: 0, limit: 3, maxFaceNum: 2,
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

    await checkRouting(page, baseUrl, locale, apiRequests)

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

    await expandAdvanced(page, text.advanced)
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
    console.error(`${locale}: route diagnostics: ${JSON.stringify({ url: page.url(), requests: requests.slice(-8), body: await page.locator('main').innerText() })}`)
    // Preserve useful evidence if a collapse state or its controls regress in CI.
    const collapse = await page.locator('.el-collapse-item').evaluateAll((items) => items.map((item) => {
      const header = item.querySelector('[role="button"]')
      const region = item.querySelector('[role="region"]')
      return {
        header: header?.outerHTML,
        expanded: header?.getAttribute('aria-expanded'),
        regionHidden: region?.getAttribute('aria-hidden'),
        regionStyle: region?.getAttribute('style'),
        inputs: [...item.querySelectorAll('input')].map((input) => ({
          id: input.id, value: input.value, visible: input.checkVisibility(),
          width: input.getBoundingClientRect().width, height: input.getBoundingClientRect().height,
        })),
      }
    }))
    console.error(`${locale}: collapse diagnostics: ${JSON.stringify(collapse)}`)
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
