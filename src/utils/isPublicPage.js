const isPublicElmt = document.getElementById('isPublic')
export default () => !!(isPublicElmt && isPublicElmt.value === '1')
