import Store from "./store.js";
async function launch() {
  let store = new Store();
  store.insert("1", "Hey There. This is document 1");
  store.insert("2", "Hello! Document 2 says hi!");
  store.insert("3", "Hi, Document 3 reporting ot!");
  store.insert("4", "NOPE; polar bear");

  const queries = ["document there", "polar", "ot document", "fibonacci"];
  queries.map(async (query) => {
    store.search(query).then((results) => {
      console.log(`Query: ${query}`);
      console.table(results);
    });
  });
}
launch();
