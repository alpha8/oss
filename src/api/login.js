import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/oss/deviceUser/login',
    method: 'post',
    data: {
      userName: username,
      password: password
    }
  })
}

export function getInfo() {
  return request({
    url: '/oss/deviceUser/info',
    method: 'get',
  })
}

export function logout() {
  return request({
    url: '/oss/deviceUser/logout',
    method: 'post'
  })
}
