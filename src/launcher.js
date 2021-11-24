import Store from "./store.js";
import fs from "fs";

function rawData() {
  const movies1 = fs
    .readFileSync("dataset/IMDB_movie_details.json", "utf8")
    .split("\n")
    .map((line) => {
      let lineObj = JSON.parse(line);
      return { text: lineObj["plot_synopsis"], id: lineObj.id };
    });
  const idToName = fs
    .readFileSync("dataset/movie.metadata.tsv", "utf8")
    .split("\n")
    .reduce((acc, line) => {
      const fields = line.split("\t");
      const id = fields[0];
      const title = fields[2];
      acc.set(id, title);
      return acc;
    }, new Map());
  const movies2 = fs
    .readFileSync("dataset/plot_summaries.tsv", "utf8")
    .split("\n")
    .map((line) => {
      const fields = line.split("\t");
      const id = fields[0];
      const name = idToName.get(id) || "Unknown";
      return {
        text: fields[1],
        id: `${id}_${name}`.substring(0, 50).replace(/[^a-z0-9]/gi, "_"),
      };
    })
    .filter(doc => doc.text && doc.text.length > 0);

  return movies1.concat(movies2);
}

async function launch() {
  let store = new Store();
  log(`Inserting documents into Store...`);
  await Promise.all(
    rawData().map(async ({ text: text, id: id }) => {
      await store.insert(id, text);
    })
  );
  log(`Inserted ${store.getDocCount()} documents into Store...`);
  const queries = [
    "Al Pacino",
    "Robert De niro",
    "Ship iceberg atlantic",
    "fibonacci",
  ];
  queries.map(async (query) => {
    store.search(query).then((results) => {
      log(`Search Results for: ${query}`);
      console.table(results);
    });
  });
}

function log(str){
    console.log(`\n${new Date()}: ${str}`)
}
launch();

//ToDo:
/** correct comments
 
 * */
