module.exports = {
  awards: [
    'GAUNTLET', // 0
    'Excellent', // 1
    'Impressive', // 2
    'Defense', // 3
    'Capture', // 4
    'Assist' // 5
  ],
  ctf: [
    'Flag is taken', // 0
    'Flag is captured', // 1
    'Flag is returned', // 2
    'Flagcarrier got killed' // 3
  ],
  kill: [
    'MOD_UNKNOWN', // 0
    'MOD_SHOTGUN', // 1
    'MOD_GAUNTLET', // 2
    'MOD_MACHINEGUN', // 3
    'MOD_GRENADE', // 4
    'MOD_GRENADE_SPLASH', // 5
    'MOD_ROCKET', // 6
    'MOD_ROCKET_SPLASH', // 7
    'MOD_PLASMA', // 8
    'MOD_PLASMA_SPLASH', // 9
    'MOD_RAILGUN', //10
    'MOD_LIGHTNING', //11
    'MOD_BFG', //12
    'MOD_BFG_SPLASH', //13
    'MOD_WATER', //14
    'MOD_SLIME', //15
    'MOD_LAVA', //16
    'MOD_CRUSH', //17
    'MOD_TELEFRAG', //18
    'MOD_FALLING', //19
    'MOD_SUICIDE', //20
    'MOD_TARGET_LASER', //21
    'MOD_TRIGGER_HURT', //22
    'MOD_NAIL', //23
    'MOD_CHAINGUN', //24
    'MOD_PROXIMITY_MINE', //25
    'MOD_KAMIKAZE', //26
    'MOD_JUICED', //27
    'MOD_GRAPPLE' //28
  ],
  challenge: {
    0: 'GENERAL_TEST',
    1: 'GENERAL_TOTALKILLS',
    2: 'GENERAL_TOTALDEATHS',
    3: 'GENERAL_TOTALGAMES',

    //Gametypes
    101: 'GAMETYPES_FFA_WINS',
    102: 'GAMETYPES_TOURNEY_WINS',
    103: 'GAMETYPES_TDM_WINS',
    104: 'GAMETYPES_CTF_WINS',
    105: 'GAMETYPES_1FCTF_WINS',
    106: 'GAMETYPES_OVERLOAD_WINS',
    107: 'GAMETYPES_HARVESTER_WINS',
    108: 'GAMETYPES_ELIMINATION_WINS',
    109: 'GAMETYPES_CTF_ELIMINATION_WINS',
    110: 'GAMETYPES_LMS_WINS',
    111: 'GAMETYPES_DD_WINS',
    112: 'GAMETYPES_DOM_WINS',

    //Weapons
    201: 'WEAPON_GAUNTLET_KILLS',
    202: 'WEAPON_MACHINEGUN_KILLS',
    203: 'WEAPON_SHOTGUN_KILLS',
    204: 'WEAPON_GRANADE_KILLS',
    205: 'WEAPON_ROCKET_KILLS',
    206: 'WEAPON_LIGHTNING_KILLS',
    207: 'WEAPON_PLASMA_KILLS',
    208: 'WEAPON_RAIL_KILLS',
    209: 'WEAPON_BFG_KILLS',
    210: 'WEAPON_GRAPPLE_KILLS',
    211: 'WEAPON_CHAINGUN_KILLS',
    212: 'WEAPON_NAILGUN_KILLS',
    213: 'WEAPON_MINE_KILLS',
    214: 'WEAPON_PUSH_KILLS',
    215: 'WEAPON_INSTANT_RAIL_KILLS',
    216: 'WEAPON_TELEFRAG_KILLS',
    217: 'WEAPON_CRUSH_KILLS',

    //Awards
    //Gauntlet is not here as it is the same as WEAPON_GAUNTLET_KILLS
    301: 'AWARD_IMPRESSIVE',
    302: 'AWARD_EXCELLENT',
    303: 'AWARD_CAPTURE',
    304: 'AWARD_ASSIST',
    305: 'AWARD_DEFENCE',

    //Powerups
    401: 'POWERUP_QUAD_KILL',
    402: 'POWERUP_SPEED_KILL',
    403: 'POWERUP_FLIGHT_KILL',
    404: 'POWERUP_INVIS_KILL',
    405: 'POWERUP_MULTI_KILL',
    406: 'POWERUP_COUNTER_QUAD',
    407: 'POWERUP_COUNTER_SPEED',
    408: 'POWERUP_COUNTER_FLIGHT',
    409: 'POWERUP_COUNTER_INVIS',
    410: 'POWERUP_COUNTER_ENVIR',
    411: 'POWERUP_COUNTER_REGEN',
    412: 'POWERUP_COUNTER_MULTI',

    //FFA awards
    501: 'FFA_TOP3',
    //From behind, enemy gets fraglimit-1, player has at most fraglimit-2 but wins anyway
    502: 'FFA_FROMBEHIND',
    //BetterThan: loose a match but have a positive kill ratio against the winner
    503: 'FFA_BETTERTHAN',
    //Get at least half of your kills for players in the best half of the scoreboard
    504: 'FFA_JUDGE',
    //The oppesite
    505: 'FFA_CHEAPKILLER'
  },
  noGUID: '(no guid)',
  weaponFactor: [
    0,  // 'MOD_UNKNOWN', // 0
    10, // 'MOD_SHOTGUN', // 1
    12, // 'MOD_GAUNTLET', // 2
    8,  // 'MOD_MACHINEGUN', // 3
    8,  // 'MOD_GRENADE', // 4
    8,  // 'MOD_GRENADE_SPLASH', // 5
    10, // 'MOD_ROCKET', // 6
    10, // 'MOD_ROCKET_SPLASH', // 7
    10, // 'MOD_PLASMA', // 8
    10, // 'MOD_PLASMA_SPLASH', // 9
    10, // 'MOD_RAILGUN', //10
    8,  // 'MOD_LIGHTNING', //11
    8,  // 'MOD_BFG', //12
    8,  // 'MOD_BFG_SPLASH', //13
    0,  // 'MOD_WATER', //14
    0,  // 'MOD_SLIME', //15
    0,  // 'MOD_LAVA', //16
    0,  // 'MOD_CRUSH', //17
    0,  // 'MOD_TELEFRAG', //18
    0,  // 'MOD_FALLING', //19
    0,  // 'MOD_SUICIDE', //20
    0,  // 'MOD_TARGET_LASER', //21
    0,  // 'MOD_TRIGGER_HURT', //22
    10, // 'MOD_NAIL', //23
    8,  // 'MOD_CHAINGUN', //24
    8,  // 'MOD_PROXIMITY_MINE', //25
    0,  // 'MOD_KAMIKAZE', //26
    0,  // 'MOD_JUICED', //27
    0   // 'MOD_GRAPPLE' //28
  ],
  skillMean: 1600,
  skillVariance: 400
};
