# ROADMAP — STRATA

## How this roadmap works
Two developers, one schedule, and Claude keeps the order. Build numbers
are the order things were planned, not the order they ship: the queue
below is the real order. Austin's ideas go onto the queue wherever they
fit best; Claude's own ideas go there too. Playtest findings get fixed
when they matter, not by rule.

## Up next (in order)
1. **HORIZON** (DONE) — the renderer rebuild. Real geometry to 150-200 m with
   merged draws, one geomorphed 2 m voxel ring to ~350 m, a heightfield
   clipmap to the horizon, SDF-consistent normals and AO, shadow
   cascades, one water mesh per lake. Nothing added to the far view
   is worth it until the far view stops moving.
2. **SCULPT** (DONE) — the identity build. The trowel (a disc on the
   ground from 1 m to 48 m that raises, lowers and flattens, and
   carries you up with the ground), the bore (spline tunnels and
   causeways), the lathe (turn a drawn profile into a tower, a dome, a
   bowl), the mirror (every edit repeated across a plane you set with
   K). Left for a later session: a smoothing stroke that erodes rather
   than adds, and the Terraformer from Build 21.
3. **THE CREW** (Austin's, with my additions) — SLICE A DONE (Build 24:
   hire at 10 goodwill, follow / stay / roam disc, give a drill and they
   mine the next cut along your aim or dig a quarry, give a sword or gun
   and they fight, saves with the village). SLICE B DONE (Build 25:
   the night hunts them and they can die; a dispenser and a stack and
   they build what you build; they raise your saved blueprints where
   you point). Left: assign to a stove / turret / table, a bed and a
   chest, they eat, houses of their own design, city folk for hire.
   The idea: hire the people you have
   earned. At high enough goodwill a villager's trade screen gains two
   buttons: FOLLOW (they track you anywhere, toggle) and ASSIGN. Assign
   points them at a thing: a stove, a turret they will man instead of
   you, a table, or the ground -- where a disc like the trowel's sets
   their roaming boundary, tight or your whole base. Drop them weapons
   and tools: a sword or gun and they fight beside you; a drill and they
   mine what you mine; a dispenser and they build what you build, and
   left alone long enough with one they start on blueprints of their
   own (villagers raise houses, city folk raise towers, wherever you
   put them). My additions: they need a bed and a chest to call home,
   they eat from your stores, and a crew member who dies is gone. A
   dispenser crew member with a saved blueprint of YOURS builds that.
