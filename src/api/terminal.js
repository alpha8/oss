import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/oss/device/list',
    method:'get',
    params:params
  })
}

export function getTerminal(id) {
  return request({
    url:'/oss/device/get/' + id,
    method:'get'
  })
}

export function createTerminal(data) {
  return request({
    url:'/oss/device/add',
    method:'post',
    data:data
  })
}

export function updateTerminal(data) {
  return request({
    url:'/oss/device/update',
    method:'post',
    data:data
  })
}

export function fetchCargoList(params) {
  return request({
    url:'/oss/channel/list',
    method:'get',
    params:params
  })
}

export function updateChannel(data) {
  return request({
    url:'/oss/channel/update',
    method:'post',
    data:data
  })
}

export function onShelf(data) {
  return request({
    url:'/oss/channel/onShelf',
    method:'post',
    data:data
  })
}

export function offShelf(data) {
  return request({
    url:'/oss/channel/offShelf',
    method:'post',
    data:data
  })
}

export function incrementStock(data) {
  return request({
    url:'/oss/stock/in',
    method:'post',
    data:data
  })
}
