import client from './client'

export const create = (data) => client.post('/visual/collect/create', data)
export const remove = (params) => client.get('/visual/collect/delete', { params })
export const view = (params) => client.get('/visual/collect/get', { params })
export const list = ({ namespace }) => client.get('/visual/collect/list', { params: { namespace } })
