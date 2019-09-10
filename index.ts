import * as pc from "playcanvas";

// give game scripts access to playcanvas namespace
(window as any).pc = pc;

const options = {
    ASSET_PREFIX: "",
    SCRIPT_PREFIX: "",
    SCENE_PATH: "802005.json",
    CONTEXT_OPTIONS: {
        'antialias': true,
        'alpha': true,
        'preserveDrawingBuffer': false,
        'preferWebGl2': true
    },
    SCRIPTS: [  ],
    CONFIG_FILENAME: "config.json",
    INPUT_SETTINGS: {
        useKeyboard: true,
        useMouse: true,
        useGamepads: false,
        useTouch: true
    },
    PRELOAD_MODULES: [
    ],
}

import {startApplication} from "./__start__";
startApplication(options);

import {createLoadingScreen} from "./__loading__";
pc.script.createLoadingScreen(app => createLoadingScreen(app, options));
