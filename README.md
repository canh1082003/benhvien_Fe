# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## Frontend / Backend Configuration and Development

This repository contains a React/Vite frontend that talks to a Django REST API.
By default the frontend assumes the backend is available at `http://localhost:8080`
and uses Vite's development proxy to avoid CORS issues.

### Environment Variables

Create a `.env` file in the `benhvien_fe` folder or set the variables in your
shell before starting the dev server:

```bash
# full URL that will be used by axios; commonly set to http://localhost:8080/api
VITE_API_BASE_URL=http://localhost:8080/api

# origin used in a couple of links and error messages (eg. admin page)
VITE_API_ORIGIN=http://localhost:8080

# optional override for the vite proxy target (defaults to http://127.0.0.1:8080)
VITE_API_PROXY_TARGET=http://localhost:8080
```

The code will fall back to sensible defaults so you only need to provide these
values when you change the backend address/port.

### Running the Backend

Start the Django server on the same port referenced above. The project is
configured to serve at port **8080** in the seed script, so:

```bash
# from the benhvien_django directory
python manage.py runserver 0.0.0.0:8080
```

Check that you can reach `http://localhost:8080/api/assets/` before starting
the frontend.

### Running the Frontend

```bash
cd benhvien_fe
npm install   # or yarn
npm run dev
```

The Vite dev server will proxy any request beginning with `/api` to the backend
specified by `VITE_API_PROXY_TARGET`.  When you build for production the
frontend assets can be served directly by Django; just make sure the backend
is mounted at `/api/` in `benhvien_django/urls.py` (it already is).

---
