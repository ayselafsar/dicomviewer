# Security Policy

The DICOM Viewer maintainers take security vulnerabilities seriously. Thank you
for reporting potential issues responsibly and giving us an opportunity to
investigate and address them before public disclosure.

## Supported Versions

Security fixes are provided for DICOM Viewer 2.3.3, the current release.
Older versions are not actively supported.

| Version | Supported |
| --- | --- |
| 2.3.3 | Yes |
| 2.3.2 and older | No |

Before reporting an issue, please verify that it is reproducible with the latest
release whenever possible.

## Reporting a Vulnerability

Do not report suspected vulnerabilities in a public GitHub issue, discussion,
pull request, or other public channel.

Email reports to [contact@acanio.com](mailto:contact@acanio.com) with the subject:

`[SECURITY] DICOM Viewer vulnerability`

Please include:

- A clear description of the vulnerability and its potential impact.
- The affected DICOM Viewer and Nextcloud versions.
- Relevant environment details, such as the operating system, browser, PHP
  version, and deployment configuration.
- Reproducible steps or a minimal proof of concept.
- Any known mitigations or workarounds.
- Whether you have disclosed, or plan to disclose, the issue elsewhere.
- Your preferred name and attribution, or a request to remain anonymous.

Use only synthetic or fully de-identified test data. Do not send protected
health information (PHI), personal data, credentials, access tokens, private
keys, or production DICOM files. If sensitive material is necessary to
demonstrate the issue, first send a minimal report so that we can agree on a
safer transfer method.

## What to Expect

We aim to:

1. Acknowledge receipt within 3 business days.
2. Provide an initial assessment within 10 business days.
3. Keep the reporter informed of material progress.
4. Coordinate a disclosure date after a fix or mitigation is available.
5. Credit the reporter in the advisory, unless anonymity is requested.

These are response targets rather than guarantees. Complex issues or
third-party dependencies may require additional time. Please tell us in the
initial report if you are working to a disclosure deadline.

Confirmed vulnerabilities may be handled through a private security advisory.
When appropriate, the advisory will identify affected versions, mitigations,
fixed versions, severity, and a CVE identifier.

## Scope

This policy covers:

- DICOM Viewer source code maintained in this repository.
- Official DICOM Viewer release artifacts.
- Vulnerabilities in bundled or third-party components when they are
  exploitable through DICOM Viewer.

Vulnerabilities that belong solely to Nextcloud, OHIF, a browser, or another
upstream dependency should normally be reported to that project's security
team. If you are unsure where the vulnerability belongs, report it to us and
we will help route it.

The following are generally out of scope:

- Issues affecting only unsupported versions.
- Reports without a plausible security impact.
- Vulnerabilities that require social engineering without a product flaw.
- Denial-of-service testing that sends excessive traffic or disrupts service.
- Findings based only on automated scanner output without validation.
- Security issues caused solely by an insecure deployment configuration.

## Responsible Testing

When investigating a potential vulnerability:

- Use an instance and data that you own or are explicitly authorized to test.
- Prefer a local test environment and synthetic DICOM data.
- Do not access, modify, retain, or disclose another person's data.
- Do not degrade service availability or perform destructive testing.
- Stop testing and report the issue if you encounter sensitive data.
- Collect only the evidence needed to demonstrate the vulnerability.

## Coordinated Disclosure

Please keep vulnerability details confidential until we have investigated the
report and agreed on a disclosure timeline. We will work with you in good faith
to set a reasonable timeline based on severity, exploitation risk, fix
complexity, and release requirements.

This project does not currently operate a bug bounty program. Submission of a
report does not create an entitlement to payment.

## Safe Harbor

Security research performed in good faith and in accordance with this policy
will be considered authorized by the project. We will not initiate legal action
against researchers for accidental, good-faith violations of this policy.

This safe harbor does not authorize testing of third-party systems or data and
cannot bind independent third parties. You remain responsible for complying
with applicable laws.
