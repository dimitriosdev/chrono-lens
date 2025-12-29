/**
 * Component Variants
 * Pre-composed Tailwind class combinations for UI components
 */

export const componentVariants = {
  button: {
    // Light theme
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 border border-neutral-300 font-medium transition-all duration-200",
    tertiary:
      "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 border border-blue-600 font-medium transition-all duration-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md",
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200",
    outline:
      "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200",
    // Dark theme
    primaryDark:
      "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 font-medium transition-all duration-200",
    secondaryDark:
      "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 border border-neutral-700 font-medium transition-all duration-200",
    ghostDark:
      "bg-transparent text-neutral-300 hover:bg-neutral-800 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 font-medium transition-all duration-200",
  },

  input: {
    default:
      "bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-neutral-500",
    error:
      "bg-white text-neutral-900 border border-red-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder:text-neutral-500",
    success:
      "bg-white text-neutral-900 border border-green-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder:text-neutral-500",
    dark: "bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-neutral-400",
    darkError:
      "bg-neutral-800 text-neutral-100 border border-red-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder:text-neutral-400",
  },

  card: {
    default:
      "bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200",
    elevated:
      "bg-white rounded-lg border border-neutral-200 shadow-md hover:shadow-lg transition-all duration-200",
    interactive:
      "bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
    glass: "glass-panel rounded-lg backdrop-blur-sm border border-white/20",
    dark: "bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200",
    darkElevated:
      "bg-neutral-800 rounded-lg border border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200",
    darkInteractive:
      "bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-neutral-900",
  },

  badge: {
    default:
      "bg-neutral-100 text-neutral-800 px-2 py-1 rounded-full text-xs font-medium",
    primary:
      "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    success:
      "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
    warning:
      "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium",
    danger:
      "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium",
    info: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    outline:
      "border border-neutral-300 text-neutral-700 px-2 py-1 rounded-full text-xs font-medium bg-white",
    defaultDark:
      "bg-neutral-800 text-neutral-200 px-2 py-1 rounded-full text-xs font-medium",
    primaryDark:
      "bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full text-xs font-medium",
    successDark:
      "bg-green-900/50 text-green-300 px-2 py-1 rounded-full text-xs font-medium",
    warningDark:
      "bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium",
    dangerDark:
      "bg-red-900/50 text-red-300 px-2 py-1 rounded-full text-xs font-medium",
  },

  text: {
    heading: "text-neutral-900 font-semibold",
    headingDark: "text-neutral-100 font-semibold",
    body: "text-neutral-700",
    bodyDark: "text-neutral-300",
    muted: "text-neutral-500",
    mutedDark: "text-neutral-400",
    caption: "text-neutral-500 text-sm",
    captionDark: "text-neutral-400 text-sm",
    error: "text-red-600",
    errorDark: "text-red-400",
    success: "text-green-600",
    successDark: "text-green-400",
    warning: "text-yellow-600",
    warningDark: "text-yellow-400",
    info: "text-blue-600",
    infoDark: "text-blue-400",
    link: "text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded",
    linkDark:
      "text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded",
  },

  alert: {
    info: "bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4",
    success:
      "bg-green-50 border border-green-200 text-green-800 rounded-lg p-4",
    warning:
      "bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4",
    error: "bg-red-50 border border-red-200 text-red-800 rounded-lg p-4",
    infoDark:
      "bg-blue-900/20 border border-blue-800/30 text-blue-300 rounded-lg p-4",
    successDark:
      "bg-green-900/20 border border-green-800/30 text-green-300 rounded-lg p-4",
    warningDark:
      "bg-yellow-900/20 border border-yellow-800/30 text-yellow-300 rounded-lg p-4",
    errorDark:
      "bg-red-900/20 border border-red-800/30 text-red-300 rounded-lg p-4",
  },
} as const;

export type ComponentVariants = typeof componentVariants;
