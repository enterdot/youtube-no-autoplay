# YouTube No Autoplay

A simple userscript that automatically disables YouTube's autoplay feature unless the user wants it enabled.

## Features

- **Disables autoplay** on regular videos to prevent unwanted video chains
- **Engagement detection** - stops interfering if you watch 5+ seconds (configurable)
- **Handles timestamped links** - works correctly with URLs like `t=1m30s`
- **Event-driven** - no polling, responds instantly to changes
- **Debug-friendly** - built-in test function for troubleshooting

## Quick Start

### 1. Install a userscript manager

Choose one for your browser:
- **Chrome/Brave/Edge**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Violentmonkey](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)
- **Safari**: [Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### 2. Install the script

1. Click the userscript manager extension icon in your browser
2. Select **"Create a new script"**
3. Replace all the default code with the code from `youtube-no-autoplay.js` and save it

### 3. Verify it's working

1. Go to any YouTube video
2. Press **F12** to open Developer Tools
3. Click the **"Console"** tab
4. Look for messages starting with `[YouTube No Autoplay]`

## ⚙️ Configuration

You can customize the script behavior by modifying these values:

```javascript
// In the script file:
DEBUG: true,              // Set to false to disable console logging
ENGAGEMENT_THRESHOLD: 5,  // Seconds to watch before allowing autoplay
```

## Troubleshooting

### Debug Function

Run this in the browser console on any YouTube page:

```javascript
testYouTubeNoAutoplay()
```

This will show you:
- Script initialization status
- Current engagement state
- URL parsing results
- Element detection results
