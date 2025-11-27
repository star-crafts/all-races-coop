import * as SCParser from "./../../../tools/tool-parser/index.js";

SCParser.config.binaryFolder = 'C:\\Program Files (x86)\\StarCraft II\\TOOLS\\tool-parser\\binary'
SCParser.SCGame.directories.mods = `C:\\Program Files (x86)\\StarCraft II\\mods\\all-races-mods`

let mod = await SCParser.createMod({
    core: [
        '$mods/native/Core',
        '$mods/dependencies/Base',
        '$mods/bundles/VoidMultiBundle',
    ],
    mods: [
        '$mods/coop/ModCoop.SC2Mod'
    ]
})

mod.dependencies = [
    'bnet:Void (Mod)/0.0/999,file:Mods/all-races-mods/bundles/VoidMultiBundle.SC2Mod'
]

mod.setDocInfo({
    Name:`[ARC] Custom Factions Bundle`,
    DescLong: `Custom Factions Bundle`,
    DescShort: `1-16`
})

mod.write('./-coop-bundle.SC2Mod')
