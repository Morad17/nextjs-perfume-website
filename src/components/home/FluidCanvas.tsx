"use client";

import { useRef, useEffect, RefObject } from "react";

interface Color {
  h: number;
  s: number;
  l: number;
}

interface Props {
  colors: Color[];
  targetRef: RefObject<HTMLDivElement | null>;
}

type RGB = { r: number; g: number; b: number };
type FmtInfo = { internalFormat: number; format: number } | null;

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

// ── Simulation config ─────────────────────────────────────────────────────────
const SIM_RESOLUTION      = 128;
const DENSITY_DISSIPATION = 3.5;
const VELOCITY_DISSIPATION = 2;
const PRESSURE             = 0.1;
const PRESSURE_ITERATIONS  = 20;
const CURL                 = 3;
const SPLAT_RADIUS         = 0.2;
const SPLAT_FORCE          = 6000;
const COLOR_UPDATE_SPEED   = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) return { r: l, g: l, b: l };
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3),
    g: hue2rgb(p, q, h),
    b: hue2rgb(p, q, h - 1 / 3),
  };
}

function paletteColor(palette: Color[]): RGB {
  const c = palette[Math.floor(Math.random() * palette.length)];
  const { r, g, b } = hslToRgb(c.h / 360, c.s / 100, c.l / 100);
  return { r: r * 0.15, g: g * 0.15, b: b * 0.15 };
}

