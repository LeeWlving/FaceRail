
export function create(sample) {
    return window.axios({
        method: 'post',
        url: '/api/visual/sample/create',
        data: sample
    })
}

export function remove({collectionName, namespace, sampleId}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/sample/delete',
        params: {collectionName, namespace, sampleId}
    })
}

export function view({collectionName, namespace, sampleId}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/sample/get',
        params: {collectionName, namespace, sampleId}
    })
}

export function list({collectionName, limit, namespace, offset = 0, order = 'asc'}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/sample/list',
        params: {collectionName, limit, namespace, offset, order}
    })
}

export function update(sample) {
    return window.axios({
        method: 'post',
        url: '/api/visual/sample/update',
        data: sample
    })
}
