import { config } from "dotenv";
config();

import express from "express";
import { SupergraphCache, compose } from "./supergraph-cache.js";
import { makeGateway } from "./gateway.js";

const app = express();
const supergraphCache = new SupergraphCache();

app.post(
  "/compose",
  express.urlencoded({ extended: true }),

  /**
   * Given new subgraph SDLs, compose a new supergraph and cache it for later
   * use.
   *
   * Responds with the HTTP header needed to access this gateway.
   *
   * @param {import('express').Request<*, *, { subgraphs: { name: string; sdl: string; }[] }>} req
   * @param {import('express').Response} res
   */
  async (req, res) => {
    try {
      const id = await supergraphCache.set(req.body.subgraphs);
      res.json({ "x-schema": id });
    } catch (e) {
      res.send(e.message.split("\n").slice(1).join("\n"));
    }
  }
);

// Expects APOLLO_KEY to be set.
const result = await compose([]);
if ("error" in result) {
  throw result.error;
}
const defaultGateway = await makeGateway({
  supergraphSdl: result.supergraphSdl,
});

app.use(async (req, res, next) => {
  if (req.header("x-schema")) {
    const { gateway } = await supergraphCache.get(req.header("x-schema"));

    if (!gateway) {
      res.json(missingSupergraphResponse(req.header("x-schema")));
      return;
    }

    gateway(req, res, next);
  } else {
    defaultGateway(req, res, next);
  }
});

const port = process.env.PORT ?? 4000;
app.listen(port, () =>
  console.log(`server running at http://localhost:${port}/graphql`)
);

/**
 * @param {any} id
 */
function missingSupergraphResponse(id) {
  return {
    data: null,
    errors: [
      {
        message: `no supergraph found for x-schema: ${id}`,
      },
    ],
  };
}
