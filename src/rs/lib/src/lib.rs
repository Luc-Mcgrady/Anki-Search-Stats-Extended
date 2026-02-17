use std::collections::{HashMap, HashSet};

pub struct Revlog {
    pub id: u64,
    pub cid: u64,
    pub ease: u64,
    pub ivl: i64,
    pub last_ivl: i64,
    pub time: u64,
    pub factor: u64,
    pub typ: u64,
}

pub struct GraphContext {
    pub revlogs: Vec<Revlog>,
    pub day_offset_ms: u64
}

impl GraphContext {
    pub fn time_total(&self) -> u64 {
        self.revlogs.iter().fold(0, |p, a| p + a.time)
    }
    
    pub fn introduced(&self) -> HashMap<u64, u64> {
        let mut days: HashMap<u64, u64> = HashMap::new();
        let mut seen_cards = HashSet::new();
        for revlog in &self.revlogs {
            if !seen_cards.contains(&revlog.cid) {
                let day = (revlog.id - self.day_offset_ms) / (1000 * 60 * 60 * 24);
                days.entry(day)
                    .and_modify(|c| *c += 1)
                    .or_insert(1);
            }
            
            seen_cards.insert(revlog.cid);
        };
    
        days
    }
}