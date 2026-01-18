mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Headers, Request, RequestInit, Response, js_sys::{Array, Object, Reflect}};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, search-stats-extended!");
}

// REVLOG_COLUMNS = ["id", "cid", "ease", "ivl", "lastIvl", "time", "factor", "type"]
pub struct Revlog {
    pub id: u64,
    pub cid: u64,
    pub ease: u64,
    pub ivl: u64,
    pub last_ivl: u64,
    pub time: u64,
    pub factor: u64,
    pub typ: u64,
}

// Todo: Convert to try-into
impl Into<Revlog> for JsValue {
    fn into(self) -> Revlog {
        let arr: Array = self.dyn_into().unwrap();

        Revlog {
            id: arr.get(0).as_f64().unwrap() as u64,
            cid: arr.get(1).as_f64().unwrap() as u64,
            ease: arr.get(2).as_f64().unwrap() as u64,
            ivl: arr.get(3).as_f64().unwrap() as u64,
            last_ivl: arr.get(4).as_f64().unwrap() as u64,
            time: arr.get(5).as_f64().unwrap() as u64,
            factor: arr.get(6).as_f64().unwrap() as u64,
            typ: arr.get(7).as_f64().unwrap() as u64,
        }
        }
}

pub fn time_total(revlogs: &[Revlog]) -> u64 {
    revlogs.iter().fold(0, |p, a| p + a.time)
}

#[wasm_bindgen(js_name = "stats")]
pub async fn stats_async() -> Result<u64, JsValue> {
    let opts = RequestInit::new();
    opts.set_method("POST");
    opts.set_body(&"{\"cids\": [1739985318629], \"day_range\": 365}".into());
    
    let headers = Headers::new()?;
    headers.set("Content-Type", "application/binary")?;
    
    opts.set_headers(&headers);
    let req = Request::new_with_str_and_init("/_anki/revlogs", &opts);
    
    let window = web_sys::window().unwrap();
    let resp: Response = JsFuture::from(window.fetch_with_request(&req.unwrap())).await?.dyn_into()?;
    
    let revlogs = JsFuture::from(resp.json()?).await?;
    let revlogs: Array = Reflect::get(&revlogs, &"data".into())?.dyn_into()?;
    let revlogs: Vec<Revlog> = revlogs.into_iter().map(Into::into).collect();
    
    let time = time_total(&revlogs);

    return Ok(time)
}