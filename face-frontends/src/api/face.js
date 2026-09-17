import client from './client'

export const create = (data) => client.post('/visual/face/create', data)
export const remove = (params) => client.get('/visual/face/delete', { params })
