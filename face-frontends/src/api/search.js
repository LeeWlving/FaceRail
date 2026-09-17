import client from './client'

export const search = (data) => client.post('/visual/search/do', data)
