/** Fixed effective date — update when legal text materially changes. */
export const LEGAL_LAST_UPDATED = "2026-05-31";

const OPERATOR = "Chaitanya Prabuddha";
const PROJECT = "ConfigShape";
const REPO = "https://github.com/chayprabs/yaml-json-patcher";
const WEBSITE = "https://www.chaitanyaprabuddha.com";

export const privacyPolicy = `
# Privacy Policy

**Last updated:** ${LEGAL_LAST_UPDATED}

This Privacy Policy describes how ${PROJECT} (the "Service", "we", "us", or "our") handles information when you use the browser-based application operated by ${OPERATOR} ("Operator").

**Summary:** The Service is designed to process your configuration data locally in your browser. We do not operate user accounts and we do not intentionally collect the content you paste into the editor.

## 1. Who we are

The Service is an open-source tool maintained by ${OPERATOR}. For privacy-related requests, contact us via the GitHub repository at ${REPO} or the website linked in the application header (${WEBSITE}).

## 2. Information we do not collect

We do **not** intentionally collect, store on our servers, or sell:

- The text of YAML, JSON, TOML, XML, or other files you paste into the editor
- Query expressions, patch documents, merge inputs, or validation schemas you provide
- Derived outputs produced by the Service in your browser

Processing of that content occurs on your device unless you choose to share it (for example, by copying a share link or exporting a file yourself).

## 3. Information processed locally on your device

The Service may store preferences and drafts in your browser's **localStorage** (or similar browser storage) on the same origin, including:

- Editor content and mode settings you choose to persist
- Engine and format preferences
- Session-restore data

You can clear this data using the in-app "Clear stored data" control or your browser settings. We do not have access to your localStorage from our servers.

## 4. Information that may be processed by third parties when you load the app

When you visit a hosted copy of the Service, standard web delivery applies:

- Your browser downloads static assets (HTML, JavaScript, WebAssembly, fonts, icons) from the hosting provider and any content delivery network (CDN) they use.
- Those providers may process technical data such as IP address, user agent, request time, and referrer in server or CDN logs under their own policies.

We do not control third-party hosting or CDN logging. Consult your host's privacy policy if you self-deploy; consult the public host's policy if you use a third-party deployment.

## 5. No analytics on file contents

We do not embed third-party analytics designed to receive the content of your configuration files. If a particular deployment adds analytics, that deployment is responsible for its own compliance and disclosure.

## 6. Share links

The Service may encode editor state in the URL fragment (hash) on your device. Fragment data is not sent to the server when you load a page. Anyone with the full URL you share can potentially decode that state in their own browser. You are responsible for what you share.

## 7. Third-party links and open-source dependencies

The application header may link to GitHub, social media, or personal websites. Those sites have separate policies. The Service bundles open-source libraries; their licenses are described in the repository NOTICE file and on the License page.

## 8. Legal bases (EEA, UK, and similar jurisdictions)

Where the General Data Protection Regulation (GDPR), UK GDPR, or similar laws apply:

- **Local processing:** Configuration content you edit is not transmitted to us by design; you remain in control on your device.
- **Hosting logs:** If a host processes IP address or technical logs, the host is typically an independent controller or processor; lawful basis and retention depend on that host.
- **Contact:** If you contact us via GitHub or email, we process your message to respond, based on legitimate interests or contract as applicable.

## 9. Your rights

Depending on your location, you may have rights to access, correct, delete, restrict, or object to processing of personal data, and to data portability or to lodge a complaint with a supervisory authority. Because we do not hold your editor content on our servers, many requests will not apply to content that never left your device. For hosting-related personal data, contact the relevant host.

**California (CCPA/CPRA):** We do not sell or share personal information as those terms are commonly defined for the content you edit. We do not use sensitive personal information for cross-context behavioral advertising.

## 10. Children

The Service is not directed to children under 16 (or under 13 where applicable law sets a lower age only with parental consent). If you believe a child provided personal data to us through a contact channel, notify us and we will take reasonable steps to delete it.

## 11. Security

We aim to follow security best practices in the open-source repository (see security.txt). No method of transmission or storage is 100% secure; use the Service at your own risk.

## 12. International transfers

If you access the Service from outside the country where a host operates, technical data may be processed in other countries by infrastructure providers. Appropriate safeguards depend on the host and applicable law.

## 13. Changes

We may update this Privacy Policy. The "Last updated" date will change when we do. Continued use after changes constitutes acceptance where permitted by law. Material changes may also be noted in the repository changelog.

## 14. Contact

Privacy questions: open an issue at ${REPO} or contact the Operator via ${WEBSITE}.
`.trim();

