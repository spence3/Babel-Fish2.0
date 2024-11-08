const socket = io('ws://localhost:8000') // Connect to server

//speech to text
const synth = window.speechSynthesis
const voices = synth.getVoices()//populate voices

//text to speech variables
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

//voice button click
voiceButton.onclick = function() {
  recognition.start()
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
  recognition.stop()
}

//errors
recognition.onerror = function(event) {
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error
}


//text to speech
function speakMessage(spanishText){
  if (synth.speaking) {
    console.error("speechSynthesis.speaking")
    return
  }

  if (true) {
    //going to change this to whatever language it's translated into
    const utterThis = new SpeechSynthesisUtterance(spanishText)
    

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
    const findMyVoice = voices.find(voice => voice.name === englishVoice)

    utterThis.voice = findMyVoice
    utterThis.pitch = 1
    utterThis.rate = 1

    synth.speak(utterThis)
  }
}

socket.on('message', message => {
  displayMessage.value += message + '\n'
  var spanishText = message.split('\n')[1]
  speakMessage(spanishText)
})

sendButton.onclick = function() {
  // var translateDisplay = displayMessage.value += text + '\n'
  const send = text
  socket.emit('message', send)
  diagnostic.value = '' // Clear the input after sending

}
