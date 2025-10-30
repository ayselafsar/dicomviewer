export default () => {
    const isPublicElmt = document.getElementById('isPublic')
    const isPublic = !!(isPublicElmt && isPublicElmt.value === '1')

    // Fallback: check if we're on a public share URL pattern
    const isPublicUrl = /\/s\/[A-Za-z0-9]+/.test(window.location.pathname) || window.location.pathname.includes('/public.php')

    return isPublic || isPublicUrl
}
