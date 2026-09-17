export function search(data) {
    return window.axios({
        method: 'post',
        url: '/api/visual/search/do',
        data: data
    })
}
