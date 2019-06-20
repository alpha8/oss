import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/oss/virtualShelf/list',
    method:'get',
    params:params
  })
}

export function batchInsert(data) {
  return request({
    url:'/oss/virtualShelf/batchInsert',
    method:'post',
    data:data
  })
}