4. **THE PALISADE** (Austin's, with my additions) — DONE but for the
   portcullis (Build 26: the claymore, the one-way spikes, the tripwire
   bell that calls your armed crew; Build 29: the oil trench, the flame
   jet). Left: the portcullis on a lever, to be built on the door
   system. The idea: defenses that know
   whose side they are on. The claymore: a set charge that fires only for
   an enemy (never you, never a passive animal) and never marks the
   ground. One-way spikes: enemies bleed on them, you and your animals
   walk over. My additions: a tripwire bell that wakes your turrets and
   crew before the enemy is in range; an oil trench you light from a
   torch; a portcullis on a lever. And the turret's cousin, a flame jet
   for the walls, short and brutal.
5. **RIVERS** (DONE, Build 27) — water that starts in the mountains and
   reaches the sea: a downhill river per macro cell with tributaries,
   valleys carved from it, a per-column water height that every water
   consumer reads, near and far, a current. Left for later: a moving
   surface, fords and waterfalls as features, riverside villages and
   cities on the banks.
6. **THE EXPEDITION** (DONE, Build 28) — eight camps, a journal in
   eight pages, bones, a shaft with a rope, and the survey at the bottom
   pointing at THE DEEP. Later: more than one story per world, and the
   survey's other markings once THE DEEP exists to be found.
5. **Build 21 — THE DEEP** (Underdark, trinkets, difficulty tiers, map,
   sound) and then the Space Arc as written below.

6. **THE GARRISON** (Austin's, with my additions) — military bases: big,
   walled, the hardest thing on Earth to take and the most rewarding.
   Soldiers everywhere with rifles and SMGs, a couple per base with
   rocket launchers; tanks that patrol and blow chunks out of walls,
   crewed till they die (no stealing them); a helicopter gunship on the
   alarm. Peaceful until you enter, hit a gate guard, or fly over it in
   anything — then the siren and the whole base. Small chests
   everywhere (ammo, pistols, coins, ore); one vault chest on the
   commander with top guns, a pile of gold and exactly one part: tank,
   helicopter or jet. Collect enough parts to build one. Tank is a tank.
   Helicopter hovers with a door gun. Jet is the fast plane with a
   cannon and missiles, and it can roll and loop.
   My additions: the base has a *radar dish* you can sabotage first
   (cut the wire, or plant a charge) so the alarm never sounds and the
   helicopter never comes — a stealth route for the drill-and-wrench
   player, and it uses the power grid we already have. Bases sit on
   the highway network, so the tanks use the roads. A taken base
   becomes yours: the garrison respawns as *your* guard, and it is the
   only place that sells jet fuel.

## Next, in my order (re-planned 2026-09-07 after Austin's first playtest)
Austin's ideas from the playtest are folded in below with mine; the
order is mine. Big items are split so each build is one session.
1. **THE CREW C — a person, not a prop** (Austin's, mostly) — DONE
   (Build 32): their own pack and armor slots you click or drag into,
   they pick the tool for the moment (the gun when something comes, the
   drill when you dig, the dispenser when you place), torches in their
   pack get planted through the dark, hire in cities and the mayor, a
   TRADES tab that keeps their shop open, carry a hireable villager over
   your head, tents are beds. No fall damage ever (they take none); the
   catch-up teleport stays. Left for a later crew slice: a bed and a
   chest of their own, eating from your stores, houses of their own.
2. **THE BREACH** (Austin's) — DONE (Build 33): enemies tear down what
   defends you and nothing else (gates, doors, spikes, trenches, bells,
   turrets, flame jets, generators), raiders go for the generator's hum,
   broken things stay broken, the mender puts them back for battery
   charge alone, and the gate: a portcullis sized to any opening on a
   lever. Left for later: enemies that climb, the mender on city walls.
3. **THE DEEP, slice A** — DONE (Build 34): the dark, the noise meter,
   the first hall, the leader's last camp and last note, the door on,
   Austin's ramp (hut, lit house, the works), the knock. **Slice B** —
   DONE (Build 59): the second hall behind the fall, the nest, THE
   KNOCKER at the end of the works, the winch and the rope for the way
   back up, glow fungus as the deep's own light.
3b. **HORIZON.2 — TRUE SHAPES** — DONE (Build 35): city towers, halls,
   stacks and highway slabs drawn as exact boxes at range, reaching
   cities and roads not yet laid; the skin keeps the ground. Mountains
   rounding as you approach is the skin's 2 m grid against the real
   field and stays.
3c. **THE LEDGER** (Austin's) — DONE (Build 36): TRACK/UNTRACK and
   REMOVE on every mission row (villager work shelved and offered back
   as it was), the map pans on right-drag and zooms on scroll, left
   click sets, moves or removes your own numbered marks, which live in
   the world and the tab like any mission.
4. **RIVERS II** — DONE (Build 37): waterfalls (stepped surface, plunge
   pool, falling sheet, mist, roar), the wheel turning with the current
   and iced in winter, highway spans and village footbridges, river
   fish, rivers drawn and named on the map. Not done, for later: the
   spring flood and the mill as a building (grain, when FARMING comes).
5. **THE LINE** (Austin's) — DONE (Build 38): a railway on every
   highway's shoulder, tunnels under the cities to the platforms, one
   timetabled train per link (loco and three box cars), tickets from
   the kiosk, board while it stands, ride inside, step off at a
   station. Not yet: the mail car (queued), a clerk at the booth
   (COUNTERS), level crossings where your own roads meet it.
## Austin's console request (2026-09-12), ahead of the City Arc

- **THE PAD** — DONE (Build 39): a gamepad plays the whole game, world
  and menus, by synthesizing the mouse and key events; fullscreen and a
  console preset. To be confirmed on the Xbox itself.
- **TOGETHER** — DONE (Build 40): host and guest by room code over
  WebRTC (PeerJS's free signalling from a CDN), the host's world is the
  truth, edits and props go both ways, creatures stream to the guest
  and its blows come back. TOGETHER II (Build 41): guest profiles kept
  in the host's world, creatures see both players, guests carry and
  drive. Later, as they come up: a third player, a relay for the
  connections that need one, the guest's carved water, crew that
  follow a guest, a guest sleeping through the night.
- **LEAN** — DONE (Build 42): the performance build Austin asked for
  after the console's 15 fps. Same picture, less work: the far skin
  drawn in frustum-culled runs, the shadow map re-rendered only when
  it would differ, god rays drawing only what can cover the sun, CPU
  copies of geometry dropped once uploaded (heap halved). Next levers
  if the console still chugs on its preset: merge chunk draws, merge
  entity part meshes, a smaller shadow map at low render scale.
- **THROUGHPUT** — DONE (Build 43): the console is parked (Austin's
  call). For the PC: the mesher rid of its sky and ruin lookups (2.8x
  on city chunks), eight workers with column affinity, chunks drawn
  merged in arenas (845 draws → 56), static props merged per material,
  the stamp freeze gone. Next levers if cities still drag: villagers
  as one draw, power-node labels only when near, a coarser first pass
  for the far ring when moving fast.

## The City Arc (brainstormed with Austin 2026-09-10, in my order)

Every one of these is a building with a desk in it, so the first one
is the foundation for the rest. One spine under all of them: a per-city
economy index (sieges, your businesses, what you buy and sell, the
region's wattage) that prices, shop income and the exchange all read,
so the city's economy is one thing that reacts to what you do.

6. **COUNTERS** (Austin's) — DONE (Build 44). Traders stop wandering: every trade is a
   real shop with an interior, a counter and a named keeper behind it
   (the electrics shop with its wares on display, the arms dealer, the
   tool shop), the mayor gets an office, the station gets a ticket
   booth with a clerk. Pedestrians keep wandering as filler, between
   shops and places, and do not trade.
7. **THE PRESS + THE EXCHANGE, with THE PHONE** (Austin's, with my
   changes) — DONE (Builds 45 and 46).
   A newspaper shop: two coins for today's paper, printed
   from what the world did (sieges, warlords killed, villages found,
   your deeds as headlines, the survey of the deep), tomorrow's weather,
   and stock tips. An exchange building, a busy floor of brokers, and a
   real market: six to eight companies typed by risk (steady risers with
   small moves, volatile movers with big swings, one dog that trends
   down but pays a daily dividend), moved by events the paper prints
   the day before at about 70% reliability, and moved by the world (the
   mining company follows the ore you sell, the power company the
   region's wattage, the dealership jumps when you buy a car, a siege
   knocks every company in that city). Never random. The stock sheet:
   prices, today's change, a 30-day line per company, who is on top.
   The phone: one craftable item with apps -- STOCKS, NEWS, BUSINESS,
   CALL (a crew member to you, a cab to you) -- and it rings you: a
   siege starting, crew in trouble, a headline about you.
8. **THE PIT + MONUMENTS** (Austin's, with mine) — DONE (Build 47). A gladiator arena, a
   bowl with stands, tiers of opponents from what already exists
   (lurkers, husks, stalkers, fort minibosses, scaled up), a bookmaker
   so you can bet on yourself, a champion's belt worth a lot of coin
   and city rep. Monuments: the city raises a statue to your deeds in
   the plaza with a plaque (champion, siege breaker, the survey of the
   deep), and the paper prints it. The show-off for a city completed.
9. **THE BANK** (mine) — DONE (Build 48). Deposits that survive death, interest by the
   day, loans to buy a shop or a car. Default and the collectors come,
   as a raid.
10. **OWNERSHIP** (Austin's) — DONE (Build 49). Buy a shop once the keeper's goodwill is
   high enough: income at the till, supplies and wages out, read from
   the city economy so a siege hurts your shop too. Sell once a day to
   a buyer who makes an offer you can raise, lower or decline. Managed
   from the phone's BUSINESS app.
11. **THE CASINO** (Austin's) — FIRST SLICE DONE (Build 50: blackjack, dice, the wheel with the car). Blackjack, dice, and the item wheel
   with a sports car jackpot first; poker against AI players as its
   own later slice, built properly or not at all.
12. **THE TRACK** (Austin's) — DONE (Build 51). A stamped circuit outside the city with
   checkpoints, AI drivers that follow it, lap timing and positions.
   Race for coin, or bet from the stands on a race that runs without
   you. Classes: sports car, bike, hoverbike.
13. **THE CONTRACTOR** (mine) — DONE (Build 52). Cities post carve-to-spec jobs: a
   foundation pit, a canal between two points, a road cut through a
   rise. Scored by volume against the requested shape (the SDF measures
   it exactly), paid by tier. The job only this game can offer.
14. **THE CARTOGRAPHER** (mine) — DONE (Build 53). Buy maps of country you have not
   walked, marked with falls, villages and forts; sell your own survey
   for coin.
15. **THE MAIL CAR** (mine, on THE LINE) — DONE (Build 54). One car on the train carries
   coin and ore. Guard it for pay, or rob it and answer for it with the
   city.

Slotted between the city builds as the mood takes me:
- **FARMING** (Austin's) — DONE (Build 55). A hoe, seeds, water you can carry and set
  down, crops (tomatoes, wheat, lettuce), and meals that are the potion
  system: a burger or a plate of spaghetti gives speed, dig speed,
  jump, invisibility, for a while. The grain mill (a wheel by a fall)
  comes with it.
- **THE CREW D** — DONE (Build 56). Crew in vehicles: a follower takes the passenger
  seat of your car, boat or plane; give them a vehicle and they drive
  their own behind you; other crew ride with them. A squad on the road.
- **THE MENAGERIE** (Austin's) — DONE (Build 57). Creature spawners. In creative,
  craft a "<creature> spawner" for any living thing and set it down. In
  survival, a creature grabber gun: right click any living thing and
  it becomes a spawner in your pack -- animals in a moment, enemies
  over a few seconds of holding the beam, bosses over a long and
  dangerous while, villagers only once you have the goodwill to hire
  them. What comes back out is the same one that went in: the mayor
  keeps his goodwill, his trades and his pockets; a crew member keeps
  their bag. (The record travels inside the spawner item: house key,
  crew record, entity fields.)
- **THE DEEP, slice B** — DONE (Build 59). The second hall behind the
  fall, lit by its own fungus, the nest, the works' drift, THE KNOCKER
  at the end of it (the knock was it), the knocker's hammer, the way
  back up (a shaft to dry ground, a rope, a coal-fed winch), page 10 in
  an older hand. Left for later: what the Knocker was guarding under
  the floor; the deep's own villagers.
- **SCULPT II** — DONE (Build 58). The sander (shift + right with the
  trowel: a smoothing op in the field), radial symmetry (hold K + a
  digit, every tool repeated n-fold, combinable with the mirror),
  brushes from blueprints (BRUSH in the blueprint screen: the drill
  carves its negative, the dispenser lays it), the path made by
  walking (R with the bore records your walk, right click lays a
  cut-and-fill track along it). Left for later: a sander that reads
  the surface's curvature rather than a fixed kernel; brushes that
  carry props.
- **THE GARRISON** — SLICE A DONE (Build 60): the bases on the
  highways, the soldiers, the alarm and the siren, the radar as the
  stealth route, the commander and the vault with its part, the taking.
  **Slice B** DONE (Build 61): tanks that patrol the highway and shell
  you on the alarm (craters, walls), crewed till they die and burning
  into a part; the tank kit from three parts, drivable, its gun on
  the left button. **Slice C** DONE (Build 62): the gunship on the pad
  that lifts on the alarm, orbits and strafes, and burns into a part;
  your own gunship; the jet with its cannon, missiles, rolls and loops;
  jet fuel from the quartermaster of a taken base and nowhere else.
  THE GARRISON is complete.
- **THE PLAYTEST OF 2026-09-19** (Austin's report on Builds 44-62), in
  the order I will build it. Bugs first: a broken game is no fun.
  1. **Build 63 -- FIXES I, the blockers** (DONE). Every menu closes on E and
     Escape (phone, paper, pit, booth, casino, bank, exchange, chart,
     race); the fists never grab a vehicle you are driving (gunship,
     jet, all of them); the tank fires where its turret points and
     third person orbits with the mouse in every vehicle; the race car
     is visible; creative is one to one with survival (fort raiders,
     train raiders, sieges: everything that spawns, spawns); the sliver
     between two adjacent cube holes.
  2. **Build 64 -- THE LOADING SCREEN** (DONE). A world does not hand you the
     controls until the ground under you and the near field are
     meshed; the player is held, not dropped, whenever the chunk under
     their feet is missing (the fall into an LOD cave); the new-world
     crashes hunted.
  3. **Build 65 -- THE FAR FIELD III** (DONE; the snow-mountain mismatch not reproduced, see DEVLOG). Villages, forts, ziggurats,
     camps and garrisons drawn as true shapes at range before they are
     stamped, so they never pop; garrisons and forts on the map; the
     LOD ground that does not match the mesh under your feet (the snow
     mountain).
  4. **Build 66 -- CITIES II** (DONE, for cities laid from now on). Smaller cities; one tower, the one you
     can buy; every keeper (mayor, cartographer, exchange, press,
     electrician, casino, and the rest) in a building of their own on
     their own lot; the centre unblocked.
  5. **Build 67 -- SOUND II** (DONE). Explosions that boom, guns that crack;
     several music tracks in different styles and tempos that hand
     over as one ends.
  6. **Build 68 -- VEHICLE SKINS** (DONE). Pixel textures for the tank, the
     gunship and the jet, and a pass over the others.
  7. **BIOMES, an arc.** A (DONE, Build 69): jungle and swamp (mud, jungle and mangrove wood and planks); B (DONE, Build 70):
     taiga and tundra and savanna; C (DONE, Build 71): animals by day and enemies by
     night, per biome; D (DONE, Build 72): each biome its own ground,
     peat, amber, cocoa. THE BIOMES ARC IS COMPLETE.
- Then the Space Arc: LIFTOFF A (DONE, Build 74): the Moon, the rocket,
  the crossing, the space suit, two worlds in one save. LIFTOFF B (DONE,
  Build 75): lunite, abandoned moon bases, dust crawlers, the Dust Wyrm,
  the mech suit.
- **THE MOON, finished** (Austin's 2026-09-20 playtest: no bugs; ideas).
  The Moon is the grind on the way to the alien planet, not a second
  Earth, so it gets exactly this and no more for now:
  1. **MOON TIERS** (DONE, Build 76): three moon ores, each a tool tier past
     diamond (drills, dispensers, swords, helm/plate/boots): **selenite**,
     common and near the surface, the step up from diamond; **lunite**,
     the second, the mech suit's metal, with its own set; **astrium**,
     rare and deep, the best there is, and the metal of the upgraded
     rocket. Diamond caps the smallest a shape can be; the moon tiers
     only go bigger (10, 12, 16 m).
  2. **MOON DEPTHS** (DONE, Build 77): lava tubes, the Moon's caves, with the
     veins in their walls and skylights down into them; two more
     structures to find: the crashed lander, and the drill rig over a
     shaft into a tube.
  3. Then STATION ONE. A (DONE, Build 78): the station as a third world,
     the route through it, zero-G, the cast in their shops speaking
     their own tongue. B (DONE, Build 79): the translator from the
     leader's hand, six trades with alien goods, the leader's story and
     two missions ending in the leader's word. STATION ONE IS COMPLETE.
  4. STATION TWO & THE CROSSING. A (DONE, Build 80): the site past the
     Moon, four frames to fill by hand, plating craftable, the star
     rocket for eight astrium. B (DONE, Build 81): THE CROSSING: the
     star rocket from the site toward the alien world, the ambush (the
     boss behind, the black hole, the station lost, Vehl on your hull),
     the crash landing, the wreck and its repair, the alien world's
     first version (the Earth's field in violet, nothing of ours on it).
     Still owed from this chapter: the **teleport bands** (Vehl's
     parting gift: fast travel to any beacon or spawn on any world).
- **After the 2026-09-22 playtest** (Austin: 76 to 81, no bugs, a page
  of notes). The alien planet is named **STRATA**: the game is named for
  where it ends. Claude's order:
  5. **THE BAND & THE FALL** (DONE, Build 82). The crash retold Austin's way:
     the boss appears first and haunts the rocket, turns to the station,
     raises its hands, a black hole that looks like one (a swirling disc
     with a bright rim) takes the station and then the ship; Vehl
     teleports in beside the hull; a second teleport sound; the alien
     world's loading screen; you load in standing, in third person,
     looking at an empty sky; the teleport effect, and the rocket
     appears in the air and falls the way it already does. Vehl at the
     wreck: "experimental teleport technology", and the **teleport
     band**: with it in the pack, M marks every beacon and every rocket
     on every world; click one, confirm, and a loading screen later you
     are there. Beacons become fast-travel points anywhere.
  6. **STATION TWO, PRE-BUILT** (DONE, Build 83). The site redone: a set layout
     shown see-through, three alien builders standing outside it. The
     first takes materials for a main section and it builds itself;
     main sections first, in order, then the road on as before.
  7. **STATION TWO, LIVED IN** (DONE, Build 84). After the main sections: the
     first builder sells upgrades (benches, stoves and weapon benches;
     a wired grid with lights; a penthouse of your own); the second
     sells pre-built rooms that attach and takes any villager spawner
     (village, city, alien) to put them in a room, where they live and
     roam the built sections; the third sells pens and aquariums that
     attach and takes animal spawners.
  8. **STRATA, an arc.** A (DONE, Build 85): its own generator, nothing
     of the Earth's in it: warped, ridged, stepped, sculpted land with
     overhangs, caverns and spires; the Glow, the Scar (with the blight)
     and the Teeth, their grounds, and voidore.
     B (DONE, Build 86): the maws, one per country, that bite when you
     mine them too close; drill, stab or shoot them dead for their
     stalk, planks and sticks; a crafting table per planet.
     C (DONE, Build 87): war-torn: thralls and gnashers all day (melee,
     no fear of light or dawn), lancers and hollows at night (all
     ranged, hard as nails), loot better than anywhere, and the null
     core they carry. D (DONE, Build 88): the centre, a bowl and a spike
     of nullstone; the seal that takes six null cores; THE UNMAKER,
     which unmakes the ground under you; the null heart; the ending.
     The arc is closed: the game has an end now, and goes on after it.
     (Build 89 fixed what the playtest of 76 to 88 found: the seal is
     marked and explained, Station Two has an airlock and vacuum outside
     its built sections, the tables craft as tables.)

After the 2026-09-24 playtest (76 to 88): Austin's ideas, in the order I
want to build them.
  9. **The planet view** (map) (DONE, Build 90). A button on the map opens a second map:
     stars, the sun behind, and the planets' sky-sprites laid out Earth,
     Station One, the Moon, Station Two, Strata. Click one to open that
     world's map (as far as you have it); the band teleports to any
     beacon or rocket on any of them from there. The same view is the
     rocket's destination picker: space in the seat opens it, click a
     world, the rocket flies (R's cycling goes away).
 10. **Every planet in every sky** (DONE, Build 91). The Earth, the Moon and Strata drawn
     as sprites in every world's sky and through the rocket's window in
     transit, sized by how far they are from where you stand (a small
     Strata over the Earth; a small Earth over Strata). Stations are too
     small to see.
 11. **STRATA E: wilder, and the ichor** (DONE, Build 92). Terrain with sudden elevation
     everywhere and stranger mountains than the teeth; a water analog,
     green, that burns anyone swimming in it and carries boats and
     hoverbikes fine, in erratic rivers found nowhere else.
 12. **STRATA F, G, H: structures.** Many. The common one is the ruined
     alien village (F, DONE, Build 93), what the Unmaker left of Vehl's
     people (the ones on the stations are the ones who got out). Then (G, DONE, Build 94: the vaults, THE KEEPER, the relic) loot structures with
     their own bosses and endgame loot, to gear up for the centre. Then
     (H, DONE, Build 95), after the end, the villages rebuilt for a
     relic each and lived in: an elder, a trader and a weaver home, with
     the lamps to light, the war's leavings to trade, and the way to the
     next vault to buy. All four of the 2026-09-24 ideas are built.

After the 2026-09-26 playtest (89 to 95): fixed in Build 96 (the seal
opens by right click; the far planets smaller and the flights showing
the sprites; the burrower moved to Strata and rare). And:
 13. **Animal breeding** (DONE, Build 97). The passive animals (grazers, sheep, the
     biomes' own) follow plant food held in the hand (what you grow,
     never meat); feed two of a kind and they come together and a baby
     of that kind appears; it grows, and can be bred in turn. Never the
     enemies.

After the 2026-09-27 playtest (96 and 97): fixed in Build 98 (Strata's
stutter, a boss frozen after a reload, the crops in creative, the
cities' ghost LOD, breeding at a minute and a half). And, in the order
I want to build them:
 14. **Fences and gates** (DONE, Build 99). A fence piece that joins to its neighbours
     and a gate that opens like a door; a wall the animals cannot cross
     or jump, and you can. Pens at last.
 15. **Springs** (DONE, Build 100). Water you can place: dig one with a SPRING STONE (a
     crafted item set in the ground) and it wells up into a source that
     never runs dry, for the can to fill from; a LAVA SPRING and an
     ICHOR SPRING the same way, from their own stones. (Austin asked for
     a way to make water; a bucket is the boring answer.)
 16. **The sprinkler** (DONE, Build 101). A tesla coil for crops: powered, and fed water
     (a can set in it, or a tube from a spring or any water), it sprays
     every plant in a wide ring on a beat, with the animation to match.
     With a spring, a tube, a generator and a crafter, a farm runs
     itself.
 17. **Farmhands** (DONE, Build 102). A villager of yours with the goodwill for it takes
     a watering can and waters what is dry as they pass; seeds, and they
     plant the empty rows; a hoe, and they harvest what is ripe into
     their own pack (or onto the ground when it is full).
 18. **Pets** (DONE, Build 103). A baby you feed three times as it grows is yours:
     it gets a name, follows you, shows on the map, and rides the
     rocket in a crate. A grazer of your own on the Moon.
 19. **The sound of Strata** (DONE, Build 104). Every world has the Earth's
     birds. Strata should have its own: the ichor's hiss, the maws
     creaking, a wind with a note in it, and nothing at all at the
     centre.
 20. **Ichor fishing** (DONE, Build 105). Something lives in it. A rod cast into
     the ichor brings up things that are not fish, and one of them is
     worth a great deal to Sova.

After the 2026-10-01 playtest (99 to 105, no bugs in the new work):
fixed in Build 106 (the hole under you in flight, bodies that keep out
of each other, fences that hold, farmhands that wait for ripe). And,
in the order I want to build them:
 21. **Fence building** (DONE, Build 107). A preview of the piece where it will stand;
     the preview snaps its end to the end of the piece beside it, and
     from that snapped joint the scroll wheel turns it freely, so two
     pieces meet at any angle and stay joined. (Austin.)
 22. **Hoed ground is ground** (DONE, Build 108). The hoe does not lay a flat patch on
     the ground; it turns the ground you point at into tilled earth
     (a material, painted on the existing shape) and the crops grow
     out of it wherever the surface is, each stalk at its own height.
     Farms on a hillside, or any shape you carve. (Austin.)
 23. **Liquids are materials** (DONE, Build 109; lava places but does not flow). The drill cuts a shape out of water,
     lava or ichor and the cut does not refill; the liquid lands in
     your pack like any material; the dispenser places it in a shape
     that does not flow. The spring, lava and ichor stones become the
     source placers: the same ghost, shape, size and click, but what
     they place flows, out to the level it stands at, without limit.
     Ctrl-Z undoes a placed source; the wrench selects and deletes
     liquid edits like any other. (Austin's "crazy idea"; it is a
     good one, and the biggest change on this list.)

After the 2026-10-05 playtest (106 to 109): fixed in Build 110 (liquid
shapes on the metre cells, liquids to the ceiling, lakes that meet their
walls, the ghost shadows over cities). And, in my order:
 24. **Strata's own tiers** (DONE, Builds 111 and 112). Four ores of Strata's own, each with its
     drill, dispenser, sword and armour, above astrium (twelve tiers in
     all). Earth's ores leave Strata. Strata's coal burns twice as long,
     makes MEGA TORCHES (their own colour, seven times the light) and a
     HEADLAMP (a light where you look, worn, never runs down). The first
     Strata ore makes the GREAT STOVE: faster, and five smelts at once
     on one fire (on top of what power already does). (Austin.)
 25. **The speed curve** (DONE, Build 111). The instant mine and instant place move from
     diamond to the top Strata tier; every tier between stone and it
     steps up evenly; stone stays as it is. (Austin; waits on 24.)
 26. **Abilities by tier** (DONE, Build 113). Stone resizes and nothing else; the tiers
     add what the tools do: rotation in every axis by diamond, the
     mirror at astrium, something new at the top of Strata (my pick,
     see below). (Austin.)
 27. **Shapes by tier** (DONE, Build 113). Austin's order (2026-10-07), one a tier from
     stone: cube, sphere, cylinder, straight STAIRCASE, SLAB (a half
     cube), cone, DOME (a half sphere), SPIRAL STAIR, PYRAMID, ARCH, and
     the FULL BUILDING (a hollow box with a roof and a door cut, in one
     click) at nullite, and THE TOWER at vehlite (a round hollow tower,
     a spiral stair inside, battlements and a door, one click; my pick,
     Austin left the twelfth to me). ECHO stays vehlite's ability. The candidates that were offered:
     Stone makes only the cube; every tier unlocks
     one more shape, for the drill and the dispenser alike. Austin picks
     the master list and its order from these candidates (mine and his):
     sphere, cylinder, cone, STAIRCASE (walkable, a fixed rise a step),
     WEDGE (a ramp or a roof), PYRAMID, dome (a half sphere), ARCH
     (a doorway or a bridge, the round top of a tunnel), TUBE (a hollow
     cylinder: wells, towers, pipes), HOLLOW BOX (a room in one click),
     slab (a floor), torus (a ring), hex column, frustum (a stepped
     pyramid's tiers), capsule (a round-ended tunnel), SPIRAL STAIR,
     octahedron (a crystal).
     For the top-of-Strata ability I want ECHO: the shape repeats along
     the way you look, a count you scroll, one click for a colonnade, a
     row of windows or a flight of piers.

Small things I want, slotted wherever a session has room:
- **Hearths** (DONE) — warm window light in village houses after dark,
  chimney smoke at dusk.
- **Shadow cascades** — a sharp near shadow map and a wide far one, if
  the HORIZON playtest says the near shadows read soft.
- **Place names on the map** (DONE, Build 73) — regions named in their
  archetype's voice, on the HUD and the map.
- **The lighting line in the skin** — measured and fixed in Build
  33.1 (the near field's occlusion sampler reads a scaled SDF and sits
  at 0.70 on open ground; the skin now carries the same curve). Left
  open until a playtest confirms the flicker at the edge went with it.
  A later question: fixing the sampler's bias at the source would
  brighten the whole near field by a quarter, a look change to decide
  on purpose.
- **Frame rate** (Build 32 playtest): 60 to 70 standing still, dips to
  about 40 flying in creative or loading a city the first time. Worth
  a profiling pass once the queue above is shorter.
- **Footsteps that know the material** (DONE, Build 73); birds along
  rivers; fish in the shallows.

## Build 1 — Core carve/place (DONE)
Superflat rock world + bedrock. Drills + dispensers, all 5 tiers, sphere/cube
brushes, grid snap, fly, 40-slot inventory, main menu, world list with seeds,
save/load. See CLAUDE.md "Definition of done."

## Build 2 — World feel (DONE, incl. 2.1 patch)
- Seeded terrain: biomes (plains/hills/mountains/desert), grass/sand/rock.
- Caves: spaghetti tunnels + deep caverns, surface entrances, unique shapes.
- Bedrock at -64; ore veins (iron/ruby/obsidian/diamond) by depth band.
- Mining yields by volume; dispenser consumes; crafting tier progression (Q).
- Tiling grid snap, shared tool shape/size, dispenser slot with auto-equip,
  V/B ghost distance, anti-slide.

## Build 3 — Depth & Feel (DONE)
The world gets dark, loud, and juicy; the tools get their full kit.
- **Lighting**: darkness underground (skylight falls off with depth), player
  headlamp radius, ore shimmer in the dark, fog fades to black at depth.
- **Audio** (procedural Web Audio, no assets): drill hum pitched by tier and
  charge, break crumble, place thunk, footsteps by surface material, UI
  clicks, deep-cave ambience. Volume in Options.
- **Particles**: debris burst on break (colored by removed materials), dust
  on place, chips while drilling.
- **Drill/dispenser kit**:
  - Mine/build time scales with shape volume and material hardness
    (grass fast, obsidian slow); mining nothing-but-air is free and skipped.
  - Paint mode (R with dispenser): repaint existing solid to the held
    material without changing geometry.
  - Pick material (middle click): select whatever material you're looking at.
  - Undo (Ctrl+Z): pop the last edit, refund/return materials.
  - Cylinder brush (third shape in the right-click cycle).
  - Cube yaw rotation (hold G + scroll, 15° steps, free-place mode only —
    grid mode stays axis-aligned so tiling never breaks).
  - Dispenser orb shrinks with the held stack and flashes red when short.
- **Navigation**: coordinates readout + compass arrow to spawn.

## Build 4 — Survival layer (DONE, incl. 4.1–4.3 patches)
- Creative/survival mode toggle at world creation.
- Health, fall damage, hunger or equivalent; death drops your stuff where
  you died (the world's geography starts to matter).
- Day/night cycle (extends the build-3 lighting), darkness as danger.
- Enemies + animals with spawning rules (dark spawns underground); guns.
- Torch/light-source item — doubles as cave breadcrumbs.

## Build 5 — Water & world depth (DONE incl. 5.1–5.3.1, wrench in playtest)
- Water scoped to real lakes; swimming, breath, underwater overlay.
- Ruins + loot, beaches/snow, beacons→beds as spawn anchors, sheep/wool.
- Sky: sun/moon/stars/3D clouds; stove furnace, ores→ingots, coal,
  lightbulbs, meat/eating, lurkers burn in daylight.
- Exact removal (no membranes), per-axis sizes + 3-axis rotation.
- **The Wrench**: select/resize/move/hollow/delete/paint existing edits.
- 5.3.1: phantom collision fix, creative catalog + free crafting.

## Build 5.4 — The editor completed (wrench II)
- Multi-select: shift-click adds edits to the selection (builds or holes).
- Copy / paste / delete / drag-move whole selections; paste shows a ghost
  of the full selection before committing.
- Blueprints: save a copied selection under a name; stamp into any world.
- Whatever the wrench playtest turns up.

## Build 5.5 — The shader pack (DONE)
Real sun shadow-mapping (trees/builds/terrain cast, PCF, day-tracking),
per-vertex SDF ambient occlusion, god rays, drifting cloud shade, far-terrain
horizon to ~1.6km, render distance to 256m full detail, FPS cap slider.
5.5.1: far terrain rebuilt as 7-level geometry-clipmap LOD rings (1m→64m
cells, 4km horizon), triplanar-textured + shadowed like real terrain, with a
chunk-coverage mask so the LOD always meets loaded geometry exactly.

## Build 5.6 — Hands & a living surface (DONE)
- Surface decor: grass tufts, flowers, shrubs scattered by biome.
- Empty hand = fists. RMB toggles fists up/down. Fists up: LMB punch
  (small damage). Fists down: LMB picks up decor — and animals; carry
  them overhead, LMB throws.
- Photo mode (creative): free camera + time-of-day slider.

## Build 6 — World Gen 2.0 (DONE)
Playtest verdict: at 4km visibility the terrain pattern visibly loops, and
caves die out before they get interesting. This build jumps the queue —
villages, raids, and bosses all need a world worth putting them in.
- **Macro-regions**: big biome cells (~400–800m, warped borders), each
  committing to an archetype — plains, sharp ranges, mesa/canyon badlands,
  dunes, swamp, glacier, volcanic fields. Region borders become landmarks.
- **Landmarks**: rare one-per-region set-pieces — volcano cones with lava
  craters, giant sinkholes into the cave layer, box canyons, crater lakes,
  monolith spires. Heightfield-expressible so the LOD rings carry them.
- **Lava**: new material — emits light, burns, and forms obsidian where it
  meets water. Volcano craters and the deep world both use it.
- **Cave networks**: per-region graph generator — chambers as nodes (pockets
  to cathedral caverns), winding tunnels as edges, vertical shafts and
  spiral chimneys for fast descent. Guaranteed length, intersections,
  branches, and multi-exit rooms; noise caves stay as filler. You should be
  able to get properly lost.
- **Deep world**: bedrock drops far lower (~-250); new strata by depth,
  richer ore lower, lava galleries near the bottom.
- **Underground biomes**: glowshroom forests, crystal caverns (light-emitting
  crystal), flooded galleries, the lava zone — depth readable at a glance.
- **Wayfinding**: surface auto-map screen (explored-fog); caves stay
  unmapped and scary. Depth readout. Rope anchor for early descent.

## Build 6.5 — what you see is what you place (DONE)
Real-time real-model previews for every placeable (props, plants, rope,
door) and a solid world-tiled material preview for the dispenser. Outlines
survive only on the drill and paint mode.

## Build 7 — Electricity (analog power, not redstone)
Power is continuous wattage, not on/off — machines scale with supply, no cap.
- **Phase A — the network (DONE)**: wires, switches (levers), live power
  meters. Sources: hand crank, water wheel (needs real water), coal
  generator. Wired bulbs live and die by their circuit; powered stoves
  smelt up to 3×. Camera drone shipped early (45m tether, battery,
  charges near a surplus grid). Still to come: animal/enemy crank.
- **Phase B — machines (DONE)**: auto-crafting table (full catalog, crafts
  while powered, real buffer inventory), boosted stove, hoppers + item
  tubes feeding stoves/crafters, and the powered elevator platform.
- **Phase C — exotics (DONE)**: generator mk2 (100W), tesla coil (wireless
  power in 8m with coil-to-coil relaying; zaps the careless), animal crank
  (~10W, forever).
- **7.1 — polish from playtesting (DONE)**: thin-slab collision fix
  (substeps + thin-aware contact filter), redstone-style staple wiring
  (stapler/spool viewmodel, chained RMB runs, taut straight lines),
  all machines open menus over the full inventory, shift-click quick
  move, generator fuel slots, chests + tube storage.
- **7.2 — rotate + wrench-everything (DONE)**: scroll rotates every
  placement preview (staples twist on their normal), chests resize with
  scroll (size = storage, 8–64 slots), the wrench selects/moves/deletes
  every prop with refunds, multiselect + copy/paste/blueprints carry
  props and their wiring.
- **Camera drone**: photo mode for survival, with a body — a buildable or
  buyable drone you charge on the grid, keep in your inventory, and hold to
  pilot. Range-limited; your body stays standing while the drone flies.
  Under the hood it's the existing photo mode with a new shell and rules.

## Build 7.5 — The player has a body (DONE)
- F5 third person with SDF camera collision; round-head player model,
  walk/crouch/air animation, held-item display, 5 skins in Options.
- Armor: helmet/plate/boots per ore tier (15 pieces), armor row in the
  inventory, tiered damage reduction (60% cap), visible on the model;
  armor stand stores + displays a set.
- Jetpack (back slot, hold-space flight, fuel HUD) + grid-powered
  charging pad; grappling hook (34m reel-in).
- Base decor: item pedestals, editable signs.

## Build 8 — Coins & villages (the world gets people) (DONE)
- **Coins**: enemies drop coin instead of materials (mining stays the
  material economy); bosses drop piles; quests and treasure pay out. Coin
  is the invisible XP — no bar, progression IS purchasing power. Coin
  sinks must scale (tier-5 gear, houses, eventually the car).
- **Chests**: container prop (villages, loot, player storage).
- **Villages**: generated settlements (structure stamps via the blueprint
  engine) with traders — arms dealer, toolsmith, mad-scientist electrician,
  ore broker (buys/sells ore at a spread, converting mining into money).
- **Goodwill & missions**: per-villager reputation gates trade tiers.
  Mission types: hunt a target, steal from a neighbor (opposed reputations
  — thief route vs upstanding route), and EXPAND THEIR HOUSE from a
  schematic — a paste-ghost outline showing material costs, verified
  against the SDF when built. The wrench engine becomes quest
  infrastructure.
- **Bounty board**: rotating kill/explore/deliver contracts — repeatable
  coin income, a reason to revisit every village.
- **Treasure maps**: bought from villagers; X marks buried loot via the
  compass.

## Build 9 — Arms race (DONE)
- Weapon table: crafted at a crafting table, requires power to operate.
- Gun arsenal (real-model-inspired, renamed): full-auto AR, SMG, semi-auto
  AR, handgun, heavy pistol, sniper, RPG, laser rifle, gatling, laser
  gatling. Guns costly, ammo cheap (coins make the economy work).
- Explosives: TNT + shaped mining charges (blast-carve spheres). RPG and
  explosions carve real craters — CSG subtract as a weapon.
- Raids: your power grid attracts enemies at night — more watts, bigger
  raids. Gives guns a target and bases a reason to be defended.
- **Raid bases**: walled forts and whole enemy towns to clear — better loot
  behind higher difficulty, a miniboss holding the vault key.

## Build 10 — Bosses & endgame (DONE)
Every STRATA boss does something only a CSG world allows. Unique unlock
drops, not just loot.
- **The Burrower**: a worm that carves real tunnels as it hunts you, deep
  in the cave layer. You hear it before you see it; the arena is destroyed
  as you fight. Drop unlocks the jetpack core / auto-tunneling drill mod.
- **The Warden**: raid-town vault golem built from terrain materials —
  damage blasts mineable chunks off it; it heals by eating the ground,
  carving craters around itself.
- **The Magma Tyrant**: volcano crater arena; lava bombs union actual lava
  onto the battlefield, flooding your footing as you terraform to survive.
- **The Architect** (endgame): fights with your own verbs — stamps walls,
  carves pits under you, and replays corrupted copies of structures YOU
  built in that world (it reads the edit list). A mirror match against the
  editor itself.
- Music + audio expansion; options expansion; perf pass (worker meshing
  via blob if continuous mining needs it).

## Build 11 — Cities & vehicles (DONE)
STRATA buildings are box CSG, so distant skylines LOD almost perfectly —
cities are feasible where block games choke.
- **Tier 1**: rare mega-cities (one per several km) — road grids, towers
  from procedural floor/facade modules, explorable interiors, shops on the
  village trade system, quest givers, places to buy food.
- **Tier 2**: pedestrians with simple schedules, light traffic.
- **Tier 3**: ownable property (the ultimate coin sink) and the ELECTRIC
  CAR — buyable in the city or buildable at home, charges on your grid.
- **Rails & trains**: powered lines between settlements and bases — fast
  travel you BUILD, not teleports.

Rule: no phase starts until the previous phase's mechanics feel right in
playtest.


## Build 12 — Playtest fixes & performance (DONE)
- **12.1**: real in-car camera (first person at the wheel, GTA chase cam
  with a seated third-person model), detailed cars with interiors +
  analog gauges, mega-city overhaul (4x+ footprints, tighter spacing,
  4m story headroom), the teleport drone, gun crosshair, sniper scope.
- **12.2 — the performance build**: dual contouring moved into a Web
  Worker pool (~16x chunk throughput, bit-identical geometry), mesher
  surgery (spatial edit index, memoized height grids, zero-alloc
  scratch), pixel-ratio cap + RENDER SCALE option, throttled markers.

---

# THE BUILD ORDER FROM HERE

Everything below is scheduled. Builds 13–21 finish Earth; 22–25 leave it.
The rule stands: no phase starts until the previous one feels right in
playtest.

## Build 13 — THE HORIZON (streaming & LOD 2.0) (DONE)
The top complaint and the top priority: the world still arrives too
slowly, and what you see at distance lies to you. 12.2 made meshing 16x
faster; this build makes the *pipeline* fast and makes the far view
honest. Nothing else ships until this does.

- **Phase A — streaming that keeps up.**
  - Priority by where you're LOOKING, not just distance: chunks inside
    the view frustum stream first, then the ring behind you. Nothing
    should ever pop in directly in front of your face.
  - Predictive prefetch along your velocity vector (walking, driving,
    flying, and especially the car and rails).
  - Chunk mesh cache: chunks that scroll out keep their geometry until
    memory pressure evicts them, so backtracking is instant.
  - Cheaper columns: the 46-chunk vertical stack per column is mostly
    empty air/solid rock — early-out on trivially-uniform chunks before
    they ever reach a worker.
  - City stamps cached per city (generate the edit list once, reuse it)
    so walking back into a city costs nothing.
  - Progressive detail: a chunk can come back coarse first and refine —
    ground under your feet is never missing.

- **Phase B — the LOD tells the truth (geometry, not heightfield).**
  The current far rings are a heightfield clipmap; a heightfield
  *cannot* represent a cave, an overhang, a hole you dug, or a
  building. That's exactly why flat ground opens into a cave in your
  face. Fix: a real coarse-voxel mesh ring between full detail and the
  clipmap — the same dual contourer at 2m/4m voxels, run on the worker
  pool, fed the same edit list. Caves, sinkholes, canyons, YOUR holes
  and YOUR builds all appear at range, in the right shape, just coarser.
  - Cave mouths and overhangs read correctly from any distance.
  - Player edits (your house, your tunnels, your pits) survive into
    every LOD level in view.
  - The transition LOD -> full detail changes crispness only. Never
    topology. No more false ground.

- **Phase C — the skyline.**
  - Whole cities render at range: every tower in view present as a LOD
    box-cluster with facade texturing, so a mega-city reads as a
    mega-city from a mountain 2km away.
  - Building impostors are near-free — STRATA towers are box CSG, so
    the LOD is literally their own boxes at lower detail.
  - Villages, ruins, raid forts, rails and roads get the same
    treatment.

- **Phase D — squeeze pass 2.** Frustum + occlusion culling for props
  and entities, instanced decor/props, entity update LOD (distant NPCs
  tick at low rate), shadow-map cost scaling with render distance, and
  a live perf overlay (F3) showing chunk queue depth, worker use, and
  frame breakdown so future regressions are visible.

## Build 14 — MENUS & MAKING THINGS (DONE)
Quality of life the whole game leans on.
- **One inventory for both modes.** The creative catalog is deleted —
  creative simply crafts everything for free from the normal crafting
  screen. Same inventory, same crafting UI, survival and creative, no
  parallel menu to maintain (and no more "the car isn't in creative").
- **Craft any amount.** Six buttons: MAX (everything your materials
  allow) / 1000 / 100 / 50 / 5 / 1, a vertical slider from 1 to 100,000
  beside them, and a type-in box for an exact number. On every crafting
  station, including auto-crafters.
- **Categories, including VEHICLES.** Crafting gets proper tabs — tools,
  weapons, power, decor, and a new **Vehicles** tab that will hold the
  car, sports car, motorcycle, boats, plane, hoverbike and rocket as
  they land. Rails and vehicle parts get homes too.
- **Reach.** Blueprint ghosts, paste ghosts and the drill/dispenser
  shape all push far out and pull back on the same controls, over a
  much longer range — so you can put a whole copied build out in front
  of you and line it up from outside instead of standing inside it.
  Distance readout while you drag.
- Inventory polish: search box, sort, and the vehicle sub-menu hook
  that Build 15 fills in.

## Build 15 — STORED POWER (batteries, pads, and a grid that makes sense) (DONE — rail battery boxes deferred)
Charging a car by wiring it near a light bulb is nonsense. Power becomes
portable.
- **Batteries** — low / medium / high capacity, each a real item with
  escalating material cost. They are the game's portable energy.
- **The battery charger** — a powered bench; right-click to slot
  batteries in and they fill from your grid over time. Bigger cells,
  longer charge.
- **The charging pad** — a wired platform big enough to drive onto. Park
  a vehicle on it and it charges. Wire it like any other machine, watch
  the meter, done.
- **Vehicle menu.** Opening your inventory while in a vehicle shows the
  vehicle's own panel with a battery slot (and cargo). Swap a fresh
  battery in and drive on — this is how you cross a continent.
- **Rails run on wire.** Powered rail segments join the normal wiring
  rules; no more accidental-lightbulb archaeology. Rail battery boxes
  for lines far from your grid.
  *(15.1: each end of a line is a rail meter — the wire terminal — that
  reads its watts and cart speed; more watts, faster cart.)
- Every existing chargeable (jetpack, drone, teleport drone) accepts
  batteries too.

## Build 16 — THE GARAGE (roads and the things that speed on them) (DONE)
- **The sports car** — coin only, sold in city dealerships. Fast, twitchy,
  a pure money sink and a status object.
- **The electric motorcycle** — crafted; quick, nimble, and dangerous:
  crashing hurts YOU. Huge air off terrain, and WASD in the air does
  tricks (flips, spins, whips) with a landing check — stick it or eat
  the ground.
- **Highways** — generated roads linking neighbouring cities, road signs,
  and a cruise-control speed bonus for staying on the tarmac. Suddenly
  the cities are a network, and vehicles have somewhere to go.
  *(16.1: one grade slab to slab, tunnels through rises, road raised a
  metre above its cut shoulders.)
- Garages/driveways on owned property; a repair bench for wrecked
  vehicles.

## Build 17 — BLUE WATER (the ocean update) (DONE — plus flowing water)
- **The paddle boat** — no power, you row it. Cheap, early, honest.
- **The motorboat** — electric, fast, battery-driven, planes across open
  water.
- **Ocean update** — proper diving (better breath gear), shipwreck vaults
  with real loot, an island-chain region archetype, coral/kelp decor.
- **Fishing** — rod, biome-specific fish, a city fish market. Quiet-time
  content that pays.
- **The Leviathan** — an ocean boss that surfaces underneath your boat.
  The one fight where the arena is water and the floor is a long way
  down.

## Build 18 — WINGS (leaving the ground) (DONE)
- **The cargo plane** — a two-seat prop plane. Not fast, but it crosses
  the map. Real takeoff and landing: come in too steep or too hot and
  it explodes. You will carve runways, and that's the point.
- **Floating sky islands** — reachable by plane, jetpack or drone, with
  ore you can't get below.
- **The hoverbike** — 2m over anything including water, drains fast;
  built from car + jetpack parts.
- **Cannon / launch pads** — aimable player launcher, pairs beautifully
  with the grapple.
- Hangars, airstrips and windsocks as buildable props; a simple
  altimeter/artificial-horizon HUD while flying.

## Build 19 — THE LIVING WORLD (things that hunt, and places that hide them) (DONE)
The world gets teeth: new enemies for the nights, a sky fortress for the
islands, a unique ruin for the ground, and then the weather.
- **Night enemies for Earth.** Three new kinds that spawn naturally
  after dark, each with a habit: the **stalker** (fast, low, hunts in
  pairs, flees torchlight), the **husk** (slow, tanky, walks straight at
  you and hits hard, burns at dawn like lurkers), and the **wisp** (a
  floating light that drifts toward you and detonates — TNT with a
  grudge). Drops feed the arsenal and the stove. Caps and spawn odds
  scale with how far you are from your torches and beacons, so a lit base
  stays a base.
- **The Sky Spire.** A single tall building on some floating islands
  (one island in three carries one): a white spire with an open gallery,
  a treasury, and a roost. It runs on the raid-fort system — a garrison
  that respawns while you're near, a vault, and a boss — but everything
  here **flies**. **Angels** (winged, fast, they swoop and slash, they
  never leave their island) guard it in tiers, and at the top, once the
  garrison is thinned, **THE ARCHANGEL**: a winged boss that fights over
  the island, dives, throws light, and never crosses the rim either.
  The loot is a tier above the raid forts: aether ingots by the stack,
  diamonds, a winged unique (glide from any height), and a key to the
  treasury. Getting up there is the point of the plane, the hoverbike,
  the jetpack and the cannon.
- **The Ziggurat.** A unique ground structure for Earth: a stepped stone
  pyramid on the plains, mesa or dunes (rarer than forts), with a
  processional stair, a hollow interior of trapped corridors (falling
  floors, spike pits, a flooding hall — real CSG traps), a sealed tomb
  at its heart with a strongbox and a relic, and a guardian that wakes
  when the seal breaks. One per world region, findable by its silhouette
  from the plane.
- **Weather** — rain that fills your carve-holes into real puddles (the
  water cells make this cheap now), snowstorms that paint snow, lightning
  that starts fires on wood, fog mornings.
- **Seasons** — a slow world clock that recolors biomes, freezes lakes
  walkable in winter, boosts summer food yields.
- **Structural collapse** — mine out a tower's base and the disconnected
  top becomes falling debris and drops. The most CSG-native mechanic on
  the list, and a genuine danger underground.

## Build 20 — METROPOLIS (cities become places) (DONE)
- **Districts & city reputation** — industrial, old town, harbor; city-wide
  rep gates the best shops and the best property.
- **Interior furnishing pass** — offices and apartments inside towers,
  working elevators in tall buildings, lit windows at night.
- **City sieges** — raids target the city itself; defend alongside the
  garrison for rep and coin, or let it burn (real subtract damage, which
  the city slowly repairs).
- **Turrets & base defense** — powered wall guns that eat watts; your
  grid finally has a defensive use, and sieges give them a target.
- **Train network v2** — pre-built city stations, buy tickets between
  connected cities, junction your own rails into the public network.
- **Blueprint marketplace** — cities sell famous building blueprints and
  buy yours. Your saved builds become income.

## Build 21 — THE DEEP & THE FINISHED GAME (Earth 1.0)
The last Earth build. After this, Earth is done and we look up.
- **The Underdark** — a second surface at ~y=-150: bioluminescent forest,
  its own villages and economy, its own boss. The reward for going down
  instead of out.
- **The Terraformer** — endgame wrench upgrade: spline sculpting,
  mirror-mode building, terrain smoothing brush. The tool the late game
  deserves.
- **Trinket slots & armor set bonuses** — every boss relic becomes an
  equippable trinket with a visible model; full sets grant real bonuses.
- **Difficulty tiers per world** — peaceful / normal / apocalypse, chosen
  at world creation.
- **Full-screen world map + photo album** built from explored-chunk data.
- **Sound pass** — footstep materials, city ambience, interior reverb,
  per-boss themes.

---

# THE SPACE ARC (Builds 22–25) — the endgame and the ending

Earth first. Then the sky stops being a ceiling. Each planet is its own
generator and its own edit list inside the same save file; travel between
them is a real flown sequence, not a menu.

## Build 22 — LIFTOFF (the rocket and the moon)
Status: A (DONE, Build 74) — the Moon as a second generator and a second
blob in the save, the rocket, the three-scene flight, the space suit,
vacuum, a sixth of the gravity, the Earth in the sky. B (DONE, Build 75)
— lunite veins, abandoned moon bases with loot, dust crawlers by night,
THE DUST WYRM, the mech suit. LIFTOFF IS COMPLETE.
- **Space suit** — breathe off-Earth. Crafted mid-late; a real armor-slot
  item with its own visor overlay.
- **The mech suit** — the upgrade: same protection plus strength, mining
  and combat bonuses. Heavy, loud, and worth it.
- **The rocket** — buildable pad, fuel/battery load, launch.
- **The flight sequence** — you fly it in third person. Earth drops away,
  becomes a LOD shell, then a model hanging in the black. You cross real
  space with Earth behind and the Moon ahead as models, then the Moon
  takes over: lowest LOD, then rings, then surface as you descend. Built
  directly on the Build 13 LOD ladder — the same system, one scale up.
- **The Moon** — low gravity movement, vacuum rules, grey regolith and
  crater terrain, moon-only ores, abandoned moon bases to loot, a moon
  boss. Buildable and mineable exactly like Earth.
- Beacons work off-world; your first inter-planetary base.

## Build 23 — STATION ONE (first contact)
Halfway between Earth and the Moon — both hanging in the windows as
models, neither loaded — a low-detail shape resolves into a space
station. Land in it.
- **True zero-G interior.** A new movement mode: no gravity, push off
  surfaces, drift. Six shops and six living quarters spread out in every
  direction, all connecting to the central hangar you land in. Glass
  sections look out at Earth and the Moon.
- **Fixed cast, generated layout** — the same six alien traders and the
  leader exist in every world, guaranteed; the station's shape is rolled
  per world.
- **No suit required inside.**
- **Gibberish first.** On landing, an objective marker in alien script
  tracks the leader. Talking to them is a wall of nonsense words — then
  you're sent off with a **translator**. Equip it and the whole station
  opens up: dialogue, trade, missions.
- **The story starts.** The leader wants their home planet back — it's
  overrun, and something at the center of it is the reason. They buy
  Moon-only goods, sell things found nowhere else, and hand out the main
  story missions.

## Build 24 — STATION TWO & THE CROSSING
- **Build the second station** — a long main-story construction project
  between the Moon and the alien planet, materials and labor, the
  biggest build the game asks of you.
- **The reward** — the leader grants an **upgraded rocket**, the only ship
  that can make the crossing.
- **The ambush** — the first time you fly the upgraded rocket out to
  Station Two, the final boss appears behind it and tears a black hole
  open. The station is destroyed. The leader teleports to your hull as
  you're being pulled in, and throws you and the ship through — to the
  alien planet's surface, crash-landed.
- **Repair & rebuild** — on-surface repair of the busted ship from local
  materials; build more once you can.
- **Teleport bands** — the leader's parting gift: fast travel to any
  beacon or spawn point on any world, skipping the flight sequence when
  you don't want it. The rocket stays the scenic route.

## Build 25 — THE ALIEN WORLD & THE END
The last build. The final planet, the final boss, the credits.
- **The planet** — genuinely alien terrain (arches, spires, wrong angles),
  **two new fluids** (alien water, alien lava) flowing across it, low
  gravity, roaming aliens hostile and otherwise, and alien structures to
  raid.
- **Endgame material & gear** — the laser-weapon material lives here.
  This is where the best gear in the game is made.
- **The final boss** — the thing that took the planet. Beat it and the
  credits roll (your world keeps going).
- **THE CREDITS** — every development role, all of them "Claude", one
  after another. Last card: *special thanks for doing nothing —*
  **Austin Zitterich**.
- **If you lose**, the leader's message finds you first: the boss took
  Earth and reshaped it in its image, stripped its terraforming tools —
  the drills and dispensers — and left to do the same elsewhere. Tens of
  thousands of years. They've watched humanity fall and rise and fall
  and rise, and this round has eyes everywhere, and calls the year 2026,
  which they find funny, because nobody down there knows how deep their
  own history goes. Then: YOU DIED. Try again.
- **Aftermath** — Station Two reappears, rebuilt. Moon-to-alien flights
  land there instead: the biggest shop in the game, and the deals that
  exist nowhere else.
