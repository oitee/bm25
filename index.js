class DocStore {
  constructor() {
    /**
     * {object{object}} documentList
     * To store, on a document level, the number of occurences of each word of every document.
     */
    this.documentList = {};

    /**
     * {object{object}} wordList
     * To store, on a word level, the number of documents each word is present
     */
    this.wordList = {};

    /**
     * {integer} idCounter
     * Counter to track id of each new document
     *
     */
    this.idCounter = 0;

    /**
     * {integer} totalWordCount
     * To store the total number of words in all documents combined
     */
    this.totalWordCount = 0;

    /**
     * {object} listOfDocIds
     * To store all document IDs and their respect documents, as key-value pairs
     */
    this.listOfDocIds = {};

    /**
     * {integer} numberOfDocs
     * To store the total number of documents
     */
    this.numberOfDocs = 0;

    /**
     * {integer} averageLength
     * To store the average length (in words) of all the documents
     */
    this.averageLength = this.totalWordCount / this.numberOfDocs;

    /**
     * {integer} K
     * Free parameter for BM25 algorithm
     */
    this.K = 1.5;

    /**
     * {integer} B
     * Free parameter for BM25 algorithm
     */
    this.B = 0.75;
  }
  /**
   *
   * @param {string} str
   * @returns {null}
   * Inserts a new document in the system
   */

  insert(str) {
    str = str.toLowerCase();
    this.idCounter++;
    let docId = this.idCounter;
    this.listOfDocIds[docId] = str;
    let words = this.wordArray(str);
    words.map((word) => {
      // todo: Remove duplicate words within a document; alt, use set to [or remove duplicates]
      if (this.wordList.hasOwnProperty(word)) {
        this.wordList[word]++;
      } else {
        this.wordList[word] = 1;
      }
    });
    let wordsInDoc = {}; // Todo: convert into a JS MAP
    let wordCount = 0;
    words.map((word) => {
      if (wordsInDoc.hasOwnProperty(word)) {
        wordsInDoc[word]++;
      } else {
        wordsInDoc[word] = 1;
      }
      wordCount++;
    });

    this.documentList[docId] = wordsInDoc;
    this.totalWordCount += wordCount;
    this.numberOfDocs++;
    this.averageLength = this.totalWordCount / this.numberOfDocs;
  }

  /**
   *
   * @param {string} str
   * @returns {array}
   * Converts a string into an array of words
   */

  wordArray(str) {
    let regex = /[\W]+/;
    let words = str.split(regex);
    if (words[words.length - 1] === "") {
      words.pop();
    }
    return words;
  }

  /**
   *
   * @param {string} queryStr
   * @returns {null}
   * Implements query search and logs the documents which contain the query string, in order of relevance
   */
  search(queryStr) {
    let queryTerms = this.wordArray(queryStr);
    
    
    let documentsWithQuery = {};
    for (let docId in this.documentList) {
      let docScore = this.score(
        this.documentList[docId],
        queryTerms
      );
      if (docScore > 0) {
        documentsWithQuery[docId] = docScore;
      }
    }
    // sorting the documents:
    let sortedDocs = [];
    for (let docId in documentsWithQuery) {
      sortedDocs.push({id: docId, text: this.listOfDocIds[docId], score: documentsWithQuery[docId]});
    }
    sortedDocs.sort((a, b) => {
      return b.score - a.score;
    });
    return sortedDocs;
  }

  /**
   *
   * @param {string} doc
   * @param {array} queryTerms
   * @param {object} idf
   * @returns {integer}
   * Calculates the score of a given document, in context of a list of query terms
   */
  score(doc, queryTerms) {
    let docScore = 0;
    queryTerms.map((query) => {
      let termFrequency = 0;
      if (doc.hasOwnProperty(query)) {
        termFrequency = doc[query];
      }

      let wordsInDoc = Object.keys(doc).length;
      docScore +=
        (this.idf(query) * (termFrequency * (this.K + 1))) /
        (termFrequency +
          this.K * (1 - this.B + (this.B * wordsInDoc) / this.averageLength));
    });
    return docScore;
  }
  /**
   *
   * @param {array} queryTerms
   * @returns {object}
   * Given a list of query terms, returns an object with containing the inverse document frequency of each document
   */
  idf(query) {
    let documentCount = 0;
    documentCount = this.wordList[query] || 0;
    return Math.log(
      (this.totalWordCount - documentCount + 0.5) / (documentCount + 0.5) + 1
    );
  }
}

let newDocuments = new DocStore();
newDocuments.insert("Hey There. This is document 1");
newDocuments.insert("Hello! Document 2 says hi!");
newDocuments.insert("Hi, Document 3 reporting ot!");
newDocuments.insert("NOPE; polar bear");



function logAndSearch(store, queries){
  queries.map((query) => {
    console.log(`Query: ${query}`);
    console.log(store.search(query));
    console.log("____")
  })
}

logAndSearch(newDocuments, ["document there", "polar", "ot document", "fibonacci"])