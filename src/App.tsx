import React from "react"
import "./App.css"

const canvasWidth = 1000;
const canvasHeight = 630;

let a = 0;
let vCos = 0;
let vSin = 0;

let frame = 0;
let intervalMs = 1000;

function App() {
    const canvas = React.useRef(null);
    const getCtx = () => canvas.current ? (canvas.current as HTMLCanvasElement).getContext("2d") : null;

    const [ih, setIh] = React.useState(0);
    const [iv, setIv] = React.useState(90);
    const [ia, setIa] = React.useState(60);
    const [ir, setIr] = React.useState(10);
    const [fr, setFr] = React.useState(60);
    const [g, setG] = React.useState(9.8);

    const [sp, setSp] = React.useState(true);
    const [sh, setSh] = React.useState(false);
    const [sv, setSv] = React.useState(false);
    const [sc, setSc] = React.useState(false);
    const [sa, setSa] = React.useState(true);
    const [sg, setSg] = React.useState(false);

    const [inputsDisabled, setInputsDisabled] = React.useState(false);
    const [intervalHandle, setIntervalHandle] = React.useState(0);

    const removeInterval = () => {
        clearInterval(intervalHandle);
        setIntervalHandle(0);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let t = tCoordinate(frame); // t in seconds

        let x = xCoordinate(t);
        let y = yCoordinate(t, ih, g);

        drawCircle(ctx, ir, x, y);
        sp && drawPath(ctx, ih, g);
        sh && drawHorizontal(ctx, y);
        sv && drawVertical(ctx, x);
        sc && drawCoordinates(ctx, x, y);
        sa && drawAxes(ctx);
        sg && drawGrid(ctx);

        if (y >= yOffset && frame > 0) {
            frame = 0;
            removeInterval();
        }
    };

    const start = () => {
        if (intervalHandle) return;

        clearInterval(intervalHandle);
        setIntervalHandle(setInterval(() => {
            const ctx = getCtx();
            ctx && draw(ctx);
            frame++;
        }, Math.floor(1000 / fr)));

        setInputsDisabled(true);
    };

    const pause = () => intervalHandle ? removeInterval() : start();
    const reset = () => {
        a = toRad(ia);
        vCos = iv * Math.cos(a);
        vSin = iv * Math.sin(a);
        intervalMs = Math.floor(1000 / fr);

        removeInterval();

        const ctx = getCtx();
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        sa && drawAxes(ctx);
        sg && drawGrid(ctx);
        drawCircle(ctx, ir, xOffset, yOffset - ih);
        frame = 0;
        setInputsDisabled(false);
    };

    React.useEffect(() => { reset(); }, [ih, iv, ia, ir, fr, g, sp, sh, sv, sc, sa, sg]);

    return (
        <div className="container py-4 bg-light mt-2 text-center">
            <h2>Parabolic Motion</h2>
            <div className="text-center fs-5 mb-4">
                by <a href="https://afaan.dev" className="text-success" target="_blank">Afaan Bilal</a>
                <br />

                <div className="pt-3">
                    <a href="https://github.com/AfaanBilal/parabolic-motion-react" className="link-dark fs-6" target="_blank">Source Code</a>
                </div>
            </div>
            <hr />
            <div className="row">
                <div className="col">
                    Height (m):
                    <br />
                    <input type="number" placeholder="Initial height" disabled={inputsDisabled} value={ih} onChange={e => setIh(parseInt(e.target.value))} />
                </div>
                <div className="col">
                    Velocity (m/s):
                    <br />
                    <input type="number" placeholder="Initial velocity" disabled={inputsDisabled} value={iv} onChange={e => setIv(parseInt(e.target.value))} />
                </div>
                <div className="col">
                    Angle (deg):
                    <br />
                    <input type="number" placeholder="Launch angle" disabled={inputsDisabled} value={ia} onChange={e => setIa(parseInt(e.target.value))} />
                </div>
                <div className="col">
                    Radius (m):
                    <br />
                    <input type="number" placeholder="Radius" disabled={inputsDisabled} value={ir} onChange={e => setIr(parseInt(e.target.value))} />
                </div>
                <div className="col">
                    Framerate (fps):
                    <br />
                    <input type="number" placeholder="Framerate" disabled={inputsDisabled} value={fr} onChange={e => setFr(parseInt(e.target.value))} />
                </div>
                <div className="col">
                    g (m/s<sup>2</sup>):
                    <br />
                    <input type="number" placeholder="Acceleration due to gravity" disabled={inputsDisabled} value={g} onChange={e => setG(parseInt(e.target.value))} />
                </div>
            </div>
            <hr />
            <div className="row">
                <div className="col">Show path: <input type="checkbox" disabled={inputsDisabled} checked={sp} onChange={e => setSp(p => !p)} /></div>
                <div className="col">Show horizontal: <input type="checkbox" disabled={inputsDisabled} checked={sh} onChange={e => setSh(p => !p)} /></div>
                <div className="col">Show vertical: <input type="checkbox" disabled={inputsDisabled} checked={sv} onChange={e => setSv(p => !p)} /></div>
                <div className="col">Show coordinates: <input type="checkbox" disabled={inputsDisabled} checked={sc} onChange={e => setSc(p => !p)} /></div>
                <div className="col">Show axes: <input type="checkbox" disabled={inputsDisabled} checked={sa} onChange={e => setSa(p => !p)} /></div>
                <div className="col">Show grid: <input type="checkbox" disabled={inputsDisabled} checked={sg} onChange={e => setSg(p => !p)} /></div>
            </div>
            <hr />
            <button onClick={start} disabled={inputsDisabled} type="button">Start</button>
            <button onClick={pause} disabled={!inputsDisabled} type="button">{intervalHandle ? "Pause" : "Resume"}</button>
            <button onClick={reset} disabled={!inputsDisabled} type="button">Reset</button>
            <hr />
            <canvas ref={canvas} width={canvasWidth} height={canvasHeight} style={{ border: "1px solid #aaa" }}></canvas>
            <hr />
            &copy; <a href="https://afaan.dev" className="link-dark" target="_blank">Afaan Bilal</a>
        </div>
    );
}

