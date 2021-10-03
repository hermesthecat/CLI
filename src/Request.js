// Load Tmp fetch
if (typeof global.fetch === "undefined") global.fetch = (...args) => import("node-fetch").then(mod => mod.default(...args));

// Load fetch
import("node-fetch").then(ESMModule => {
    if (typeof global.fetch === "undefined") global.fetch = ESMModule.default;
}).catch(error => {});

// JSON Request
async function Json(...options) {
    const Res = await fetch(...options);
    if (Res.status === 200) return await Res.json(); else throw new Error(JSON.stringify({
        Http: `${Res.status} ${Res.statusText}`,
        Body: await Res.text()
    }, null, 2));
}

// Text Request
async function Text(...options) {
    const Res = await fetch(...options);
    if (Res.status === 200) return await Res.text(); else throw new Error(JSON.stringify({
        Http: `${Res.status} ${Res.statusText}`,
        Body: await Res.text()
    }, null, 2));
}

// Buffer Request
async function BufferResponse(...options) {
    const Res = await fetch(...options);
    if (Res.status === 200) return Buffer.from(await Res.arrayBuffer()); else throw new Error(JSON.stringify({
        Http: `${Res.status} ${Res.statusText}`,
        Body: await Res.text()
    }, null, 2));
}

// Exports
module.exports.Text = Text;
module.exports.Json = Json;
module.exports.Buffer = BufferResponse;
