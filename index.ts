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

    if ("updateWorldTrackingState" in session) {
        (session as any).updateWorldTrackingState({
            planeDetectionState : {
                enabled : true
            }
        });
    }

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
        let cameraTransform = cameraPose.transform;

        let pos = cameraTransform.position;
        let rot = cameraTransform.orientation;
        xrCameraEntity.setPosition(pos.x, pos.y, pos.z);
        xrCameraEntity.setRotation(rot.x, rot.y, rot.z, rot.w);

        let viewport = session.renderState.baseLayer!.getViewport(cameraPose.views[0]);
        xrRenderTarget._colorBuffer = viewport;

        renderPlanes(frame);
        app.render();
    }

    session.requestAnimationFrame(onXRFrame);
}

function renderPlanes(frame: XRFrame) {
    if ("worldInformation" in frame) {
        let worldInformation = (frame as any).worldInformation;

        if ("detectedPlanes" in worldInformation) {
            let detectedPlanes = worldInformation.detectedPlanes;

            let floorY = Number.POSITIVE_INFINITY;
            for (let plane of detectedPlanes) {

                let planeTransform = (frame as XRFrame).getPose(plane.planeSpace, xrLocalRefSpace)!.transform;
                let planeVertices = plane.polygon as pc.Vec3[];

                console.log("plane:", plane);
                renderPlane(planeVertices, planeTransform);

                let planeY = planeTransform.position.y;
                if (floorY > planeY) floorY = planeTransform.position.y;
            }

            if (floorY !== Number.POSITIVE_INFINITY) {
                let floorEntity = app.root.findByName("Floor");
                floorEntity.setPosition(0, floorY, 0);
            }
        }
    }
}

function renderPlane(vertices: pc.Vec3[], transform: XRRigidTransform) {
    let pos = transform.position as any as pc.Vec3;
    let rot = transform.orientation as any as pc.Quat;
    let matrix = new pc.Mat4().setTRS(pos, rot, pc.Vec3.ONE);
    let position = vertices.map(vertex => matrix.transformPoint(vertex));

    let color = new pc.Color(0, 1, 0);
    app.renderLines(position, color as any);
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
    if (touch) {
        touch.on(pc.EVENT_TOUCHSTART, onTouchStart);
        touch.on(pc.EVENT_TOUCHEND, onTouchEnd);
    }
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
