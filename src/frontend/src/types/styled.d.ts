import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      lightText: string;
      border: string;
      success: string;
      warning: string;
      danger: string;
      white: string;
      searchEngine: string;
      seo: string;
      aiScraper: string;
      other: string;
    };
    fonts: {
      main: string;
      heading: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      largeDesktop: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      round: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      inset: string;
    };
    transitions: {
      fast: string;
      medium: string;
      slow: string;
    };
  }
}
