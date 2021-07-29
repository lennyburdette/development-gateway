import { ApolloServer } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

/**
 * @param {import("@apollo/gateway").GatewayConfig | undefined} [gatewayConfig]
 */
export async function makeGateway(gatewayConfig) {
  console.time("=== Gateway created");
  console.log("=== Creating new gateway...");

  const gateway = new ApolloGateway({
    debug: true,
    ...gatewayConfig,
  });
  const server = new ApolloServer({
    gateway,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await server.start();
  const middleware = server.getMiddleware();

  console.timeEnd("=== Gateway created");

  return middleware;
}
