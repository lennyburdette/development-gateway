import { config } from "dotenv";
config();

import express from "express";
import { Cache } from "./supergraph-cache.js";
import { makeGateway } from "./gateway.js";

const app = express();
const supergraphCache = new Cache();

app.post(
  "/compose",
  express.urlencoded({ extended: true }),

  /**
   * Given new subgraph SDLs, compose a new supergraph, spin up a gateway, and
   * cache it for later use.
   *
   * Responds with the HTTP header needed to access this gateway.
   *
   * @param {import('express').Request<*, *, { subgraphs: { name: string; sdl: string; }[] }>} req
   * @param {import('express').Response} res
   */
  async (req, res) => {
    const id = await supergraphCache.set(req.body.subgraphs);
    res.json({ "x-schema": id });
  }
);

// Expects APOLLO_KEY to be set.
const defaultGateway = await makeGateway();

app.use((req, res, next) => {
  if (req.header("x-schema")) {
    const { gateway } = supergraphCache.get(req.header("x-schema"));

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
