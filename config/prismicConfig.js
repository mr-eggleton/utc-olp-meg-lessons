// node-fetch is used to make network requests to the Prismic Rest API.
// In Node.js Prismic projects, you must provide a fetch method to the
// Prismic client.
import fetch from "node-fetch";
import * as prismic from "@prismicio/client";

const repoName = "ethel-trust"; // Fill in your repository name.

const accessToken = process.env.PrismicAccessToken; // If your repo is private, add an access token in the .env file.
const endpoint = prismic.getEndpoint(repoName); // Format your endpoint.

// The `routes` property is your Route Resolver. It defines how you will
// structure URLs in your project. Update the types to match the Custom
// Types in your project, and edit the paths to match the routing in your
// project.
const routes = [
  {
    type: "post",
    path: "/post/:uid",
  },
  {
    type: "page",
    path: "/:uid",
  },
  {
    type: "route",
    path: "/activities",
  },
];



export const client = prismic.createClient(endpoint, {
  fetch,
  accessToken,
  routes,
});

export const getPage = async function (page) {
  return await client.getByUID("page", page, {
    graphQuery: `{
      page {
        ...pageFields
        related_pages {
          page{
            ...on page{
              ...pageFields
            }
          }
        }
      }
    }`,
  });
}