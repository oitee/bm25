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
    this.wordCount = 0;

    /**
     * {integer} numberOfDocs
     * To store the total number of documents
     */
    this.docCount = 0;

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
    const words = this.extractWords(str);
    this.docIndex.set(id, { text: str, words: words });
    const seenWords = new Set();
    const wordsInDoc = new Map();

    words.forEach(word => {
      //Calculating inverse document frequency
      if (!seenWords.has(word)) {
        if (this.wordDocFreq.has(word)) {
          this.wordDocFreq.set(word, this.wordDocFreq.get(word) + 1);
        } else {
          this.wordDocFreq.set(word, 1);
        }
      }
      seenWords.add(word);

      // Calculating per-document term frequency
      if (wordsInDoc.has(word)) {
        wordsInDoc.set(word, wordsInDoc.get(word) + 1);
      } else {
        wordsInDoc.set(word, 1);
      }
    });

    this.documentTF.set(id, wordsInDoc);
    this.wordCount += words.length;
    this.docCount++;
  }

  /**
   *
   * @param {string} str
   * @returns {array}
   * Converts a string into an array of words
   */

  extractWords(str) {
    return str
      .toLocaleLowerCase()
      .split(/[\W]+/)
      .filter(word => word.length > 0);
  }

  /**
   *
   * @param {string} queryStr
   * @returns {null}
   * Implements query search and logs the documents which contain the query string, in order of relevance
   */
  async search(queryStr, limit = 10) {
    const queryTerms = this.extractWords(queryStr);

    const scoreDocs = await Promise.all(
      this.docIDs().map(async id => {
        let result = await this.score(id, queryTerms);
        result.text = this.docIndex.get(id).text.substring(0, 50) + "...";
        return result;
      })
    );
    return scoreDocs
      .filter(doc => doc.score > 0)
      .sort((a, b) => {
        return b.score - a.score;
      })
      .slice(0, limit);
  }

  /**
   *
   * @param {string} docWordFreq
   * @param {array} queryTerms
   * @param {object} idf
   * @returns {integer}
   * Calculates the score of a given document, in context of a list of query terms
   */
  async score(docId, queryTerms) {
    const wordFreq = this.documentTF.get(docId);

    const docScore = queryTerms.reduce((docScore, query) => {
      const termFrequency = wordFreq.get(query) || 0;
      const wordsInDoc = this.wordCountInDoc(docId);
      const avgLength = this.wordCount / this.docCount;

      docScore +=
        (this.idf(query) * (termFrequency * (K + 1))) /
        (termFrequency + K * (1 - B + (B * wordsInDoc) / avgLength));
      return docScore;
    }, 0);
    return { score: docScore, id: docId };
  }
  /**
   *
   * @param {array} queryTerms
   * @returns {object}
   * Given a list of query terms, returns an object with containing the inverse document frequency of each document
   */
  idf(queryTerm) {
    const documentCount = this.wordDocFreq.get(queryTerm) || 0;
    return Math.log(
      (this.wordCount - documentCount + 0.5) / (documentCount + 0.5) + 1
    );
  }

  docIDs() {
    return Array.from(this.docIndex.keys());
  }

  wordCountInDoc(id) {
    return this.docIndex.get(id).words.length;
  }
}
