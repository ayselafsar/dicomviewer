# Security Policy

The Nextcloud DICOM Viewer maintainers take security vulnerabilities
seriously. Thank you for reporting potential issues responsibly and giving us
an opportunity to investigate and address them before public disclosure.

## Supported Versions

The latest maintained release is currently Nextcloud DICOM Viewer 2.4.0.
Older versions are not actively supported. Security fixes are evaluated on a
case-by-case basis and are not guaranteed for every reported issue.

| Version | Supported |
| --- | --- |
| 2.4.0 | Yes |
| 2.3.3 and older | No |

Before reporting an issue, please verify that it is reproducible with the latest
release whenever possible.

## Reporting a Vulnerability

Do not report suspected vulnerabilities in a public GitHub issue, discussion,
pull request, or other public channel.

Email reports to [security@acanio.com](mailto:security@acanio.com) with the subject:

`[SECURITY] Nextcloud DICOM Viewer vulnerability`

Please include:

- A clear description of the vulnerability and its potential impact.
- The affected Nextcloud DICOM Viewer and Nextcloud versions.
- Relevant environment details, such as the operating system, browser, PHP
  version, and deployment configuration.
- Reproducible steps or a minimal proof of concept.
- Any known mitigations or workarounds.
- Whether you have disclosed, or plan to disclose, the issue elsewhere.
- Your preferred name and attribution, or a request to remain anonymous.

Use only synthetic or fully de-identified test data. Do not send protected
health information (PHI), personal data, credentials, access tokens, private
keys, or production DICOM files. If you accidentally encounter PHI or other
sensitive information, stop testing immediately. Do not download, copy, retain,
or include it in a report. Notify security@acanio.com using a description that
does not disclose the sensitive information. If more evidence is needed, first
send a minimal report so that we can agree on a safe way to demonstrate the
issue using synthetic or fully de-identified data.

## What to Expect

We aim to acknowledge vulnerability reports and provide an initial assessment
within a reasonable timeframe. Response times may vary depending on
availability, severity, and complexity.

We also aim to:

1. Keep the reporter informed of material progress.
2. Coordinate disclosure timelines on a case-by-case basis, taking available
   fixes or mitigations into account.
3. Credit the reporter in the advisory, unless anonymity is requested.

These are nonbinding intentions. An initial assessment does not guarantee
confirmation of a vulnerability or a remediation timeline. Complex issues or
third-party dependencies may require additional time. Please tell us in the
initial report if you are working to a disclosure deadline.

Confirmed vulnerabilities may be handled through a private security advisory.
When appropriate, advisories may include affected versions, available
mitigations, fixed versions, severity, and a CVE identifier if one has been
assigned.

## Scope

This policy covers:

- Nextcloud DICOM Viewer source code maintained in this repository.
- Official Nextcloud DICOM Viewer release artifacts.
- Vulnerabilities introduced by Nextcloud DICOM Viewer integrations or its use of bundled
  or third-party components, including those exploitable through Nextcloud DICOM Viewer.

Vulnerabilities that exist independently in Nextcloud, a browser, or
another upstream project, without a Nextcloud DICOM Viewer integration or usage flaw,
should normally be reported to that project's security team. If you are unsure
where the vulnerability belongs, report it to us and we will help route it.

Inclusion in scope does not authorize testing of third-party systems or data;
see Responsible Security Research below.

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
- Stop testing immediately if you encounter PHI or other sensitive information,
  and notify us without disclosing it, as described above.
- Collect only nonsensitive evidence needed to demonstrate the vulnerability.

## Coordinated Disclosure

Please keep vulnerability details confidential while we investigate the report
and coordinate an appropriate disclosure timeline. We will work with reporters
in good faith to determine a reasonable disclosure date based on severity,
exploitation risk, available mitigations, remediation complexity, and release
requirements.

Disclosure timelines are determined on a case-by-case basis. This policy does
not guarantee remediation or public disclosure within a specific timeframe. If
we cannot agree on a disclosure date, we will continue communicating in good
faith while considering the security risks to users.

This project does not currently operate a bug bounty program. Submission of a
report does not create an entitlement to payment.

## Responsible Security Research

The Nextcloud DICOM Viewer maintainers welcome good-faith security research
conducted in accordance with this policy against instances and data that
researchers own or are explicitly authorized to test.

This policy does not grant permission to test Acanio's production infrastructure
or third-party Nextcloud installations, infrastructure, or data. Such testing
requires separate, explicit authorization from the relevant owner.

This policy does not bind independent third parties. Researchers remain
responsible for complying with applicable laws.
