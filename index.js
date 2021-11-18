let documentList = {};
let wordList = {};
let idCounter = 0;
let totalWordCount = 0;
let listOfDocIds = {};
let numberOfDocs = 0;
let averageLength = totalWordCount / numberOfDocs;
const K = 1.5;
const B = 0.75;

let aver;
//constants

/**
 
 IDF = log ((N - n(qi) + 0.5)/ (n(qi) + 0.5) + 1)
 Math.log(n);

 For each query term:
 score = (IDF) * (f(qi, doc) * (k + 1)) / ( f(qi, doc) + k + (1 - b + (b * |D| / averLength)))


 }

 * 
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
  if(currentWord.length > 0){
    words.push(currentWord);
  }
  return words;
}

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

function search(queryStr) {
  let queryTerms = wordArray(queryStr);
  //console.log(queryTerms)
  let idfObject = idf(queryTerms);
  let documentsWithQuery = {};
  for (let docId in documentList) {
    //console.log({docId});
    // console.log(documentList[docId]);
    let docScore = score(documentList[docId], queryTerms, idfObject);
    // console.log({docScore})
    if (docScore > 0) {
      documentsWithQuery[docId] = docScore;
    }
  }
  console.log(documentsWithQuery);
}

function score(doc, queryTerms, idf) {
  let docScore = 0;
  // console.log({doc});
   //console.log({idf})
  queryTerms.map((query) => {
    let termFrequency = 0;
    // console.log({doc});
    // console.log({query})
    // console.log(doc.hasOwnProperty(query));
    // console.log(`-----------`)
    
    if (doc.hasOwnProperty(query)) {
      termFrequency = doc[query];
    }
    
    let wordsInDoc = Object.keys(doc).length;
    // console.log({wordsInDoc});
    // console.log({termFrequency});
    // console.log(`idf [query] ${idf[query]}`);
    // console.log({K});
    // console.log({B});
    // console.log({wordsInDoc});
    // console.log({averageLength});
    docScore +=
      (idf[query] * (termFrequency * (K + 1))) /
      (termFrequency + K * (1 - B + (B * wordsInDoc) / averageLength));
      // console.log({docScore})
  });
  return docScore;
}

function idf(queryTerms) {
  let documentFrequency = {};
  // console.log(queryTerms)
  queryTerms.map((query) => {
    // console.log({query})
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
insert("Hi, Document 3 reporting!");
insert("NOPE; polar bear");
//console.log({ listOfDocIds });
// console.log({ wordList });
//console.log(documentList);
search("document there");
search("polar");