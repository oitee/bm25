import Store from "./store.js";
import fs from "fs";

function rawData() {
  const movies = fs
    .readFileSync("dataset/IMDB_movie_details.json", "utf8")
    .split("\n")
    .map((line) => {
      let lineObj = JSON.parse(line);
      return { text: lineObj["plot_synopsis"], id: lineObj.id };
    });
  const reviews = fs
    .readFileSync("dataset/IMDB_movie_reviews.txt", "utf8")
    .split("\n")
    .map((line) => {
      return {
        text: line,
        id: line.substring(0, 50).replace(/[^a-z0-9]/gi, "_"),
      };
    });
  return movies.concat(reviews);
}

async function launch() {
  let store = new Store();
  await Promise.all(
    rawData().map(async ({ text: text, id: id }) => {
      await store.insert(id, text);
    })
  );
  const queries = [
    "Al Pacino",
    "Robert De niro",
    "Ship iceberg atlantic",
    "fibonacci",
  ];
  queries.map(async (query) => {
    store.search(query).then((results) => {
      console.log(`Query: ${query}`);
      console.table(results);
    });
  });
}
launch();

//ToDo:
/** correct comments
 * index 1500 movie plots
 *
 * */
