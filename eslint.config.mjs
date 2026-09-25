import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    ignores: [".next/**", "node_modules/**", "data/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Hochgeladene Bilder werden hinter der Authentifizierung ueber eine
      // dynamische Route ausgeliefert. next/image wuerde sie serverseitig ohne
      // Cookies laden und damit die Auth aushebeln – daher bewusst <img>.
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
