export function search(data) {
    return window.axios({
        method: 'post',
        url: '/api/visual/compare/do',
        data: data
    })
}
