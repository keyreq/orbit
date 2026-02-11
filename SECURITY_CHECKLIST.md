# 🛡️ ORBIT Security Checklist

## Pre-Launch Security Audit

Use this checklist before deploying to production.

---

## ✅ Authentication & Authorization

### OAuth Implementation
- [ ] PKCE enabled for all OAuth flows
- [ ] State parameter validated to prevent CSRF
- [ ] Redirect URIs whitelisted in OAuth provider settings
- [ ] No OAuth tokens exposed in client-side code
- [ ] Refresh token rotation implemented
- [ ] Short-lived access tokens (15 minutes max)

### Session Management
- [ ] Sessions stored server-side (Redis/Database)
- [ ] Session IDs are cryptographically random (32+ bytes)
- [ ] Sessions expire after 30 days of inactivity
- [ ] Logout invalidates session on server-side
- [ ] Device fingerprinting for anomaly detection
- [ ] Concurrent session limits enforced

### Password Security (if using email auth)
- [ ] Minimum 12 characters required
- [ ] Common password checking (have-i-been-pwned API)
- [ ] Passwords hashed with bcrypt/Argon2 (not MD5/SHA1)
- [ ] Account lockout after 5 failed attempts
- [ ] Password reset tokens expire in 15 minutes
- [ ] Old password required for password changes

---

## 🔐 API Security

### API Key Management
- [ ] NO API keys in client-side code
- [ ] NO API keys committed to Git (check with `git log`)
- [ ] All API keys stored in environment variables or secrets manager
- [ ] Separate API keys for dev/staging/production
- [ ] API keys rotated every 90 days
- [ ] Webhook secrets used for third-party integrations

### Rate Limiting
- [ ] Global rate limit: 100 requests/minute per IP
- [ ] Per-user rate limit: 60 requests/minute
- [ ] Alert creation rate limit: 10/hour per user
- [ ] WebSocket connection limit: 5 per user
- [ ] Exponential backoff on repeated violations

### Input Validation
- [ ] All inputs validated with Zod schemas
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize HTML inputs)
- [ ] Command injection prevention (never use eval or exec on user input)
- [ ] Path traversal prevention (validate file paths)
- [ ] JSON payload size limit (1MB max)

---

## 🗄️ Data Security

### Encryption
- [ ] TLS 1.3 enforced for all connections
- [ ] HTTPS redirect from HTTP (301 permanent)
- [ ] HSTS header with 1-year expiry
- [ ] Database connections use TLS
- [ ] Sensitive data encrypted at rest (AES-256)
- [ ] Wallet addresses hashed when stored

### Database Security
- [ ] MongoDB authentication enabled
- [ ] IP whitelist for database access
- [ ] Database user with least-privilege principle
- [ ] Regular automated backups (daily)
- [ ] Backups tested monthly for restore
- [ ] Point-in-time recovery enabled

### Secret Management
- [ ] Using AWS Secrets Manager or HashiCorp Vault
- [ ] Secrets never logged or printed
- [ ] Secrets access audited and logged
- [ ] Emergency secret rotation procedure documented

---

## 🔒 Application Security

