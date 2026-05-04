# 00 – Start Here

## Repository

`MikaMcFlurry/typhoon.band-website`

## Situation

The user has uploaded Claude Design handoff files to this repository:
- desktop HTML
- mobile HTML
- handoff / transfer protocol

The user has also uploaded new assets:
- gallery assets
- band info card assets for Mika and Typhoon

Those handoff files and assets are the implementation source of truth.

## What Claude Code should do

Implement the website in Next.js using:
- the approved Claude Design handoff for frontend
- the content facts in this docs package
- the uploaded gallery and band info card assets
- the Supabase/Resend architecture described here
- local audio demo files
- audio player behavior from the old Claude branch, but not the old visual layout

## Do not copy

Do not copy old failed frontend implementations from previous branches/repos.
Do not reinterpret the design into a generic band website.

## Current preferred result

A professional onepage frontend with backend foundation so later batches can finalize:
- Admin
- content CRUD
- media uploads
- legal editing
- shop/tickets
