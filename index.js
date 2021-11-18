/**
 * {object{object}} documentList
 * To store, on a document level, the number of occurences of each word of every document.
 */
let documentList = {};

/**
 * {object{object}} wordList
 * To store, on a word level, the number of documents each word is present
 */
let wordList = {};

/**
 * {integer} idCounter
 * Counter to track id of each new document
 *
 */
let idCounter = 0;

/**
 * {integer} totalWordCount
 * To store the total number of words in all documents combined
 */
let totalWordCount = 0;

/**
 * {object} listOfDocIds
 * To store all document IDs and their respect documents, as key-value pairs
 */
let listOfDocIds = {};

/**
 * {integer} numberOfDocs
 * To store the total number of documents
 */
let numberOfDocs = 0;

/**
 * {integer} averageLength
 * To store the average length (in words) of all the documents
 */
let averageLength = totalWordCount / numberOfDocs;

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

/**
 *
 * @param {string} str
 * @returns {null}
 * Inserts a new document in the system
 */

function insert(str) {
  str = str.toLowerCase();
  idCounter++;
  let docId = idCounter;
  listOfDocIds[docId] = str;
  let words = wordArray(str);
  words.map((word) => {
    if (wordList.hasOwnProperty(word)) {
      wordList[word]++;
    } else {
      wordList[word] = 1;
    }
  });
  let listOfWordsInThisDoc = {};
  let wordCount = 0;
  words.map((word) => {
    if (listOfWordsInThisDoc.hasOwnProperty(word)) {
      listOfWordsInThisDoc[word]++;
    } else {
      listOfWordsInThisDoc[word] = 1;
    }
    wordCount++;
  });

  documentList[docId] = listOfWordsInThisDoc;
  totalWordCount += wordCount;
  numberOfDocs++;
  averageLength = totalWordCount / numberOfDocs;
}

/**
 *
 * @param {string} str
 * @returns {array}
 * Converts a string into an array of words
 */

function wordArray(str) {
  let strArr = [...str];
  let currentWord = "";
  let words = [];
  strArr.map((char) => {
    if (isAlphabetOrDigit(char)) {
      currentWord += char;
    } else {
      if (currentWord.length > 0) {
        words.push(currentWord);
        currentWord = "";
      }
    }
  });
  if (currentWord.length > 0) {
    words.push(currentWord);
  }
  return words;
}

/**
 *
 * @param {string} char
 * @returns {boolean}
 * Determines if a character is an alphabet/digit or not
 */
function isAlphabetOrDigit(char) {
  let currentCharCode = char.charCodeAt(0);
  if (
    currentCharCode >= "a".charCodeAt(0) &&
    currentCharCode <= "z".charCodeAt(0)
  ) {
    return true;
  }
  if (
    currentCharCode >= "A".charCodeAt(0) &&
    currentCharCode <= "Z".charCodeAt(0)
  ) {
    return true;
  }
  if (
    currentCharCode >= "0".charCodeAt(0) &&
    currentCharCode <= "9".charCodeAt(0)
  ) {
    return true;
  }
  return false;
}

/**
 *
 * @param {string} queryStr
 * @returns {null}
 * Implements query search and logs the documents which contain the query string, in order of relevance
 */
function search(queryStr) {
  let queryTerms = wordArray(queryStr);
  let idfObject = idf(queryTerms);
  let documentsWithQuery = {};
  for (let docId in documentList) {
    let docScore = score(documentList[docId], queryTerms, idfObject);
    if (docScore > 0) {
      documentsWithQuery[docId] = docScore;
    }
  }
  // sorting the documents:
  let sortedDocs = [];
  for (let docId in documentsWithQuery) {
    sortedDocs.push([docId, [documentsWithQuery[docId]]]);
  }
  sortedDocs.sort((a, b) => {
    return b[1][0] - a[1][0];
  });
  for (let i = 0; i < sortedDocs.length; i++) {
    let docId = sortedDocs[i][0];
    console.log(`${i + 1}. ${listOfDocIds[docId]}`);
  }
}

/**
 *
 * @param {string} doc
 * @param {array} queryTerms
 * @param {object} idf
 * @returns {integer}
 * Calculates the score of a given document, in context of a list of query terms
 */
function score(doc, queryTerms, idf) {
  let docScore = 0;
  queryTerms.map((query) => {
    let termFrequency = 0;
    if (doc.hasOwnProperty(query)) {
      termFrequency = doc[query];
    }

    let wordsInDoc = Object.keys(doc).length;
    docScore +=
      (idf[query] * (termFrequency * (K + 1))) /
      (termFrequency + K * (1 - B + (B * wordsInDoc) / averageLength));
  });
  return docScore;
}
/**
 *
 * @param {array} queryTerms
 * @returns {object}
 * Given a list of query terms, returns an object with containing the inverse document frequency of each document
 */
function idf(queryTerms) {
  let documentFrequency = {};
  queryTerms.map((query) => {
    let documentCount = 0;
    for (let docId in documentList) {
      if (documentList[docId].hasOwnProperty(query)) {
        documentCount++;
      }
    }
    documentFrequency[query] = Math.log(
      (totalWordCount - documentCount + 0.5) / (documentCount + 0.5) + 1
    );
    return;
  });
  return documentFrequency;
}

insert("Hey There. This is document 1");
insert("Hello! Document 2 says hi!");
insert("Hi, Document 3 reporting ot!");
insert("NOPE; polar bear");
// search("document there");
// search("polar");
search("ot document");