### Security Headers
```
✅ Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Dependency Security
- [ ] `npm audit` run and all high/critical issues fixed
- [ ] Dependabot enabled for automatic security updates
- [ ] No outdated packages (check with `npm outdated`)
- [ ] Supply chain attack prevention (use package lock files)
- [ ] Private packages come from trusted registries only

### Code Security
- [ ] ESLint security plugin enabled
- [ ] No console.log statements with sensitive data
- [ ] No hardcoded secrets in code
- [ ] User uploads restricted (if applicable)
- [ ] CORS configured properly (not `*` in production)

---

## 📱 Frontend Security

### Client-Side Protection
- [ ] No sensitive data in localStorage (use httpOnly cookies)
- [ ] JWT tokens not accessible via JavaScript
- [ ] XSS protection with React's built-in escaping
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] CSP prevents inline scripts
- [ ] Subresource Integrity (SRI) for CDN assets

### WebSocket Security
- [ ] WSS (WebSocket Secure) used, not WS
- [ ] Authentication required before accepting messages
- [ ] Message size limits enforced
- [ ] Connection limits per user
- [ ] Heartbeat/ping-pong to detect zombie connections

---

## 🔔 Notification Security

### Email Security
- [ ] SPF record configured
- [ ] DKIM signing enabled
- [ ] DMARC policy set to `quarantine` or `reject`
- [ ] Unsubscribe link in all emails
- [ ] No sensitive data in email subjects
- [ ] Rate limit on email sends (prevent spam)

### Telegram Bot Security
- [ ] Bot token stored securely (not in code)
- [ ] User verification before linking accounts
- [ ] Commands rate-limited
- [ ] No financial transactions via bot

### SMS Security
- [ ] Phone number verification required
- [ ] SMS rate limited (5 per day per user)
- [ ] No sensitive data in SMS content
- [ ] SIM swap detection (check recent phone number changes)

---

## 🌐 Infrastructure Security

### Deployment
- [ ] Environment variables set in hosting platform (not in code)
- [ ] Production environment isolated from dev/staging
- [ ] No debug mode in production
- [ ] Error messages don't expose stack traces to users
- [ ] Logging enabled for all authentication events
- [ ] Centralized logging (Sentry, Datadog, or similar)

### Monitoring & Alerting
- [ ] Uptime monitoring configured
- [ ] Alert on failed login attempts (>10 in 5 minutes)
- [ ] Alert on API error rate spike
- [ ] Alert on unusual traffic patterns
- [ ] Database query performance monitoring
- [ ] Scheduled security scans (weekly)

### Backup & Recovery
- [ ] Automated daily backups
- [ ] Backups stored in separate region
- [ ] Disaster recovery plan documented
- [ ] Backup restoration tested quarterly
- [ ] Incident response plan defined

---

## 🧪 Testing

### Security Testing
- [ ] Penetration testing completed
- [ ] OWASP Top 10 vulnerabilities checked
- [ ] Automated security scanning (Snyk, SonarQube)
- [ ] API fuzzing performed
- [ ] Load testing (1000+ concurrent users)

### Vulnerability Disclosure
- [ ] Security.txt file created (/.well-known/security.txt)
- [ ] Bug bounty program considered
- [ ] Security contact email published
- [ ] Responsible disclosure policy documented

---

## 📋 Compliance

### Privacy Regulations
- [ ] Privacy policy published and linked
- [ ] Cookie consent banner (GDPR)
- [ ] Data deletion API implemented
- [ ] Data export functionality available
- [ ] Third-party data processors documented
- [ ] Data retention policy defined

### Terms of Service
- [ ] Terms of service published
- [ ] No liability disclaimer for financial losses
- [ ] No guarantee of data accuracy stated
- [ ] Acceptable use policy defined
- [ ] Account termination policy defined

---

## 🚨 Incident Response Plan

### In Case of Security Breach

1. **Immediate Actions (0-1 hour)**
   - [ ] Isolate affected systems
   - [ ] Revoke compromised credentials
   - [ ] Enable read-only mode if necessary
   - [ ] Notify security team

2. **Investigation (1-24 hours)**
   - [ ] Determine scope of breach
   - [ ] Identify attack vector
   - [ ] Check audit logs
   - [ ] Document findings

3. **Remediation (24-72 hours)**
   - [ ] Patch vulnerabilities
   - [ ] Reset all affected API keys
   - [ ] Force password reset for affected users
   - [ ] Deploy security updates

4. **Communication (72+ hours)**
   - [ ] Notify affected users (email)
   - [ ] Publish post-mortem report
   - [ ] Update security documentation
   - [ ] Implement preventive measures

---

## 🔄 Regular Maintenance Schedule

### Weekly
- [ ] Review error logs for security issues
- [ ] Check for npm package vulnerabilities
- [ ] Review failed login attempts

### Monthly
- [ ] Rotate API keys for critical services
- [ ] Review and update firewall rules
- [ ] Test backup restoration
- [ ] Security training for team

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review access controls
- [ ] Update disaster recovery plan

### Annually
- [ ] Rotate all secrets and keys
- [ ] Third-party security assessment
- [ ] Compliance audit (GDPR, CCPA)
- [ ] Update security policies

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25 Software Weaknesses](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Security Contact:** security@orbit.app
**Last Review Date:** 2026-02-11
**Next Review Date:** 2026-05-11

---

*Security is not a one-time task—it's an ongoing process. Review this checklist monthly and after any major changes.*
