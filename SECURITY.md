# Security Policy

## Supported Versions

Security fixes are applied to the current development branch and released as updates to the MakeCode extension.

| Version | Supported |
| --- | --- |
| `main` branch / latest release | Yes |
| Older commits / forks | Best-effort |

## Reporting a Vulnerability

Please report security issues **privately**.

- **Preferred**: Use **GitHub Security Advisories** for this repository
  - Go to the repository → **Security** → **Advisories** → **New draft security advisory**

If you are unable to use GitHub Security Advisories, open a regular GitHub issue with **no sensitive details** and ask maintainers for a private reporting channel.

### What to include

- A clear description of the issue and impact
- Steps to reproduce (or a proof-of-concept)
- Affected files/functions and any relevant configuration
- Your suggested fix/mitigation (optional)

### What to expect

- **Acknowledgement**: typically within 7 days
- **Status updates**: provided as the report is triaged and fixed
- **Coordinated disclosure**: we will coordinate a disclosure timeline with the reporter when possible

---

## Scope

This repository is a MakeCode extension targeting BBC micro:bit and Robot PU.

In scope:

- Vulnerabilities in extension code that could lead to unsafe behavior, data leakage, or unexpected remote control
- Radio control parsing and command handling (`runKeyValueCommand`, `runStringCommand`)
- Documentation issues that could encourage unsafe behaviors (hardware, power, or mechanical hazards)

Out of scope:

- Issues requiring physical access to the device (unless they enable privilege escalation beyond physical access)
- Vulnerabilities in upstream platforms or tooling (MakeCode editor, micro:bit runtime, browser, OS)
- Social engineering or spam

---

## Safe harbor

We welcome good-faith security research.

- Do not perform testing that could harm users, devices, or third-party services.
- Avoid public disclosure until we have had a reasonable chance to address the issue.
