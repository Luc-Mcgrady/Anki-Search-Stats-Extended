
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = (...args) => ({ok: true, text: ()=>"{}"})
global.alert = (...args) => {}
global.SSEconfig = {}
global.SSEother = {lang: "en"}