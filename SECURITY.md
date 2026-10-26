# Security policy

## Reporting a vulnerability

Please do not report exploitable vulnerabilities in public GitHub issues. Email **praisetechzw@gmail.com** with a concise description, affected component, reproduction steps, and potential impact. Avoid attaching real user data or live credentials.

We will acknowledge reports as soon as practical and coordinate a fix and disclosure timeline with the reporter. Do not access, modify, or retain data belonging to other users while investigating.

## Supported releases

Security fixes are generally prepared for the current supported Google Play release. Older builds may not receive fixes; install the latest version available for your device.

## Secret handling

Never commit Supabase service-role keys, OpenRouter keys, account passwords, Android signing material, or store service-account JSON. Expo variables prefixed with `EXPO_PUBLIC_` are public client configuration and must not contain private credentials.