export default App;

const toRad = (angle: number) => angle * (Math.PI / 180);
const xOffset = 30;
const yOffset = 600;
const textOffset = 20;

const drawAxes = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(canvasWidth - xOffset, yOffset);
    ctx.stroke();

    ctx.fillText("m", canvasWidth - xOffset + 5, yOffset + 2);
    for (let i = 0; i <= 900; i += 50) {
        ctx.fillText(i.toString(), xOffset + i - 5, yOffset + textOffset);
    }

    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(xOffset, canvasHeight - yOffset);
    ctx.stroke();

    ctx.fillText("m", xOffset - 5, 20);
    for (let i = yOffset; i >= canvasHeight - yOffset; i -= 50) {
        ctx.fillText((yOffset - i).toString(), xOffset - textOffset, i + 2);
    }
};

const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#999";

    for (let i = 50; i <= 900; i += 50) {
        ctx.beginPath();
        ctx.moveTo(xOffset + i, yOffset);
        ctx.lineTo(xOffset + i, canvasHeight - yOffset);
        ctx.stroke();
    }

    for (let i = yOffset; i >= canvasHeight - yOffset; i -= 50) {
        ctx.beginPath();
        ctx.moveTo(xOffset, i);
        ctx.lineTo(canvasWidth - xOffset, i);
        ctx.stroke();
    }

    ctx.strokeStyle = "#000";
};

const drawCircle = (ctx: CanvasRenderingContext2D, radius: number, x: number, y: number) => {
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
};

const drawPath = (ctx: CanvasRenderingContext2D, ih: number, g: number) => {
    ctx.strokeStyle = "#00f";

    let px = 0;
    let py = 0;

    for (let i = 0; i <= frame; i++) {
        let t = tCoordinate(i); // t in seconds

        let x = xCoordinate(t);
        let y = yCoordinate(t, ih, g);

        if (!px) px = x;
        if (!py) py = y;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();

        px = x;
        py = y;
    }

    ctx.strokeStyle = "#000";
};

const drawVertical = (ctx: CanvasRenderingContext2D, x: number) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
};

const drawHorizontal = (ctx: CanvasRenderingContext2D, y: number) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
};

const drawCoordinates = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillText("t: " + tCoordinate(frame).toFixed(3) + "s", x + 10, y - 50);
    ctx.fillText("x: " + (x - xOffset).toFixed(3) + "m", x + 10, y - 40);
    ctx.fillText("y: " + (yOffset - y).toFixed(3) + "m", x + 10, y - 30);
};

const tCoordinate = (frame: number) => frame * intervalMs / 1000;
const xCoordinate = (t: number) => xOffset + vCos * t;
const yCoordinate = (t: number, ih: number, g: number) => yOffset - ih - (vSin * t - g * t * t / 2);
