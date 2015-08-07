Array.prototype.randomElement = function() {
	return this[Math.floor(Math.random()*this.length)];
};


GAME = {};

GAME.ENGINE = {};

GAME.ENGINE.RAND = (function(){
	var _s0 = 0, _s1 = 0, _s2 = 0, _c = 0, _frac = 2.3283064365386963e-10;
	var _seed;

	var getSeed = function() {
		return _seed;
	};

	var setSeed = function(seed) {
		seed = (seed < 1 ? 1 / seed : seed);
		_seed = seed;
		_s0 = (seed >>> 0) * _frac;
		seed = (seed * 69069 + 1) >>> 0;
		_s1 = seed * _frac;
		seed = (seed * 69069 + 1) >>> 0;
		_s2 = seed * _frac;
		_c = 1;
	};

	var getState = function() {
		return [_s0, _s1, _s2, _c];
	};

	var setState = function(state) {
			_s0 = state[0];
			_s1 = state[1];
			_s2 = state[2];
			_c = state[3];
	};

	var getUniform = function() {
		var t = 2091639 * _s0 + _c * _frac;
		_s0 = _s1;
		_s1 = _s2;
		_c = t | 0;
		_s2 = t - _c;
		return _s2;
	};

	var getUniformInt = function(lowerBound, upperBound) {
		var max = Math.max(lowerBound, upperBound);
		var min = Math.min(lowerBound, upperBound);
		return Math.floor(getUniform() * (max - min + 1)) + min;
	};

	var getPercentage = function() {
		return 1 + Math.floor(getUniform() * 100);
	};

	var getNormal = function(mean, stddev) {
		do {
			var u = 2 * getUniform() - 1;
			var v = 2 * getUniform() - 1;
			var r = u * u + v * v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2 * Math.log(r) / r);
		return (mean || 0) + gauss * (stddev || 1);
	};

	var getComplex = function(params) {
		var ret = 0;
		if(params.Dices)
			ret = rollDices(params.Dices);
		if(params.Mean && params.Dev) {
			ret = getNormal(params.Mean, params.Dev);
			if(params.Min) ret = Math.max(ret, params.Min);
			if(params.Max) ret = Math.min(ret, params.Max);
		} else if(params.Min && params.Max) {
			ret = getUniformInt(params.Min, params.Max);
		}
		if(params.Add) {
			ret += params.Add;
		}
		if(params.Round){
			ret = Math.round(ret);
		}
		return ret;
	};

	var rollDices = function(dices){
		var REx = /(\d*)?d(\d*)((?:\+|-)(?:\d*))?/gi;
		var ret = REx.exec(dices);

		if(!ret) return false;

		var rolls, sum;
		rolls = ret[1] ? parseInt(ret[1]) : 1;
		sum = ret[3] ? parseInt(ret[3]) : 0;

		for (var i = 0; i < rolls; i++) {
			sum += getUniformInt(1, ret[2]);
		};

		return sum;
	};

	setSeed(Date.now());

	return {
		getSeed: getSeed,
		setSeed: setSeed,
		getState: getState,
		setState: setState,
		getUniform: getUniform,
		getUniformInt: getUniformInt,
		getPercentage: getPercentage,
		getNormal: getNormal,
		getComplex: getComplex,
		rollDices: rollDices
	};
})();

