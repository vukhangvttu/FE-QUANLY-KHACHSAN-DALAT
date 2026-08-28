const currentHost = window.location.hostname

let apiBaseUrl

if (currentHost === 'ge.vttu.edu.vn') {
  apiBaseUrl = 'http://115.75.179.80:3366/khachsan-service'
} else if (currentHost === 'localhost') {
  apiBaseUrl = 'http://localhost:8080/khachsan-service'
} else if (currentHost === '192.168.0.88') {
  apiBaseUrl = 'http://192.168.0.88:8080/khachsan-service'
} else if (currentHost === '192.168.99.66') {
  apiBaseUrl = 'http://192.168.99.66:3366/khachsan-service'
}
else {
  apiBaseUrl = 'http://192.168.0.11:8080/khachsan-service'
}

const config = {
  apiBaseUrl,
}

export default config
