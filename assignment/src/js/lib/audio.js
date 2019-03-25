let
    audioClips = []

const audio = {
    init:()=>{
        console.log("Booting audio")
        let bpm = document.querySelector("input[type='number']").value
        // audio.visualizer()
        audio.controller()
        audio.userMic(bpm)
    },
    visualizer:()=>{
        console.log("Booting audio visualizer")
        if("AudioContext" in window || "webkitAudioContext" in window){
            let
                ctx           = new (window.AudioContext || window.webkitAudioContext)(),
                audioEl       = document.querySelector("#audio-element"),
                audioSrc      = ctx.createMediaElementSource(audioEl),
                analyser      = ctx.createAnalyser(),
                frequencyData = new Uint8Array(analyser.frequencyBinCount),
                canvas        = document.getElementById("canvas"),
                canvasCtx     = canvas.getContext('2d')
            
            audioSrc.connect(analyser)
            audioSrc.connect(ctx.destination)

            //TODO: create bars (CSS polygons?)

            let renderFrame = ()=>{
                let err = true     
                if(err){
                    try {
                        let newFrame = canvasCtx.createImageData(32,8)
                        requestAnimationFrame(renderFrame)
                        analyser.getByteFrequencyData(frequencyData)
                        for (let i = 0; i < newFrame.data.length; i++) {
                            // if(i%4 != 3) {
                            //     newFrame.data[i] = 255
                            // }else{
                            //     newFrame.data[i] = frequencyData[i]
                            // }  
                            newFrame.data[i] = frequencyData[i]
                        }
                        canvasCtx.putImageData(newFrame,0,0)

                    } catch (error) {
                        err = false
                        console.log(error)
                    }
                }else{
                    console.log("Analyser got Botched")
                }
            }

            renderFrame(analyser.frequencyData)
            audioEl.play()

        }else{
            console.log("Audio CTX not Supported")
            document.body.innerHTML += `Audio Visualiation is not supported`
        }
    },
    userMic:(bpm)=>{
        navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
            const 
                mic = new MediaRecorder(stream)
            
            mic.start()
            console.log(mic)
            const 
                audioChunks = []

            mic.addEventListener("dataavailable",(e)=>{
                audioChunks.push(e.data)
                console.log(audioChunks)
            })
            mic.addEventListener("stop",(e)=>{
                let 
                    audioBlob = new Blob(audioChunks),
                    audioUrl  = URL.createObjectURL(audioBlob),
                    audioClip = new Audio(audioUrl),
                    audioEl   = document.querySelector("#audio-element")
                    
                audioEl.src = audioUrl
                audio.visualizer()
                audioClips.push(audioClip)
            })
            setTimeout(() => {
                mic.stop()
            }, (1/bpm*60)*4000)

        })
    },
    controller:()=>{

    }
}
export default audio
