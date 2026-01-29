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

pub fn time_total(revlogs: &[Revlog]) -> u64 {
    revlogs.iter().fold(0, |p, a| p + a.time)
}