GAME.ENGINE.HEROS = (function(){
	var Types = {
		/*Adventurer: {
			Name: 'Adventurer',
			Attributes: ['Strength', 'Constitution', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma'],
		},*/
		Mage: {
			Name: 'Mage',
			Attributes: ['Intelligence', 'Wisdom', 'Constitution', 'Charisma', 'Dexterity', 'Strength'],
		},
		Rogue: {
			Name: 'Rogue',
			Attributes: ['Dexterity', 'Strength', 'Constitution', 'Charisma', 'Intelligence', 'Wisdom',],
		},
		Warrior: {
			Name: 'Warrior',
			Attributes: ['Strength', 'Constitution', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma'],
		}
	};
	var TypesNames = Object.keys(Types);

	var Proto = {
		levelUp: function(){console.log('ding!')},
	};

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		var hero = Object.create(Proto);
		var attributes = ['3d6', '3d6', '3d6', '3d6', '3d6', '3d6'];

		hero.Kind = Types[type].Name;
		for (var i = 0, l = attributes.length; i < l; i++) {
			attributes[i] = GAME.ENGINE.RAND.rollDices(attributes[i]);
		};
		attributes.sort(function(a, b){return b-a});
		for (var key of Types[type].Attributes){
			hero[key] = attributes.shift();
		}

		return hero;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();

GAME.ENGINE.MONSTERS = (function(){
	var Types = {
		Generic: {
			Name: 'Generic Monster',
			Attributes: ['Strength', 'Constitution', 'Dexterity', 'Wisdom'],
		}
	};

	var Proto = {};
	var TypesNames = Object.keys(Types);

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		options = options || {};
		var monster = Object.create(Proto);
		var attributes = ['3d6', '3d6', '3d6', '3d6'];

		monster.Name = Types[type].Name;
		for (var i = 0, l = attributes.length; i < l; i++) {
			attributes[i] = GAME.ENGINE.RAND.rollDices(attributes[i]);
		};
		attributes.sort(function(a, b){return b-a});
		for (var key of Types[type].Attributes){
			monster[key] = attributes.shift();
		}

		for(var key in options)
			monster[key] = options[key];

		return monster;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();

GAME.ENGINE.LAIRS = (function(){
	var Types = {
		Generic: {
			Name: 'Generic Lair',
			Size: {Min: 1, Mean: 2, Dev: 1},
			Monsters: [{Type: 'Generic', Count: {Mean: 6, Dev: 2, Add: 5, Round: true}}]
		},
	};
	var TypesNames = Object.keys(Types);

	var Proto = {
		get Count(){
			return this.Monsters.length;
		},
	};

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		options = options || {};
		var lair = Object.create(Proto);

		lair.Name = Types[type].Name;

		lair.Size = options.Size || GAME.ENGINE.RAND.getComplex(Types[type].Size);
		lair.Monsters = [];
		for (var monster of Types[type].Monsters){
			var count = GAME.ENGINE.RAND.getComplex(monster.Count);
			count *= lair.Size;
			for (var i = 0; i < count; i++) {
				lair.Monsters.push(GAME.ENGINE.MONSTERS.create(monster.Type));
			};
		}

		return lair;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();



console.log(GAME);
console.log(GAME.ENGINE.HEROS.createRandom());
console.log(GAME.ENGINE.LAIRS.createRandom());
console.log(GAME.ENGINE.LAIRS.createRandom({Size: 1}));


GAME.ENGINE.CHARACTER = (function(
	var Abilities = ['Strength', 'Constitution', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma'];
	//var Races = ['Human', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling'];
	var Races = {
		Human: {
			Size: 'Medium',
			Speed: 30,
			ExtraFeat: 1,
			ExtraSkill: 4,
			ExtraSkillLvl: 1,
		},
		Dwarf: {
			Abilities: {Constitution: 2, Charisma: -2},
			Size: 'Medium',
			Speed: 20,
			SpeedFree: true,
			Vision: 'Darkvision',

			Weapon Familiarity: ['dwarven waraxe', 'dwarven urgrosh'],
			Stonecunning: {Search: 2}, // stonework
			Stability: {Ability: 4}, // resist being bull rushed or tripped when standing
			SThrows: {Poison: 2, Spells: 2},
			ARolls: {Orcs: 1, Goblins: 1},
			DRolls: {Giant: 4},
			Check: {Appraise: 2, Craft: 2 /*Stone, metal*/},
			FClass: ['Fighter']
		},
		Elf: {
			Abilities: {Dexterity: 2, Constitution: -2},
			Size: 'Medium',
			Speed: 20,
			Vision: 'Low-light vision',

			Weapon Proficiency: ['longsword', 'rapier', 'longbow', 'shortbow'],
			SThrows: {Sleep: 'immunity', Enchantment: 2},
			Check: {Listen: 2, Search: 2, Spot: 2},
			FClass: ['Wizard']
		},
		Gnome: {
			Abilities: {Constitution: 2, Strength: -2},
			Size: 'Small',
			Speed: 20,
			Vision: 'Low-light vision',

			Weapon Familiarity: ['gnome hooked hammer'],
			SThrows: {Illusion: 2},	/*+1 Difficulty Class*/
			ARolls: {Kobolds: 1, Goblins: 1},
			DRolls: {Giant: 4},
			Check: {Listen: 2, Craft: 2 /*Alchemy*/},
			/*Spell-Like Abilities: 1/day—speak with animals (burrowing mammal only, duration 1 minute). A gnome with a Charisma score of at least 10 also has the following spell-like abilities: 1/day—dancing lights, ghost sound, prestidigitation. Caster level 1st; save DC 10 + gnome’s Cha modifier + spell level.*/
			FClass: ['Bard']
		},
		Halfling: {
			Abilities: {Dexterity: 2, Strength: -2},
			Size: 'Small',
			Speed: 20,

			Check: {Listen: 2, Jumb: 2, Climb: 2, Move Silently: 2},
			SThrows: {All: 1, Fear: 2},
			ARolls: {Thrown: 1, Sling: 1},
			FClass: ['Rogue']
		}
/*
Half-Elves
Also see the Half-Elf monster listing.

Medium: As Medium creatures, half-elves have no special bonuses or penalties due to their size.
Half-elf base land speed is 30 feet.
Immunity to sleep spells and similar magical effects, and a +2 racial bonus on saving throws against enchantment spells or effects.
Low-Light Vision: A half-elf can see twice as far as a human in starlight, moonlight, torchlight, and similar conditions of poor illumination. She retains the ability to distinguish color and detail under these conditions.
+1 racial bonus on Listen, Search, and Spot checks.
+2 racial bonus on Diplomacy and Gather Information checks.
Elven Blood: For all effects related to race, a half-elf is considered an elf.
Automatic Languages: Common and Elven. Bonus Languages: Any (other than secret languages, such as Druidic).
Favored Class: Any. When determining whether a multiclass half-elf takes an experience point penalty, her highest-level class does not count.

Half-Orcs
Also see the Half-Orc monster listing.

+2 Strength, -2 Intelligence, -2 Charisma.

A half-orc’s starting Intelligence score is always at least 3. If this adjustment would lower the character’s score to 1 or 2, his score is nevertheless 3.

Medium: As Medium creatures, half-orcs have no special bonuses or penalties due to their size.
Half-orc base land speed is 30 feet.
Darkvision: Half-orcs (and orcs) can see in the dark up to 60 feet. Darkvision is black and white only, but it is otherwise like normal sight, and half-orcs can function just fine with no light at all.
Orc Blood: For all effects related to race, a half-orc is considered an orc.
Automatic Languages: Common and Orc. Bonus Languages: Draconic, Giant, Gnoll, Goblin, and Abyssal.
Favored Class: Barbarian. A multiclass half-orc’s barbarian class does not count when determining whether he takes an experience point penalty.
*/
	};

	var Skills = {

	};
))();