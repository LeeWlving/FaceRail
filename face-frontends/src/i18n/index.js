import { createI18n } from 'vue-i18n'

const savedLocale = localStorage.getItem('facerail.locale')
const locale = ['zh-CN', 'en'].includes(savedLocale) ? savedLocale : 'zh-CN'

const messages = {
  'zh-CN': {
    app: { console: '视觉检索控制台', openNav: '打开导航', closeNav: '关闭导航', mainNav: '主导航' },
    nav: {
      recognition: '识别', collections: '集合', data: '数据', search: '人脸搜索', compare: '人脸比对',
      collectionList: '集合列表', collectionCreate: '创建集合', collectionView: '查看集合', collectionRemove: '删除集合',
      sampleList: '样本列表', sampleCreate: '创建样本', sampleView: '查看样本', sampleRemove: '删除样本', faceCreate: '录入人脸',
    },
    preferences: {
      language: '语言', chinese: '中文', english: 'English', inference: '机器学习运行位置',
      device: '设备端', cloud: '云端', deviceHint: '图片留在当前设备，由浏览器运行 SCRFD 和 ArcFace',
      cloudHint: '上传图片，由 Rails 后端运行 SCRFD 和 ArcFace', deviceActive: '设备端推理', cloudActive: '云端推理',
    },
    common: {
      namespace: '命名空间', collectionName: '集合名称', collectionDescription: '集合描述', sampleId: '样本 ID', faceId: '人脸 ID',
      description: '描述', actions: '操作', query: '查询', create: '创建', save: '保存', delete: '删除', view: '查看', cancel: '取消',
      yes: '是', no: '否', none: '无', records: '{count} 条', faces: '{count} 张人脸', matches: '{count} 个匹配', quality: '质量分',
      fieldName: '名称', fieldType: '类型', fieldDescription: '描述', fieldValue: '值', add: '添加', remove: '删除', example: '例如 production',
      permanentDelete: '永久删除', dangerAction: '危险操作', processing: '处理中', submit: '提交处理', errorInfo: '错误信息',
      faceData: '人脸数据', sampleData: '样本数据', extendedData: '扩展数据', faceCount: '人脸数', retainImage: '保留图片',
      sampleFields: '样本字段', faceFields: '人脸字段', storage: '存储方式', inputCompleteIdentity: '请输入完整的样本标识',
      inputNamespaceCollection: '请输入命名空间和集合名称', inputNamespace: '请输入命名空间', selectImage: '请选择图片',
    },
    validation: {
      namespace: '请输入命名空间', collectionName: '请输入集合名称', sampleId: '请输入样本 ID',
      identifier: '仅支持小写字母、数字和下划线', invalidFormat: '格式不正确', image: '请选择人脸图片', twoImages: '请选择两张待比对图片',
    },
    status: { pending: '等待处理', processing: '生成中', ready: '可搜索', failed: '失败' },
    fields: { definitions: '字段定义', extraData: '扩展数据', empty: '暂无字段', placeholderName: '字段名称', placeholderType: '类型', placeholderDescription: '字段描述', placeholderValue: '字段值' },
    image: { alt: '人脸分析图片', selectedAlt: '已选择图片', formats: 'JPG、PNG 或 WebP，最大 10 MB', remove: '移除图片', chooseQuery: '选择查询图片', chooseSample: '选择样本人脸图片', chooseFirst: '选择第一张图片', chooseSecond: '选择第二张图片' },
    ml: { loading: '正在加载设备端模型，首次使用需要下载约 100 MB…', noFace: '图片中没有检测到符合阈值的人脸', modelFailed: '设备端模型加载失败，可切换到云端模式重试', deviceReady: '图片仅在当前设备处理', cloudReady: '图片会上传到 Rails 后端处理' },
    errors: { request: '请求失败', network: '网络连接失败', imageFile: '请选择图片文件', imageSize: '图片不能超过 10 MB', imageRead: '图片读取失败' },
    search: {
      title: '人脸搜索', description: '从查询图片提取 ArcFace 向量，通过 pgvector 余弦距离返回最相似的人脸。', conditions: '查询条件',
      result: '搜索结果', limit: '返回数量', maxFaces: '最多检测人脸', confidenceThreshold: '最低匹配分 {value}', faceThreshold: '人脸质量阈值 {value}',
      start: '开始搜索', detected: '检测人脸 {index}', noMatch: '未匹配', emptyMatch: '没有达到阈值的匹配', empty: '上传图片并开始搜索', matchScore: '匹配分',
    },
    compare: {
      title: '人脸比对', description: '分别提取两张图片的人脸向量，返回相似度置信分和欧氏距离。', images: '比对图片', imageA: '图片 A', imageB: '图片 B',
      threshold: '人脸质量阈值 {value}', faceInfo: '返回人脸位置与质量分', start: '开始比对', result: '比对结果', confidence: '相似度置信分',
      confidenceHint: '-100 至 100，越高越相似', distance: '向量欧氏距离', distanceHint: '距离越小越相似', high: '高度相似', possible: '可能相似', low: '相似度较低',
    },
    face: {
      title: '录入人脸', description: '上传样本图片并生成 ArcFace 向量。', identity: '图片与归属', parameters: '识别参数', threshold: '人脸质量阈值', thresholdHint: '0 使用模型默认值',
      sameThreshold: '同样本最低相似度', sameHint: '0 表示不检查类内相似度', otherThreshold: '异样本最高相似度', otherHint: '0 表示不检查类间冲突',
      queued: '已进入处理队列', completed: '设备端处理完成', sample: '样本', viewStatus: '查看处理状态', cloudSuccess: '人脸已提交，正在后台生成向量', deviceSuccess: '人脸向量已在设备端生成并保存',
    },
    collection: {
      titleList: '集合列表', descList: '按命名空间查看人脸集合及字段规模。', titleCreate: '创建集合', descCreate: '定义命名空间、数据结构和人脸图片留存策略。',
      titleView: '查看集合', descView: '查看集合配置及样本、人脸扩展字段。', titleRemove: '删除集合', descRemove: '删除集合会一并移除其中的样本、人脸和图片，此操作不可恢复。',
      config: '集合配置', list: '集合', new: '新建集合', create: '创建集合', created: '集合创建成功', retainFace: '保留人脸图片', viewSamples: '查看样本', notFilled: '未填写', shards: '分片 / 副本',
      noSampleFields: '未定义样本字段', noFaceFields: '未定义人脸字段', emptyDetails: '输入集合标识查看配置', empty: '输入命名空间后查询', confirmUnused: '请确认当前集合已不再使用', confirm: '确认删除集合 {name}？', confirmTitle: '删除集合', confirmButton: '确认删除', removed: '集合已删除',
    },
    sample: {
      titleList: '样本列表', descList: '分页查看集合中的身份样本与人脸向量状态。', titleCreate: '创建样本', descCreate: '创建身份样本并填写集合定义的扩展数据。',
      titleView: '查看样本', descView: '更新样本扩展数据，并管理该样本下的人脸记录。', titleRemove: '删除样本', descRemove: '删除样本会同时删除其人脸记录和已存储图片，此操作不可恢复。',
      create: '创建样本', created: '样本创建成功', info: '样本信息', saveData: '保存扩展数据', updated: '样本已更新', records: '人脸记录', list: '样本', new: '新建样本', emptyList: '暂无样本', emptySampleFaces: '该样本尚未录入人脸', emptyFaces: '尚未录入人脸', embeddingStatus: '向量状态',
      empty: '输入样本标识查看详情', confirmUnused: '确认该身份样本已不再参与搜索', confirm: '确认删除样本 {id}？', confirmTitle: '删除样本', removed: '样本已删除', faceConfirm: '确认删除人脸 {id}？', faceConfirmTitle: '删除人脸', faceRemoved: '人脸已删除',
      offset: '偏移 {value}', limit: '每页数量', order: '排序', oldest: '最早创建', newest: '最近创建', previous: '上一页', next: '下一页',
    },
  },
  en: {
    app: { console: 'Visual Search Console', openNav: 'Open navigation', closeNav: 'Close navigation', mainNav: 'Main navigation' },
    nav: {
      recognition: 'Recognition', collections: 'Collections', data: 'Data', search: 'Face Search', compare: 'Face Compare',
      collectionList: 'Collection List', collectionCreate: 'Create Collection', collectionView: 'View Collection', collectionRemove: 'Delete Collection',
      sampleList: 'Sample List', sampleCreate: 'Create Sample', sampleView: 'View Sample', sampleRemove: 'Delete Sample', faceCreate: 'Enroll Face',
    },
    preferences: {
      language: 'Language', chinese: '中文', english: 'English', inference: 'ML execution', device: 'On-device', cloud: 'Cloud',
      deviceHint: 'Keep images on this device and run SCRFD and ArcFace in the browser', cloudHint: 'Upload images and run SCRFD and ArcFace in Rails', deviceActive: 'On-device inference', cloudActive: 'Cloud inference',
    },
    common: {
      namespace: 'Namespace', collectionName: 'Collection name', collectionDescription: 'Collection description', sampleId: 'Sample ID', faceId: 'Face ID',
      description: 'Description', actions: 'Actions', query: 'Search', create: 'Create', save: 'Save', delete: 'Delete', view: 'View', cancel: 'Cancel', yes: 'Yes', no: 'No', none: 'None',
      records: '{count} records', faces: '{count} faces', matches: '{count} matches', quality: 'Quality', fieldName: 'Name', fieldType: 'Type', fieldDescription: 'Description', fieldValue: 'Value',
      add: 'Add', remove: 'Remove', example: 'e.g. production', permanentDelete: 'Delete permanently', dangerAction: 'Danger zone', processing: 'Processing', submit: 'Submit', errorInfo: 'Error',
      faceData: 'Face data', sampleData: 'Sample data', extendedData: 'Extra data', faceCount: 'Faces', retainImage: 'Retain images', sampleFields: 'Sample fields', faceFields: 'Face fields', storage: 'Storage',
      inputCompleteIdentity: 'Enter the complete sample identity', inputNamespaceCollection: 'Enter the namespace and collection name', inputNamespace: 'Enter the namespace', selectImage: 'Select an image',
    },
    validation: { namespace: 'Enter a namespace', collectionName: 'Enter a collection name', sampleId: 'Enter a sample ID', identifier: 'Use lowercase letters, numbers, and underscores only', invalidFormat: 'Invalid format', image: 'Select a face image', twoImages: 'Select two images to compare' },
    status: { pending: 'Pending', processing: 'Processing', ready: 'Searchable', failed: 'Failed' },
    fields: { definitions: 'Field definitions', extraData: 'Extra data', empty: 'No fields', placeholderName: 'Field name', placeholderType: 'Type', placeholderDescription: 'Field description', placeholderValue: 'Field value' },
    image: { alt: 'Face analysis image', selectedAlt: 'Selected image', formats: 'JPG, PNG, or WebP, up to 10 MB', remove: 'Remove image', chooseQuery: 'Choose query image', chooseSample: 'Choose sample face image', chooseFirst: 'Choose first image', chooseSecond: 'Choose second image' },
    ml: { loading: 'Loading on-device models. The first run downloads about 100 MB…', noFace: 'No face met the quality threshold', modelFailed: 'Could not load the on-device models. Switch to cloud mode and retry.', deviceReady: 'Images are processed only on this device', cloudReady: 'Images are uploaded to the Rails backend for processing' },
    errors: { request: 'Request failed', network: 'Network connection failed', imageFile: 'Select an image file', imageSize: 'Images must be no larger than 10 MB', imageRead: 'Could not read the image' },
    search: {
      title: 'Face Search', description: 'Extract ArcFace embeddings and use pgvector cosine distance to return the closest faces.', conditions: 'Search criteria', result: 'Search results', limit: 'Result limit', maxFaces: 'Maximum faces',
      confidenceThreshold: 'Minimum match score {value}', faceThreshold: 'Face quality threshold {value}', start: 'Search', detected: 'Detected face {index}', noMatch: 'No match', emptyMatch: 'No matches met the threshold', empty: 'Upload an image to start searching', matchScore: 'Match score',
    },
    compare: {
      title: 'Face Compare', description: 'Extract a face embedding from each image and return confidence and Euclidean distance.', images: 'Images', imageA: 'Image A', imageB: 'Image B', threshold: 'Face quality threshold {value}',
      faceInfo: 'Return face location and quality', start: 'Compare', result: 'Comparison result', confidence: 'Similarity confidence', confidenceHint: '-100 to 100; higher is more similar', distance: 'Euclidean distance', distanceHint: 'Lower is more similar', high: 'Highly similar', possible: 'Possibly similar', low: 'Low similarity',
    },
    face: {
      title: 'Enroll Face', description: 'Upload a sample image and create its ArcFace embedding.', identity: 'Image and identity', parameters: 'Recognition parameters', threshold: 'Face quality threshold', thresholdHint: '0 uses the model default',
      sameThreshold: 'Minimum same-sample similarity', sameHint: '0 disables within-sample checks', otherThreshold: 'Maximum other-sample similarity', otherHint: '0 disables cross-sample conflict checks',
      queued: 'Queued for processing', completed: 'Processed on device', sample: 'Sample', viewStatus: 'View processing status', cloudSuccess: 'Face submitted; the embedding is being generated in the background', deviceSuccess: 'Face embedding generated on device and saved',
    },
    collection: {
      titleList: 'Collections', descList: 'Browse face collections and their schemas by namespace.', titleCreate: 'Create Collection', descCreate: 'Define the namespace, schema, and face image retention policy.', titleView: 'View Collection', descView: 'Review collection settings and metadata fields.',
      titleRemove: 'Delete Collection', descRemove: 'Deleting a collection also removes its samples, faces, and images. This cannot be undone.', config: 'Collection settings', list: 'Collections', new: 'New collection', create: 'Create collection', created: 'Collection created',
      retainFace: 'Retain face images', viewSamples: 'View samples', notFilled: 'Not provided', shards: 'Shards / replicas', noSampleFields: 'No sample fields defined', noFaceFields: 'No face fields defined', emptyDetails: 'Enter a collection identity to view settings', empty: 'Enter a namespace to search', confirmUnused: 'Confirm that this collection is no longer in use', confirm: 'Delete collection {name}?', confirmTitle: 'Delete collection', confirmButton: 'Delete', removed: 'Collection deleted',
    },
    sample: {
      titleList: 'Samples', descList: 'Browse identity samples and face embedding status.', titleCreate: 'Create Sample', descCreate: 'Create an identity sample and fill its collection-defined metadata.', titleView: 'View Sample', descView: 'Update sample metadata and manage its face records.',
      titleRemove: 'Delete Sample', descRemove: 'Deleting a sample also removes its face records and stored images. This cannot be undone.', create: 'Create sample', created: 'Sample created', info: 'Sample details', saveData: 'Save extra data', updated: 'Sample updated',
      records: 'Face records', list: 'Samples', new: 'New sample', emptyList: 'No samples', emptySampleFaces: 'No faces enrolled for this sample', emptyFaces: 'No faces enrolled', embeddingStatus: 'Embedding status', empty: 'Enter a sample identity to view details', confirmUnused: 'Confirm that this identity should no longer participate in search', confirm: 'Delete sample {id}?', confirmTitle: 'Delete sample', removed: 'Sample deleted',
      faceConfirm: 'Delete face {id}?', faceConfirmTitle: 'Delete face', faceRemoved: 'Face deleted', offset: 'Offset {value}', limit: 'Page size', order: 'Order', oldest: 'Oldest first', newest: 'Newest first', previous: 'Previous', next: 'Next',
    },
  },
}

export default createI18n({ legacy: false, locale, fallbackLocale: 'zh-CN', messages })
