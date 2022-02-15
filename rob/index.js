const fs = require('fs')
try {
    const guesses = ['badge','','','','','']
    const hardMode = false
    const useAnswers = false
    const showWhen = true
    const showWhenIsDate = true
    const showScores = true
    const showFrequencies = false
    const showNumPossible = true
    
    const yellow = '\x1b[1m\x1b[43m\x1b[30m '
    const green = '\x1b[1m\x1b[42m\x1b[30m '
    const resetColour = ' \x1b[0m'
    const wordleNumber = Math.round((new Date().setHours(0) - new Date(2021, 5, 19)) / 864e5)   
    const wordleAnswers = fs.readFileSync('wordleorderednew.txt', 'UTF-8').split(/\r?\n/)
    let validWords = fs.readFileSync('wordle.txt', 'UTF-8').split(/\r?\n/)
    const wordleAnswer = wordleAnswers[wordleNumber]
    let regexpArr = Array(wordleAnswer.length).fill('.')
    let [includes,excludes,colouredString] = ['','','']
    
    for(let guess of guesses){
      if(
          guess!=='' && 
          validWords.includes(guess) && 
          (!hardMode || 
            (includes.split('').every(include=>guess.includes(include)) && 
            excludes.split('').every(exclude=>!guess.includes(exclude)) && 
            guess.match(regexpArr.join(''))))){
              colouredString+='\r\n'
              for(i=0; i<wordleAnswer.length; i++){
                if(guess[i] === wordleAnswer[i]){
                  regexpArr[i] = guess[i]
                  colouredString += green + guess[i] + resetColour
                }
                else if(wordleAnswer.includes(guess[i])){
                  includes += guess[i]
                  colouredString += yellow + guess[i] + resetColour
                  if (regexpArr[i]==='.')
                    regexpArr[i]='[^]' 
                  if(regexpArr[i][0]==='['){
                    regexpArr[i]=[regexpArr[i].slice(0, regexpArr[i].length-1), guess[i], ']'].join('')
                  }
                }
                else{
                  excludes+=guess[i]
                  colouredString += ' '+guess[i]+' '
                }
              }
            }
    }
    
    validWords = (useAnswers? wordleAnswers : validWords)
        .filter(word => includes.toLowerCase().split('').every(letter => word.includes(letter)))
        .filter(word => excludes.toLowerCase().split('').every(letter => !word.includes(letter)))
        .filter(word => word.match(regexpArr.join('').toLowerCase()))
    
    const letterFrequencies = []
    for(position = 0; position < wordleAnswer.length; position++){
        if(!Array.isArray(letterFrequencies[position])) letterFrequencies[position] = []
        validWords.map(word=>{
            letterFrequencies[position][word[position]] ? 
            letterFrequencies[position][word[position]]++ :
            letterFrequencies[position][word[position]] = 1
        })
        letterFrequencies[position] = Object.fromEntries(
            Object.entries(letterFrequencies[position]).sort(([,a],[,b]) => b-a)
        )
    }
    
    let wordScores=[]
    validWords.map(word => {
        wordScores[word] = 0
        for(position = 0; position<word.length; position++)
        wordScores[word] += letterFrequencies[position][word[position]]
    })
    wordScores=Object.entries(wordScores).sort(([,a],[,b]) => b-a)
    
    if(showWhen){
      const whenIsWordleNumber = Object.keys(wordleAnswers).find(key => wordleAnswers[key] === guesses[0])
      let whenIsDate = new Date(2021, 5, 19)
      if(whenIsWordleNumber > 0){
        whenIsDate.setMilliseconds(whenIsDate.getMilliseconds() + whenIsWordleNumber * 864e5);
        console.log(`${guesses[0]} is a wordle`)
        if(showWhenIsDate) console.log(`${whenIsWordleNumber} on ${whenIsDate.toDateString()}`)
      }
      else{
        console.log(`The word ${guesses[0]} is never going to be a wordle word`)
      }
    }
    console.log(`Today's Wordle is number ${wordleNumber}`) 
    console.log(colouredString)
    if(showScores) console.log(wordScores)
    if(showFrequencies) console.log(letterFrequencies)
    if(showNumPossible) console.log(`${validWords.length} possible words remaining`)
} catch (err) {
    console.error(err)
}