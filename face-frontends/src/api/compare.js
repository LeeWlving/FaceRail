import client from './client'

export const compare = (data) => client.post('/visual/compare/do', data)
