import * as SCParser from "./../../../tools/tool-parser/index.js";
import fs from "fs";

SCParser.config.binaryFolder = 'C:\\Program Files (x86)\\StarCraft II\\TOOLS\\tool-parser\\binary'
SCParser.SCGame.directories.mods = `C:\\Program Files (x86)\\StarCraft II\\mods\\all-races-mods`

async function removeSounds(modName,output){

    let mod = await SCParser.createMod({
        core: [
            '$mods/native/Core',
            '$mods/bundles/VoidMultiBundle',
        ],
        mods: [
            '$mods/' + modName,
        ],
        catalogs: ["sound","actor"],
        scopes: ["data"]
    })
    let deleted = 0
    let actors2 = mod.catalogs.actor
    for(let actor of actors2) {
        if (actor.parent === "SMClickable" || actor.parent === "GenericUnitSM" || actor.id.startsWith("SM")) {
            actor.__deleted = true
            deleted++
        }
    }

    let actors = mod.catalogs.actor
        .filter(c => c.class === "CActorUnit" && !c.__core)
        .map(a => a.getResolvedData())

    mod.index()

    if(true){
        let readySounds = []
        for(let actor of actors){
            let soundTypes =  [
                "Yes",
                "Ready",
                "Help",
                "Board",
                "Birth",
                "Attack",
                "Click",
                "What",
                "Pissed",
                "DeathNormal",
                "DeathUnderConstruction",
                "DeathEviscerate",
                "DeathFire",
                "DeathDisintegrate",
                "DeathSilentkill",
                "DeathEat",
                "DeathSquish",
                "DeathTrainingComplete",
                "DeathTimeout",
                "DeathBlast",
                "DeathRemove",
                "DeathElectrocute",
                "DeathFreeze",
                "DeathImpact",
                "DeathMorph",
                "DeathUnlink",
                "DeathSalvage",
                "DeathCancel",
                "DeathTrainingCancel",
            ]

            let soundarrays = ["GroupSoundArray", "SoundArray"]
            function checkSound(sound){
                if (sound.$$references.filter(r => r.path).length === 0) {
                    // console.log(sound.id + " can be deleted!")
                    sound.__deleted = true
                    deleted++
                    for (let rtd of sound.__referencesToDelete) {
                        let _actor = mod.cache.actor[rtd.actor]
                        if (!_actor) {
                            continue;
                        }
                        if (!_actor[rtd.array]) {
                            _actor[rtd.array] = {}
                        }
                        _actor[rtd.array][rtd.sound] = ""
                    }
                }
            }
            for(let soundarray of soundarrays) {
                for (let soundType of soundTypes) {

                    if (actor[soundarray]?.[soundType]) {
                        let sound = mod.cache.sound[actor[soundarray][soundType]]


                        if (sound && !sound.__core) {
                            let ref = sound.$$references.find(r => r.path === "actor." + actor.id + "." + soundarray + "." + soundType)
                            if (ref) {
                                sound.$$references.splice(sound.$$references.indexOf(ref), 1)
                            }
                            if (!sound.__referencesToDelete) {
                                sound.__referencesToDelete = []
                            }
                            sound.__referencesToDelete.push({actor: actor.id, array: soundarray , sound: soundType})
                            checkSound(sound)
                        }

                    }
                }
            }
            if (actor.DeathArray) {
                for(let deathtype in actor.DeathArray){
                    if(actor.DeathArray[deathtype].SoundLink){
                        let sound = mod.cache.sound[actor.DeathArray[deathtype].SoundLink]

                        if (sound && !sound.__core) {
                            let ref = sound.$$references.find(r => r.path === "actor." + actor.id + ".DeathArray." + deathtype + ".SoundLink")
                            if (ref) {
                                sound.$$references.splice(sound.$$references.indexOf(ref), 1)
                            }
                            if (!sound.__referencesToDelete) {
                                sound.__referencesToDelete = []
                            }
                            sound.__referencesToDelete.push({actor: actor.id, array: "DeathArray" , sound: deathtype})
                            checkSound(sound)
                        }
                    }
                }
            }
        }
    }

    for(let sound of mod.catalogs.sound){

        if(sound.__deleted || sound.__core){
            continue
        }
        if(sound.parent==="SetPiece"){
            sound.__deleted = true
            deleted++
            continue
        }
        if( sound.id.startsWith("acAttack") ||
            sound.id.startsWith("acResponse") ||
            sound.id.includes("_Trade_") ||
            sound.id.startsWith("acCommander") ||
            sound.id.startsWith("acVictory") ||
            sound.id.startsWith("Jukebox") ||
            sound.id.startsWith("Event") ||
            sound.id.startsWith("acGeneric") ||
            sound.id.startsWith("acIntro")){
            sound.__deleted = true
            deleted++
            continue
        }
        if(!sound.$$references?.length){
            sound.__deleted = true
            deleted++
        }
    }


    console.log(deleted)

    let catalogXML = mod.catalogs.sound
        .filter(entity => !entity.__core && !entity.__deleted)
        .reduce((acc, entity) => acc + entity.getXML({...entity}), '')
        .replace(/<__token__ (.*)\/>/g,`<?token $1?>`)
    fs.writeFileSync(output + "/SoundData.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Catalog>\n${catalogXML}\n</Catalog>`)


    let catalogXML2 = mod.catalogs.actor
        .filter(entity => !entity.__core && !entity.__deleted)
        .reduce((acc, entity) => acc + entity.getXML({...entity}), '')
        .replace(/<__token__ (.*)\/>/g,`<?token $1?>`)
    fs.writeFileSync(output + "/ActorData.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Catalog>\n${catalogXML2}\n</Catalog>`)
}

removeSounds('coop/-coop-bundle.SC2Mod','./-coop-bundle.SC2Mod/Base.SC2Data/')