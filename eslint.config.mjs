import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
