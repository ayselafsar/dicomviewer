const BASE_URL = `${OC.getProtocol()}://${OC.getHost()}`;

export default function(url) {
    return `${BASE_URL}${url}`;
}
