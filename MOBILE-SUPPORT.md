# Mobile Support Status

## Known Issue: MCP Connectors on Mobile

### Current Status
Both the **Priority Inbox** and **Playa del Carmen Guide** widgets currently experience issues when used on **ChatGPT mobile apps** (iOS/Android) and narrow screen widths (< 680px).

### Error Message
```
MCP write action is temporarily disabled
```

### Root Cause
This is a **known ChatGPT platform bug** (not a configuration issue with our widgets):
- **Tracked Issue**: [openai/openai-apps-sdk-examples #68](https://github.com/openai/openai-apps-sdk-examples/issues/68)
- **Status**: OpenAI team confirmed and working on fix (as of October 2024)
- **Affects**: All MCP connectors that trigger confirmation dialogs on mobile

### Why This Happens
1. ChatGPT mobile blocks tools that require confirmation dialogs
2. Our widgets are read-only (display only), but ChatGPT still requests confirmation
3. The confirmation mechanism is broken on mobile/narrow screens
4. Desktop/web works perfectly

### What We've Done
✅ **Added MCP Annotations** to mark tools as read-only:
```typescript
annotations: {
  title: "Priority Inbox",
  readOnlyHint: true,      // No data modification
  destructiveHint: false,   // No destructive actions
  idempotentHint: true,     // Safe to call multiple times
  openWorldHint: false,     // No external API calls
}
```

These annotations follow MCP best practices and *may* help when OpenAI releases their fix.

### Workarounds
- **Desktop/Web**: ✅ Works perfectly
- **Mobile Incognito**: Some users report temporary success in incognito/private browsing mode
- **Wait for Fix**: OpenAI is actively working on resolving this

### Testing Status
| Platform | Status | Notes |
|----------|--------|-------|
| ChatGPT Web (Desktop) | ✅ Working | Full functionality |
| ChatGPT Web (Mobile width) | ❌ Blocked | Width < 680px triggers error |
| ChatGPT iOS App | ❌ Blocked | Confirmation dialog broken |
| ChatGPT Android App | ❌ Blocked | Confirmation dialog broken |

### Recommendation
For **production use**, recommend users access widgets via:
1. **ChatGPT Web on desktop** (primary)
2. **ChatGPT Web on mobile browser** (may work in private mode)
3. Wait for OpenAI's platform fix for native mobile app support

### References
- [GitHub Issue #68](https://github.com/openai/openai-apps-sdk-examples/issues/68)
- [MCP Specification - Tool Annotations](https://modelcontextprotocol.io/specification)
- [OpenAI Apps SDK - Custom UX Widgets](https://developers.openai.com/apps-sdk/concepts/custom-ux/)

---

## Widget-Specific Mobile UX Issues

### Playa del Carmen Guide - Desktop-First Layout

**Status**: 🔧 Improvement Needed (separate from ChatGPT platform bug above)

#### Current Mobile UX Problems

Even when the ChatGPT platform bug is fixed, the Playa Guide widget has desktop-first design issues on mobile:

1. **Fixed 420px Sidebar** - Hardcoded width dominates mobile screens
2. **Map + List Overlap** - Both views compete for limited screen space
3. **No Responsive Breakpoints** - Missing conditional rendering for mobile (< 768px)
4. **Poor Touch Targets** - UI elements too small for mobile interaction
5. **Information Density** - Too much content cramped into small viewport

#### Recommended Solution: Vertical Stack Layout

Implement a mobile-responsive design with vertical stacking:

**Mobile (< 768px):**
- **Vertical scroll container** with two sections:
  1. **List section** (top): Full-width scrollable place cards with photos, ratings, details
  2. **Map section** (below): Interactive map with markers and bottom card overlay
- **Natural scroll experience**: Users browse list first, scroll down to see map
- **No toggle needed**: Both views accessible in single scroll flow
- **Full-Width Cards**: Better use of screen real estate

**Desktop (≥ 768px):**
- Keep current sidebar + map layout (works great!)
- 420px fixed sidebar on right
- Map on left with proper padding

#### Implementation Checklist

```typescript
// Detect mobile viewport
const isMobile = window.innerWidth < 768;

// Mobile: Vertical stack layout
{isMobile ? (
  <div className="flex flex-col h-full overflow-y-auto">
    {/* List Section - scrollable place cards */}
    <div className="px-4 py-4 space-y-3">
      {places.map(place => (
        <PlaceCard
          key={place.id}
          place={place}
          onClick={() => setSelectedId(place.id)}
          className="w-full"
        />
      ))}
    </div>

    {/* Map Section - fixed height, interactive */}
    <div className="h-[400px] w-full relative">
      <Map places={places} selectedId={selectedId} />
      {selectedPlace && (
        <BottomCard place={selectedPlace} onClose={() => setSelectedId(null)} />
      )}
    </div>
  </div>
) : (
  // Desktop: Keep current sidebar + map layout
  <>
    <Sidebar places={places} selectedId={selectedId} onSelect={setSelectedId} />
    <Map places={places} selectedId={selectedId} />
  </>
)}
```

#### Key Changes Needed

1. **App.tsx**: Add responsive breakpoint detection and conditional layout rendering
2. **Mobile Layout**: Create vertical stack container with list section + map section
3. **PlaceCard Component**: Extract place cards from Sidebar for reuse in mobile list
4. **BottomCard Component**: Create overlay card for map view (shows selected place)
5. **Responsive Hook**: Add `useMediaQuery` or `useWindowSize` hook for breakpoint detection
6. **CSS Updates**: Tailwind responsive classes (`md:`, `lg:`, `flex-col` vs `flex-row`)
7. **Touch Targets**: Increase tap areas to 44x44px minimum
8. **Map Height**: Set appropriate fixed height for map section on mobile (~400px)

#### Priority

- **Impact**: High - Poor mobile UX when platform bug is fixed
- **Effort**: Medium - ~4-6 hours implementation
- **Status**: Documented for future implementation

#### References

- User feedback: Mobile screenshots showing cramped layout
- Pattern inspiration: Vertical stack pattern with list-first approach
  - List section: Full-width cards with photos, ratings, descriptions
  - Map section: Interactive map with bottom overlay card
  - Natural scroll flow from list → map (no toggle needed)

---

**Last Updated**: October 31, 2024
**Next Review**: When OpenAI releases mobile fix
