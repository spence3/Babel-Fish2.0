const socket = io('ws://localhost:8000') // Connect to server

//speech to text
const synth = window.speechSynthesis
let voices = []
synth.onvoiceschanged = function(){
  voices = synth.getVoices()
}

//speech to text variables
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
var text //text as global

var recognition = new SpeechRecognition()
recognition.continuous = false
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1


var diagnostic = document.querySelector('#stt')
var voiceButton = document.querySelector('#speech')
var sendButton = document.querySelector('#send')
var displayMessage = document.querySelector('#msgDisplay')

//"translation to" textbox
const tCheckbox = document.querySelector('input[type="checkbox"]')
var language = ''

//voice button click
voiceButton.onclick = function() {
  recognition.start()
  voiceButton.classList.remove('bg-white')
  voiceButton.classList.add('bg-blue-500')
  console.log('Listening for sentence.')
}

//voice to text in textbox
recognition.onresult = function(event) {
  text = event.results[0][0].transcript
  diagnostic.value += text + '.'
  console.log('Confidence: ' + event.results[0][0].confidence)
}


//stop recording when user stops talking
recognition.onspeechend = function() {
  voiceButton.classList.remove('bg-blue-500')
  voiceButton.classList.add('bg-white')
  recognition.stop()
}

//errors
recognition.onerror = function(event) {
  voiceButton.classList.remove('bg-blue-500')
  voiceButton.classList.add('bg-white')
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error
}




//text to speech function
function speakMessage(messageText, language){
  if (synth.speaking) {
    console.error("speechSynthesis.speaking")
    return
  }

  if (true) {
    //going to change this to whatever language it's translated into
    const utterThis = new SpeechSynthesisUtterance(messageText)
    

    //done talking
    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend")
    }

    //error with speech synthesis
    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror")
    }

    //voice = spanish or english
    const englishVoice = 'Aaron'
    const spanishVoice = 'Flo (Spanish (Mexico))'
    const voiceChoice = language === 'Spanish' ? 'Flo (Spanish (Mexico))' : 'Aaron'

    const findMyVoice = voices.find(voice => voice.name === voiceChoice)

    utterThis.voice = findMyVoice
    utterThis.pitch = 1
    utterThis.rate = 1

    synth.speak(utterThis)
  }
}

socket.on('message', message => {
  displayMessage.value += message + '\n'
  var messageText = message.split('\n')[1]
  speakMessage(messageText, language)
})

sendButton.onclick = function() {
  if(tCheckbox.checked){
    language = 'Spanish'
    console.log('checked Spanish')
  }
  else{
    language = 'English'
    console.log('checked English')
  }

  const messageInfo = {
    message: text,
    translate: language
  }
  socket.emit('message', messageInfo)
  diagnostic.value = ''

}
