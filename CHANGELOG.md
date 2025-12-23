# Changelog

## Unreleased

### Bug Fixes

* **ci:** fix Dependabot auto-merge not working - enable auto-merge immediately and let GitHub handle check waiting

## [1.1.1](https://github.com/GaryOcean428/Monkey-One/compare/v1.1.0...v1.1.1) (2025-12-23)


### Bug Fixes

* OAuth React [#306](https://github.com/GaryOcean428/Monkey-One/issues/306) error + fix corrupted favicon files ([6017070](https://github.com/GaryOcean428/Monkey-One/commit/6017070d00d52719c77fe2c66cc55cc8a9489f38))

## [1.1.0](https://github.com/GaryOcean428/Monkey-One/compare/v1.0.1...v1.1.0) (2025-12-23)


### Features

* add database validation script and configuration guide ([642a67d](https://github.com/GaryOcean428/Monkey-One/commit/642a67d4c5aff193855aa0dbc59fd7d86cc8092c))


### Bug Fixes

* consolidate Message types and resolve import issues ([96c179b](https://github.com/GaryOcean428/Monkey-One/commit/96c179b8ef8a2d8a5de33e07c244c7843e45bbd8))
* resolve Bundle Size Analysis workflow failure by removing broken action ([3e0a936](https://github.com/GaryOcean428/Monkey-One/commit/3e0a93620e59690320a40e69e98cfb9217a3b73a))
* resolve critical test failures in multiple modules ([93ea845](https://github.com/GaryOcean428/Monkey-One/commit/93ea8457ce405e66418f5e181af4264590829474))
* update all workflow files to use pnpm 10.17.1 matching package.json ([dec251e](https://github.com/GaryOcean428/Monkey-One/commit/dec251ea1ed11da1a0f359b05459d5298d2bbb99))
* update test mocks and add backward compatibility methods ([35bba63](https://github.com/GaryOcean428/Monkey-One/commit/35bba63b78cabcaefa81300f07b82c1bba7eea09))

## [1.0.1](https://github.com/GaryOcean428/Monkey-One/compare/v1.0.0...v1.0.1) (2025-10-24)


### Bug Fixes

* **auth:** add null/undefined guards to prevent React error [#306](https://github.com/GaryOcean428/Monkey-One/issues/306) ([70dc81b](https://github.com/GaryOcean428/Monkey-One/commit/70dc81b439abc86ed4bb050e8e380ae29c7d6402))
* **ci:** revert hookTimeout to 20s, retry to 2, and fix dependency vulnerabilities ([88d1812](https://github.com/GaryOcean428/Monkey-One/commit/88d1812df79c8be7fa2feb65de25951374a19184))

## 1.0.0 (2025-10-10)


### Features

* add comprehensive auth debugging toolset with CLI and web UI ([06d78d3](https://github.com/GaryOcean428/Monkey-One/commit/06d78d3e2488cdbc87e5c4369b7775ee4e9e8352))
* add project design approach documentation and UI improvements ([53e720c](https://github.com/GaryOcean428/Monkey-One/commit/53e720c839b8bf40152b87ea6ecc59be9e09b4fe))
* configure Vercel OIDC authentication with GCP integration ([a818378](https://github.com/GaryOcean428/Monkey-One/commit/a81837872010dd589ec937fcefca441a349895ac))
* implement universal theme system and fix pre-commit hooks ([f86066b](https://github.com/GaryOcean428/Monkey-One/commit/f86066bcab9a9d5660ecdfee54638f6f39fd2b6f))
* implement Vercel OIDC authentication and Skew Protection ([a26bde1](https://github.com/GaryOcean428/Monkey-One/commit/a26bde1acaece00682c33b14d26a7b63ce1670da))
* integrate OpenAI SDK for AI text generation with RAG support ([06752e2](https://github.com/GaryOcean428/Monkey-One/commit/06752e2f065e5911d1c762d5988a53ba375a35da))
* optimize ChatInterface performance and fix memory leaks ([ea93b4e](https://github.com/GaryOcean428/Monkey-One/commit/ea93b4e72d0bd7d0a027010caae1ae95583ca553))


### Bug Fixes

* add back serverless functions configuration for Pinecone API ([42a5127](https://github.com/GaryOcean428/Monkey-One/commit/42a5127a05fcdcf65de9836a0af270fa324d1213))
* add error state for failed OAuth callback and fix formatting ([83471f1](https://github.com/GaryOcean428/Monkey-One/commit/83471f1a8fe1747b1d58179018bba19df98ef2bd))
* add Google OAuth configuration to .env.example ([d32f820](https://github.com/GaryOcean428/Monkey-One/commit/d32f82010f108e0d919554090753ff9e7b86d652))
* add missing client_secret to Google OAuth token exchange ([121b6b4](https://github.com/GaryOcean428/Monkey-One/commit/121b6b4b7bdb96ddd9ac4386f7a33f54acb73cad))
* add missing signInWithGoogle function to useAuth hook ([db216d6](https://github.com/GaryOcean428/Monkey-One/commit/db216d6803a5e4b16983eecc842138868bb14aaa))
* add static file handling and update build config ([57a17ca](https://github.com/GaryOcean428/Monkey-One/commit/57a17ca2b776a76829012a61790fdbd5ae8319da))
* address build warnings and clean up configuration ([0bd4637](https://github.com/GaryOcean428/Monkey-One/commit/0bd4637cff40b2109fbc2bd15375d2c42353b8c0))
* correct pnpm setup order in GitHub Actions workflows ([a5840ec](https://github.com/GaryOcean428/Monkey-One/commit/a5840ec1fa546c7224eb248969c677b5efb14621))
* **deps:** update dependency @huggingface/inference to v3 ([c681212](https://github.com/GaryOcean428/Monkey-One/commit/c681212dddc0371168534129d88e2c135cc5cc9f))
* **deps:** update dependency @octokit/rest to v21.1.1 ([dffa9c5](https://github.com/GaryOcean428/Monkey-One/commit/dffa9c5deaf6e1f1b7a2b503f2f8bc24294f141a))
* **deps:** update dependency @pinecone-database/pinecone to v4.1.0 ([70d4423](https://github.com/GaryOcean428/Monkey-One/commit/70d44238aea585b173c60fa61b0270d9324acbbd))
* **deps:** update dependency @sentry/browser to v8.55.0 ([e1943b0](https://github.com/GaryOcean428/Monkey-One/commit/e1943b0cb553fafaea981f71d30881eddef70989))
* **deps:** update dependency @supabase/supabase-js to v2.48.1 ([12b3f7b](https://github.com/GaryOcean428/Monkey-One/commit/12b3f7b91cc13ecdede0533dcf8a8de9b27ace13))
* **deps:** update dependency framer-motion to v11.18.2 ([e542d48](https://github.com/GaryOcean428/Monkey-One/commit/e542d48725f836ac72f10a39209b6a2a3a7933e6))
* **deps:** update dependency helmet to v8 ([eab0310](https://github.com/GaryOcean428/Monkey-One/commit/eab0310f0b5a6daa6b3d76caafc9e8dba0b3430d))
* **deps:** update dependency lucide-react to ^0.475.0 ([d9a511b](https://github.com/GaryOcean428/Monkey-One/commit/d9a511bd746e496638355c5337a66b260f673606))
* **deps:** update dependency path-to-regexp to v8 ([82645d2](https://github.com/GaryOcean428/Monkey-One/commit/82645d21348bd0f853e92b3d0385af2075466a29))
* **deps:** update dependency react-error-boundary to v5 ([d0ac4f4](https://github.com/GaryOcean428/Monkey-One/commit/d0ac4f4cd217df9932d204f579bb794e603ce4b4))
* **deps:** update dependency react-router-dom to v6.29.0 ([348490a](https://github.com/GaryOcean428/Monkey-One/commit/348490a229be660810ce6dcb759fe67cb6592534))
* **deps:** update dependency semver to v7.7.1 ([a5e874e](https://github.com/GaryOcean428/Monkey-One/commit/a5e874ed908898a9f1890bc5084983bad3755c7d))
* **deps:** update dependency tailwind-merge to v3 ([f08990a](https://github.com/GaryOcean428/Monkey-One/commit/f08990ab9c97a3cdf6cbcdea2398cef0e5aa4947))
* **deps:** update dependency zod to v3.24.2 ([471a311](https://github.com/GaryOcean428/Monkey-One/commit/471a311befdc12ec5ff0f9c21ab6416f373de9cd))
* **deps:** update radix-ui-primitives monorepo ([23b80e6](https://github.com/GaryOcean428/Monkey-One/commit/23b80e6a96ae83ee5895d17d288110880bbc28cf))
* **deps:** update react monorepo ([bccc1ca](https://github.com/GaryOcean428/Monkey-One/commit/bccc1ca17e15ec1596204ee6d6145ed176831d19))
* **deps:** update react monorepo (major) ([f836d7a](https://github.com/GaryOcean428/Monkey-One/commit/f836d7a1a3a07eced93778d3d4b7ad7792497691))
* **deps:** update tanstack-query monorepo to v5.66.5 ([541a2fc](https://github.com/GaryOcean428/Monkey-One/commit/541a2fcbe67183eff952fa2767a05b175df31e0e))
* downgrade React to v18 to resolve dependency conflicts ([f0a1276](https://github.com/GaryOcean428/Monkey-One/commit/f0a12767822072321b2c0636e0b69856ae851c3e))
* force production URL to use custom domain ([53a4dda](https://github.com/GaryOcean428/Monkey-One/commit/53a4ddaaaa1fe24e9f7289f900fe05c5f3d1c93a))
* improve TypeScript types and error handling ([0e3dccc](https://github.com/GaryOcean428/Monkey-One/commit/0e3dcccf8c9a8fbdab243b630e3ffd9784f72f99))
* move API files to root api directory for Vercel serverless functions ([8c27b20](https://github.com/GaryOcean428/Monkey-One/commit/8c27b20d5809860ae4ee3d5090d7efb753e0e7c0))
* prioritize custom domain over Vercel default domain ([c3ddcf9](https://github.com/GaryOcean428/Monkey-One/commit/c3ddcf91987b497eb074ca240d22197770eebf7f))
* remove @testing-library/react-hooks to resolve React version conflict ([89df534](https://github.com/GaryOcean428/Monkey-One/commit/89df5344e0d218d869e3bc79e2112415c274aa06))
* remove conflicting allow-licenses from dependency review ([4eaffc6](https://github.com/GaryOcean428/Monkey-One/commit/4eaffc6f452ec9567ebbe7f7e46bf558a7d08371))
* remove explicit pnpm version to avoid conflict with packageManager ([04f89b7](https://github.com/GaryOcean428/Monkey-One/commit/04f89b706348b1f4f04bc2e0a198d806ba4a7d47))
* remove invalid skewProtection property from vercel.json ([978737d](https://github.com/GaryOcean428/Monkey-One/commit/978737da529d2d04b8483b8737890b53bb1981ae))
* resolve 'any' type warnings in ProfileManager.tsx ([4ffde7b](https://github.com/GaryOcean428/Monkey-One/commit/4ffde7b891652e1f6988182faa9a1aeb93395155))
* resolve ESLint errors and improve type safety ([6b86399](https://github.com/GaryOcean428/Monkey-One/commit/6b863994abfc1ddbc8fb6d6ee55ac41d4ddf97de))
* resolve ESLint errors and update dependencies ([0da47bc](https://github.com/GaryOcean428/Monkey-One/commit/0da47bc321c5a79756d3cd9ebbc8188d818f6b83))
* resolve merge conflicts in vite.config.ts ([e1f6a9d](https://github.com/GaryOcean428/Monkey-One/commit/e1f6a9d195153f1aaa5aa72776c16f3e9313382f))
* resolve OAuth callback and Supabase authentication errors ([8c5a2e2](https://github.com/GaryOcean428/Monkey-One/commit/8c5a2e2a62612faa7529e54f9e8b2626ccbc226a))
* resolve path alias issues and clean up browser compatibility ([6f7d9e2](https://github.com/GaryOcean428/Monkey-One/commit/6f7d9e2ee22cdc4fbeafc1f61f8c009013361e11))
* resolve TypeScript/ESLint errors in LLM providers and responseCache ([49043ef](https://github.com/GaryOcean428/Monkey-One/commit/49043efc7b98fd423623ff57c2a59ac7b79e4fd2))
* set production URL fallback in Vite config ([08277d6](https://github.com/GaryOcean428/Monkey-One/commit/08277d62b16ff7c0820675cb2f8ecf68ba3de727))
* simplify vercel.json by removing functions section ([428afcc](https://github.com/GaryOcean428/Monkey-One/commit/428afccd907422b4f9bf7b94689591b6ff80c936))
* simplify vercel.json to minimal valid configuration ([c59bf40](https://github.com/GaryOcean428/Monkey-One/commit/c59bf40c135109c4d237a0db8221842a363f6df7))
* update Node.js runtime version in vercel.json ([225f969](https://github.com/GaryOcean428/Monkey-One/commit/225f969bdafa83f66bcf655e8a35d62a9d5f6e91))
* update serverless functions path in vercel.json ([f913b75](https://github.com/GaryOcean428/Monkey-One/commit/f913b7532e43984cf88098c64f39946cb17ccb71))
* update vercel-build script to avoid recursive build ([5438f1b](https://github.com/GaryOcean428/Monkey-One/commit/5438f1b8ac480510843c0ac1cb7f35639799193c))
* update vercel.json environment variables to use proper syntax ([44630bf](https://github.com/GaryOcean428/Monkey-One/commit/44630bfe842fc4e9a2e499c9e9a54d1e15066230))
* update vercel.json routing configuration ([c4955ab](https://github.com/GaryOcean428/Monkey-One/commit/c4955abdd97413ce0f1ce9bf4284cefde55348c1))
* use legacy-peer-deps for npm install ([ea20995](https://github.com/GaryOcean428/Monkey-One/commit/ea2099517c1bee70e3e33481246734df50fcf5e5))
* use pnpm for installation ([ba83b21](https://github.com/GaryOcean428/Monkey-One/commit/ba83b21f1151c708b4cff6d652319cf81c1e534d))
