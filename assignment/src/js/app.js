import audio from "./lib/audio.js"
(()=>{
    const app = {
        init:()=>{
            console.log("Booting app")
            audio.init()
        }
    }
    app.init()
})()