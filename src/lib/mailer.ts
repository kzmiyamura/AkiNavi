import * as Brevo from '@getbrevo/brevo'

const apiInstance = new Brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY ?? ''
)

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'kzk_mymr@yahoo.co.jp'

type SendParams = {
  from: string
  to: string | string[]
  bcc?: string[]
  subject: string
  html: string
}

export const mailer = {
  emails: {
    async send(params: SendParams) {
      const senderEmail = params.from.includes('<')
        ? params.from.match(/<(.+)>/)?.[1] ?? params.from
        : params.from
      const senderName = params.from.includes('<')
        ? params.from.split('<')[0].trim()
        : 'AkiNavi'

      const toList = Array.isArray(params.to)
        ? params.to.map((e) => ({ email: e }))
        : [{ email: params.to }]

      const email = new Brevo.SendSmtpEmail()
      email.sender = { name: senderName, email: senderEmail }
      email.to = toList
      if (params.bcc?.length) {
        email.bcc = params.bcc.map((e) => ({ email: e }))
      }
      email.subject = params.subject
      email.htmlContent = params.html

      try {
        const result = await apiInstance.sendTransacEmail(email)
        return { data: result.body, error: null }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err)
        console.error('[mailer] send error:', error)
        return { data: null, error }
      }
    },
  },
}
