import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/oss/appversion/list',
    method:'get',
    params:params
  })
}

export function getVersions(id) {
  return request({
    url:'/oss/appversion/get/' + id,
    method:'get'
  })
}

export function createVersions(data) {
  return request({
    url:'/oss/appversion/add',
    method:'post',
    data:data
  })
}

export function updateVersions(data) {
  return request({
    url:'/oss/appversion/update',
    method:'post',
    data:data
  })
}

export function releaseVersion(data) {
  return request({
    url:'/oss/appversion/release',
    method:'post',
    data:data
  })
}