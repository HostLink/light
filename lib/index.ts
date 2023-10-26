export * from './auth'
export * from './axios'
export * from './granted'
export * from './model'

import query from './query'
import mutation from './mutation'
import toQuery from './toQuery'
export * from './apiUrl'

import uploadFile from './uploadFile'
import sendMail from './sendMail'

import getConfig from './getConfig'

import webauthnLogin from './webauthnLogin'
import webauthnRegister from './webauthnRegister'

export type Fields = Object | Array<string | Object> | string

export * from './fs'

export {
    toQuery,
    query,
    mutation,
    uploadFile,
    sendMail,
    webauthnLogin,
    webauthnRegister,
    getConfig,
}