# Adopt in an Existing Project

## 1. Inventory before documenting

Inspect repository roots, build manifests, entry points, tests, migrations, deployment files and current documentation. Record facts in `PROJECT-CONTEXT.md` and `architecture/08-CODE-INVENTORY.md`.

## 2. Establish authority

Complete `01-CONTRACT.md`. Identify published interfaces, accepted decisions and non-negotiable security or compatibility requirements. Resolve conflicts between documentation and implementation explicitly.

## 3. Describe current architecture

Fill only the architecture documents relevant to the system. Delete or mark non-applicable templates rather than inventing content.

## 4. Capture domain truth

Document important terminology, invariants, decisions and state transitions. Link to authoritative implementation and tests.

## 5. Decide proposed ADRs

Review the included AI-boundary and single-source-of-truth ADRs. Accept, modify or reject them; do not leave proposed decisions looking binding.

## 6. Configure assistant entry points

Make repository assistant instructions point to `00-ROUTER.md`. Keep the router stable and route selectively so each task loads only useful context.

## 7. Pilot the workflow

Use one small real task. After completion, remove redundant documents and refine routing based on what the assistant actually needed.
