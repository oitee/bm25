# bm25

Here, I am implementing the BM25 algorithm to retrieve most relevant items out of a set of strings, given a search query. This is the first part of implementing a bare-bones version of [ElasticSearch](https://www.elastic.co/what-is/elasticsearch) which also uses the [BM25 algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) internally.

Before getting into the implementation, following is a quick run down of the algorithm itself.

1. **Documents** are strings, containing words (including repeating words).
2. New documents can be inserted in the store, given a corresponding ID.
3. Documents can be searched using a query string containing one or more words.
4. The search function returns the **most relevant documents first**.
5. Relevance is defined by BM25 to be composed of two factors: **term frequency** and **inverse document frequency**
6. Term frequency is the **number of times a word appears in a document**. For example, if the word 'Clojure' appears 10 times in one document and 2 times in another document, and the query includes the word 'Clojure', the first document will be more relevant.
7. Inverse document frequency **reduces the impact of commonly occuring words**. For example, most documents will contain words like 'this' and 'that'; but few documents will contain the word 'Clojure'. Document frequency tracks the number of documents in which a word appears. So, if the query term contains 'this Clojure', the contribution of the word 'this' to the final score will be less than the word 'Clojure' because, inverse document frequency is defined as 1 / document frequency.

More mathamatically, the scoring function which decides how relevant a document is, given a query, is defined as follows:

<img src="https://otee.dev/assets/images/bm25_formula.png" alt="BM25 Equation" border="1px" width="100%"/>

## Running

To run this, use:

```
npm start
```

This will take a few seconds to run, because we are storing around 50K movie plots! Following is a sample run:

```
Wed Nov 24 2021 12:25:09 GMT+0530 (India Standard Time): Inserting documents into Store...

Wed Nov 24 2021 12:25:19 GMT+0530 (India Standard Time): Inserted 43878 documents into Store...

Wed Nov 24 2021 12:25:20 GMT+0530 (India Standard Time): Search Results for: Al Pacino
┌─────────┬────────────────────┬───────────────────────────────┬─────────────────────────────────────────────────────────┐
│ (index) │       score        │              id               │                          text                           │
├─────────┼────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────────────┤
│    0    │ 41.831449389639545 │     '1602075_Revolution'      │ 'The film stars Al Pacino as a New York fur trapper...' │
│    1    │ 40.47173964629228  │    '28014683_Jack___Jill'     │ 'The film opens with homemade videos of Jack and Ji...' │
│    2    │ 29.45107011565092  │   '6199357_Kiss_Me__Guido'    │ 'Frankie  is a young Italian American man living wi...' │
│    3    │ 23.894616346443655 │      '8749884_Onionhead'      │ 'In the spring of 1941, Al Woods quits an Oklahoma ...' │
│    4    │ 23.856335762319592 │     '6594677_Mojave_Moon'     │ 'Al McCord is hanging out at his favourite restaura...' │
│    5    │ 23.63329421913485  │     '2981197_Down_to_You'     │ 'Sophomore Al Connelly  meets the girl of his dream...' │
│    6    │ 23.577988988540447 │        '73427_Detour'         │ ' Piano player Al  is bitter about having to work i...' │
│    7    │ 23.12132228667727  │      '6181075_Waxworks'       │ 'A young nameless poet  enters a wax museum where t...' │
│    8    │ 23.10689922826007  │    '2861645_Smash_Palace'     │ 'The film centres around a car wrecking yard known ...' │
│    9    │ 22.910448847565785 │ '18515925_Go_Into_Your_Dance' │ 'Broadway star Al Howard’s  business is slow, and n...' │
└─────────┴────────────────────┴───────────────────────────────┴─────────────────────────────────────────────────────────┘

Wed Nov 24 2021 12:25:20 GMT+0530 (India Standard Time): Search Results for: Robert De niro
┌─────────┬────────────────────┬─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┐
│ (index) │       score        │                     id                      │                           text                           │
├─────────┼────────────────────┼─────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│    0    │ 56.53901562965471  │          'tt0106489_A_Bronx_Tale'           │ 'This first appeared on www.realmoviereview.com\nRob...' │
│    1    │ 39.82621884905853  │          '6199357_Kiss_Me__Guido'           │ 'Frankie  is a young Italian American man living wi...'  │
│    2    │ 39.286809367395705 │ '27137136_Bhargavacharitham_Moonam_Khandam' │ 'The plot is inspired from Harold Ramis directed cl...'  │
│    3    │ 38.19470595848078  │            '35003577_El_Madina'             │ 'In the center of El-Madina lives Ali, a young man ...'  │
│    4    │ 32.65689038246984  │      '9271078_Adventures_of_Don_Juan'       │ '{{Cleanup-rewrite}} Late in the reign of Elizabeth...'  │
│    5    │ 32.22850476024959  │            '27250998_Anonymous'             │ 'After a monologue delivered by Derek Jacobi, the f...'  │
│    6    │ 31.52509666858584  │             '28126186_Man_ges'              │ 'Robert , a riding school owner, and his wife Dora ...'  │
│    7    │ 30.538169454158314 │        '17016522_Beyond_the_Limits'         │ 'The young reporter interviewed the gravedigger Viv...'  │
│    8    │ 29.07121029834167  │        '26174601_Holiday_for_Lovers'        │ 'Robert Dean is an old-fashioned psychologist who r...'  │
│    9    │ 29.03074330516624  │       '202133_The_Rules_of_the_Game'        │ 'The film begins with the aviator André Jurieux lan...'  │
└─────────┴────────────────────┴─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘

Wed Nov 24 2021 12:25:20 GMT+0530 (India Standard Time): Search Results for: Ship iceberg atlantic
┌─────────┬────────────────────┬───────────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ (index) │       score        │                  id                   │                          text                           │
├─────────┼────────────────────┼───────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│    0    │ 57.63922588952189  │          '8522084_Atlantic'           │ 'Atlantic is a drama film based on the RMS Titanic ...' │
│    1    │ 47.37485412734705  │         '27405104_Titanic_II'         │ 'On April 14, 2012, 100 years after the sinking of ...' │
│    2    │ 38.144416845265354 │        '1401912_The_Cruel_Sea'        │ 'The film begins with a voice-over by Ericson ; Thi...' │
│    3    │ 35.83420955617304  │     '6524086_A_Night_to_Remember'     │ 'The Titanic was the largest vessel afloat, and was...' │
│    4    │ 34.998276611540334 │ '29609480_Ice_Age__Continental_Drift' │ ' Manny becomes over-protective about his teenage d...' │
│    5    │ 33.46752402767911  │        '9049407_Souls_at_Sea'         │ 'The story is based on two distinct early 19th-cent...' │
│    6    │ 31.67929528450068  │         '2704622_Juggernaut'          │ 'A cruise liner, the SS Britannic, is in the middle...' │
│    7    │ 31.38865945255477  │     '23126212_Raise_The_Titanic'      │ 'A group of Americans, none of whom have any experi...' │
│    8    │ 31.14678026858718  │           '1203778_Titanic'           │ 'Mrs Julia Sturges , who is at the time estranged f...' │
│    9    │ 30.292725820378664 │     '7816124_Plymouth_Adventure'      │ 'The film tells a fictionalized version of the Pilg...' │
└─────────┴────────────────────┴───────────────────────────────────────┴─────────────────────────────────────────────────────────┘

Wed Nov 24 2021 12:25:20 GMT+0530 (India Standard Time): Search Results for: fibonacci
┌─────────┬────────────────────┬────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ (index) │       score        │               id               │                          text                           │
├─────────┼────────────────────┼────────────────────────────────┼─────────────────────────────────────────────────────────┤
│    0    │ 9.907194303433139  │          '458573_Pi'           │ `Maximillian "Max" Cohen , the story's protagonist ...` │
│    1    │  9.60662864244158  │ 'tt0382625_The_Da_Vinci_Code'  │ 'A man revealed to be Jacques Saunière is being pur...' │
│    2    │ 7.533755479434348  │         'tt0138704_Pi'         │ 'The film is about a mathematical genius, Maximilia...' │
│    3    │ 7.287660080674373  │  '1908238_The_Da_Vinci_Code'   │ ' In Paris, Jacques Saunière is pursued through the...' │
│    4    │ 3.3281014938208844 │ 'tt1937390_Nymphomaniac_Vol_I' │ 'The film starts with a repetitive sound effect in ...' │
└─────────┴────────────────────┴────────────────────────────────┴─────────────────────────────────────────────────────────┘

```
