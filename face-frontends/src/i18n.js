import { computed, readonly, ref } from 'vue'

const STORAGE_KEY = 'facerail.locale'
const supportedLocales = ['zh-CN', 'en-US']
const initialLocale = supportedLocales.includes(localStorage.getItem(STORAGE_KEY))
  ? localStorage.getItem(STORAGE_KEY)
  : (navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US')
const locale = ref(initialLocale)

const en = {
  '视觉检索控制台': 'Visual Search Console', '关闭导航': 'Close navigation', '打开导航': 'Open navigation', '主导航': 'Main navigation',
  '识别': 'Recognition', '集合': 'Collections', '数据': 'Data', '人脸搜索': 'Face Search', '人脸比对': 'Face Compare',
  '集合列表': 'Collection List', '创建集合': 'Create Collection', '查看集合': 'View Collection', '删除集合': 'Delete Collection',
  '样本列表': 'Sample List', '创建样本': 'Create Sample', '新建样本': 'New Sample', '查看样本': 'View Sample', '删除样本': 'Delete Sample', '录入人脸': 'Enroll Face',
  '命名空间': 'Namespace', '集合名称': 'Collection Name', '集合描述': 'Collection Description', '保留人脸图片': 'Retain Face Images',
  '存储方式': 'Storage', '样本字段': 'Sample Fields', '人脸字段': 'Face Fields', '是': 'Yes', '否': 'No',
  '请输入命名空间': 'Enter a namespace', '请输入集合名称': 'Enter a collection name', '请输入样本 ID': 'Enter a sample ID',
  '仅支持小写字母、数字和下划线': 'Only lowercase letters, numbers, and underscores are allowed', '格式不正确': 'Invalid format',
  '字段定义': 'Field Definitions', '扩展数据': 'Custom Data', '添加': 'Add', '暂无字段': 'No fields', '名称': 'Name',
  '字段名称': 'Field name', '类型': 'Type', '描述': 'Description', '值': 'Value', '字段描述': 'Field description', '字段值': 'Field value', '删除': 'Delete',
  '已选择图片': 'Selected image', 'JPG、PNG 或 WebP，最大 10 MB': 'JPG, PNG, or WebP, up to 10 MB', '移除图片': 'Remove image',
  '选择查询图片': 'Select query image', '人脸分析图片': 'Face analysis image', '样本 ID': 'Sample ID', '样本扩展数据': 'Sample Custom Data',
  '等待处理': 'Pending', '生成中': 'Processing', '可搜索': 'Searchable', '失败': 'Failed',
  '定义命名空间、数据结构和人脸图片留存策略。': 'Define the namespace, data schema, and face image retention policy.',
  '集合配置': 'Collection Settings', '集合创建成功': 'Collection created', '按命名空间查看人脸集合及字段规模。': 'Browse face collections and their schemas by namespace.',
  '新建集合': 'New Collection', '例如 production': 'e.g. production', '查询': 'Search', '条': 'items', '输入命名空间后查询': 'Enter a namespace to search',
  '保留图片': 'Retain Images', '操作': 'Actions', '查看': 'View', '查看集合配置及样本、人脸扩展字段。': 'View collection settings and custom sample and face fields.',
  '未填写': 'Not provided', '分片 / 副本': 'Shards / Replicas', '未定义样本字段': 'No sample fields defined',
  '未定义人脸字段': 'No face fields defined', '输入集合标识查看配置': 'Enter a collection identifier to view its settings',
  '请输入命名空间和集合名称': 'Enter the namespace and collection name',
  '删除集合会一并移除其中的样本、人脸和图片，此操作不可恢复。': 'Deleting a collection also removes its samples, faces, and images. This cannot be undone.',
  '危险操作': 'Danger Zone', '请确认当前集合已不再使用': 'Make sure this collection is no longer in use', '永久删除': 'Delete Permanently',
  '确认删除': 'Confirm Delete', '取消': 'Cancel', '集合已删除': 'Collection deleted',
  '确认删除集合 {name}？': 'Delete collection {name}?', '确认删除样本 {name}？': 'Delete sample {name}?', '确认删除人脸 {name}？': 'Delete face {name}?',
  '创建身份样本并上传首张人脸，后台会自动生成可搜索的 ArcFace 向量。': 'Create an identity sample and upload its first face. A searchable ArcFace vector will be generated in the background.',
  '样本信息': 'Sample Information', '首张人脸': 'First Face', '选择样本人脸图片': 'Select sample face image', '高级参数': 'Advanced Options',
  '人脸质量阈值': 'Face quality threshold', '模型默认': 'Model default', '同样本最低相似度': 'Minimum same-sample similarity',
  '异样本最高相似度': 'Maximum different-sample similarity', '默认关闭': 'Disabled by default', '请选择样本人脸图片': 'Select a sample face image',
  '样本已创建，正在生成人脸向量': 'Sample created; generating face vector', '浏览集合中的身份样本和人脸向量处理状态。': 'Browse identity samples and face vector processing status.',
  '每页数量': 'Items per Page', '排序': 'Sort', '最早创建': 'Oldest First', '最近创建': 'Newest First', '样本': 'Samples',
  '上一页': 'Previous', '下一页': 'Next', '偏移': 'Offset', '暂无样本': 'No samples', '该样本尚未录入人脸': 'No faces enrolled for this sample',
  '人脸 ID': 'Face ID', '质量分': 'Quality Score', '向量状态': 'Vector Status', '错误信息': 'Error', '人脸数据': 'Face Data', '人脸数': 'Faces', '无': 'None',
  '更新样本扩展数据，并管理该样本下的人脸记录。': 'Update sample custom data and manage its face records.', '添加人脸': 'Add Face',
  '保存扩展数据': 'Save Custom Data', '人脸记录': 'Face Records', '尚未录入人脸': 'No faces enrolled', '输入样本标识查看详情': 'Enter a sample identifier to view details',
  '请输入完整的样本标识': 'Enter the complete sample identifier', '样本已更新': 'Sample updated', '删除人脸': 'Delete Face', '人脸已删除': 'Face deleted',
  '删除样本会同时删除其人脸记录和已存储图片，此操作不可恢复。': 'Deleting a sample also removes its face records and stored images. This cannot be undone.',
  '确认该身份样本已不再参与搜索': 'Make sure this identity sample is no longer needed for search', '样本已删除': 'Sample deleted',
  '从查询图片提取 ArcFace 向量，通过 pgvector 余弦距离返回最相似的人脸。': 'Extract ArcFace vectors from the query image and return the closest faces using pgvector cosine distance.',
  '查询条件': 'Search Criteria', '返回数量': 'Result Limit', '最多检测人脸': 'Maximum Faces', '最低匹配分': 'Minimum Match Score', '开始搜索': 'Search',
  '搜索结果': 'Search Results', '张人脸': 'faces', '检测人脸': 'Detected Face', '个匹配': 'matches', '没有达到阈值的匹配': 'No matches reached the threshold',
  '匹配分': 'Match Score', '样本数据': 'Sample Data', '上传图片并开始搜索': 'Upload an image to start searching', '未匹配': 'No match', '请选择查询图片': 'Select a query image',
  '分别提取两张图片的人脸向量，返回相似度置信分和欧氏距离。': 'Extract face vectors from two images and return their confidence score and Euclidean distance.',
  '比对图片': 'Images', '图片 A': 'Image A', '图片 B': 'Image B', '选择第一张图片': 'Select first image', '选择第二张图片': 'Select second image',
  '返回人脸位置与质量分': 'Return face location and quality score', '开始比对': 'Compare', '比对结果': 'Comparison Result', '相似度置信分': 'Similarity Confidence',
  '-100 至 100，越高越相似': '-100 to 100; higher is more similar', '向量欧氏距离': 'Vector Euclidean Distance', '距离越小越相似': 'Smaller is more similar',
  '高度相似': 'Highly Similar', '可能相似': 'Possibly Similar', '相似度较低': 'Low Similarity', '请选择两张待比对图片': 'Select two images to compare',
  '上传样本图片后，后台任务会检测人脸并生成 ArcFace 向量。': 'Upload a sample image; a background job will detect the face and generate its ArcFace vector.',
  '图片与归属': 'Image and Assignment', '已进入处理队列': 'Queued for Processing', '请选择人脸图片': 'Select a face image',
  '提交处理': 'Submit', '查看处理状态': 'View Processing Status', '人脸已提交，正在后台生成向量': 'Face submitted; generating vector in the background', '请求失败': 'Request failed', '网络连接失败': 'Network connection failed',
  '请选择图片文件': 'Select an image file', '图片不能超过 10 MB': 'Image must not exceed 10 MB', '图片读取失败': 'Could not read image',
}

export const currentLocale = readonly(locale)
export const isEnglish = computed(() => locale.value === 'en-US')
export function translate(message) { return locale.value === 'en-US' ? (en[message] || message) : message }
export function translateWith(message, values = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    translate(message),
  )
}
export function setLocale(value) {
  if (!supportedLocales.includes(value)) return
  locale.value = value
  localStorage.setItem(STORAGE_KEY, value)
  document.documentElement.lang = value
}

document.documentElement.lang = locale.value

export default {
  install(app) {
    app.config.globalProperties.$t = translate
  },
}
