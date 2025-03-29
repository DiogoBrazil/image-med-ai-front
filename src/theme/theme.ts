import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: {
    50: '#e6f2ff',
    100: '#cce0ff',
    200: '#99c2ff',
    300: '#66a3ff',
    400: '#3385ff',
    500: '#0066ff', // Base blue
    600: '#0052cc',
    700: '#003d99',
    800: '#002966',
    900: '#001433',
  },
  secondary: {
    50: '#fffde6',
    100: '#fff9cc',
    200: '#fff499',
    300: '#ffee66',
    400: '#ffe833',
    500: '#ffe200', // Base yellow
    600: '#ccb500',
    700: '#998800',
    800: '#665a00',
    900: '#332d00',
  },
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
};

const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: { colorScheme: string }) => ({
        bg: props.colorScheme === 'primary' ? 'primary.500' : `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'primary' ? 'primary.600' : `${props.colorScheme}.600`,
        },
      }),
      outline: (props: { colorScheme: string }) => ({
        borderColor: props.colorScheme === 'primary' ? 'primary.500' : `${props.colorScheme}.500`,
        color: props.colorScheme === 'primary' ? 'primary.500' : `${props.colorScheme}.500`,
      }),
    },
  },
  Card: {
    baseStyle: {
      p: '6',
      bg: 'white',
      borderRadius: 'lg',
      boxShadow: 'md',
      transition: 'all 0.2s',
      _hover: {
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      },
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export default theme;