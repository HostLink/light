import login from './login'
import logout from './logout'
import query from './query'
import mutation from './mutation'
import toQuery from './toQuery'
import getApiUrl from './getApiUrl'
import setApiUrl from './setApiUrl'
import uploadFile from './uploadFile'
import sendMail from './sendMail'

import getConfig from './getConfig'

import webauthnLogin from './webauthnLogin'
import webauthnRegister from './webauthnRegister'

export type Fields = Object | Array<string | Object> | string


export {
    toQuery,
    login,
    logout,
    query,
    mutation,
    getApiUrl,
    setApiUrl,
    uploadFile,
    sendMail,
    webauthnLogin,
    webauthnRegister,
    getConfig

}