// api/migrate.ts
export default eventHandler(async (event) => {
  // IMPORTANT: Authenticate user and validate payload!
  const payload = { ...getQuery(event) };
  const { result } = await runTask("db:migrate", { payload });

  return { result };
});
