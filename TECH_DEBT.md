# Tech Debt — Dream House Site

A running log of known compromises in the codebase. Each entry should
include status, root cause, current workaround, what's needed from
which team to remove the workaround, owner, and priority.

---

## Backend data inconsistency: house_type vs building_material

**Status:** Workaround on frontend (commit `fix(detail): correct house_type vs building_material mapping`)

**Issue:** Backend stores wall material (e.g. `"brick_monolith"`) in the
`house_type` field, while `building_material` is `null`. The fields are
conceptually swapped — `house_type` should describe the housing format
(apartment vs private house), and `building_material` should describe the
wall material.

**Frontend workaround:** Read from `building_material` first, fallback to
`house_type`. The label in the characteristics table changed from "Тип
дома" to "Материал стен" so it reflects the actual content. Type for
`building_material` is now `string?` (optional) to match the null
possibility from the API.

**Required from backend team:**
- Migrate data: move wall-material values from `house_type` to
  `building_material`.
- Define `house_type` semantics (e.g. `apartment` vs `private`) and
  populate accordingly.
- Once fixed, the frontend will automatically pick up the correct field
  with no client-side change required.

**Owner:** _to be assigned_
**Priority:** Medium
**Related files:**
- `app/card/[id]/page.tsx` (≈ line 200)
- `app/types/models.ts` (`ICard.building_material`, `ICard.house_type`)
- `app/card/[id]/lib/index.ts` (`translateBuildingMaterial`, `translateHouseType`)
