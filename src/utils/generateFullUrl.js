const BASE_URL = `${window.location.protocol}//${window.location.host}`;

export default function(url) {
    return `${BASE_URL}${url}`;
}
