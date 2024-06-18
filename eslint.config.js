import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ...react.configs.recommended.languageOptions,
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
      },
    },
  }
);
