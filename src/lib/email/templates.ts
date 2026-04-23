const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f8fafc;
  margin: 0;
  padding: 0;
`

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background: #ffffff; border-radius: 16px;
          border: 1px solid #e2e8f0; overflow: hidden;">

          <!-- ヘッダー -->
          <tr>
            <td style="background: #4f46e5; padding: 24px 32px;">
              <p style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;
                letter-spacing: -0.5px;">AkiNavi</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #c7d2fe;">不動産空室状況管理</p>
            </td>
          </tr>

          <!-- 本文 -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>

          <!-- フッター -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #f1f5f9;
              background: #f8fafc; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                このメールは AkiNavi から自動送信されています。<br>
                心当たりのない場合はこのメールを無視してください。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function primaryButton(href: string, label: string): string {
  return `
<a href="${href}" style="display: inline-block; margin-top: 24px;
  padding: 12px 28px; background: #4f46e5; color: #ffffff;
  font-size: 14px; font-weight: 600; text-decoration: none;
  border-radius: 8px; letter-spacing: 0.2px;">
  ${label}
</a>`
}

function infoRow(label: string, value: string): string {
  return `
<tr>
  <td style="padding: 8px 0; font-size: 13px; color: #64748b; width: 100px;">${label}</td>
  <td style="padding: 8px 0; font-size: 13px; color: #1e293b; font-weight: 500;">${value}</td>
</tr>`
}

// ─────────────────────────────────────────────
// 1. 管理者への承認依頼メール（ユーザー登録時）
// ─────────────────────────────────────────────
export function adminApprovalRequestEmail({
  fullName,
  companyName,
  email,
  registeredAt,
}: {
  fullName: string
  companyName: string
  email: string
  registeredAt: string
}): { subject: string; html: string } {
  const content = `
<h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">新しいユーザーが登録しました</h2>
<p style="margin: 0 0 24px; font-size: 14px; color: #64748b; line-height: 1.6;">
  以下のユーザーが AkiNavi に登録しました。内容を確認のうえ、承認または拒否を行ってください。
</p>

<table cellpadding="0" cellspacing="0" style="width: 100%; background: #f8fafc;
  border-radius: 10px; padding: 16px 20px; border: 1px solid #e2e8f0;">
  ${infoRow('氏名', fullName)}
  ${infoRow('会社名', companyName)}
  ${infoRow('メール', email)}
  ${infoRow('登録日時', registeredAt)}
</table>

${primaryButton(`${SITE_URL}/admin/users`, '管理画面で確認する')}
`

  return {
    subject: '【AkiNavi】新しいユーザーが登録しました',
    html: layout(content),
  }
}

// ─────────────────────────────────────────────
// 2. ユーザーへの承認完了メール
// ─────────────────────────────────────────────
export function userApprovedEmail({
  fullName,
}: {
  fullName: string
}): { subject: string; html: string } {
  const content = `
<h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">アカウントが承認されました</h2>
<p style="margin: 0 0 16px; font-size: 14px; color: #64748b; line-height: 1.6;">
  ${fullName} 様
</p>
<p style="margin: 0 0 16px; font-size: 14px; color: #64748b; line-height: 1.6;">
  AkiNavi へのご登録ありがとうございます。<br>
  管理者によるアカウント承認が完了しました。<br>
  以下のボタンから物件の空室情報をご確認いただけます。
</p>

<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
  padding: 16px 20px; margin: 16px 0;">
  <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 500;">
    ✓ アカウント承認済み
  </p>
</div>

${primaryButton(`${SITE_URL}/properties`, '物件一覧を見る')}
`

  return {
    subject: '【AkiNavi】アカウントが承認されました',
    html: layout(content),
  }
}

// ─────────────────────────────────────────────
// 3. ユーザーへの拒否通知メール
// ─────────────────────────────────────────────
export function userRejectedEmail({
  fullName,
}: {
  fullName: string
}): { subject: string; html: string } {
  const content = `
<h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">アカウント登録について</h2>
<p style="margin: 0 0 16px; font-size: 14px; color: #64748b; line-height: 1.6;">
  ${fullName} 様
</p>
<p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
  AkiNavi へのご登録をいただきありがとうございました。<br>
  誠に恐れ入りますが、今回はご登録をお受けできませんでした。<br>
  詳細についてはご担当の管理者までお問い合わせください。
</p>
`

  return {
    subject: '【AkiNavi】アカウント登録について',
    html: layout(content),
  }
}
