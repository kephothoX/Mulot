export interface User {

  id: string,
  status: string,
  createDate: Date,
  pinStatus: string,
  pinDetails: {
    failedAttempts: number
  },
  securityQuestionStatus: string,
  securityQuestionDetails: {
    failedAttempts: number
  },
  authMode: string

}
