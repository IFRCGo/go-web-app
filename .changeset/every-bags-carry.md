---
"go-web-app": minor
---

Fix page breaks in the EAP Summary export and validate EAP file uploads

- Start each main section of the EAP Summary export on a new page
- Show an error for unsupported files and upload only the accepted ones
- Allow `.xlsx` files in EAP file uploads
- Disable removing a file while the file input is disabled
