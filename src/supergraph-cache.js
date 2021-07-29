import { readFile, writeFile } from "fs/promises";
import { createRequire } from "module";
import { load, dump } from "js-yaml";
import { merge } from "lodash-es";
import { file as tmpFile } from "tmp-promise";
import execa from "execa";
import LRUCache from "lru-cache";
import { createHash } from "crypto";
import { makeGateway } from "./gateway.js";

const require = createRequire(import.meta.url);
const rover = require.resolve("@apollo/rover/run.js");

export class Cache {
  #cache = new LRUCache();

  /**
   * @param {{ name: string; sdl: string; }[]} params
   */
  async set(params) {
    const supergraphSdl = await compose(params);
    const names = params.map((p) => p.name).join(":");

    const hash = createHash("sha256").update(supergraphSdl).digest("hex");
    const id = `${names}:${hash}`;

    const gateway = await makeGateway({ supergraphSdl });

    this.#cache.set(id, { supergraphSdl, gateway });
    return id;
  }

  /**
   * @param {any} id
   */
  get(id) {
    return this.#cache.get(id) ?? {};
  }
}

/**
 * Generates a new supergraph YAML config by overridding specific subgraph
 * schemas.
 *
 * @param {{ name: string; sdl: string; }[]} subgraphs
 * @returns {Promise<string>}
 */
async function compose(subgraphs) {
  const cleanups = [];

  let config = load(await readFile("schemas/supergraph.yaml", "utf-8"));

  for (const { name, sdl } of subgraphs) {
    const { path, cleanup } = await tmpFile();
    cleanups.push(cleanup);

    await writeFile(path, sdl, "utf-8");

    const overrides = {
      subgraphs: {
        [name]: {
          schema: {
            file: path,
          },
        },
      },
    };

    config = merge(config, overrides);

    // @ts-ignore
    delete config.subgraphs[name].schema.graphref;
    // @ts-ignore
    delete config.subgraphs[name].schema.subgraph;
    // @ts-ignore
    delete config.subgraphs[name].schema.subgraph_url;
  }

  const { path, cleanup } = await tmpFile();
  cleanups.push(cleanup);

  await writeFile(path, dump(config), "utf-8");

  const proc = execa("node", [
    rover,
    "supergraph",
    "compose",
    "--config",
    path,
  ]);

  const supergraphSdl = (await proc).stdout;

  cleanups.forEach((fn) => fn());

  return supergraphSdl;
}
