# Authentication Agent - Questions for Human

**Last Updated:** 2026-02-11 (Initial)

---

## Critical Questions (Need Answer Before Implementation)

### Question 1: OAuth Providers Priority
**Category:** Feature Scope
**Urgency:** HIGH (Day 1)

**Question:**
Should we implement both Google AND Apple Sign In for the MVP, or start with Google only?

**Context:**
- Google OAuth: Free, easy to set up, most widely used
- Apple Sign In: Requires $99/year Apple Developer account, mandatory for iOS apps

**Options:**
A) Implement both Google + Apple (as specified in requirements)
B) Start with Google only, add Apple in Phase 2
C) Add Twitter/X OAuth as third option

**Recommendation:**
Option A (both Google + Apple) as specified in DESIGN_ARCHITECTURE.md

**Impact:**
- Option A: 3-4 days implementation
- Option B: 2-3 days implementation (Google only)

**Your Decision:**
[ ] A - Both Google + Apple
[x] B - Google only (MVP)
[ ] C - Google + Apple + Twitter
[ ] Other: _______________

---

### Question 2: Email Verification
**Category:** Security Policy
**Urgency:** MEDIUM (Day 2)

**Question:**
Should we require additional email verification after OAuth sign-in, or trust the OAuth provider's email verification?

**Context:**
- Google and Apple already verify user emails
- Additional verification adds friction to sign-up flow
- Some apps still send verification emails for extra security

**Options:**
A) Trust OAuth providers (no additional verification)
B) Send verification email after first OAuth sign-in
C) Make verification optional but recommended

**Recommendation:**
Option A (trust OAuth providers) - reduces friction, standard practice

**Impact:**
- Option A: No extra work
- Option B: +1 day for email verification system
- Option C: +1 day + UI for verification status

**Your Decision:**
[x ] A - Trust OAuth providers
[ ] B - Require email verification
[ ] C - Optional verification
[ ] Other: _______________

---

## Important Questions (Can Be Deferred)

### Question 3: Session Expiry Duration
**Category:** Security Configuration
**Urgency:** LOW (Day 3)

**Question:**
Confirm session expiry duration: 30 days acceptable?

**Context:**
- DESIGN_ARCHITECTURE.md specifies 30 days
- Industry standards: 7-90 days
- Shorter = more secure, longer = better UX

**Options:**
A) 30 days (as specified)
B) 7 days (more secure)
C) 90 days (maximum convenience)
D) Custom duration: ___ days

**Recommendation:**
Option A (30 days) - good balance of security and UX

**Your Decision:**
[x] A - 30 days
[ ] B - 7 days
[ ] C - 90 days
[ ] D - Custom: _____ days

---

### Question 4: Multi-Factor Authentication (MFA)
**Category:** Security Feature
**Urgency:** LOW (Can defer to Phase 3)

**Question:**
Should we implement MFA (2FA) now or in a later phase?

**Context:**
- MFA adds significant security for sensitive operations
- DESIGN_ARCHITECTURE.md mentions MFA as "enhancement"
- Implementation time: 2-3 days for TOTP-based MFA

**Options:**
A) Defer to Phase 3 (recommended)
B) Implement basic TOTP MFA now
C) Skip entirely (not recommended for crypto app)

**Recommendation:**
Option A (defer to Phase 3) - focus on core auth first

**Impact:**
- Option A: No impact on timeline
- Option B: +2-3 days to Phase 1

**Your Decision:**
[x] A - Defer to Phase 3
[ ] B - Implement now
[ ] C - Skip MFA
[ ] Other: _______________

---

### Question 5: Sign-In Page Design
**Category:** UI/UX
**Urgency:** LOW (Day 2)

**Question:**
Should the sign-in page match the existing ORBIT glassmorphism design, or use a simpler centered card?

**Context:**
- Existing app has dark theme with glassmorphism (`glass-panel` class)
- Sign-in page could match this OR use simpler design
- Marketing sites often have different sign-in page designs

**Options:**
A) Match existing ORBIT design (glassmorphism, dark theme)
B) Simple centered card (easier to implement)
C) Custom design (provide mockup)

**Recommendation:**
Option A (match ORBIT design) - consistency is important

**Your Decision:**
[x] A - Match ORBIT design
[ ] B - Simple centered card
[ ] C - Custom design
[ ] Other: _______________

---

## Configuration Questions

### Question 6: Session Strategy
**Category:** Technical Implementation
**Urgency:** MEDIUM (Day 1)

**Question:**
Confirm JWT-based sessions (not database sessions) for initial implementation?

**Context:**
- DESIGN_ARCHITECTURE.md specifies JWT strategy
- JWT = faster, no database queries per request
- Database sessions = more control, easier to revoke

**Options:**
A) JWT strategy (as specified)
B) Database sessions
C) Hybrid approach

**Recommendation:**
Option A (JWT strategy) - simpler, faster, per specification

**Your Decision:**
[x] A - JWT strategy
[ ] B - Database sessions
[ ] C - Hybrid
[ ] Other: _______________

---

### Question 7: Automatic Session Refresh
**Category:** User Experience
**Urgency:** LOW (Day 3)

**Question:**
Should sessions automatically refresh on activity, or require manual re-authentication after expiry?

**Context:**
- Auto-refresh: Better UX, user stays logged in if active
- Manual re-auth: More secure, forces periodic re-authentication

**Options:**
A) Auto-refresh on activity (recommended)
B) Manual re-authentication
C) Prompt user before refresh

**Recommendation:**
Option A (auto-refresh) - standard practice

**Your Decision:**
[x] A - Auto-refresh on activity
[ ] B - Manual re-authentication
[ ] C - Prompt before refresh
[ ] Other: _______________

---

## Answered Questions

*None yet - awaiting human input*

---

## How to Answer

**Method 1: Update this file**
Simply check the boxes next to your chosen options above.

**Method 2: Create new file**
Create `agent-outputs/auth-agent/ANSWERS.md` with your decisions.

**Method 3: Direct message**
Provide answers in any format, and I'll update this document.

---

**Questions Prepared By:** Authentication Engineer (auth-agent)
**Awaiting Answers:** Yes (7 questions)
**Can Proceed Without Answers:** No (Questions 1-2 are critical)
