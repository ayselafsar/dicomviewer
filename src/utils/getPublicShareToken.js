export default () => {
    const sharingTokenElmt = document.getElementById('sharingToken')
    const token = sharingTokenElmt && sharingTokenElmt.value

    // Fallback: extract from URL if element not found
    if (!token) {
        const urlMatch = window.location.pathname.match(/\/s\/([^\/]+)/)
        return urlMatch ? urlMatch[1] : null
    }

    return token
}
