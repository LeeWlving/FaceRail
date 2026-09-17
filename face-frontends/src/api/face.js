
export function create(face) {
    return window.axios({
        method: 'post',
        url: '/api/visual/face/create',
        data: face
    })
}

export function remove({collectionName, namespace, sampleId, faceId}) {
    return window.axios({
        method: 'get',
        url: '/api/visual/face/delete',
        params: {collectionName, namespace, sampleId, faceId}
    })
}

