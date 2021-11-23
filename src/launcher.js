import Store from "./store.js";
import fs from "fs";

function rawData() {
  return fs
    .readFileSync("dataset/IMDB_movie_details.json", "utf8") 
    .split("\n")
    .map((line) => {
      let lineObj = JSON.parse(line);
      return { text: lineObj["plot_synopsis"], id: lineObj.id };
    });
}

async function launch() {
  let store = new Store();
  rawData().map(({ text: text, id: id }) => {
    store.insert(id, text);
  });
  const queries = ["Al Pacino", "Robert De niro", "Ship iceberg atlantic", "fibonacci"];
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
