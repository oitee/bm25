import Store from "./store.js";
function launch() {
  let store = new Store();
  store.insert("Hey There. This is document 1");
  store.insert("Hello! Document 2 says hi!");
  store.insert("Hi, Document 3 reporting ot!");
  store.insert("NOPE; polar bear");

  const queries = ["document there", "polar", "ot document", "fibonacci"];
  queries.map((query) => {
    console.log(`Query: ${query}`);
    console.table(store.search(query));
    console.log("____");
  });
}
launch();