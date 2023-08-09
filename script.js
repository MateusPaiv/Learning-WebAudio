const audioContext = new AudioContext();

const buffer = audioContext.createBuffer(
    1, 
    audioContext.sampleRate * 3,
    audioContext.sampleRate

);

const channelData = buffer.getChannelData(0);


for(let i = 0;i < buffer.length; i++){
    channelData[i] = Math.random() * 2-1;
}

const whiteNoiseSource = audioContext.createBufferSource();

whiteNoiseSource.buffer = buffer;

const primaryGainControl = audioContext.createGain()
primaryGainControl.gain.setValueAtTime(0.05, 0);

whiteNoiseSource.connect(primaryGainControl);
primaryGainControl.connect(audioContext.destination)

function whiteNoise(){
    const whiteNoiseSource = audioContext.createBufferSource();
    whiteNoiseSource.buffer = buffer;
    whiteNoiseSource.connect(primaryGainControl);
    whiteNoiseSource.start();  
}


const snareFilter = audioContext.createBiquadFilter();
snareFilter.type = "highpass";
snareFilter.frequency.value = 1500;
snareFilter.connect(primaryGainControl);

function snare(){
    const whiteNoiseSource = audioContext.createBufferSource();
    whiteNoiseSource.buffer = buffer;


    const whiteNoiseGain = audioContext.createGain();

    whiteNoiseGain.gain.setValueAtTime(5, audioContext.currentTime);
    whiteNoiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    whiteNoiseSource.connect(whiteNoiseGain);
    whiteNoiseGain.connect(snareFilter);

    whiteNoiseSource.start();
    whiteNoiseSource.stop(audioContext.currentTime + 0.2);

    const snareOscilator = audioContext.createOscillator();
    snareOscilator.type ='triangle';
    snareOscilator.frequency.setValueAtTime(100,audioContext.currentTime)

    const oscilatorGain = audioContext.createGain();
    oscilatorGain.gain.setValueAtTime(1,audioContext.currentTime);
    oscilatorGain.gain.exponentialRampToValueAtTime(0.01,audioContext+0.1);

    snareOscilator.connect(oscilatorGain);
    oscilatorGain.connect(primaryGainControl);

    snareOscilator.start();
    snareOscilator.stop(audioContext.currentTime + 0.2)

    
}

function kick(){
    const kickOscilator = audioContext.createOscillator();
    kickOscilator.frequency.setValueAtTime(150,0);
    kickOscilator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);    

    const kickGain = audioContext.createGain();
    kickGain.gain.setValueAtTime(1,0);
    kickGain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime + 0,5);

    kickOscilator.connect(primaryGainControl);
    kickOscilator.start();
    kickOscilator.stop(audioContext.currentTime + 0.5)
}

const HIHAT_URL = "https://unpkg.com/@teropa/drumkit@1.1.0/src/assets/hatOpen2.mp3"

const hihatbutton = document.createElement('button');
hihatbutton.innerText = 'HiHat';
hihatbutton.addEventListener("click", async () => {
    const response = await fetch(HIHAT_URL)
    const soundBuffer = await response.arrayBuffer()
    const hihatBuffer = await audioContext.decodeAudioData(soundBuffer)
   
    const hiHatSource = audioContext.createBufferSource()
    hiHatSource.buffer = hihatBuffer;
    hiHatSource.playbackRate.setValueAtTime(0.8 ,0);
    hiHatSource.connect(primaryGainControl);
    hiHatSource.start();
})

document.body.appendChild(hihatbutton);

const notes = [
    {name : "C", frequency: 261.23},
    {name : "C#", frequency: 277.18},
    {name : "D", frequency: 293.66},
    {name : "D#", frequency: 311.13},
    {name : "E", frequency: 329.63},
    {name : "F", frequency: 349.23},
    {name : "F#", frequency: 369.99},
    {name : "G", frequency: 392.0},
    {name : "G#", frequency: 415.3},
    {name : "A", frequency: 440.0},
    {name : "A#", frequency: 466.16},
    {name : "B", frequency: 493.88},
    {name : "C", frequency: 523.25}
]


document.body.appendChild(document.createElement('br'));

notes.forEach(({name,frequency})=> {
    const noteButton = document.createElement('button')
    noteButton.innerText = name;
    noteButton.addEventListener("click", () =>{
        const noteOscilator = audioContext.createOscillator();
        noteOscilator.type = 'square';
        noteOscilator.frequency.setValueAtTime(frequency,audioContext.currentTime)

        const vibrato = audioContext.createOscillator()
        vibrato.frequency.setValueAtTime(10,0)
        const vibratoGain = audioContext.createGain();
        vibratoGain.gain.setValueAtTime(2,0)
        vibrato.connect(vibratoGain)
        vibratoGain.connect(noteOscilator.frequency)
        vibrato.start();
        
        const attackTime = 0.2;
        const decayTime = 0.3;
        const sustainLevel = 0.7;
        const releaseTime = 0.2;

        const now = audioContext.currentTime;

        const noteGain = audioContext.createGain();
        noteGain.gain.setValueAtTime(0,0);
        noteGain.gain.linearRampToValueAtTime(1,now + attackTime)
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime)
        noteGain.gain.setValueAtTime(sustainLevel, now + 1 - releaseTime)
        noteGain.gain.linearRampToValueAtTime(0,now+1   )
        
        noteOscilator.connect(noteGain);
        noteGain.connect(primaryGainControl)
        noteOscilator.start();
        noteOscilator.stop(audioContext.currentTime + 1);
    })
    document.body.appendChild(noteButton)
})
