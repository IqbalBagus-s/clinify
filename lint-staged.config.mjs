// lint-staged.config.mjs
export default {
  '*.ts': [
    'prettier --write',
    'oxlint',
    // Fungsi tanpa argumen file: tsc harus cek seluruh project sekali,
    // bukan per file. Kalau diberi nama file, tsc mengabaikan tsconfig.
    () => 'npm run typecheck',
  ],
  '*.{json,md,yml,yaml}': 'prettier --write',
};