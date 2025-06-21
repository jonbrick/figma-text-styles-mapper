# Figma Text Styles Mapper

This Figma plugin parses CSS code with Tailwind @apply directives to extract and display which Tailwind utility classes are used by each CSS selector, providing structured JSON output for design system analysis.

## Features

- **CSS Parsing**: Paste CSS code with `@apply` directives directly into the plugin interface
- **Tailwind Class Extraction**: Automatically identifies and extracts Tailwind utility classes from CSS selectors
- **JSON Output**: Generates structured JSON mapping CSS selector names to their Tailwind classes
- **Copy to Clipboard**: One-click copying of the parsed output for use in other tools

## How It Works

1. **Input**: Paste your CSS code containing `@apply` directives
2. **Parse**: The plugin extracts CSS selectors and their associated Tailwind classes
3. **Output**: View the structured JSON representation of your typography system
4. **Export**: Copy the results for documentation or further processing

## Example Usage

**Input CSS:**

```css
.hero-title {
  @apply text-4xl font-bold leading-tight;
}

.body-text {
  @apply text-base font-normal leading-relaxed;
}

.caption {
  @apply text-sm font-medium tracking-wide;
}
```

**Output JSON:**

```json
{
  "hero-title": {
    "font-size": "font/size/4xl",
    "font-weight": "font/weight/bold",
    "line-height": "font/leading/tight"
  },
  "body-text": {
    "font-size": "font/size/base",
    "font-weight": "font/weight/normal",
    "line-height": "font/leading/relaxed"
  },
  "caption": {
    "font-size": "font/size/sm",
    "font-weight": "font/weight/medium",
    "letter-spacing": "font/tracking/wide"
  }
}
```

## Supported Tailwind Classes

### Font Sizes

- `text-xs` through `text-9xl`
- Custom sizes with bracket notation: `text-[16px]`

### Font Weights

- `font-thin` (100) through `font-black` (900)
- Custom weights with bracket notation: `font-[450]`

### Font Families

- `font-sans`, `font-serif`, `font-mono`
- Custom families with bracket notation: `font-[Inter]`

### Line Heights

- `leading-none`, `leading-tight`, `leading-snug`, `leading-normal`, `leading-relaxed`, `leading-loose`
- Custom line heights with bracket notation: `leading-[1.2]`

### Letter Spacing

- `tracking-tighter` through `tracking-widest`
- Custom tracking with bracket notation: `tracking-[0.05em]`

### Font Style

- `italic`, `not-italic`

## Installation

1. Download the plugin files
2. In Figma, go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this project
4. The plugin will appear in your Figma plugins list

## Development

### Prerequisites

- Node.js and npm
- TypeScript

### Setup

```bash
npm install
npm run build
```

### Watch Mode

```bash
npm run watch
```

This will automatically recompile TypeScript files when changes are detected.

### Linting

```bash
npm run lint
npm run lint:fix
```

## Use Cases

- **Design System Auditing**: Understand which Tailwind classes are being used across your CSS
- **Documentation Generation**: Create structured documentation of your typography system
- **Design-Development Sync**: Bridge the gap between CSS implementations and design specifications
- **Token Analysis**: Analyze usage patterns of design tokens in your codebase

## Technical Details

The plugin consists of two main components:

1. **UI (ui.html)**: Browser-based interface for CSS input and JSON output display
2. **Plugin Code (code.ts)**: Figma plugin infrastructure with TypeScript support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Add your license information here]
