import audio from "./lib/audio.js"
(()=>{
    const app = {
        init:()=>{
            console.log("Booting app")
            try{
                audio.init()
            } catch{
                console.log("modules not supported")
            }
        }
    }
    app.init()
})()