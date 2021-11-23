/**
 * {integer} K
 * Free parameter for BM25 algorithm
 */
const K = 1.5;

/**
 * {integer} B
 * Free parameter for BM25 algorithm
 */
const B = 0.75;

export default class Store {
  constructor() {
    /**
     * {object{object}} documentList
     * To store, on a document level, the number of occurences of each word of every document.
     */
    this.documentTF = new Map();

    /**
     * {object{object}} wordList
     * To store, on a word level, the number of documents each word is present
     */
    this.wordDocFreq = new Map();

    /**
     * {integer} totalWordCount
     * To store the total number of words in all documents combined, required for calculating average length of documents in words
     */
    this.totalWordCount = 0;

    /**
     * {integer} numberOfDocs
     * To store the total number of documents
     */
    this.numberOfDocs = 0;

    /**
     * {integer} averageLength
     * To store the average length (in words) of all the documents
     */
    this.averageLength = 0;

    /**
     * {object} listOfDocIds
     * To store all document IDs and their respect documents, as key-value pairs
     */
    this.docIndex = new Map();
  }
  /**
   *
   * @param {string} str
   * @returns {null}
   * Inserts a new document in the system
   */

  async insert(id, str) {
    str = str.toLowerCase();

    this.docIndex.set(id, str);
    let words = this.wordArray(str);
    words.map((word) => {
      // todo: Remove duplicate words within a document; alt, use set to [or remove duplicates]
      if (this.wordDocFreq.has(word)) {
        this.wordDocFreq.set(word, this.wordDocFreq.get(word) + 1);
      } else {
        this.wordDocFreq.set(word, 1);
      }
    });
    let wordsInDoc = new Map();
    let wordCount = 0;
    words.map((word) => {
      if (wordsInDoc.has(word)) {
        wordsInDoc.set(word, wordsInDoc.get(word) + 1);
      } else {
        wordsInDoc.set(word, 1);
      }
      wordCount++;
    });

    this.documentTF.set(id, wordsInDoc);
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
    return str.split(/[\W]+/).filter((word) => word.length > 0);
  }

  /**
   *
   * @param {string} queryStr
   * @returns {null}
   * Implements query search and logs the documents which contain the query string, in order of relevance
   */
  async search(queryStr, limit = 10) {
    const queryTerms = this.wordArray(queryStr);

    const scoreDocs = await Promise.all(
      Array.from(this.docIndex.keys()).map(async (id) => {
        let result = await this.score(id, this.documentTF.get(id), queryTerms);
        result.text = this.docIndex.get(id).substring(0, 50) + "...";
        return result;
      })
    );
    return scoreDocs
      .filter((doc) => doc.score > 0)
      .sort((a, b) => {
        return b.score - a.score;
      })
      .slice(0, limit);
  }

  /**
   *
   * @param {string} doc
   * @param {array} queryTerms
   * @param {object} idf
   * @returns {integer}
   * Calculates the score of a given document, in context of a list of query terms
   */
  async score(docId, doc, queryTerms) {
    let docScore = 0;
    queryTerms.map((query) => {
      let termFrequency = 0;
      if (doc.has(query)) {
        termFrequency = doc.get(query);
      }

      let wordsInDoc = doc.size;
      docScore +=
        (this.idf(query) * (termFrequency * (K + 1))) /
        (termFrequency + K * (1 - B + (B * wordsInDoc) / this.averageLength));
    });
    return { score: docScore, id: docId };
  }
  /**
   *
   * @param {array} queryTerms
   * @returns {object}
   * Given a list of query terms, returns an object with containing the inverse document frequency of each document
   */
  idf(query) {
    let documentCount = 0;
    documentCount = this.wordDocFreq.get(query) || 0;
    return Math.log(
      (this.totalWordCount - documentCount + 0.5) / (documentCount + 0.5) + 1
    );
  }
}
