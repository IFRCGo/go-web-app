# GitHub Copilot Instructions - National Risk Watch (NRW)

## Project Overview

NRW is a web application for visualizing and analyzing disaster risk data, built on top of the IFRC Go platform. This repo contains code for the whole Go platform, but this branch focuses on NRW development only.
We control the backend for NRW and generally run it locally during development, so we have direct access to the service and data for debugging.

## Repository Overview

Directories that relate to NRW:

- `app/src/components/NrwMap`: NRW components
- `app/src/utils/nrw`: NRW helper files

---

## General Conventions (all languages)

- Use full names, no abbreviations — let IDE auto-complete handle length
- Avoid `any` (TypeScript) everywhere
- Use type annotations everywhere
- Do not include "Enum" suffix for enum names (e.g., `HazardType`, not `HazardTypeEnum`)
- Follow existing code patterns — prioritize readability over cleverness
- Always include Azure DevOps reference `AB#XXXXX` in commit body
- Do not delete the following when making other changes. The user will delete them later.
  - console.log statements
  - Debug comments that are not resolved

## Repo notes

- Do not change the following files. We copy them over directly from another repo to share enum and class types:
  - `app/src/utils/nrw/shared-dtos.ts`
  - `app/src/utils/nrw/shared-enums.ts`
