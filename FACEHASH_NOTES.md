# FaceHash Integration Notes

## Key Facts
- FaceHash is a **React component** that generates deterministic avatar faces from any string
- Zero dependencies, works with React 18/19
- **Problem**: It uses CSS/HTML rendering (div-based faces) - NOT SVG
- It's designed for web (React DOM), NOT React Native
- Same input = same face, always (deterministic hashing)

## Integration Strategy for React Native
Since FaceHash is a web-only React component, we have two options:

### Option A: Use the hosted API endpoint (BEST for RN)
- `https://www.facehash.dev/api/avatar?name=USERNAME&size=200`
- Returns a PNG image that can be used with `<Image>` in React Native
- No npm package needed, just construct the URL
- Pros: Zero dependencies, works everywhere, cached for 1 year
- Cons: Requires internet connection

### Option B: WebView-based rendering
- Render FaceHash in a WebView
- Too heavy, not recommended

## Decision: Option A - Use the hosted API
- Construct URL: `https://www.facehash.dev/api/avatar?name={username}&size={size}`
- Query params: name (required), size (number), variant ("gradient"|"solid"), showInitial (boolean)
- Display as `<Image source={{ uri: url }}>`
- Cache aggressively (same name = same face forever)

## Props available via URL
- name: string (required)
- size: number (16-2000)
- variant: "gradient" | "solid"
- showInitial: "true" | "false"
- colors: comma-separated hex (e.g., %23ff0000,%2300ff00)
