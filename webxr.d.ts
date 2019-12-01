type XRSessionMode =
    | "inline"
    | "immersive-vr"
    | "immersive-ar";

type XRReferenceSpaceType =
    | "viewer"
    | "local"
    | "local-floor"
    | "bounded-floor"
    | "unbounded";

type XREnvironmentBlendMode =
    | "opaque"
    | "additive"
    | "alpha-blend";

type XRVisibilityState =
    | "visible"
    | "visible-blurred"
    | "hidden";

type XRHandedness =
    | "none"
    | "left"
    | "right";

type XRTargetRayMode =
    | "gaze"
    | "tracked-pointer"
    | "screen";

type XREye =
    | "none"
    | "left"
    | "right";

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

interface XRSessionInit {
    requiredFeatures: Array<any>;
    optionalFeatures: Array<any>;
}

interface XRSpace extends EventTarget {

}

interface XRRenderState {
    readonly depthNear?: number;
    readonly depthFar?: number;
    readonly inlineVerticalFieldOfView?: number;
    readonly baseLayer?: XRWebGLLayer;
}

interface XRInputSource {
    readonly handedness: XRHandedness;
    readonly targetRayMode: XRTargetRayMode;
    readonly targetRaySpace: XRSpace;
    readonly gripSpace?: XRSpace;
    readonly profiles: Array<string>;
}

interface XRSession extends EventTarget {
    readonly visibilityState: XRVisibilityState;
    readonly renderState: XRRenderState;
    readonly inputSources: Array<XRInputSource>;
    updateRenderState(XRRenderStateInit: XRRenderState): Promise<void>;
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
    end(): Promise<void>;
    onend: any;
    onselect: any;
    oninputsourceschange: any;
    onselectstart: any;
    onselectend: any;
    onvisibilitychange: any;
}

interface XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
    onreset: any;
}

interface XRFrame {
    readonly session: XRSession;
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | undefined;
    getPose(space: XRSpace, baseSpace: XRSpace): XRPose | undefined;
}

interface XRViewerPose extends XRPose {
    readonly views: Array<XRView>;
}

interface XRPose {
    readonly transform: XRRigidTransform;
    readonly emulatedPosition: boolean;
}

interface XRViewport {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

declare var XRWebGLLayer: {
    prototype: XRWebGLLayer;
    new(session: XRSession, context: WebGLRenderingContext | undefined): XRWebGLLayer;
};
interface XRWebGLLayer {
    readonly antialias: boolean;
    readonly ignoreDepthValues: boolean;
    readonly framebuffer: WebGLFramebuffer;
    readonly framebufferWidth: number;
    readonly framebufferHeight: number;
    getViewport(view: XRView): XRViewport | undefined;
}

interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
    readonly inverse: XRRigidTransform;
}

interface XRView {
    readonly eye: XREye;
    readonly projectionMatrix: Float32Array;
    readonly transform: XRRigidTransform;
}

interface XRInputSourceChangeEvent {
    readonly session: XRSession;
    readonly added: Array<XRInputSource>;
    readonly removed: Array<XRInputSource>;
}

interface XR extends EventTarget {
    isSessionSupported(sessionMode: XRSessionMode): Promise<void>;
    requestSession(sessionMode: XRSessionMode): Promise<XRSession>;
    requestSession(sessionMode: XRSessionMode, sessionInit: XRSessionInit): Promise<XRSession>;
    ondevicechange: any;
}

interface Navigator {
    readonly xr?: XR;
}
