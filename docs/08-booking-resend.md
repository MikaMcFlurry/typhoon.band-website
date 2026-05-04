# 08 – Booking and Resend

## Goal

Booking form is visible on homepage and later fully handled by Supabase + Resend.

## Current implementation expectation

Implement a server-side booking handler with graceful fallback:
- validate input
- if Supabase env exists, store request
- if Resend env exists, send email
- if env is missing, return a clear development/demo message
- never expose API keys to frontend

## Recipient

```text
booking@typhoon.band
```

## Recommended email

```text
From: Typhoon Website <website@typhoon.band>
To: booking@typhoon.band
Reply-To: user email
```
