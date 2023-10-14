import { createSchema, createYoga } from "graphql-yoga";
import { useDeferStream } from "@graphql-yoga/plugin-defer-stream";

const typeDefs = /* GraphQL */ `
  type Query {
    alphabet: [String!]!
    """
    A field that resolves fast.
    """
    fastField: String!

    """
    A field that resolves slowly.
    Maybe you want to @defer this field ;)
    """
    slowField(waitFor: Int! = 2000): String
  }
`;

const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const resolvers = {
  Query: {
    async *alphabet() {
      for (const character of ["a", "b", "c", "d", "e", "f", "g"]) {
        yield character;
        await wait(1000);
      }
    },
    fastField: async () => {
      await wait(100);
      return "I am speed";
    },
    // @ts-ignore
    slowField: async (_, { waitFor }) => {
      await wait(waitFor);
      return "I am slow";
    },
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  plugins: [useDeferStream()],
});

// @ts-ignore
const server = Bun.serve(yoga);

console.info(
  `Server is running on ${new URL(
    yoga.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`
  )}`
);
