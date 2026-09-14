import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import {
  listTorchStops,
  getTorchStopById,
  createTorchStop,
  updateTorchStop,
  deleteTorchStop
} from "./torch.service.js";
import { requireAdmin } from "../../middleware/auth.js";
import { torchStopSchema } from "../../../shared/contracts.js";

export const torchRoutes = new Hono();

torchRoutes.get("/", async (c) => {

  const stops = await listTorchStops();

  return ok(c, stops);
});

torchRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const stop = await getTorchStopById(id);

  if (!stop) {
    return fail(c, 404, "NOT_FOUND", "Torch stop not found");
  }

  return ok(c, stop);
});

torchRoutes.post("/", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = torchStopSchema.parse(await c.req.json());


  const torchStop = await createTorchStop(body);

  return ok(c, torchStop, 201);
});

torchRoutes.patch("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = torchStopSchema.partial().parse(await c.req.json());
  const place = await updateTorchStop(c.req.param("id"), body);
  return ok(c, place);
});

torchRoutes.delete("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  await deleteTorchStop(c.req.param("id"));
  return ok(c, { deleted: true });
});