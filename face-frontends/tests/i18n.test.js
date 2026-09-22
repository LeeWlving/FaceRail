import assert from 'node:assert/strict'
import test from 'node:test'

function installBrowserGlobals({ language = 'zh-CN', storedLocale = null } = {}) {
  const values = new Map()
  if (storedLocale) values.set('facerail.locale', storedLocale)

  Object.defineProperties(globalThis, {
    document: {
      configurable: true,
      value: {
        createElement: () => ({}),
        documentElement: { lang: '' },
      },
    },
    localStorage: {
      configurable: true,
      value: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      },
    },
    navigator: {
      configurable: true,
      value: { language },
    },
  })

  return values
}

test('selects, persists, and applies supported locales', async () => {
  const values = installBrowserGlobals({ language: 'zh-CN' })
  const i18n = await import(`../src/i18n.js?test=${Date.now()}`)

  assert.equal(i18n.currentLocale.value, 'zh-CN')
  assert.equal(i18n.translate('人脸搜索'), '人脸搜索')
  assert.equal(document.documentElement.lang, 'zh-CN')

  i18n.setLocale('en-US')
  assert.equal(i18n.currentLocale.value, 'en-US')
  assert.equal(i18n.translate('人脸搜索'), 'Face Search')
  assert.equal(i18n.translate('unknown message'), 'unknown message')
  assert.equal(i18n.translateWith('确认删除样本 {name}？', { name: 'alice' }), 'Delete sample alice?')
  assert.equal(values.get('facerail.locale'), 'en-US')
  assert.equal(document.documentElement.lang, 'en-US')

  i18n.setLocale('unsupported')
  assert.equal(i18n.currentLocale.value, 'en-US')
})

test('prefers a stored locale over the browser language', async () => {
  installBrowserGlobals({ language: 'zh-CN', storedLocale: 'en-US' })
  const i18n = await import(`../src/i18n.js?test=${Date.now()}-stored`)

  assert.equal(i18n.currentLocale.value, 'en-US')
  assert.equal(document.documentElement.lang, 'en-US')
})
