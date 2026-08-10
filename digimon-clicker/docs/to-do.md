* Jogress (dual-parent) evolutions — needs a real UX decision (how does a player pick 2 party members to fuse?), not just data mapping. Only one edge in the whole roster needs it currently.
* Real per-species attributeResistances replacing the hardcoded Vaccine>Virus>Data>Vaccine triangle — this is a combat rework, which you asked me to defer earlier.
* Add Bond levels
* Increase active digimon count to 3
* Increase max enemy digimon count to 5
* Implement Items - consumables data (src/data/consumables.ts) + quantity-tracked inventory + Augment Chips (permanent stat bonus, applied via PartyPage) are in; still need a use-item flow for the rest (Single/All targeting), and combat wiring for status ailments/timed stat boosts/EXP/Bond gain
* Implement Store - basic unrestricted buy-everything Shop is in (ShopPage.tsx); still needs stock limits/level or area gates/categories polish