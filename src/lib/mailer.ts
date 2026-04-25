import { BrevoClient } from '@getbrevo/brevo'

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY ?? '',
})

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'kzmiyamura@gmail.com'

type SendParams = {
  from: string
  to: string | string[]
  bcc?: string[]
  subject: string
  html: string
}

function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<(.+)>$/)
  if (match) return { name: match[1].trim(), email: match[2].trim() }
  return { name: 'AkiNavi', email: from }
}

export const mailer = {
  emails: {
    async send(params: SendParams) {
      const sender = parseSender(params.from)
      const toList = Array.isArray(params.to)
        ? params.to.map((e) => ({ email: e }))
        : [{ email: params.to }]

      try {
        const result = await client.transactionalEmails.sendTransacEmail({
          sender,
          to: toList,
          bcc: params.bcc?.map((e) => ({ email: e })),
          subject: params.subject,
          htmlContent: params.html,
        })
        return { data: result, error: null }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err)
        console.error('[mailer] send error:', error)
        return { data: null, error }
      }
    },
  },
}
