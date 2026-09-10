import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import { listTorchStops, getTorchStopById } from "./torch.service.js";

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