export const termsAndConditions = `
# Terms & Conditions

**Last updated:** ${LEGAL_LAST_UPDATED}

Please read these Terms & Conditions ("Terms") carefully. They form a binding agreement between you ("you", "User") and ${OPERATOR} ("Operator", "we", "us") regarding your use of ${PROJECT} (the "Service"), including any website, progressive web application, or single-file build that provides access to the Service.

**If you do not agree to these Terms, do not use the Service.**

## 1. The Service

${PROJECT} is a browser-based utility for querying, patching, merging, validating, and converting structured configuration formats (such as YAML, JSON, TOML, and XML). The Service is provided **free of charge**, **"AS IS"**, and **"AS AVAILABLE"**. Source code is offered under the MIT License (see License page and repository LICENSE file).

We may modify, suspend, or discontinue any part of the Service at any time without liability.

## 2. No professional advice

The Service is a technical tool only. It does **not** provide legal, financial, medical, security auditing, or compliance advice. Output may be incorrect, incomplete, or unsuitable for your environment. You must independently verify all results before use in production, safety-critical, regulated, or high-availability systems.

## 3. Eligibility

You represent that you are at least 18 years old (or the age of majority in your jurisdiction, if higher) and have legal capacity to enter into these Terms, or that you use the Service with consent of a parent or guardian where required by law.

## 4. Your responsibilities

You are solely responsible for:

- All content you load, edit, export, or share using the Service
- Backups, version control, and rollback of your configuration files
- Compliance with your employer's policies, contracts, licenses, and applicable laws (including export control, data protection, and sector-specific rules)
- Ensuring you have rights to process any data you input (including personal data or trade secrets)

## 5. Acceptable use

You agree **not** to:

- Use the Service in violation of any applicable law or regulation
- Infringe intellectual property, privacy, or other rights of any person
- Upload or process malware, unlawful content, or content you lack rights to use
- Attempt to probe, scan, or compromise the Service or related infrastructure except as permitted by written authorization
- Misrepresent affiliation with the Operator or overload systems through abuse or automated scraping of hosted deployments without permission

We may block or refuse service to anyone for conduct we reasonably believe violates these Terms.

## 6. Intellectual property

The Service software and branding are owned by the Operator and contributors, subject to the MIT License for the code. **Your configuration content remains yours.** You grant no license to us in your content because we do not receive it on our servers by design.

Third-party components are licensed under their respective terms (see NOTICE in the repository).

## 7. Disclaimer of warranties

**TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW**, THE SERVICE AND ALL OUTPUT ARE PROVIDED **WITHOUT WARRANTIES OF ANY KIND**, WHETHER **EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE**, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF **MERCHANTABILITY**, **FITNESS FOR A PARTICULAR PURPOSE**, **TITLE**, **NON-INFRINGEMENT**, **ACCURACY**, **QUIET ENJOYMENT**, AND ANY WARRANTIES ARISING FROM **COURSE OF DEALING OR USAGE OF TRADE**.

We do not warrant that the Service will be uninterrupted, error-free, secure, lossless, or that query, patch, merge, validate, or diff results will be correct or preserve comments, ordering, anchors, or semantics in any format.

Some jurisdictions do not allow exclusion of implied warranties; in those jurisdictions, exclusions apply only to the maximum extent permitted.

## 8. Limitation of liability

**TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW:**

(a) **IN NO EVENT** SHALL THE OPERATOR, CONTRIBUTORS, LICENSORS, OR HOSTS BE LIABLE FOR ANY **INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES**, OR FOR ANY **LOSS OF PROFITS, REVENUE, DATA, GOODWILL, BUSINESS INTERRUPTION, OR PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES**, ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE, WHETHER BASED ON **WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER THEORY**, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

(b) **TOTAL AGGREGATE LIABILITY** of the Operator for all claims arising out of or relating to the Service or these Terms shall not exceed the **greater of (i) zero United States dollars (US$0)** or **(ii) the amount you paid us for the Service in the twelve (12) months before the claim** (which, for the free Service, is zero).

(c) **Multiple claims** do not expand this limit.

(d) **Nothing in these Terms** excludes or limits liability that **cannot** be excluded or limited under applicable law, including liability for **death or personal injury caused by negligence**, **fraud**, or **intentional misconduct** where such exclusion is prohibited.

## 9. Indemnification

You agree to **defend, indemnify, and hold harmless** the Operator, contributors, and anyone who hosts or redistributes the Service from and against any **claims, damages, losses, liabilities, costs, and expenses** (including reasonable attorneys' fees) arising out of or related to:

- Your use or misuse of the Service or reliance on its output
- Your content or data
- Your violation of these Terms or applicable law
- Your violation of any third-party right

We may assume exclusive defense and control of any matter subject to indemnification at your expense, and you agree to cooperate.

## 10. Release

To the maximum extent permitted by law, you **release** the Operator from claims and damages of every kind and nature, known and unknown, arising out of or connected with disputes between you and third parties relating to your use of the Service or your configuration data.

Where a jurisdiction limits releases, this section applies only to the maximum extent permitted.

## 11. Export and sanctions

You represent that you are not located in, under control of, or a national or resident of any country or person subject to comprehensive embargoes or sanctions prohibiting use of US or applicable software, and that you will not use the Service in violation of export control laws.

## 12. Consumer rights (EEA, UK, Australia, and other mandatory regimes)

If you are a **consumer**, mandatory laws in your country of residence may give you rights that cannot be waived by contract. Nothing in these Terms affects those **non-waivable** rights. If any part of these Terms is void for consumers in your jurisdiction, it is severed or modified only to the minimum extent necessary.

## 13. Governing law and disputes

These Terms are governed by the **laws of India**, without regard to conflict-of-law rules that would apply another jurisdiction's laws, except where mandatory consumer protection or other non-waivable law of your residence requires otherwise.

**Exclusive jurisdiction:** Subject to mandatory consumer forum rules, you agree that courts located in **Bengaluru, Karnataka, India** shall have exclusive jurisdiction over disputes arising from these Terms or the Service that are not resolved informally.

Before filing suit, you agree to contact us via ${REPO} and attempt good-faith resolution for at least **thirty (30) days**.

## 14. Severability and entire agreement

If any provision is held invalid or unenforceable, the remaining provisions remain in effect. These Terms, the Privacy Policy, and the MIT License (for software) constitute the entire agreement regarding the Service and supersede prior understandings on that subject.

## 15. No waiver; assignment

Failure to enforce a provision is not a waiver. You may not assign these Terms without our consent. We may assign these Terms in connection with a reorganization or transfer of the project.

## 16. Changes

We may update these Terms. The "Last updated" date will change. Continued use after changes constitutes acceptance where permitted by law. If you do not agree, stop using the Service.

## 17. Contact

Legal or Terms questions: ${REPO} or ${WEBSITE}.

**Notice:** These Terms are provided for clarity and risk allocation. They are **not** a substitute for advice from a qualified attorney in your jurisdiction.
`.trim();

export const softwareLicense = `
# Software License & Disclaimer

**Last updated:** ${LEGAL_LAST_UPDATED}

## MIT License

Copyright (c) 2026 ${OPERATOR}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Additional disclaimer for end users

Use of the hosted ${PROJECT} application is also subject to the **Terms & Conditions** and **Privacy Policy**. The MIT License governs the source code; it does not expand warranties for any particular deployment you access.

Contributors to the repository provide code under the same license without assuming liability for how you use the Service.

## Third-party software

This project depends on open-source packages (for example, parsers, query engines, and UI libraries). Those components are licensed under their own terms. See the repository **NOTICE.md** file for attribution and license references.

## No guarantee

No license or notice in this repository guarantees that use of the Software is lawful in every country or for every purpose. **You** are responsible for compliance with laws applicable to you.
`.trim();