function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  return ((value - min) % range) + min;
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FluidCanvas({ colors, targetRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;

    // WebGL context
    const ctxParams = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    const gl = (
      canvas.getContext("webgl2", ctxParams) ||
      canvas.getContext("webgl", ctxParams) ||
      canvas.getContext("experimental-webgl", ctxParams)
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    const isWebGL2 = "drawBuffers" in gl;
    let supportLinearFiltering = false;
    let halfFloatOES = 0;

    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = !!gl.getExtension("OES_texture_float_linear");
      halfFloatOES = (gl as WebGL2RenderingContext).HALF_FLOAT;
    } else {
      const hfExt = gl.getExtension("OES_texture_half_float");
      supportLinearFiltering = !!gl.getExtension("OES_texture_half_float_linear");
      halfFloatOES = hfExt ? (hfExt as { HALF_FLOAT_OES: number }).HALF_FLOAT_OES : 0;
    }

    gl.clearColor(0, 0, 0, 1);

    // Format detection
    function supportRenderTextureFormat(internalFormat: number, format: number, type: number): boolean {
      const tex = gl!.createTexture();
      if (!tex) return false;
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl!.createFramebuffer();
      if (!fbo) return false;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      return gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE;
    }

    function getSupportedFormat(internalFormat: number, format: number, type: number): FmtInfo {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        if (isWebGL2) {
          const gl2 = gl as WebGL2RenderingContext;
          if (internalFormat === gl2.R16F)  return getSupportedFormat(gl2.RG16F, gl2.RG, type);
          if (internalFormat === gl2.RG16F) return getSupportedFormat(gl2.RGBA16F, gl2.RGBA, type);
          return null;
        }
        return null;
      }
      return { internalFormat, format };
    }

    let formatRGBA: FmtInfo, formatRG: FmtInfo, formatR: FmtInfo;
    if (isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      formatRGBA = getSupportedFormat(gl2.RGBA16F, gl2.RGBA, halfFloatOES);
      formatRG   = getSupportedFormat(gl2.RG16F,   gl2.RG,   halfFloatOES);
      formatR    = getSupportedFormat(gl2.R16F,    gl2.RED,  halfFloatOES);
    } else {
      formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatOES);
      formatRG   = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatOES);
      formatR    = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatOES);
    }
    if (!formatRGBA || !formatRG || !formatR) return;

    const dyeResolution  = supportLinearFiltering ? 1440 : 256;
    const shading        = supportLinearFiltering;
    const filtering      = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    // ── Shader helpers ────────────────────────────────────────────────────────
    function compileShader(type: number, source: string, keywords?: string[] | null): WebGLShader | null {
      let src = source;
      if (keywords?.length) src = keywords.map(k => `#define ${k}\n`).join("") + src;
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
        console.error(gl!.getShaderInfoLog(shader));
      return shader;
    }

    function makeProgram(vert: WebGLShader, frag: WebGLShader): WebGLProgram | null {
      const prog = gl!.createProgram();
      if (!prog) return null;
      gl!.attachShader(prog, vert);
      gl!.attachShader(prog, frag);
      gl!.linkProgram(prog);
      if (!gl!.getProgramParameter(prog, gl!.LINK_STATUS))
        console.error(gl!.getProgramInfoLog(prog));
      return prog;
    }

    function getUniforms(prog: WebGLProgram): Record<string, WebGLUniformLocation | null> {
      const u: Record<string, WebGLUniformLocation | null> = {};
      const n = gl!.getProgramParameter(prog, gl!.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl!.getActiveUniform(prog, i);
        if (info) u[info.name] = gl!.getUniformLocation(prog, info.name);
      }
      return u;
    }

    class GlProgram {
      program: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;
      constructor(vert: WebGLShader, frag: WebGLShader) {
        this.program = makeProgram(vert, frag);
        this.uniforms = this.program ? getUniforms(this.program) : {};
      }
      bind() { if (this.program) gl!.useProgram(this.program); }
    }

    class DynamicMaterial {
      vertexShader: WebGLShader;
      fragmentShaderSource: string;
      programs: Record<number, WebGLProgram | null>;
      activeProgram: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;
      constructor(vert: WebGLShader, fragSource: string) {
        this.vertexShader = vert;
        this.fragmentShaderSource = fragSource;
        this.programs = {};
        this.activeProgram = null;
        this.uniforms = {};
      }
      setKeywords(keywords: string[]) {
        let hash = 0;
        for (const kw of keywords) hash += hashCode(kw);
        let prog = this.programs[hash];
        if (prog == null) {
          const frag = compileShader(gl!.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          if (!frag) return;
          prog = makeProgram(this.vertexShader, frag);
          this.programs[hash] = prog;
        }
        if (prog === this.activeProgram) return;
        if (prog) this.uniforms = getUniforms(prog);
        this.activeProgram = prog;
      }
      bind() { if (this.activeProgram) gl!.useProgram(this.activeProgram); }
    }

    // ── Shaders ───────────────────────────────────────────────────────────────
    const baseVert = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `)!;

    const copyFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }
    `)!;

    const clearFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
    `)!;

    const displayFragSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
          vec3 lc = texture2D(uTexture, vL).rgb;
          vec3 rc = texture2D(uTexture, vR).rgb;
          vec3 tc = texture2D(uTexture, vT).rgb;
          vec3 bc = texture2D(uTexture, vB).rgb;
          float dx = length(rc) - length(lc);
          float dy = length(tc) - length(bc);
          vec3 n = normalize(vec3(dx, dy, length(texelSize)));
          vec3 l = vec3(0.0, 0.0, 1.0);
          float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
          c *= diffuse;
        #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `;

    const splatFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `)!;

    const advectionFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
        #ifdef MANUAL_FILTERING
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
        #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `, supportLinearFiltering ? null : ["MANUAL_FILTERING"])!;

    const divergenceFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `)!;

    const curlFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `)!;

    const vorticityFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `)!;

    const pressureFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `)!;

    const gradSubtractFrag = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `)!;

    // ── Programs ──────────────────────────────────────────────────────────────
    const copyProg        = new GlProgram(baseVert, copyFrag);
    const clearProg       = new GlProgram(baseVert, clearFrag);
    const splatProg       = new GlProgram(baseVert, splatFrag);
    const advectionProg   = new GlProgram(baseVert, advectionFrag);
    const divergenceProg  = new GlProgram(baseVert, divergenceFrag);
    const curlProg        = new GlProgram(baseVert, curlFrag);
    const vorticityProg   = new GlProgram(baseVert, vorticityFrag);
    const pressureProg    = new GlProgram(baseVert, pressureFrag);
    const gradSubtractProg = new GlProgram(baseVert, gradSubtractFrag);
    const displayMat      = new DynamicMaterial(baseVert, displayFragSource);

    // suppress unused-variable warning on copyProg (used only as reference)
    void copyProg;

    // ── Blit quad ─────────────────────────────────────────────────────────────
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target: FBO | null, doClear = false) {
      if (!target) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      } else {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      }
      if (doClear) {
        gl!.clearColor(0, 0, 0, 1);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    // ── FBO helpers ───────────────────────────────────────────────────────────
    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      return {
        texture, fbo, width: w, height: h,
        texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
      const a = createFBO(w, h, internalFormat, format, type, param);
      const b = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w, height: h,
        texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
        read: a, write: b,
        swap() { const tmp = this.read; this.read = this.write; this.write = tmp; },
      };
    }

    function getResolution(resolution: number) {
      const w = gl!.drawingBufferWidth;
      const h = gl!.drawingBufferHeight;
      const aspect = w / h;
      const min = Math.round(resolution);
      const max = Math.round(resolution * (aspect < 1 ? 1 / aspect : aspect));
      return w > h ? { width: max, height: min } : { width: min, height: max };
    }

    function scaleByPixelRatio(input: number) {
      return Math.floor(input * (window.devicePixelRatio || 1));
    }

    // ── Framebuffers ──────────────────────────────────────────────────────────
    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergenceFBO: FBO;
    let curlFBO: FBO;
    let pressureFBO: DoubleFBO;

    function initFramebuffers() {
      const simRes = getResolution(SIM_RESOLUTION);
      const dyeRes = getResolution(dyeResolution);
      const { internalFormat: rgbaIF, format: rgbaF } = formatRGBA!;
      const { internalFormat: rgIF,   format: rgF   } = formatRG!;
      const { internalFormat: rIF,    format: rF    } = formatR!;
      gl!.disable(gl!.BLEND);

      if (!dye)      dye      = createDoubleFBO(dyeRes.width, dyeRes.height, rgbaIF, rgbaF, halfFloatOES, filtering);
      if (!velocity) velocity = createDoubleFBO(simRes.width, simRes.height, rgIF,   rgF,   halfFloatOES, filtering);
      divergenceFBO = createFBO(simRes.width, simRes.height, rIF, rF, halfFloatOES, gl!.NEAREST);
      curlFBO       = createFBO(simRes.width, simRes.height, rIF, rF, halfFloatOES, gl!.NEAREST);
      pressureFBO   = createDoubleFBO(simRes.width, simRes.height, rIF, rF, halfFloatOES, gl!.NEAREST);
    }

    const kw: string[] = [];
    if (shading) kw.push("SHADING");
    displayMat.setKeywords(kw);
    initFramebuffers();

    // ── Pointer state ─────────────────────────────────────────────────────────
    const ptr = {
      texcoordX: 0, texcoordY: 0,
      prevTexcoordX: 0, prevTexcoordY: 0,
      deltaX: 0, deltaY: 0,
      down: false, moved: false,
      color: paletteColor(colors),
    };

    // ── Simulation step ───────────────────────────────────────────────────────
    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      curlProg.bind();
      gl!.uniform2f(curlProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO);

      vorticityProg.bind();
      gl!.uniform2f(vorticityProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(vorticityProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(vorticityProg.uniforms.uCurl, curlFBO.attach(1));
      gl!.uniform1f(vorticityProg.uniforms.curl, CURL);
      gl!.uniform1f(vorticityProg.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      divergenceProg.bind();
      gl!.uniform2f(divergenceProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergenceFBO);

      clearProg.bind();
      gl!.uniform1i(clearProg.uniforms.uTexture, pressureFBO.read.attach(0));
      gl!.uniform1f(clearProg.uniforms.value, PRESSURE);
      blit(pressureFBO.write);
      pressureFBO.swap();

      pressureProg.bind();
      gl!.uniform2f(pressureProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(pressureProg.uniforms.uDivergence, divergenceFBO.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(pressureProg.uniforms.uPressure, pressureFBO.read.attach(1));
        blit(pressureFBO.write);
        pressureFBO.swap();
      }

      gradSubtractProg.bind();
      gl!.uniform2f(gradSubtractProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(gradSubtractProg.uniforms.uPressure, pressureFBO.read.attach(0));
      gl!.uniform1i(gradSubtractProg.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      advectionProg.bind();
      gl!.uniform2f(advectionProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering)
        gl!.uniform2f(advectionProg.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const velId = velocity.read.attach(0);
      gl!.uniform1i(advectionProg.uniforms.uVelocity, velId);
      gl!.uniform1i(advectionProg.uniforms.uSource, velId);
      gl!.uniform1f(advectionProg.uniforms.dt, dt);
      gl!.uniform1f(advectionProg.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      if (!supportLinearFiltering)
        gl!.uniform2f(advectionProg.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl!.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectionProg.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(advectionProg.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function renderFrame() {
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.enable(gl!.BLEND);
      const w = gl!.drawingBufferWidth;
      const h = gl!.drawingBufferHeight;
      displayMat.bind();
      if (shading) gl!.uniform2f(displayMat.uniforms.texelSize, 1 / w, 1 / h);
      gl!.uniform1i(displayMat.uniforms.uTexture, dye.read.attach(0));
      blit(null, false);
    }

    // ── Splat ─────────────────────────────────────────────────────────────────
    function correctRadius(r: number) {
      const ar = canvas!.width / canvas!.height;
      return ar > 1 ? r * ar : r;
    }
    function correctDeltaX(d: number) {
      const ar = canvas!.width / canvas!.height;
      return ar < 1 ? d * ar : d;
    }
    function correctDeltaY(d: number) {
      const ar = canvas!.width / canvas!.height;
      return ar > 1 ? d / ar : d;
    }

    function splat(x: number, y: number, dx: number, dy: number, color: RGB) {
      splatProg.bind();
      gl!.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(splatProg.uniforms.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(splatProg.uniforms.point, x, y);
      gl!.uniform3f(splatProg.uniforms.color, dx, dy, 0);
      gl!.uniform1f(splatProg.uniforms.radius, correctRadius(SPLAT_RADIUS / 100));
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(splatProg.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    let lastTime = Date.now();
    let colorTimer = 0;
    let rafId: number;

    function resizeCanvas() {
      const w = scaleByPixelRatio(canvas!.clientWidth);
      const h = scaleByPixelRatio(canvas!.clientHeight);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        return true;
      }
      return false;
    }

    function updateFrame() {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      if (resizeCanvas()) initFramebuffers();

      colorTimer += dt * COLOR_UPDATE_SPEED;
      if (colorTimer >= 1) {
        colorTimer = wrap(colorTimer, 0, 1);
        ptr.color = paletteColor(colors);
      }

      if (ptr.moved) {
        ptr.moved = false;
        splat(ptr.texcoordX, ptr.texcoordY, ptr.deltaX * SPLAT_FORCE, ptr.deltaY * SPLAT_FORCE, ptr.color);
      }

      step(dt);
      renderFrame();
      rafId = requestAnimationFrame(updateFrame);
    }

    // ── Events (scoped to targetRef) ──────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const posX = scaleByPixelRatio(e.clientX - rect.left);
      const posY = scaleByPixelRatio(e.clientY - rect.top);
      ptr.prevTexcoordX = ptr.texcoordX;
      ptr.prevTexcoordY = ptr.texcoordY;
      ptr.texcoordX = posX / canvas!.width;
      ptr.texcoordY = 1 - posY / canvas!.height;
      ptr.deltaX = correctDeltaX(ptr.texcoordX - ptr.prevTexcoordX);
      ptr.deltaY = correctDeltaY(ptr.texcoordY - ptr.prevTexcoordY);
      ptr.moved = Math.abs(ptr.deltaX) > 0 || Math.abs(ptr.deltaY) > 0;
    };

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      ptr.texcoordX = scaleByPixelRatio(e.clientX - rect.left) / canvas!.width;
      ptr.texcoordY = 1 - scaleByPixelRatio(e.clientY - rect.top) / canvas!.height;
      ptr.down = true;
      const burst = paletteColor(colors);
      burst.r *= 10; burst.g *= 10; burst.b *= 10;
      splat(ptr.texcoordX, ptr.texcoordY, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 30, burst);
    };

    const onMouseLeave = () => { ptr.down = false; };

    target.addEventListener("mousemove", onMouseMove);
    target.addEventListener("mousedown", onMouseDown);
    target.addEventListener("mouseleave", onMouseLeave);

    const ro = new ResizeObserver(() => { if (resizeCanvas()) initFramebuffers(); });
    ro.observe(canvas);

    rafId = requestAnimationFrame(updateFrame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      target.removeEventListener("mousemove", onMouseMove);
      target.removeEventListener("mousedown", onMouseDown);
      target.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [colors, targetRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}
