(()=>{
    const app = {
        init:function(){
            console.log("Booting app")
            if("AudioContext" in window){
                document.getElementById("trackList").remove()
                document.getElementById("beatbox").innerHTML =
                `<div id="app">
                    <canvas height="8" width="32" id="canvas"></canvas>
                </div>
                <audio src="" id="audio-element" controls loop></audio>
                <div id="controls"></div>
                <div id="keypad"></div>
                <input type="number" id="bpm" value="90">
                <span>All Meassures are in 4/4</span>
                <input type="number" id="measure" value="1">
                <a href="tracks.html>Use a preset</a>`
                audio.init()
            }else{
                console.log("Audio Api is not supported")
            }
        }
    }

    let
        audioClips = [],
        audioCtxCreated = false

    const audio = {
        init:function(){
            console.log("Booting audio")
            let bpm = document.querySelector("input[type='number']").value
            audio.controller()
        },
        visualizer:function(){
            if("AudioContext" in window || "webkitAudioContext" in window){
                console.log("Booting audio visualizer")
                let
                    ctx           = new (window.AudioContext || window.webkitAudioContext)(),
                    audioEl       = document.querySelector("#audio-element"),
                    audioSrc      = ctx.createMediaElementSource(audioEl),
                    analyser      = ctx.createAnalyser(),
                    frequencyData = new Uint8Array(analyser.frequencyBinCount),
                    canvas        = document.getElementById("canvas"),
                    canvasCtx     = canvas.getContext('2d')
                
                audioCtxCreated = true
                                
                audioSrc.connect(analyser)
                audioSrc.connect(ctx.destination)

                //TODO: create bars (CSS polygons?)

                let renderFrame = function(){
                    let err = true     
                    if(err){
                        try {
                            let newFrame = canvasCtx.createImageData(32,8)
                            requestAnimationFrame(renderFrame)
                            analyser.getByteFrequencyData(frequencyData)
                            for (let i = 0; i < newFrame.data.length; i++) {
                                if(i%4 != 3) {
                                    newFrame.data[i] = 255
                                }else{
                                    newFrame.data[i] = frequencyData[i]
                                }  
                                // newFrame.data[i] = frequencyData[i]
                            }
                            canvasCtx.putImageData(newFrame,0,0)

                        } catch (error) {
                            err = false
                            console.log(error)
                        }
                    }else{
                        console.log("Analyser is not Supported")
                    }
                }

                renderFrame(analyser.frequencyData)
                audioEl.play()

            }else{
                console.log("Audio CTX not Supported")
                document.body.innerHTML += `Audio Visualiation is not supported`
            }
        },
        userMic:function(bpm,measure){
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
                    audioClips.push(audioClip)
                    if(audioCtxCreated == false){
                        audio.visualizer()
                    }else{
                        audioEl.play()
                    }
                    audio.pad()

                })
                setTimeout(() => {
                    mic.stop()
                }, (1/bpm*60)*4000*measure)

            })
        },
        controller:function(){
            const recorder = document.createElement("button")

            recorder.innerText = "Record"
        
            recorder.addEventListener("click",function(){
                try{
                    audio.userMic(document.querySelector("#bpm").value,document.querySelector("#measure").value)
                } catch(err){
                    console.log(err)
                }
            })

            document.getElementById("controls").appendChild(recorder)
        },
        pad: function(){
            document.querySelector("#keypad").innerHTML = ""
            audioClips.forEach(function(clip,index){
                let
                    padCont = document.querySelector("#keypad"),
                    newKey = document.createElement("button")

                clip.setAttribute("loop","true")
                
                newKey.innerHTML = `Clip ${index + 1}`
                newKey.append(clip)
                
                newKey.addEventListener("click",function(){
                    let
                        audio = this.querySelector("audio")
                    if(!this.classList.contains("playing")){
                        audio.play()
                        this.classList.add("playing")
                        console.log("playing")
                    }else{
                        audio.pause()
                        audio.currentTime = 0
                        this.classList.remove("playing")
                        console.log("pausing")
                    }
                })

                padCont.appendChild(newKey)
            })
        }
    }
    app.init()
})()