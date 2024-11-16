export interface ResponseModel {
  code: any
  msg: string
}
export type ResponseOkWithData<T> = T & { msg: string }
export function sendOk<T>(payload?: T): ResponseOkWithData<T> {
  const response: ResponseModel = {
    code: 200,
    msg: 'success',
  }
  // Object.assign will trigger setter
  return Object.assign(response, payload)
}

export type ResponseErrorWithData<T> = T & { msg: string }
export function sendError<T>(payload?: T): ResponseErrorWithData<T> {
  const response: ResponseModel = {
    code: 500,
    msg: 'error',
  }
  return Object.assign(response, payload)
}

export function sendClientError<T>(message: string = "client error"):  ResponseErrorWithData<T> {
  const response: ResponseModel = {
    code: 400,
    msg: message,
  }
  return Object.assign(response)
}