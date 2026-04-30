# TTS Integration Fix Plan

## Problem Summary
The Text-to-Speech (TTS) functionality that reads questions to users is not working despite speech recognition functioning correctly and sound being enabled.

## Root Cause Analysis
Based on code review, the TTS implementation appears structurally correct. Issues likely stem from:

1. Environment configuration (missing API keys)
2. Network/API accessibility problems
3. State hydration timing issues
4. Browser autoplay restrictions
5. Lack of user-facing error reporting

## Fix Implementation Plan

### Phase 1: Diagnostic Improvements

#### 1. Enhanced Logging & Error Reporting
Modify `src/components/shared/audio-play-button.tsx` to add comprehensive logging:

```typescript
// Add to the top of the file
const debugTTS = process.env.NODE_ENV === 'development';

// In playAudio function:
console.log('[TTS DEBUG] Attempting to play audio:', {
  textLength: text.length,
  ttsEnabled,
  hydrated,
  isLoading,
  isPlayingRef: isPlayingRef.current
});

// Add more detailed error logging:
} catch (error) {
  console.error('[TTS ERROR] Playback failed:', error);
  // User-facing error notification
  toast.error('Failed to play audio. Please check your connection and try again.');
  // ... rest of error handling
}
```

#### 2. API Route Testing Endpoint
Create a simple test route to verify TTS API is working:

```typescript
// src/app/api/tts-test/route.ts
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'This is a test',
        voice: 'jam',
        speed: 0.85,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API returned ${response.status}`);
    }

    const blob = await response.blob();
    return new Response(blob, {
      headers: { 'Content-Type': 'audio/wav' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### Phase 2: State Management Fixes

#### 3. Hydration State Improvement
Update `src/components/shared/audio-play-button.tsx` to handle hydration more robustly:

```typescript
// Replace the hydration check logic
const isEnabled = (() => {
  if (!hydrated) {
    // During SSR, default to enabled but log warning
    if (debugTTS) console.log('[TTS] Not hydrated yet, defaulting to enabled');
    return true;
  }
  return ttsEnabled;
})();

// Update the disabled state calculation
const isDisabled = !isEnabled;
```

#### 4. Auto-read Timing Adjustment
Modify `src/components/pages/lesson-page.tsx` auto-read effect:

```typescript
useEffect(() => {
  // More permissive conditions for testing
  if (!currentQ) return;
  
  // Always allow during development for easier testing
  const shouldAutoRead = process.env.NODE_ENV === 'development' 
    || (autoReadEnabled && ttsEnabled && !showFeedback && !hasNote);
    
  if (!shouldAutoRead) return;
  
  // ... rest of the logic
}, [currentQuestion, currentQ, showFeedback, autoReadEnabled, ttsEnabled, hasNote]);
```

### Phase 3: User Experience Improvements

#### 5. Visual Feedback for TTS State
Enhanced the button to show when TTS is disabled:

```typescript
// In the button's aria-label and title:
aria-label={
  isDisabled
    ? 'Text-to-speech is disabled'
    : isPlayingState
    ? 'Stop audio'
    : 'Play question audio'
}
title={
  isDisabled
    ? 'Text-to-speech is disabled in settings or not available'
    : isPlayingState
    ? 'Stop audio'
    : 'Play question audio'
}
```

#### 6. Settings Validation
Add validation in the sound settings to prevent saving invalid states:

```typescript
// In sound-store.ts, add validation to toggleTTS:
toggleTTS: () => {
  const newState = !get().ttsEnabled;
  // Only allow disabling if we can verify TTS is available
  // (This would require a capability check, simplified here)
  set({ ttsEnabled: newState });
},
```

### Phase 4: Deployment & Configuration Checks

#### 7. Environment Verification Checklist
Create a verification script to check:

```bash
# Check environment variables
echo "Checking NEXT_PUBLIC_ZAI_API_KEY:"
if [ -z "$NEXT_PUBLIC_ZAI_API_KEY" ]; then
  echo "❌ MISSING: ZAI API key not configured"
else
  echo "✅ Found: ZAI API key is set"
fi

# Check API route accessibility
echo "Testing TTS API endpoint..."
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"test","voice":"jam","speed":0.85}' \
  -w "%{http_code}\n" -s -o /dev/null
```

#### 8. Browser Compatibility Notes
Add documentation about browser requirements:

```typescript
// Add to audio-play-button.tsx comments:
// Note: Some browsers require user interaction before allowing audio playback
// Safari has particularly strict autoplay policies
// Consider implementing a user gesture requirement if needed
```

## Testing Procedure

1. **Unit Test**: Verify individual components work in isolation
2. **Integration Test**: Test the full flow from lesson page to TTS API
3. **Manual Test**: 
   - Verify TTS button appears and is clickable
   - Check browser console for TTS debug logs
   - Verify network requests to /api/tts succeed
   - Test auto-read functionality advances properly
4. **Edge Case Test**:
   - Test with various text lengths
   - Test with different voices and speeds
   - Test error conditions (network failure, invalid response)

## Success Criteria

- [ ] TTS button is visible and enabled when settings allow
- [ ] Clicking TTS button initiates audio playback
- [ ] Auto-read functionality works when enabled
- [ ] Error states are properly handled and communicated to user
- [ ] TTS persists correctly across sessions
- [ ] No console errors related to TTS functionality

## Estimated Effort

- Diagnostic improvements: 2 hours
- State management fixes: 1 hour  
- UX improvements: 1 hour
- Testing and verification: 2 hours
- **Total: 6 hours**

## Risk Assessment

- Low risk: Most changes are additive or improve error handling
- Medium risk: Changes to hydration logic could affect SSR (mitigated by thorough testing)
- Low risk: Environment verification helps identify configuration issues early

## Rollback Plan

Since changes are primarily additive (logging, error handling) or defensive (better state checks), rollback would involve reverting the specific file changes. The API test route can be easily removed if needed.