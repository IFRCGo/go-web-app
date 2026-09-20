---
"go-web-app": minor
---

Allow password reset through email while logged in

- Let users pick between the old password and an emailed reset link when changing their password
- Keep the emailed recovery link usable while signed in, and end the session once the password has been changed
- Ask for the email instead of the email or username on the recover account and resend validation email pages
