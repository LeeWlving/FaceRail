import client from './client'

export const create = (data) => client.post('/visual/sample/create', data)
export const remove = (params) => client.get('/visual/sample/delete', { params })
export const view = (params) => client.get('/visual/sample/get', { params })
export const list = ({ collectionName, limit = 10, namespace, offset = 0, order = 'asc' }) =>
  client.get('/visual/sample/list', { params: { collectionName, limit, namespace, offset, order } })
export const update = (data) => client.post('/visual/sample/update', data)
