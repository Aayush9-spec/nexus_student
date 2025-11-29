# Security Policy

## Supported Versions

Use the latest version of this project to ensure you have the latest security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability within this project, please follow these steps:

1.  **Do NOT** open a public issue on GitHub.
2.  Email the security team at `security@nexus-student.com` (or the repository owner).
3.  Include a detailed description of the vulnerability and steps to reproduce it.

## Security Measures Implemented

### 1. HTTP Security Headers
We enforce strict HTTP headers to protect against common attacks:
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS connections.
- **X-XSS-Protection**: Blocks detected Cross-Site Scripting (XSS) attacks.
- **X-Frame-Options**: Prevents Clickjacking by disallowing the site to be embedded in iframes.
- **X-Content-Type-Options**: Prevents MIME-sniffing attacks.
- **Referrer-Policy**: Controls how much referrer information is sent.
- **Permissions-Policy**: Restricts access to sensitive browser features (camera, mic, etc.).

### 2. Database Security (Firestore Rules)
- **Role-Based Access Control**: Users can only modify their own data.
- **Data Validation**: Server-side rules ensure data integrity (e.g., buyers can't modify transaction history).
- **Private Data**: Personal information like transaction history and chats are restricted to the participants involved.

### 3. Authentication
- **Firebase Auth**: We use industry-standard Firebase Authentication for secure user management.
- **Client-Side Protection**: Protected routes redirect unauthenticated users.

### 4. Input Validation
- **Zod Schemas**: All form inputs are validated against strict schemas using Zod to prevent malformed data injection.
- **Sanitization**: React automatically escapes content to prevent XSS.

### 5. Dependency Management
- We regularly audit dependencies using `npm audit` to identify and fix known vulnerabilities.
