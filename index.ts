/// <reference path="webxr.d.ts" />

import * as pc from "playcanvas";
import {startApplication} from "./__start__";
import {createLoadingScreen} from "./__loading__";
import {WebXRButton} from "./webxr-button";

// give game scripts access to playcanvas namespace
(window as any).pc = pc;

const options = {
    ASSET_PREFIX: "",
    SCRIPT_PREFIX: "",
    SCENE_PATH: "802005.json",
    CONTEXT_OPTIONS: {
        'antialias':  true,
        'alpha': false,
        'preserveDrawingBuffer': false,
        'preferWebGl2': true,
        'xrCompatible': true
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

let app = startApplication(options)!;
pc.script.createLoadingScreen(app => createLoadingScreen(app, options));

function onSessionStarted(session: XRSession) {
    session.addEventListener('end', onSessionEnded);

    let gl = (app.graphicsDevice as any).gl as WebGLRenderingContext;
    let baseLayer = new XRWebGLLayer(session, gl);
    session.updateRenderState({ baseLayer });

    let renderTarget = new pc.RenderTarget({});
    app.scene.layers.getLayerById(pc.LAYERID_WORLD).renderTarget = renderTarget;

    xrRenderTarget = renderTarget as any;
    xrRenderTarget._glFrameBuffer = baseLayer.framebuffer;

    xrCameraEntity = app.root.findOne(node => 'camera' in node) as pc.Entity;
    session.requestReferenceSpace('local').then(refSpace => xrLocalRefSpace = refSpace);

    app.autoRender = false;
    session.requestAnimationFrame(onXRFrame);

    session.addEventListener('selectstart', onTouchStart);
    session.addEventListener('selectend', onTouchEnd);
}

function onXRFrame(timestamp: number, frame: XRFrame) {
    let session = frame.session;

    let cameraPose = xrLocalRefSpace && frame.getViewerPose(xrLocalRefSpace);

    if (cameraPose) {
        let pos = cameraPose.transform.position;
        let rot = cameraPose.transform.orientation;
        xrCameraEntity.setPosition(pos.x, pos.y, pos.z);
        xrCameraEntity.setRotation(rot.x, rot.y, rot.z, rot.w);

        let viewport = session.renderState.baseLayer!.getViewport(cameraPose.views[0]);
        xrRenderTarget._colorBuffer = viewport;
        app.render();
    }

    session.requestAnimationFrame(onXRFrame);
}

function onEndSession(session) {
    session.end();
}

function onSessionEnded(event) {
    xrButton.setSession(null);
}

function initXR() {
    xrButton = new WebXRButton({
        onRequestSession: onRequestSession,
        onEndSession: onEndSession,
        textEnterXRTitle: "START AR",
        textXRNotFoundTitle: "AR NOT FOUND",
        textExitXRTitle: "EXIT  AR",
    });

    if (navigator.xr) {
        // Checks to ensure that environment integration (AR) is available,
        // and only enables the button if so.
        navigator.xr.isSessionSupported('immersive-ar').then(() => {
            xrButton.enabled = true;
        });
    }

    document.getElementById('ar-button')!.appendChild(xrButton.domElement);

    let touch = app.touch as any;
    touch.on(pc.EVENT_TOUCHSTART, onTouchStart);
    touch.on(pc.EVENT_TOUCHEND, onTouchEnd);
}

function onRequestSession() {
    // Requests an inline (non-immersive) session with environment integration
    // to get AR via video passthrough.

    // Even though this is a non-immersive session, the fact that it's
    // using environment integration means it must be requested in a user
    // activation event so that appropriate permissions can be granted.
    // This will likely prompt the user to allow camera use, so the promise
    // may remain outstanding for a while.
    navigator.xr!.requestSession('immersive-ar')
        .then((session) => {
            xrButton.setSession(session);
            onSessionStarted(session);
        });
}

function onTouchStart() {
    let entity = app.root.findOne(node => node.name === 'MakeItRain') as pc.Entity;
    entity.enabled = true;
}

function onTouchEnd() {
    let entity = app.root.findOne(node => node.name === 'MakeItRain') as pc.Entity;
    entity.enabled = false;
}

let xrCameraEntity: pc.Entity;
let xrRenderTarget: { _glFrameBuffer: WebGLFramebuffer, _colorBuffer?: XRViewport };
let xrLocalRefSpace: XRReferenceSpace;
let xrButton: WebXRButton;

(app as any).on("start", initXR);
