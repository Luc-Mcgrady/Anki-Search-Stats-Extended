mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Headers, Request, RequestInit, Response, js_sys::{Array, Object, Reflect}};
use search_stats_extended::{time_total, Revlog};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub unsafe fn greet() {
    alert("Hello, search-stats-extended!");
}

// REVLOG_COLUMNS = ["id", "cid", "ease", "ivl", "lastIvl", "time", "factor", "type"]

fn revlog_into(value: JsValue) -> Result<Revlog, JsValue> {
    let arr: Array = value.dyn_into()?;

    Ok(Revlog {
        id: arr.get(0).as_f64().unwrap() as u64,
        cid: arr.get(1).as_f64().unwrap() as u64,
        ease: arr.get(2).as_f64().unwrap() as u64,
        ivl: arr.get(3).as_f64().unwrap() as i64,
        last_ivl: arr.get(4).as_f64().unwrap() as i64,
        time: arr.get(5).as_f64().unwrap() as u64,
        factor: arr.get(6).as_f64().unwrap() as u64,
        typ: arr.get(7).as_f64().unwrap() as u64,
    })
}


#[wasm_bindgen(js_name = "stats")]
pub async fn stats_async(revlogs: Array) -> Result<u64, JsValue> {
    utils::set_panic_hook();

    let revlogs: Result<Vec<Revlog>, _> = revlogs.into_iter().map(revlog_into).collect();
    let revlogs = revlogs?;

    let time = time_total(&revlogs);

    return Ok(time)
}