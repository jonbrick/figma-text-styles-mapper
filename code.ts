/// <reference types="@figma/plugin-typings" />

// This plugin will parse Tailwind CSS classes and create Figma text styles

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 600 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

interface ParsedStyle {
  name: string;
  textClasses: string[];
}

interface ParsedStyles {
  styles: ParsedStyle[];
}

type FigmaTextProperty = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
};

type TailwindToFigmaMap = {
  [key: string]: FigmaTextProperty;
};

// Map Tailwind classes to Figma text style properties
const tailwindToFigmaMap: TailwindToFigmaMap = {
  // Font families
  "font-sans": { fontFamily: "Inter" },
  "font-serif": { fontFamily: "Georgia" },
  "font-mono": { fontFamily: "Roboto Mono" },

  // Font weights
  "font-thin": { fontWeight: 100 },
  "font-extralight": { fontWeight: 200 },
  "font-light": { fontWeight: 300 },
  "font-normal": { fontWeight: 400 },
  "font-medium": { fontWeight: 500 },
  "font-semibold": { fontWeight: 600 },
  "font-bold": { fontWeight: 700 },
  "font-extrabold": { fontWeight: 800 },
  "font-black": { fontWeight: 900 },

  // Font sizes (converted to pixels)
  "text-xs": { fontSize: 12 },
  "text-sm": { fontSize: 14 },
  "text-base": { fontSize: 16 },
  "text-lg": { fontSize: 18 },
  "text-xl": { fontSize: 20 },
  "text-2xl": { fontSize: 24 },
  "text-3xl": { fontSize: 30 },
  "text-4xl": { fontSize: 36 },
  "text-5xl": { fontSize: 48 },
  "text-6xl": { fontSize: 60 },
  "text-7xl": { fontSize: 72 },
  "text-8xl": { fontSize: 96 },
  "text-9xl": { fontSize: 128 },

  // Line heights (as multipliers)
  "leading-none": { lineHeight: 1 },
  "leading-tight": { lineHeight: 1.25 },
  "leading-snug": { lineHeight: 1.375 },
  "leading-normal": { lineHeight: 1.5 },
  "leading-relaxed": { lineHeight: 1.625 },
  "leading-loose": { lineHeight: 2 },

  // Letter spacing (in pixels)
  "tracking-tighter": { letterSpacing: -1 },
  "tracking-tight": { letterSpacing: -0.5 },
  "tracking-normal": { letterSpacing: 0 },
  "tracking-wide": { letterSpacing: 0.5 },
  "tracking-wider": { letterSpacing: 1 },
  "tracking-widest": { letterSpacing: 2 },
};

function isTextClass(className: string): boolean {
  return (
    className.startsWith("text-") ||
    className.startsWith("font-") ||
    className.startsWith("leading-") ||
    className.startsWith("tracking-")
  );
}

function parseTextStyles(css: string): ParsedStyles {
  const styles: ParsedStyle[] = [];
  const styleRegex = /([^{]+){([^}]+)}/g;
  let match;

  while ((match = styleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();

    // Skip if it's not a class selector
    if (!selector.startsWith(".")) continue;

    const styleName = selector.substring(1); // Remove the dot

    // Check for @apply directive
    const applyMatch = properties.match(/@apply\s+([^;]+)/);
    if (applyMatch) {
      const appliedClasses = applyMatch[1].split(/\s+/);
      const textClasses = appliedClasses.filter(isTextClass);

      // Only create a style if it has text-related classes
      if (textClasses.length > 0) {
        styles.push({
          name: styleName,
          textClasses: textClasses,
        });
      }
    }
  }

  return { styles };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "parse-css") {
    const { styles } = parseTextStyles(msg.css);
    figma.ui.postMessage({
      type: "found-styles",
      styles: styles,
    });
  } else if (msg.type === "create-styles") {
    const { styles } = parseTextStyles(msg.css);

    // Get the shared library collection
    const libraryCollection = (await figma.getNodeByIdAsync(
      "YOUR_LIBRARY_COLLECTION_ID"
    )) as ComponentSetNode;
    if (!libraryCollection) {
      figma.notify("Could not find the shared library collection");
      return;
    }

    for (const style of styles) {
      const textStyle = figma.createTextStyle();
      textStyle.name = style.name;

      // Map each Tailwind class to Figma properties
      for (const className of style.textClasses) {
        const figmaProps = tailwindToFigmaMap[className];
        if (figmaProps) {
          // Find matching style in library collection
          const matchingStyle = libraryCollection.children.find((child) => {
            if (child.type === "TEXT") {
              const textNode = child as TextNode;
              return Object.keys(figmaProps).every((key) => {
                const propKey = key as keyof FigmaTextProperty;
                const value = figmaProps[propKey];
                if (value === undefined) return true;

                switch (propKey) {
                  case "fontFamily":
                    return (
                      textNode.fontName !== figma.mixed &&
                      textNode.fontName.family === value
                    );
                  case "fontSize":
                    return (
                      textNode.fontSize !== figma.mixed &&
                      textNode.fontSize === value
                    );
                  case "lineHeight":
                    return (
                      textNode.lineHeight !== figma.mixed &&
                      typeof textNode.lineHeight === "object" &&
                      "value" in textNode.lineHeight &&
                      textNode.lineHeight.value === value
                    );
                  case "letterSpacing":
                    return (
                      textNode.letterSpacing !== figma.mixed &&
                      typeof textNode.letterSpacing === "object" &&
                      "value" in textNode.letterSpacing &&
                      textNode.letterSpacing.value === value
                    );
                  default:
                    return false;
                }
              });
            }
            return false;
          });

          if (matchingStyle) {
            const textNode = matchingStyle as TextNode;
            // Apply the library style properties
            if (textNode.fontName !== figma.mixed) {
              textStyle.fontName = textNode.fontName;
            }
            if (textNode.fontSize !== figma.mixed) {
              textStyle.fontSize = textNode.fontSize;
            }
            if (
              textNode.lineHeight !== figma.mixed &&
              typeof textNode.lineHeight === "object"
            ) {
              textStyle.lineHeight = textNode.lineHeight;
            }
            if (
              textNode.letterSpacing !== figma.mixed &&
              typeof textNode.letterSpacing === "object"
            ) {
              textStyle.letterSpacing = textNode.letterSpacing;
            }
          }
        }
      }
    }

    figma.notify(`Created ${styles.length} text styles`);
  } else if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
