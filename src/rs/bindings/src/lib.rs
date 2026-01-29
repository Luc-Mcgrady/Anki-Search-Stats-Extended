mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Headers, Request, RequestInit, Response, js_sys::{Array, Object, Reflect}};
use search_stats_extended::{time_total, Revlog};
use serde::Deserialize;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub unsafe fn greet() {
    alert("Hello, search-stats-extended!");
}

// REVLOG_COLUMNS = ["id", "cid", "ease", "ivl", "lastIvl", "time", "factor", "type"]

#[derive(Deserialize)]
struct RevlogRow(u64, u64, u64, i64, i64, u64, u64, u64);

impl Into<Revlog> for RevlogRow {
    fn into(self) -> Revlog {
        Revlog {
            id: self.0,
            cid: self.1,
            ease: self.2,
            ivl: self.3,
            last_ivl: self.4,
            time: self.5,
            factor: self.6,
            typ: self.7,
        }
    }
}

#[derive(Deserialize)]
struct RevlogsResponse {
    pub data: Vec<RevlogRow>,
    #[serde(rename = "columns")]
    pub _columns: Vec<String>,
}

#[wasm_bindgen(js_name = "stats")]
pub async fn stats_async(cids: Vec<u64>) -> Result<u64, JsValue> {
    utils::set_panic_hook();

    let opts = RequestInit::new();
    opts.set_method("POST");

    let cids: Vec<String> = cids.into_iter().map(|x| x.to_string()).collect::<Vec<String>>();
    opts.set_body(&format!("{{\"cids\": [{}], \"day_range\": 365}}", cids.join(",")).into());
    
    let headers = Headers::new()?;
    headers.set("Content-Type", "application/binary")?;
    
    opts.set_headers(&headers);
    let req = Request::new_with_str_and_init("/_anki/revlogs", &opts);
    
    let window = web_sys::window().unwrap();
    let resp: Response = JsFuture::from(window.fetch_with_request(&req.unwrap())).await?.dyn_into()?;
    
    let revlogs = JsFuture::from(resp.text()?).await?;
    let revlogs = revlogs.as_string().unwrap();
    let revlogs: RevlogsResponse = serde_json::from_str(&revlogs).unwrap();
    let revlogs: Vec<Revlog> = revlogs.data.into_iter().map(Into::into).collect();
    
    let time = time_total(&revlogs);

    //let revlogs: Result<Vec<Revlog>, _> = revlogs.into_iter().map(revlog_into).collect();
    //let revlogs = revlogs?;

    // let time = time_total(&revlogs);

    return Ok(time)
}