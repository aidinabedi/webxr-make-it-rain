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
        //'antialias':  true,
        'alpha': false,
        //'preserveDrawingBuffer': false,
        //'preferWebGl2': true,
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
    let gl = (app.graphicsDevice as any).gl as WebGLRenderingContext;

    let baseLayer = new XRWebGLLayer(session, gl);
    session.updateRenderState({ baseLayer });

    session.requestReferenceSpace('local').then((refSpace) => {
        xrRefSpace = refSpace;
        session.requestAnimationFrame(onXRFrame);
    });

    app.autoRender = false;

    let renderTarget = new pc.RenderTarget({});
    app.scene.layers.getLayerById(pc.LAYERID_WORLD).renderTarget = renderTarget;

    xrRenderTarget = renderTarget as any;
    xrRenderTarget._glFrameBuffer = baseLayer.framebuffer;

    let camera = app.root.findComponent('camera') as pc.CameraComponent;
    camera.clearColorBuffer = false;
    camera.clearDepthBuffer = false;
    camera.clearStencilBuffer = false;
    camera.layers = [pc.LAYERID_WORLD];
    xrCameraNode = camera.node;
}

function onXRFrame(timestamp: number, frame: XRFrame) {
    let session = frame.session;
    let pose = frame.getViewerPose(xrRefSpace);

    let viewport = pose && session.renderState.baseLayer!.getViewport(pose.views[0]);
    console.log(timestamp, { frame, pose, viewport });

    if (pose) {
        let pos = pose.transform.position;
        let rot = pose.transform.orientation;
        xrCameraNode.setPosition(pos.x, pos.y, pos.z);
        xrCameraNode.setRotation(rot.x, rot.y, rot.z, rot.w);
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

function createXRButton() {
    let button = new WebXRButton({
        onRequestSession: onRequestSession,
        onEndSession: onEndSession,
        textEnterXRTitle: "START AR",
        textXRNotFoundTitle: "AR NOT FOUND",
        textExitXRTitle: "EXIT  AR",
    });

    if (navigator.xr) {
        // Checks to ensure that environment integration (AR) is available,
        // and only enables the button if so.
        navigator.xr.supportsSession('immersive-ar').then(() => {
            button.enabled = true;
        });
    }

    document.getElementById("ar-button")!.appendChild(button.domElement);
    return button;
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

let xrCameraNode: pc.GraphNode;
let xrRenderTarget: { _glFrameBuffer: WebGLFramebuffer, _colorBuffer?: XRViewport };
let xrRefSpace: XRReferenceSpace;
let xrButton = createXRButton();
