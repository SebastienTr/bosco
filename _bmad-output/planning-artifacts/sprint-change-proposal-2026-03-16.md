# Sprint Change Proposal — Leg Deletion

**Date:** 2026-03-16
**Status:** Approved
**Scope:** Minor
**Trigger:** Missing leg deletion capability discovered after completing Stories 2.3 (GPX Import) and 2.4 (Stopovers)

---

## 1. Issue Summary

A sailor who imports an incorrect GPX file, a duplicate track, or a leg with errors has no way to delete it individually. The only option is to delete the entire voyage (planned in Story 2.6) and re-import everything.

FR-4 (GPX Import) covers the import workflow but not post-import leg management. FR-3 covers voyage CRUD, FR-5 covers stopover management (rename, reposition, delete, merge), but no FR addresses individual leg management.

## 2. Impact Analysis

### Epic Impact
- **Epic 2 (Track Import & Map Visualization):** New Story 2.4b inserted between 2.4 (done) and 2.5 (backlog). No existing stories invalidated.
- **Epics 3, 4:** No impact.

### Artifact Changes
- **PRD FR-4:** Extended with "Users can delete individual legs from a voyage"
- **Epics:** New Story 2.4b added with full acceptance criteria
- **Sprint Status:** Updated to reflect 2.4 done, 2.4b backlog
- **Architecture:** No changes needed — existing data layer pattern applies
- **UX:** Reuses existing confirmation dialog pattern (UX-DR15)

### Stopover Decision
Stopovers reference `voyage_id`, not `leg_id`. Deleting a leg does NOT cascade to stopovers. This is intentional: a port remains a port even if the track is removed. A sailor may want to delete a bad track and re-import without losing renamed stopovers.

## 3. Recommended Approach

**Direct Adjustment** — Add Story 2.4b within existing Epic 2 structure.

- Effort: Low (~1 Server Action, ~1 data layer function, UI delete button + confirmation, tests)
- Risk: Low (identical pattern to existing deletions)
- Timeline impact: Minimal (small story, before 2.5 PWA)
- Rollback: Not needed
- MVP: Not impacted

## 4. Change Proposals Applied

### PRD — FR-4
Added: "Users can delete individual legs from a voyage"

### Epics — Story 2.4b: Leg Deletion
Full story with acceptance criteria added between Stories 2.4 and 2.5.

### Sprint Status
- `2-4-automatic-stopover-detection-and-management`: review → done
- `2-4b-leg-deletion`: added as backlog
- Story ordering: 2.4 → 2.4b → 2.5 → 2.6

## 5. Implementation Handoff

| Action | Owner | Status |
|--------|-------|--------|
| Update FR-4 in PRD | This workflow | Done |
| Add Story 2.4b in epics | This workflow | Done |
| Update sprint-status.yaml | This workflow | Done |
| Create story file | `bmad-create-story` | Next |
| Implement | `bmad-dev-story` | After story creation |
