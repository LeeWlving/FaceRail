
export function create(collect) {
    return window.axios({
        method: 'post',
        url: '/api/visual/collect/create',
        data: collect
    })
}

export function remove({collectionName, namespace}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/collect/delete',
        params: {collectionName, namespace}
    })
}

export function view({collectionName, namespace}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/collect/get',
        params: {collectionName, namespace}
    })
}

export function list({namespace}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/collect/list',
        params: {namespace}
    })
}
