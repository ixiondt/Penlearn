// Liveness probe for the container healthcheck / load balancer.
// Cheap by design: no DB, no business logic — just confirms the process serves.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { status: 200 });
}
