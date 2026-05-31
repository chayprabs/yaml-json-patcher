export const privacyPolicy = `
# Privacy Policy

**Last updated:** ${new Date().toISOString().slice(0, 10)}

ConfigShape ("we", "the tool") is a browser-only application. We designed it so your configuration files and queries are processed entirely on your device.

## What we collect

- **Nothing from your files.** Pasted YAML, JSON, TOML, XML, expressions, and patches stay in your browser memory and optional browser storage (localStorage) on your machine.
- **No accounts.** We do not operate user accounts or authentication for this tool.
- **No analytics on file contents.** We do not transmit the content you paste into the editor to any server operated by us.

## Local storage

The app may save drafts, engine preferences, or session restore data in your browser's localStorage on the same origin. You can clear this data using the "Clear data" control in the playground or your browser settings.

## Third-party links

The header links to GitHub, X (Twitter), and a personal website. Those sites have their own privacy policies.

## Hosting

When you load the app from a static host, your browser downloads HTML, JavaScript, and WebAssembly assets. That is a normal software download, not upload of your configs.

## Children

This tool is not directed at children under 13.

## Changes

We may update this policy. Continued use after changes constitutes acceptance of the revised policy.

## Contact

For privacy questions, open an issue on the GitHub repository or contact the maintainer via the website linked in the header.
`.trim();

export const termsAndConditions = `
# Terms & Conditions

**Last updated:** ${new Date().toISOString().slice(0, 10)}

By using ConfigShape you agree to these terms. If you do not agree, do not use the tool.

## The service

ConfigShape is provided **"as is"** and **"as available"** for querying and patching structured configuration files in your browser. It is an open-source utility under the MIT License.

## No warranty

To the fullest extent permitted by law, the authors and contributors disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose. We do not guarantee that results are correct, lossless, or suitable for production deployments.

## Your responsibility

You are solely responsible for:

- Verifying output before applying it to production systems
- Backing up configuration files
- Compliance with your organization's policies and applicable law

Do not rely on this tool as the sole validator for safety-critical or regulated systems without independent review.

## Limitation of liability

In no event shall the authors, contributors, or hosts be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or business, arising from use of or inability to use the tool, even if advised of the possibility of such damages.

## Intellectual property

The software is licensed under MIT. Your configuration content remains yours.

## Prohibited use

You may not use the tool to violate law, infringe others' rights, or attempt to disrupt the hosting infrastructure.

## Modifications

We may change these terms. Material changes will be reflected by updating the date above.

## Governing law

These terms are governed by the laws applicable where the maintainer resides, without regard to conflict-of-law rules, except where mandatory consumer protections apply in your jurisdiction.

## Contact

Questions about these terms may be directed via the GitHub repository issue tracker.
`.trim();
